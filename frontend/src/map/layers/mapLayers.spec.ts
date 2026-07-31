import type { Map as MapLibreMap } from 'maplibre-gl'
import { describe, expect, it, vi } from 'vitest'

import type { MvpDataset } from '../../domain/mvpTypes'
import type { DerivedMapState } from '../../domain/deriveMapState'
import {
  addGeographyLayers,
  GEOGRAPHY_LAYER_IDS,
  GEOGRAPHY_SOURCE_ID,
  setLayerVisibility,
} from './geographyLayer'
import {
  addPlaceLayers,
  applyRelatedPlaceState,
  PLACE_LAYER_IDS,
  PLACE_SOURCE_ID,
  setSelectedPlace,
} from './placeLayer'
import {
  addRouteLayers,
  applyRouteState,
  ROUTE_LAYER_IDS,
  ROUTE_SOURCE_ID,
} from './routeLayer'

function createMapMock() {
  const sources = new Map<string, unknown>()
  const layers = new Map<string, { id: string; [key: string]: unknown }>()

  return {
    sources,
    layers,
    addSource: vi.fn((id: string, source: unknown) => {
      sources.set(id, source)
    }),
    getSource: vi.fn((id: string) => sources.get(id)),
    addLayer: vi.fn((layer: { id: string; [key: string]: unknown }) => {
      layers.set(layer.id, layer)
    }),
    getLayer: vi.fn((id: string) => layers.get(id)),
    setFilter: vi.fn(),
    setLayoutProperty: vi.fn(),
  }
}

const geography: MvpDataset['geography'] = {
  type: 'FeatureCollection',
  features: [],
}

const places: MvpDataset['places'] = {
  type: 'FeatureCollection',
  features: [],
}

const routeSegments: MvpDataset['routeSegments'] = {
  type: 'FeatureCollection',
  features: [],
}

const derivedState: DerivedMapState = {
  visibleRouteSegmentIds: ['route-yan-01', 'route-tang-01'],
  activeRouteSegmentIds: ['route-tang-01'],
  relatedPlaceIds: ['place-tongguan', 'place-lingbao'],
  selectedPlaceId: 'place-tongguan',
  currentEventId: 'event-third',
}

