import type { Map as MapLibreMap } from 'maplibre-gl'
import { describe, expect, it, vi } from 'vitest'

import type { MvpDataset } from '../../domain/mvpTypes'
import type { DerivedMapState } from '../../domain/deriveMapState'
import {
  addGeographyLayers,
  GEOGRAPHY_DISPLAY_LABEL_SOURCE_ID,
  GEOGRAPHY_LAYER_IDS,
  GEOGRAPHY_SOURCE_ID,
  setLayerVisibility,
} from './geographyLayer'
import {
  addMilitaryGeographyBaseLayers,
  addMilitaryGeographyOverlayLayers,
  buildMilitaryGeographyGuides,
  EAST_GUANZHONG_CORRIDOR_SCREEN_WIDTH_PX,
  GUANZHONG_LOWLAND_LABEL_ANCHOR,
  MILITARY_GEOGRAPHY_LAYER_IDS,
  MILITARY_GEOGRAPHY_SOURCE_ID,
} from './militaryGeographyLayer'
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

const guideGeography = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[109.9, 34.7], [111.2, 34.8]],
      },
      properties: {
        id: 'geography-yellow-river',
        name: '黄河',
        geographyType: 'RIVER',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[108.9, 34.4], [110.3, 34.6]],
      },
      properties: {
        id: 'geography-wei-river',
        name: '渭河',
        geographyType: 'RIVER',
      },
    },
  ],
} as unknown as MvpDataset['geography']

const guideRouteSegments = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[110.29, 34.6], [110.87, 34.62]],
      },
      properties: {
        id: 'route-tang-advance-01',
        fromPlaceId: 'place-tongguan',
        toPlaceId: 'place-lingbao',
      },
    },
  ],
} as unknown as MvpDataset['routeSegments']

const derivedState: DerivedMapState = {
  visibleRouteSegmentIds: ['route-yan-01', 'route-tang-01'],
  activeRouteSegmentIds: ['route-tang-01'],
  relatedPlaceIds: ['place-tongguan', 'place-lingbao'],
  selectedPlaceId: 'place-tongguan',
  currentEventId: 'event-third',
}

