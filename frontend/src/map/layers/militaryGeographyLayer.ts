import type { Map as MapLibreMap } from 'maplibre-gl'

import type {
  GeoJsonFeature,
  GeoJsonFeatureCollection,
  LineStringGeometry,
  MvpDataset,
  PointGeometry,
} from '../../domain/mvpTypes'

export const MILITARY_GEOGRAPHY_SOURCE_ID =
  'phase2-military-geography-guides'

export const MILITARY_GEOGRAPHY_BASE_LAYER_IDS = [
  'phase2-east-guanzhong-corridor-band',
  'phase2-east-guanzhong-corridor-edge',
] as const

export const MILITARY_GEOGRAPHY_OVERLAY_LAYER_IDS = [
  'phase2-river-flow-arrows',
  'phase2-guanzhong-lowland-label',
  'phase2-east-guanzhong-corridor-label',
] as const

export const MILITARY_GEOGRAPHY_LAYER_IDS = [
  ...MILITARY_GEOGRAPHY_BASE_LAYER_IDS,
  ...MILITARY_GEOGRAPHY_OVERLAY_LAYER_IDS,
] as const

export const MILITARY_HYDROGRAPHY_LAYER_IDS = [
  'phase2-river-flow-arrows',
] as const

export const MILITARY_LAND_GEOGRAPHY_LAYER_IDS = [
  'phase2-east-guanzhong-corridor-band',
  'phase2-east-guanzhong-corridor-edge',
  'phase2-guanzhong-lowland-label',
  'phase2-east-guanzhong-corridor-label',
] as const

export const GUANZHONG_LOWLAND_LABEL_ANCHOR = [109.68, 34.4] as const
export const EAST_GUANZHONG_CORRIDOR_SCREEN_WIDTH_PX = 22

export const MILITARY_GEOGRAPHY_ATTRIBUTION =
  '现代流向与地貌概览：<a href="https://zrzyt.xinjiang.gov.cn/xjgtzy/mtxc/202501/c9797502c012491680e9727c3eea8cb1.shtml" target="_blank" rel="noopener">自然资源部</a> · <a href="https://www.wushan.gov.cn/info/2791/1463412.htm" target="_blank" rel="noopener">武山县人民政府</a> · <a href="https://www.shaanxi.gov.cn/zfxxgk/fdzdgknr/zcwj/nszfbgtwj/szbf/202208/t20220808_2234281.html" target="_blank" rel="noopener">陕西省人民政府</a>；仅作现代概览与解释性显示，不表示唐代精确河道、道路或边界'

type MilitaryGeographyFeatureKind =
  | 'modernRiverFlowGuide'
  | 'modernLowlandLabel'
  | 'displayOnlyCorridor'

interface MilitaryGeographyProperties extends Record<string, unknown> {
  id: string
  name: string
  featureKind: MilitaryGeographyFeatureKind
  displayBoundary: string
  sourceFeatureId: string
}

type MilitaryGeographyFeature = GeoJsonFeature<
  LineStringGeometry | PointGeometry,
  MilitaryGeographyProperties
>

export type MilitaryGeographyGuides =
  GeoJsonFeatureCollection<MilitaryGeographyFeature>

function riverFlowFeatures(
  geography: MvpDataset['geography'],
): MilitaryGeographyFeature[] {
  const riverIds = new Set([
    'geography-yellow-river',
    'geography-wei-river',
  ])

  return geography.features.flatMap((feature) => {
    if (
      !riverIds.has(feature.properties.id) ||
      feature.geometry.type !== 'LineString'
    ) {
      return []
    }

    return [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: feature.geometry.coordinates,
        },
        properties: {
          id: `flow-${feature.properties.id}`,
          name: feature.properties.name,
          featureKind: 'modernRiverFlowGuide',
          displayBoundary:
            'Coordinate order is used only for approved modern overview arrows; it is not a Tang-dynasty channel reconstruction.',
          sourceFeatureId: feature.properties.id,
          arrowText: '➤',
        },
      } satisfies MilitaryGeographyFeature,
    ]
  })
}

function eastGuanzhongCorridorFeature(
  routeSegments: MvpDataset['routeSegments'],
): MilitaryGeographyFeature[] {
  const sourceSegment = routeSegments.features.find(
    (feature) => feature.properties.id === 'route-tang-advance-01',
  )

  if (!sourceSegment) {
    return []
  }

  return [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [...sourceSegment.geometry.coordinates].reverse(),
      },
      properties: {
        id: 'display-east-guanzhong-corridor',
        name: '东入关中解释性通道',
        featureKind: 'displayOnlyCorridor',
        displayBoundary:
          'Reversed two-point route-tang-advance-01 geometry; 22px is a screen width, not a historical road or corridor width.',
        sourceFeatureId: sourceSegment.properties.id,
        screenWidthPx: EAST_GUANZHONG_CORRIDOR_SCREEN_WIDTH_PX,
      },
    },
  ]
}

