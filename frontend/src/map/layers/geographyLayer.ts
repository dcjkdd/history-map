import type { Map as MapLibreMap } from 'maplibre-gl'

import type { LayerGroup, MvpDataset } from '../../domain/mvpTypes'
import {
  MILITARY_HYDROGRAPHY_LAYER_IDS,
  MILITARY_LAND_GEOGRAPHY_LAYER_IDS,
} from './militaryGeographyLayer'
import { PLACE_LAYER_IDS } from './placeLayer'
import { ROUTE_LAYER_IDS } from './routeLayer'

export const GEOGRAPHY_SOURCE_ID = 'mvp-geography'
export const GEOGRAPHY_DISPLAY_LABEL_SOURCE_ID = 'mvp-geography-display-labels'

export const HISTORY_GEOGRAPHY_ATTRIBUTION =
  'Made with <a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener">Natural Earth</a> · 正式历史数据含 DISPUTED 代表点、APPROXIMATE 事件与 INFERENCE / LOW 路线；不表示精确古代边界、河道或行军轨迹'

export const GEOGRAPHY_LAYER_IDS = [
  'mvp-geography-area',
  'mvp-geography-area-outline',
  'mvp-geography-river-casing',
  'mvp-geography-river',
  'mvp-geography-linear-landform',
  'mvp-geography-river-label',
  'mvp-geography-mountain-label',
] as const

const DISPLAY_ONLY_GEOGRAPHY_LABELS = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [110.45, 33.86],
      },
      properties: {
        name: '秦岭',
        labelBasis:
          'display-only anchor derived from the approved generalized polygon; not formal history data',
      },
    },
  ],
}

const LAYER_IDS_BY_GROUP: Record<LayerGroup, readonly string[]> = {
  hydrography: [
    GEOGRAPHY_LAYER_IDS[2],
    GEOGRAPHY_LAYER_IDS[3],
    GEOGRAPHY_LAYER_IDS[5],
    ...MILITARY_HYDROGRAPHY_LAYER_IDS,
  ],
  geography: [
    GEOGRAPHY_LAYER_IDS[0],
    GEOGRAPHY_LAYER_IDS[1],
    GEOGRAPHY_LAYER_IDS[4],
    GEOGRAPHY_LAYER_IDS[6],
    ...MILITARY_LAND_GEOGRAPHY_LAYER_IDS,
  ],
  places: PLACE_LAYER_IDS,
  routes: ROUTE_LAYER_IDS,
}

export function addGeographyLayers(
  map: MapLibreMap,
  geography: MvpDataset['geography'],
): void {
  if (!map.getSource(GEOGRAPHY_SOURCE_ID)) {
    map.addSource(GEOGRAPHY_SOURCE_ID, {
      type: 'geojson',
      data: geography,
      attribution: HISTORY_GEOGRAPHY_ATTRIBUTION,
    })
  }

  if (!map.getSource(GEOGRAPHY_DISPLAY_LABEL_SOURCE_ID)) {
    map.addSource(GEOGRAPHY_DISPLAY_LABEL_SOURCE_ID, {
      type: 'geojson',
      data: DISPLAY_ONLY_GEOGRAPHY_LABELS,
    })
  }

  if (!map.getLayer(GEOGRAPHY_LAYER_IDS[0])) {
    map.addLayer({
      id: GEOGRAPHY_LAYER_IDS[0],
      type: 'fill',
      source: GEOGRAPHY_SOURCE_ID,
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: {
        'fill-color': [
          'match',
          ['get', 'geographyType'],
          'MOUNTAIN',
          '#8a7654',
          'CORRIDOR',
          '#c6a56d',
          '#a99b7d',
        ],
        'fill-opacity': 0.22,
      },
    })
  }

  if (!map.getLayer(GEOGRAPHY_LAYER_IDS[1])) {
    map.addLayer({
      id: GEOGRAPHY_LAYER_IDS[1],
      type: 'line',
      source: GEOGRAPHY_SOURCE_ID,
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: {
        'line-color': '#756343',
        'line-opacity': 0.72,
        'line-width': 1.5,
        'line-dasharray': [2, 1.5],
      },
    })
  }

  if (!map.getLayer(GEOGRAPHY_LAYER_IDS[2])) {
    map.addLayer({
      id: GEOGRAPHY_LAYER_IDS[2],
      type: 'line',
      source: GEOGRAPHY_SOURCE_ID,
      filter: [
        'all',
        ['==', ['geometry-type'], 'LineString'],
        ['==', ['get', 'geographyType'], 'RIVER'],
      ],
      paint: {
        'line-color': '#f4f1df',
        'line-opacity': 0.78,
        'line-width': ['interpolate', ['linear'], ['zoom'], 5, 4, 8, 6],
      },
    })
  }

  if (!map.getLayer(GEOGRAPHY_LAYER_IDS[3])) {
    map.addLayer({
      id: GEOGRAPHY_LAYER_IDS[3],
      type: 'line',
      source: GEOGRAPHY_SOURCE_ID,
      filter: [
        'all',
        ['==', ['geometry-type'], 'LineString'],
        ['==', ['get', 'geographyType'], 'RIVER'],
      ],
      paint: {
        'line-color': '#236f9b',
        'line-opacity': 0.96,
        'line-width': ['interpolate', ['linear'], ['zoom'], 5, 1.8, 8, 3.2],
      },
    })
  }

  if (!map.getLayer(GEOGRAPHY_LAYER_IDS[4])) {
    map.addLayer({
      id: GEOGRAPHY_LAYER_IDS[4],
      type: 'line',
      source: GEOGRAPHY_SOURCE_ID,
      filter: [
        'all',
        ['==', ['geometry-type'], 'LineString'],
        ['!=', ['get', 'geographyType'], 'RIVER'],
      ],
      paint: {
        'line-color': '#8f7043',
        'line-opacity': 0.7,
        'line-width': 4,
        'line-dasharray': [1.5, 1.5],
      },
    })
  }

  if (!map.getLayer(GEOGRAPHY_LAYER_IDS[5])) {
    map.addLayer({
      id: GEOGRAPHY_LAYER_IDS[5],
      type: 'symbol',
      source: GEOGRAPHY_SOURCE_ID,
      filter: ['==', ['get', 'geographyType'], 'RIVER'],
      layout: {
        'symbol-placement': 'line',
        'symbol-spacing': 360,
        'text-field': ['get', 'name'],
        'text-size': 13,
        'text-allow-overlap': false,
        'text-keep-upright': true,
      },
      paint: {
        'text-color': '#155b83',
        'text-halo-color': '#fff8e5',
        'text-halo-width': 1.8,
      },
    })
  }

  if (!map.getLayer(GEOGRAPHY_LAYER_IDS[6])) {
    map.addLayer({
      id: GEOGRAPHY_LAYER_IDS[6],
      type: 'symbol',
      source: GEOGRAPHY_DISPLAY_LABEL_SOURCE_ID,
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 17,
        'text-letter-spacing': 0.14,
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': '#3f4734',
        'text-halo-color': '#fff8e5',
        'text-halo-width': 2,
      },
    })
  }
}

export function setLayerVisibility(
  map: MapLibreMap,
  layerGroup: LayerGroup,
  visible: boolean,
): void {
  for (const layerId of LAYER_IDS_BY_GROUP[layerGroup]) {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(
        layerId,
        'visibility',
        visible ? 'visible' : 'none',
      )
    }
  }
}