describe('MVP map layers', () => {
  it('分别建立 geography、route 与 place GeoJSON source/layer 且重复调用幂等', () => {
    const mapMock = createMapMock()
    const map = mapMock as unknown as MapLibreMap

    addGeographyLayers(map, geography)
    addRouteLayers(map, routeSegments)
    addPlaceLayers(map, places)
    addGeographyLayers(map, geography)
    addRouteLayers(map, routeSegments)
    addPlaceLayers(map, places)

    expect(mapMock.addSource).toHaveBeenCalledTimes(3)
    expect(mapMock.sources.has(GEOGRAPHY_SOURCE_ID)).toBe(true)
    expect(mapMock.sources.has(PLACE_SOURCE_ID)).toBe(true)
    expect(mapMock.sources.has(ROUTE_SOURCE_ID)).toBe(true)
    expect(mapMock.addLayer).toHaveBeenCalledTimes(
      GEOGRAPHY_LAYER_IDS.length + ROUTE_LAYER_IDS.length + PLACE_LAYER_IDS.length,
    )
    expect(mapMock.layers.get('mvp-geography-river')).toMatchObject({
      source: GEOGRAPHY_SOURCE_ID,
      type: 'line',
    })
    expect(mapMock.layers.get('mvp-places-city')).toMatchObject({
      source: PLACE_SOURCE_ID,
      type: 'circle',
    })
    expect(mapMock.layers.get('mvp-places-pass-outer')).toMatchObject({
      source: PLACE_SOURCE_ID,
      type: 'circle',
    })
    expect(mapMock.layers.get('mvp-places-uncertain')).toMatchObject({
      filter: [
        'in',
        ['get', 'certainty'],
        ['literal', ['LOW', 'DISPUTED', 'UNKNOWN']],
      ],
      paint: {
        'circle-color': 'rgba(255, 253, 247, 0)',
        'circle-stroke-width': 2,
      },
    })
    expect(mapMock.layers.get('mvp-geography-area-outline')).toMatchObject({
      paint: {
        'line-dasharray': [2, 1.5],
      },
    })
    expect(mapMock.layers.get('mvp-routes-tang')).toMatchObject({
      type: 'line',
      source: ROUTE_SOURCE_ID,
      paint: {
        'line-color': '#2f6085',
        'line-dasharray': [2.4, 1.4],
        'line-width': 4,
        'line-opacity': 0.58,
      },
    })
    expect(mapMock.layers.get('mvp-routes-yan')).toMatchObject({
      paint: {
        'line-color': '#9d3f32',
        'line-dasharray': [0.65, 1.25],
        'line-width': 5,
      },
    })
    expect(mapMock.layers.get('mvp-routes-court')).toMatchObject({
      paint: {
        'line-color': '#7b5b90',
        'line-dasharray': [3, 1.2, 0.65, 1.2],
        'line-width': 3,
      },
    })
    expect(mapMock.layers.get('mvp-routes-tang-active')).toMatchObject({
      paint: {
        'line-color': '#2f6085',
        'line-width': 6.5,
        'line-opacity': 0.92,
      },
    })
    expect(
      mapMock.addLayer.mock.calls
        .map(([layer]) => layer.id)
        .filter((layerId) => layerId.startsWith('mvp-routes-')),
    ).toEqual(ROUTE_LAYER_IDS)
  })

  it('独立切换 geography/place/routes 可见性', () => {
    const mapMock = createMapMock()
    const map = mapMock as unknown as MapLibreMap

    addGeographyLayers(map, geography)
    addRouteLayers(map, routeSegments)
    addPlaceLayers(map, places)
    setLayerVisibility(map, 'geography', false)
    setLayerVisibility(map, 'places', false)

    setLayerVisibility(map, 'routes', false)

    expect(mapMock.setLayoutProperty).toHaveBeenCalledTimes(
      GEOGRAPHY_LAYER_IDS.length + PLACE_LAYER_IDS.length + ROUTE_LAYER_IDS.length,
    )
    expect(mapMock.setLayoutProperty).toHaveBeenCalledWith(
      'mvp-geography-river',
      'visibility',
      'none',
    )
    expect(mapMock.setLayoutProperty).toHaveBeenCalledWith(
      'mvp-places-city',
      'visibility',
      'none',
    )

    expect(mapMock.setLayoutProperty).toHaveBeenCalledWith(
      'mvp-routes-yan',
      'visibility',
      'none',
    )
  })

  it('只在选择高亮层存在时更新地点过滤条件', () => {
    const mapMock = createMapMock()
    const map = mapMock as unknown as MapLibreMap

    setSelectedPlace(map, 'place-tongguan')
    expect(mapMock.setFilter).not.toHaveBeenCalled()

    addPlaceLayers(map, places)
    setSelectedPlace(map, 'place-tongguan')
    setSelectedPlace(map, undefined)

    expect(mapMock.setFilter).toHaveBeenNthCalledWith(
      1,
      'mvp-places-selected',
      ['==', ['get', 'id'], 'place-tongguan'],
    )
    expect(mapMock.setFilter).toHaveBeenNthCalledWith(
      2,
      'mvp-places-selected',
      ['==', ['get', 'id'], ''],
    )
  })

  it('按派生状态过滤可见/active 路线，并让手动地点优先于事件相关地点', () => {
    const mapMock = createMapMock()
    const map = mapMock as unknown as MapLibreMap

    addRouteLayers(map, routeSegments)
    addPlaceLayers(map, places)
    applyRouteState(map, derivedState)
    applyRelatedPlaceState(map, derivedState)
    setSelectedPlace(map, derivedState.selectedPlaceId)

    expect(mapMock.setFilter).toHaveBeenCalledWith('mvp-routes-yan', [
      'all',
      ['==', ['get', 'side'], 'YAN'],
      [
        'in',
        ['get', 'id'],
        ['literal', ['route-yan-01', 'route-tang-01']],
      ],
    ])
    expect(mapMock.setFilter).toHaveBeenCalledWith(
      'mvp-routes-tang-active',
      [
        'all',
        ['==', ['get', 'side'], 'TANG'],
        ['in', ['get', 'id'], ['literal', ['route-tang-01']]],
      ],
    )
    expect(mapMock.setFilter).toHaveBeenCalledWith('mvp-places-related', [
      'in',
      ['get', 'id'],
      ['literal', ['place-lingbao']],
    ])
    expect(mapMock.setFilter).toHaveBeenCalledWith('mvp-places-selected', [
      '==',
      ['get', 'id'],
      'place-tongguan',
    ])
  })
})
