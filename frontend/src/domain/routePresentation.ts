import type {
  GeoJsonFeature,
  GeoJsonFeatureCollection,
  LineStringGeometry,
  MvpDataset,
  Position,
  RouteSegmentFeature,
  Side,
} from './mvpTypes'

export const EARTH_MEAN_RADIUS_KM = 6371.0088
export const ROUTE_DISTANCE_ROUNDING_KM = 5
export const ROUTE_DISTANCE_METHOD_NOTE =
  '按两个现代争议代表点的大圆距离计算，取整到最近 5 公里；不等于唐代道路或历史行军里程。'

export interface RouteSupplementalSource {
  id: string
  title: string
  provider: string
  url: string
  scope: string
}

interface ApprovedRouteCopy {
  directionLabel: string
  notes: readonly string[]
  supplementalSources: readonly RouteSupplementalSource[]
}

const YAN_TERRAIN_SOURCES = [
  {
    id: 'PHASE2-04-SRC-XIAOHAN-SCOPE-01',
    title: '崤函古道入选2024年度“最受欢迎古道”',
    provider: '三门峡市人民政府',
    url: 'https://www.smx.gov.cn/4036/616951008/1869004.html',
    scope: '只支持洛阳—潼关区域范围及沿线因地理形成多处隘口。',
  },
  {
    id: 'PHASE2-04-SRC-XIAOHAN-WEST-TERRAIN-01',
    title: '函谷关历史文化旅游区',
    provider: '灵宝市人民政府',
    url: 'https://www.lingbao.gov.cn/16031/616500000/1265843.html',
    scope: '只支持陕州—潼关西段南依崤山、北临黄河。',
  },
  {
    id: 'PHASE2-04-SRC-XIAOHAN-TANG-CONTEXT-01',
    title: '通古达今的崤函古道',
    provider: '《光明日报》/ 光明网',
    url: 'https://news.gmw.cn/2024-03/03/content_37180338.htm',
    scope: '只作区域山河关系与唐代两京交通背景的交叉核对。',
  },
] as const satisfies readonly RouteSupplementalSource[]

const APPROVED_ROUTE_COPY: Record<string, ApprovedRouteCopy> = {
  'route-yan-westward': {
    directionLabel: '燕军 · 向西',
    notes: [
      '主体与方向：燕军由洛阳经陕州向潼关方向西进。',
      '相关关隘：潼关是陕郡以西、进入关中的关键防御节点。',
      '不确定性：两段只连接现代争议代表点，表达宏观节点顺序，不是唐代道路或行军轨迹。',
      '地形约束：洛阳—潼关的崤函区域受山地与黄河影响，沿线因地理形成多处隘口；其中陕州—潼关西段南依崤山、北临黄河。',
    ],
    supplementalSources: YAN_TERRAIN_SOURCES,
  },
  'route-tang-advance': {
    directionLabel: '唐军 · 向东',
    notes: [
      '主体与方向：唐军由潼关出关，向东推进至灵宝西原方向。',
      '地形约束：灵宝西原方向现有材料只支持南近山、北临黄河的狭窄通道这一相对关系。',
      '相关关隘：潼关是本路线出发关隘；当前点只是现代旧城遗址代表点，唐代关城位置仍有争议。',
      '不确定性：直线只连接两个现代争议代表点，不是唐代道路、战场坐标或撤退线。',
    ],
    supplementalSources: [],
  },
}

export interface RouteDisplayProperties extends Record<string, unknown> {
  id: string
  routeId: string
  routeName: string
  segmentNo: number
  side: Side
  directionLabel: string
  distanceLabel: string
  arrowText: '▶'
}

export type RouteDisplayFeature = GeoJsonFeature<
  LineStringGeometry,
  RouteDisplayProperties
>

export interface RouteSegmentPresentation {
  id: string
  segmentNo: number
  fromName: string
  toName: string
  distanceKm: number
  roundedDistanceKm: number
  distanceLabel: string
}

export interface RoutePresentation {
  routeId: string
  routeName: string
  side: Side
  directionLabel: string
  certainty: 'LOW'
  notes: readonly string[]
  segments: RouteSegmentPresentation[]
  citationIds: string[]
  supplementalSources: readonly RouteSupplementalSource[]
}

function assertPosition(position: Position, label: string): void {
  const [longitude, latitude] = position

  if (
    !Number.isFinite(longitude) ||
    !Number.isFinite(latitude) ||
    longitude < -180 ||
    longitude > 180 ||
    latitude < -90 ||
    latitude > 90
  ) {
    throw new Error(`${label} 不是有效的经纬度坐标`)
  }
}

function radians(value: number): number {
  return (value * Math.PI) / 180
}

