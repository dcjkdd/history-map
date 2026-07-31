import type {
  FilterSpecification,
  Map as MapLibreMap,
} from 'maplibre-gl'

import type { DerivedMapState } from '../../domain/deriveMapState'
import type { MvpDataset, Side } from '../../domain/mvpTypes'

export const ROUTE_SOURCE_ID = 'mvp-route-segments'

export const ROUTE_LAYER_IDS = [
  'mvp-routes-tang',
  'mvp-routes-yan',
  'mvp-routes-court',
  'mvp-routes-other',
  'mvp-routes-tang-active',
  'mvp-routes-yan-active',
  'mvp-routes-court-active',
  'mvp-routes-other-active',
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
): void {
  if (!map.getSource(ROUTE_SOURCE_ID)) {
    map.addSource(ROUTE_SOURCE_ID, {
      type: 'geojson',
      data: routeSegments,
    })
  }

  const sides = ['TANG', 'YAN', 'COURT', 'OTHER'] satisfies Side[]

  for (const side of sides) {
    addRouteLayer(map, side, ROUTE_STYLES[side], false)
  }

  for (const side of sides) {
    addRouteLayer(map, side, ROUTE_STYLES[side], true)
  }
}

export function applyRouteState(
  map: MapLibreMap,
  derivedState: DerivedMapState,
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
}
