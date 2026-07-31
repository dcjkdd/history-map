import type { Map as MapLibreMap } from 'maplibre-gl'
import { describe, expect, it, vi } from 'vitest'

import type { MvpDataset } from '../../domain/mvpTypes'
import {
  addGeographyLayers,
  GEOGRAPHY_LAYER_IDS,
  GEOGRAPHY_SOURCE_ID,
  setLayerVisibility,
} from './geographyLayer'
import {
  addPlaceLayers,
  PLACE_LAYER_IDS,
  PLACE_SOURCE_ID,
  setSelectedPlace,
} from './placeLayer'

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

describe('MVP map layers', () => {
  it('分别建立 geography 与 place GeoJSON source/layer 且重复调用幂等', () => {
    const mapMock = createMapMock()
    const map = mapMock as unknown as MapLibreMap

    addGeographyLayers(map, geography)
    addPlaceLayers(map, places)
    addGeographyLayers(map, geography)
    addPlaceLayers(map, places)

    expect(mapMock.addSource).toHaveBeenCalledTimes(2)
    expect(mapMock.sources.has(GEOGRAPHY_SOURCE_ID)).toBe(true)
    expect(mapMock.sources.has(PLACE_SOURCE_ID)).toBe(true)
    expect(mapMock.addLayer).toHaveBeenCalledTimes(
      GEOGRAPHY_LAYER_IDS.length + PLACE_LAYER_IDS.length,
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
  })

  it('独立切换 geography/place 可见性，routes 空组安全无操作', () => {
    const mapMock = createMapMock()
    const map = mapMock as unknown as MapLibreMap

    addGeographyLayers(map, geography)
    addPlaceLayers(map, places)
    setLayerVisibility(map, 'geography', false)
    setLayerVisibility(map, 'places', false)

    expect(mapMock.setLayoutProperty).toHaveBeenCalledTimes(
      GEOGRAPHY_LAYER_IDS.length + PLACE_LAYER_IDS.length,
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

    mapMock.setLayoutProperty.mockClear()
    expect(() => setLayerVisibility(map, 'routes', false)).not.toThrow()
    expect(mapMock.setLayoutProperty).not.toHaveBeenCalled()
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
})
