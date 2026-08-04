import type { Map as MapLibreMap } from 'maplibre-gl'

export const TERRAIN_ASSET_DIRECTORY = 'terrain/phase2-02'
export const TERRAIN_BOUNDS: [number, number, number, number] = [108, 33, 113, 36]

export const TERRAIN_SOURCE_IDS = [
  'phase2-terrain-color-relief',
  'phase2-terrain-dem',
  'phase2-modern-provinces',
] as const

export const TERRAIN_LAYER_IDS = [
  'phase2-terrain-color-relief',
  'phase2-terrain-hillshade',
  'phase2-modern-provinces-fill',
  'phase2-modern-provinces-outline',
  'phase2-modern-provinces-label',
] as const

export const COPERNICUS_ATTRIBUTION =
  'produced using Copernicus WorldDEM-90 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved · The organisations in charge of the Copernicus programme by law or by delegation do not incur any liability for any use of the Copernicus WorldDEM™-90.'

export const GEObOUNDARIES_ATTRIBUTION =
  '<a href="https://www.geoboundaries.org/" target="_blank" rel="noopener">geoBoundaries</a>（现代省级方位，非唐代边界）'

export function resolveTerrainAssetUrl(baseUrl: string, path: string): string {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return `${normalizedBaseUrl}${TERRAIN_ASSET_DIRECTORY}/${path}`
}

export function addTerrainLayers(map: MapLibreMap, baseUrl = import.meta.env.BASE_URL): void {
  const [west, south, east, north] = TERRAIN_BOUNDS

  if (!map.getSource(TERRAIN_SOURCE_IDS[0])) {
    map.addSource(TERRAIN_SOURCE_IDS[0], {
      type: 'image',
      url: resolveTerrainAssetUrl(baseUrl, 'color-relief.png'),
      coordinates: [
        [west, north],
        [east, north],
        [east, south],
        [west, south],
      ],
    })
  }

  if (!map.getSource(TERRAIN_SOURCE_IDS[1])) {
    map.addSource(TERRAIN_SOURCE_IDS[1], {
      type: 'raster-dem',
      tiles: [resolveTerrainAssetUrl(baseUrl, 'terrain/{z}/{x}/{y}.png')],
      bounds: TERRAIN_BOUNDS,
      minzoom: 5,
      maxzoom: 9,
      tileSize: 256,
      encoding: 'terrarium',
      attribution: COPERNICUS_ATTRIBUTION,
    })
  }

  if (!map.getSource(TERRAIN_SOURCE_IDS[2])) {
    map.addSource(TERRAIN_SOURCE_IDS[2], {
      type: 'geojson',
      data: resolveTerrainAssetUrl(baseUrl, 'provinces.geojson'),
      attribution: GEObOUNDARIES_ATTRIBUTION,
    })
  }

  if (!map.getLayer(TERRAIN_LAYER_IDS[0])) {
    map.addLayer({
      id: TERRAIN_LAYER_IDS[0],
      type: 'raster',
      source: TERRAIN_SOURCE_IDS[0],
      paint: {
        'raster-opacity': 0.92,
        'raster-fade-duration': 0,
      },
    })
  }

  if (!map.getLayer(TERRAIN_LAYER_IDS[1])) {
    map.addLayer({
      id: TERRAIN_LAYER_IDS[1],
      type: 'hillshade',
      source: TERRAIN_SOURCE_IDS[1],
      paint: {
        'hillshade-exaggeration': 0.55,
        'hillshade-illumination-direction': 315,
        'hillshade-illumination-anchor': 'map',
        'hillshade-shadow-color': '#2d3028',
        'hillshade-highlight-color': '#fff4d7',
        'hillshade-accent-color': '#6f604b',
      },
    })
  }

  if (!map.getLayer(TERRAIN_LAYER_IDS[2])) {
    map.addLayer({
      id: TERRAIN_LAYER_IDS[2],
      type: 'fill',
      source: TERRAIN_SOURCE_IDS[2],
      filter: ['==', ['get', 'featureKind'], 'modernProvinceBoundary'],
      paint: {
        'fill-color': '#fffdf7',
        'fill-opacity': 0.025,
      },
    })
  }

  if (!map.getLayer(TERRAIN_LAYER_IDS[3])) {
    map.addLayer({
      id: TERRAIN_LAYER_IDS[3],
      type: 'line',
      source: TERRAIN_SOURCE_IDS[2],
      filter: ['==', ['get', 'featureKind'], 'modernProvinceBoundary'],
      paint: {
        'line-color': '#514d47',
        'line-opacity': 0.5,
        'line-width': 1.2,
        'line-dasharray': [3, 2],
      },
    })
  }

  if (!map.getLayer(TERRAIN_LAYER_IDS[4])) {
    map.addLayer({
      id: TERRAIN_LAYER_IDS[4],
      type: 'symbol',
      source: TERRAIN_SOURCE_IDS[2],
      filter: ['==', ['get', 'featureKind'], 'modernProvinceLabel'],
      layout: {
        'text-field': ['concat', ['get', 'labelZh'], '（今）'],
        'text-size': 13,
        'text-letter-spacing': 0.12,
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': '#4e4a44',
        'text-halo-color': 'rgba(255, 253, 247, 0.92)',
        'text-halo-width': 1.5,
      },
    })
  }
}

interface TerrainErrorLike {
  sourceId?: unknown
  error?: { url?: unknown; message?: unknown }
}

export function isTerrainAssetError(event: TerrainErrorLike): boolean {
  if (
    typeof event.sourceId === 'string' &&
    (TERRAIN_SOURCE_IDS as readonly string[]).includes(event.sourceId)
  ) {
    return true
  }

  const url = event.error?.url
  const message = event.error?.message
  return (
    (typeof url === 'string' && url.includes(`/${TERRAIN_ASSET_DIRECTORY}/`)) ||
    (typeof message === 'string' && message.includes(`/${TERRAIN_ASSET_DIRECTORY}/`))
  )
}
