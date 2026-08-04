import type { Map as MapLibreMap } from 'maplibre-gl'
import { describe, expect, it, vi } from 'vitest'

import {
  addTerrainLayers,
  COPERNICUS_ATTRIBUTION,
  GEObOUNDARIES_ATTRIBUTION,
  isTerrainAssetError,
  resolveTerrainAssetUrl,
  TERRAIN_LAYER_IDS,
  TERRAIN_SOURCE_IDS,
} from './terrainLayer'

function createMapMock() {
  const sources = new Map<string, Record<string, unknown>>()
  const layers = new Map<string, Record<string, unknown>>()
  return {
    sources,
    layers,
    addSource: vi.fn((id: string, source: Record<string, unknown>) => sources.set(id, source)),
    getSource: vi.fn((id: string) => sources.get(id)),
    addLayer: vi.fn((layer: Record<string, unknown> & { id: string }) => layers.set(layer.id, layer)),
    getLayer: vi.fn((id: string) => layers.get(id)),
  }
}

describe('PHASE2-02 terrain layers', () => {
  it('同时支持根路径与 /history-map/ 静态 base path', () => {
    expect(resolveTerrainAssetUrl('/', 'manifest.json')).toBe(
      '/terrain/phase2-02/manifest.json',
    )
    expect(resolveTerrainAssetUrl('/history-map', 'color-relief.png')).toBe(
      '/history-map/terrain/phase2-02/color-relief.png',
    )
  })

  it('幂等建立分层设色、hillshade 与现代省级定位图层', () => {
    const mapMock = createMapMock()
    const map = mapMock as unknown as MapLibreMap

    addTerrainLayers(map, '/history-map/')
    addTerrainLayers(map, '/history-map/')

    expect(mapMock.addSource).toHaveBeenCalledTimes(TERRAIN_SOURCE_IDS.length)
    expect(mapMock.addLayer).toHaveBeenCalledTimes(TERRAIN_LAYER_IDS.length)
    expect(mapMock.sources.get('phase2-terrain-color-relief')).toMatchObject({
      type: 'image',
      url: '/history-map/terrain/phase2-02/color-relief.png',
    })
    expect(mapMock.sources.get('phase2-terrain-dem')).toMatchObject({
      type: 'raster-dem',
      encoding: 'terrarium',
      tiles: ['/history-map/terrain/phase2-02/terrain/{z}/{x}/{y}.png'],
      attribution: COPERNICUS_ATTRIBUTION,
    })
    expect(mapMock.sources.get('phase2-modern-provinces')).toMatchObject({
      type: 'geojson',
      data: '/history-map/terrain/phase2-02/provinces.geojson',
      attribution: GEObOUNDARIES_ATTRIBUTION,
    })
    expect(mapMock.layers.get('phase2-terrain-hillshade')).toMatchObject({
      type: 'hillshade',
      source: 'phase2-terrain-dem',
    })
    expect(mapMock.layers.get('phase2-modern-provinces-label')).toMatchObject({
      type: 'symbol',
      source: 'phase2-modern-provinces',
    })
  })

  it('只把正式地形 source 或静态资产 URL 的错误判定为地形降级', () => {
    expect(isTerrainAssetError({ sourceId: 'phase2-terrain-dem' })).toBe(true)
    expect(
      isTerrainAssetError({
        error: { url: '/history-map/terrain/phase2-02/terrain/8/205/101.png' },
      }),
    ).toBe(true)
    expect(isTerrainAssetError({ sourceId: 'mvp-places' })).toBe(false)
    expect(isTerrainAssetError({ error: { url: '/data/anshi/mvp-v1.json' } })).toBe(false)
  })
})
