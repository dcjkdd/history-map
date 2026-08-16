import type {
  FilterSpecification,
  Map as MapLibreMap,
} from 'maplibre-gl'

import type { DerivedMapState } from '../../domain/deriveMapState'
import type { MvpDataset, Side } from '../../domain/mvpTypes'
import { buildRouteDisplayFeatures } from '../../domain/routePresentation'

export const ROUTE_SOURCE_ID = 'mvp-route-segments'

export const ROUTE_ATTRIBUTION =
  '路线方向与距离为已审核 display-only 派生：<a href="https://www.smx.gov.cn/4036/616951008/1869004.html" target="_blank" rel="noopener">三门峡市人民政府</a> · <a href="https://www.lingbao.gov.cn/16031/616500000/1265843.html" target="_blank" rel="noopener">灵宝市人民政府</a> · <a href="https://news.gmw.cn/2024-03/03/content_37180338.htm" target="_blank" rel="noopener">《光明日报》</a>；现代代表点直线距离不等于唐代道路或历史行军里程'

export const ROUTE_LAYER_IDS = [
  'mvp-routes-tang',
  'mvp-routes-yan',
  'mvp-routes-court',
  'mvp-routes-other',
  'mvp-routes-tang-active',
  'mvp-routes-yan-active',
  'mvp-routes-court-active',
  'mvp-routes-other-active',
  'mvp-routes-hit-area',
  'mvp-routes-selected',
  'mvp-route-direction-arrows',
  'mvp-route-direction-labels',
] as const

export const ROUTE_INTERACTIVE_LAYER_IDS = [
  'mvp-routes-hit-area',
  'mvp-route-direction-arrows',
  'mvp-route-direction-labels',
  'mvp-routes-selected',
  'mvp-routes-tang-active',
  'mvp-routes-yan-active',
  'mvp-routes-court-active',
  'mvp-routes-other-active',
  'mvp-routes-tang',
  'mvp-routes-yan',
  'mvp-routes-court',
  'mvp-routes-other',
] as const

interface RouteStyle {
  layerId: (typeof ROUTE_LAYER_IDS)[number]
  activeLayerId: (typeof ROUTE_LAYER_IDS)[number]
  color: string
  width: number
  dasharray: number[]
}

const ROUTE_STYLES: Record<Side, RouteStyle> = {
  TANG: {
    layerId: 'mvp-routes-tang',
    activeLayerId: 'mvp-routes-tang-active',
    color: '#2f6085',
    width: 4,
    dasharray: [2.4, 1.4],
  },
  YAN: {
    layerId: 'mvp-routes-yan',
    activeLayerId: 'mvp-routes-yan-active',
    color: '#9d3f32',
    width: 5,
    dasharray: [0.65, 1.25],
  },
  COURT: {
    layerId: 'mvp-routes-court',
    activeLayerId: 'mvp-routes-court-active',
    color: '#7b5b90',
    width: 3,
    dasharray: [3, 1.2, 0.65, 1.2],
  },
  OTHER: {
    layerId: 'mvp-routes-other',
    activeLayerId: 'mvp-routes-other-active',
    color: '#69635b',
    width: 3,
    dasharray: [1.5, 1.5],
  },
}

function routeFilter(
  side: Side,
  segmentIds: readonly string[],
): FilterSpecification {
  return [
    'all',
    ['==', ['get', 'side'], side],
    ['in', ['get', 'id'], ['literal', segmentIds]],
  ]
}

function addRouteLayer(
  map: MapLibreMap,
  side: Side,
  style: RouteStyle,
  active: boolean,
): void {
  const layerId = active ? style.activeLayerId : style.layerId

  if (map.getLayer(layerId)) {
    return
  }

  map.addLayer({
    id: layerId,
    type: 'line',
    source: ROUTE_SOURCE_ID,
    filter: routeFilter(side, []),
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': style.color,
      'line-width': style.width + (active ? 2.5 : 0),
      'line-dasharray': style.dasharray,
      'line-opacity': active ? 0.92 : 0.58,
      'line-blur': active ? 0.15 : 0.35,
    },
  })
}