describe('MVP map layers', () => {
  it('分别建立军事地理、geography、route 与 place source/layer 且重复调用幂等', () => {
    const mapMock = createMapMock()
    const map = mapMock as unknown as MapLibreMap

    addMilitaryGeographyBaseLayers(map, geography, routeSegments)
    addGeographyLayers(map, geography)
    addMilitaryGeographyOverlayLayers(map)
    addRouteLayers(map, routeSegments)
    addPlaceLayers(map, places)
    addMilitaryGeographyBaseLayers(map, geography, routeSegments)
    addGeographyLayers(map, geography)
    addMilitaryGeographyOverlayLayers(map)
    addRouteLayers(map, routeSegments)
    addPlaceLayers(map, places)

    expect(mapMock.addSource).toHaveBeenCalledTimes(5)
    expect(mapMock.sources.has(MILITARY_GEOGRAPHY_SOURCE_ID)).toBe(true)
    expect(mapMock.sources.has(GEOGRAPHY_SOURCE_ID)).toBe(true)
    expect(mapMock.sources.has(GEOGRAPHY_DISPLAY_LABEL_SOURCE_ID)).toBe(true)
    expect(mapMock.sources.has(PLACE_SOURCE_ID)).toBe(true)
    expect(mapMock.sources.has(ROUTE_SOURCE_ID)).toBe(true)
    expect(mapMock.addLayer).toHaveBeenCalledTimes(
      GEOGRAPHY_LAYER_IDS.length +
        ROUTE_LAYER_IDS.length +
        PLACE_LAYER_IDS.length +
        MILITARY_GEOGRAPHY_LAYER_IDS.length,
    )
    expect(mapMock.layers.get('mvp-geography-river')).toMatchObject({
      source: GEOGRAPHY_SOURCE_ID,
      type: 'line',
    })
    expect(mapMock.layers.get('mvp-places-city')).toMatchObject({
      source: PLACE_SOURCE_ID,
      type: 'circle',
    })
    expect(mapMock.layers.get('mvp-places-pass-symbol')).toMatchObject({
      source: PLACE_SOURCE_ID,
      type: 'symbol',
      layout: {
        'text-field': '◆',
      },
    })
    expect(mapMock.layers.get('mvp-places-pass-label')).toMatchObject({
      source: PLACE_SOURCE_ID,
      type: 'symbol',
      filter: ['==', ['get', 'placeType'], 'PASS'],
      layout: {
        'text-allow-overlap': true,
        'text-ignore-placement': true,
      },
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
    expect(mapMock.layers.get('phase2-river-flow-arrows')).toMatchObject({
      type: 'symbol',
      source: MILITARY_GEOGRAPHY_SOURCE_ID,
      layout: {
        'text-field': ['get', 'arrowText'],
        'text-keep-upright': false,
      },
    })
    expect(mapMock.layers.get('phase2-east-guanzhong-corridor-band')).toMatchObject({
      type: 'line',
      paint: {
        'line-width': EAST_GUANZHONG_CORRIDOR_SCREEN_WIDTH_PX,
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

  it('独立切换 hydrography/geography/place/routes 可见性', () => {
    const mapMock = createMapMock()
    const map = mapMock as unknown as MapLibreMap

    addMilitaryGeographyBaseLayers(map, geography, routeSegments)
    addGeographyLayers(map, geography)
    addMilitaryGeographyOverlayLayers(map)
    addRouteLayers(map, routeSegments)
    addPlaceLayers(map, places)
    setLayerVisibility(map, 'hydrography', false)
    setLayerVisibility(map, 'geography', false)
    setLayerVisibility(map, 'places', false)

    setLayerVisibility(map, 'routes', false)

    expect(mapMock.setLayoutProperty).toHaveBeenCalledTimes(
      GEOGRAPHY_LAYER_IDS.length +
        MILITARY_GEOGRAPHY_LAYER_IDS.length +
        PLACE_LAYER_IDS.length +
        ROUTE_LAYER_IDS.length,
    )
    expect(mapMock.setLayoutProperty).toHaveBeenCalledWith(
      'phase2-river-flow-arrows',
      'visibility',
      'none',
    )
    expect(mapMock.setLayoutProperty).toHaveBeenCalledWith(
      'phase2-east-guanzhong-corridor-band',
      'visibility',
      'none',
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

  it('从已批准正式几何派生流向、低地锚点和两点解释性通道，不写历史宽度', () => {
    const guides = buildMilitaryGeographyGuides(
      guideGeography,
      guideRouteSegments,
    )
    const flowFeatures = guides.features.filter(
      (feature) => feature.properties.featureKind === 'modernRiverFlowGuide',
    )
    const corridor = guides.features.find(
      (feature) => feature.properties.featureKind === 'displayOnlyCorridor',
    )
    const lowland = guides.features.find(
      (feature) => feature.properties.featureKind === 'modernLowlandLabel',
    )

    expect(flowFeatures).toHaveLength(2)
    expect(flowFeatures.map((feature) => feature.properties.sourceFeatureId)).toEqual([
      'geography-yellow-river',
      'geography-wei-river',
    ])
    expect(corridor?.geometry).toEqual({
      type: 'LineString',
      coordinates: [[110.87, 34.62], [110.29, 34.6]],
    })
    expect(corridor?.properties).toMatchObject({
      screenWidthPx: 22,
      sourceFeatureId: 'route-tang-advance-01',
    })
    expect(corridor?.properties.displayBoundary).toContain('not a historical road')
    expect(lowland?.geometry).toEqual({
      type: 'Point',
      coordinates: [...GUANZHONG_LOWLAND_LABEL_ANCHOR],
    })
    expect(lowland?.properties.displayBoundary).toContain('no historical plain polygon')
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