export function buildMilitaryGeographyGuides(
  geography: MvpDataset['geography'],
  routeSegments: MvpDataset['routeSegments'],
): MilitaryGeographyGuides {
  return {
    type: 'FeatureCollection',
    features: [
      ...riverFlowFeatures(geography),
      ...eastGuanzhongCorridorFeature(routeSegments),
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [...GUANZHONG_LOWLAND_LABEL_ANCHOR],
        },
        properties: {
          id: 'display-guanzhong-east-lowland-label',
          name: '关中东部低地\n（现代地貌概览）',
          featureKind: 'modernLowlandLabel',
          displayBoundary:
            'Display-only label anchor; no historical plain polygon or passability area is implied.',
          sourceFeatureId: 'PHASE2-CIT-GUANZHONG-LOWLAND-01',
        },
      },
    ],
  }
}

function addMilitaryGeographySource(
  map: MapLibreMap,
  geography: MvpDataset['geography'],
  routeSegments: MvpDataset['routeSegments'],
): void {
  if (!map.getSource(MILITARY_GEOGRAPHY_SOURCE_ID)) {
    map.addSource(MILITARY_GEOGRAPHY_SOURCE_ID, {
      type: 'geojson',
      data: buildMilitaryGeographyGuides(geography, routeSegments),
      attribution: MILITARY_GEOGRAPHY_ATTRIBUTION,
    })
  }
}

export function addMilitaryGeographyBaseLayers(
  map: MapLibreMap,
  geography: MvpDataset['geography'],
  routeSegments: MvpDataset['routeSegments'],
): void {
  addMilitaryGeographySource(map, geography, routeSegments)

  if (!map.getLayer(MILITARY_GEOGRAPHY_BASE_LAYER_IDS[0])) {
    map.addLayer({
      id: MILITARY_GEOGRAPHY_BASE_LAYER_IDS[0],
      type: 'line',
      source: MILITARY_GEOGRAPHY_SOURCE_ID,
      filter: ['==', ['get', 'featureKind'], 'displayOnlyCorridor'],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#c79847',
        'line-opacity': 0.28,
        'line-width': EAST_GUANZHONG_CORRIDOR_SCREEN_WIDTH_PX,
        'line-blur': 1.25,
      },
    })
  }

  if (!map.getLayer(MILITARY_GEOGRAPHY_BASE_LAYER_IDS[1])) {
    map.addLayer({
      id: MILITARY_GEOGRAPHY_BASE_LAYER_IDS[1],
      type: 'line',
      source: MILITARY_GEOGRAPHY_SOURCE_ID,
      filter: ['==', ['get', 'featureKind'], 'displayOnlyCorridor'],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#745027',
        'line-opacity': 0.88,
        'line-width': 2.2,
        'line-dasharray': [3, 2],
      },
    })
  }
}

export function addMilitaryGeographyOverlayLayers(map: MapLibreMap): void {
  if (!map.getSource(MILITARY_GEOGRAPHY_SOURCE_ID)) {
    return
  }

  if (!map.getLayer(MILITARY_GEOGRAPHY_OVERLAY_LAYER_IDS[0])) {
    map.addLayer({
      id: MILITARY_GEOGRAPHY_OVERLAY_LAYER_IDS[0],
      type: 'symbol',
      source: MILITARY_GEOGRAPHY_SOURCE_ID,
      filter: ['==', ['get', 'featureKind'], 'modernRiverFlowGuide'],
      layout: {
        'symbol-placement': 'line',
        'symbol-spacing': 150,
        'text-field': ['get', 'arrowText'],
        'text-size': 15,
        'text-allow-overlap': true,
        'text-ignore-placement': true,
        'text-keep-upright': false,
        'text-rotation-alignment': 'map',
      },
      paint: {
        'text-color': '#0d5f91',
        'text-halo-color': 'rgba(255, 248, 229, 0.9)',
        'text-halo-width': 1.2,
      },
    })
  }

  if (!map.getLayer(MILITARY_GEOGRAPHY_OVERLAY_LAYER_IDS[1])) {
    map.addLayer({
      id: MILITARY_GEOGRAPHY_OVERLAY_LAYER_IDS[1],
      type: 'symbol',
      source: MILITARY_GEOGRAPHY_SOURCE_ID,
      filter: ['==', ['get', 'featureKind'], 'modernLowlandLabel'],
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 14,
        'text-letter-spacing': 0.08,
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': '#68713e',
        'text-halo-color': 'rgba(255, 248, 229, 0.94)',
        'text-halo-width': 2,
      },
    })
  }

  if (!map.getLayer(MILITARY_GEOGRAPHY_OVERLAY_LAYER_IDS[2])) {
    map.addLayer({
      id: MILITARY_GEOGRAPHY_OVERLAY_LAYER_IDS[2],
      type: 'symbol',
      source: MILITARY_GEOGRAPHY_SOURCE_ID,
      filter: ['==', ['get', 'featureKind'], 'displayOnlyCorridor'],
      layout: {
        'symbol-placement': 'line-center',
        'text-field': ['get', 'name'],
        'text-size': 12,
        'text-offset': [0, -1.15],
        'text-keep-upright': true,
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': '#67451f',
        'text-halo-color': 'rgba(255, 248, 229, 0.96)',
        'text-halo-width': 1.8,
      },
    })
  }
}