export function addRouteLayers(
  map: MapLibreMap,
  routeSegments: MvpDataset['routeSegments'],
  places: MvpDataset['places'],
): void {
  if (!map.getSource(ROUTE_SOURCE_ID)) {
    map.addSource(ROUTE_SOURCE_ID, {
      type: 'geojson',
      data: buildRouteDisplayFeatures(routeSegments, places),
      attribution: ROUTE_ATTRIBUTION,
    })
  }

  const sides = ['TANG', 'YAN', 'COURT', 'OTHER'] satisfies Side[]

  for (const side of sides) {
    addRouteLayer(map, side, ROUTE_STYLES[side], false)
  }

  for (const side of sides) {
    addRouteLayer(map, side, ROUTE_STYLES[side], true)
  }

  if (!map.getLayer('mvp-routes-hit-area')) {
    map.addLayer({
      id: 'mvp-routes-hit-area',
      type: 'line',
      source: ROUTE_SOURCE_ID,
      filter: ['in', ['get', 'id'], ['literal', []]],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': 'rgba(255, 255, 255, 0.001)',
        'line-width': 22,
      },
    })
  }

  if (!map.getLayer('mvp-routes-selected')) {
    map.addLayer({
      id: 'mvp-routes-selected',
      type: 'line',
      source: ROUTE_SOURCE_ID,
      filter: ['==', ['get', 'routeId'], ''],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#fff6d8',
        'line-width': 9,
        'line-opacity': 0.64,
        'line-blur': 1.2,
      },
    })
  }

  if (!map.getLayer('mvp-route-direction-arrows')) {
    map.addLayer({
      id: 'mvp-route-direction-arrows',
      type: 'symbol',
      source: ROUTE_SOURCE_ID,
      filter: ['in', ['get', 'id'], ['literal', []]],
      layout: {
        'symbol-placement': 'line-center',
        'text-field': ['get', 'arrowText'],
        'text-size': 19,
        'text-offset': [0, 0.78],
        'text-allow-overlap': true,
        'text-ignore-placement': true,
        'text-keep-upright': false,
        'text-rotation-alignment': 'map',
      },
      paint: {
        'text-color': [
          'match',
          ['get', 'side'],
          'TANG',
          ROUTE_STYLES.TANG.color,
          'YAN',
          ROUTE_STYLES.YAN.color,
          'COURT',
          ROUTE_STYLES.COURT.color,
          ROUTE_STYLES.OTHER.color,
        ],
        'text-halo-color': 'rgba(255, 248, 229, 0.96)',
        'text-halo-width': 2,
      },
    })
  }

  if (!map.getLayer('mvp-route-direction-labels')) {
    map.addLayer({
      id: 'mvp-route-direction-labels',
      type: 'symbol',
      source: ROUTE_SOURCE_ID,
      filter: ['in', ['get', 'id'], ['literal', []]],
      layout: {
        'symbol-placement': 'line-center',
        'text-field': [
          'concat',
          ['get', 'directionLabel'],
          '\n',
          ['get', 'distanceLabel'],
        ],
        'text-size': 12,
        'text-line-height': 1.2,
        'text-offset': [0, -1.72],
        'text-allow-overlap': false,
        'text-keep-upright': true,
        'text-rotation-alignment': 'map',
      },
      paint: {
        'text-color': [
          'match',
          ['get', 'side'],
          'TANG',
          '#244f70',
          'YAN',
          '#7f2e25',
          'COURT',
          '#644675',
          '#504b45',
        ],
        'text-halo-color': 'rgba(255, 248, 229, 0.98)',
        'text-halo-width': 2.2,
      },
    })
  }
}

export function applyRouteState(
  map: MapLibreMap,
  derivedState: DerivedMapState,
  selectedRouteId?: string,
): void {
  for (const side of ['TANG', 'YAN', 'COURT', 'OTHER'] satisfies Side[]) {
    const style = ROUTE_STYLES[side]

    if (map.getLayer(style.layerId)) {
      map.setFilter(
        style.layerId,
        routeFilter(side, derivedState.visibleRouteSegmentIds),
      )
    }

    if (map.getLayer(style.activeLayerId)) {
      map.setFilter(
        style.activeLayerId,
        routeFilter(side, derivedState.activeRouteSegmentIds),
      )
    }
  }

  if (map.getLayer('mvp-routes-hit-area')) {
    map.setFilter('mvp-routes-hit-area', [
      'in',
      ['get', 'id'],
      ['literal', derivedState.visibleRouteSegmentIds],
    ])
  }

  for (const layerId of [
    'mvp-route-direction-arrows',
    'mvp-route-direction-labels',
  ] as const) {
    if (map.getLayer(layerId)) {
      map.setFilter(layerId, [
        'in',
        ['get', 'id'],
        ['literal', derivedState.visibleRouteSegmentIds],
      ])
    }
  }

  if (map.getLayer('mvp-routes-selected')) {
    map.setFilter('mvp-routes-selected', [
      'all',
      ['==', ['get', 'routeId'], selectedRouteId ?? ''],
      [
        'in',
        ['get', 'id'],
        ['literal', derivedState.visibleRouteSegmentIds],
      ],
    ])
  }
}