export function haversineDistanceKm(
  from: Position,
  to: Position,
): number {
  assertPosition(from, '起点')
  assertPosition(to, '终点')

  const latitude1 = radians(from[1])
  const latitude2 = radians(to[1])
  const deltaLatitude = latitude2 - latitude1
  const deltaLongitude = radians(to[0] - from[0])
  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitude1) *
      Math.cos(latitude2) *
      Math.sin(deltaLongitude / 2) ** 2
  const angularDistance =
    2 * Math.asin(Math.min(1, Math.sqrt(haversine)))

  return EARTH_MEAN_RADIUS_KM * angularDistance
}

export function roundRouteDistanceKm(distanceKm: number): number {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    throw new Error('路线距离必须是非负有限数值')
  }

  return (
    Math.floor(distanceKm / ROUTE_DISTANCE_ROUNDING_KM + 0.5) *
    ROUTE_DISTANCE_ROUNDING_KM
  )
}

function samePosition(left: Position, right: Position): boolean {
  return left[0] === right[0] && left[1] === right[1]
}

function placeForEndpoint(
  dataset: Pick<MvpDataset, 'places'>,
  placeId: string | null,
  endpoint: Position,
  label: string,
) {
  if (!placeId) {
    throw new Error(`${label}缺少正式 Place ID`)
  }

  const place = dataset.places.features.find(
    (candidate) => candidate.properties.id === placeId,
  )

  if (!place) {
    throw new Error(`${label}引用了不存在的 Place：${placeId}`)
  }

  if (!samePosition(place.geometry.coordinates, endpoint)) {
    throw new Error(`${label}坐标与 Place ${placeId} 的正式代表点不一致`)
  }

  return place
}

function segmentPresentation(
  dataset: Pick<MvpDataset, 'places'>,
  segment: RouteSegmentFeature,
): RouteSegmentPresentation {
  const [from, to] = segment.geometry.coordinates

  if (!from || !to || segment.geometry.coordinates.length !== 2) {
    throw new Error(`RouteSegment ${segment.properties.id} 必须保持正式两点几何`)
  }

  const fromPlace = placeForEndpoint(
    dataset,
    segment.properties.fromPlaceId,
    from,
    `RouteSegment ${segment.properties.id} 起点`,
  )
  const toPlace = placeForEndpoint(
    dataset,
    segment.properties.toPlaceId,
    to,
    `RouteSegment ${segment.properties.id} 终点`,
  )
  const distanceKm = haversineDistanceKm(from, to)
  const roundedDistanceKm = roundRouteDistanceKm(distanceKm)

  return {
    id: segment.properties.id,
    segmentNo: segment.properties.segmentNo,
    fromName: fromPlace.properties.name,
    toName: toPlace.properties.name,
    distanceKm,
    roundedDistanceKm,
    distanceLabel: `现代代表点间直线距离约 ${roundedDistanceKm} 公里`,
  }
}

function approvedCopy(routeId: string): ApprovedRouteCopy | undefined {
  return APPROVED_ROUTE_COPY[routeId]
}

export function buildRouteDisplayFeatures(
  routeSegments: MvpDataset['routeSegments'],
  places: MvpDataset['places'],
): GeoJsonFeatureCollection<RouteDisplayFeature> {
  return {
    type: 'FeatureCollection',
    features: routeSegments.features.flatMap((segment) => {
      const copy = approvedCopy(segment.properties.routeId)

      if (!copy) {
        return []
      }

      const presentation = segmentPresentation({ places }, segment)

      return [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: segment.geometry.coordinates.map(
              (position) => [...position] as Position,
            ),
          },
          properties: {
            ...segment.properties,
            directionLabel: copy.directionLabel,
            distanceLabel: presentation.distanceLabel,
            arrowText: '▶',
          },
        },
      ]
    }),
  }
}

export function getRoutePresentation(
  dataset: Pick<MvpDataset, 'places' | 'routeSegments'>,
  routeId: string,
): RoutePresentation | undefined {
  const copy = approvedCopy(routeId)

  if (!copy) {
    return undefined
  }

  const routeSegments = dataset.routeSegments.features
    .filter((segment) => segment.properties.routeId === routeId)
    .sort((left, right) => left.properties.segmentNo - right.properties.segmentNo)
  const first = routeSegments[0]

  if (!first) {
    return undefined
  }

  const citationIds = [
    ...new Set(
      routeSegments.flatMap((segment) => [
        ...segment.properties.citationIds,
        ...segment.properties.summary.citationIds,
      ]),
    ),
  ]

  return {
    routeId,
    routeName: first.properties.routeName,
    side: first.properties.side,
    directionLabel: copy.directionLabel,
    certainty: 'LOW',
    notes: copy.notes,
    segments: routeSegments.map((segment) =>
      segmentPresentation({ places: dataset.places }, segment),
    ),
    citationIds,
    supplementalSources: copy.supplementalSources,
  }
}

export function routeIdIsVisible(
  routeSegments: MvpDataset['routeSegments'],
  routeId: string,
  visibleSegmentIds: readonly string[],
): boolean {
  const visibleIds = new Set(visibleSegmentIds)

  return routeSegments.features.some(
    (segment) =>
      segment.properties.routeId === routeId &&
      visibleIds.has(segment.properties.id),
  )
}
