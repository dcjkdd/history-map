import type { Map as MapLibreMap } from 'maplibre-gl'

import type { LayerGroup, MvpDataset } from '../../domain/mvpTypes'
import { PLACE_LAYER_IDS } from './placeLayer'

export const GEOGRAPHY_SOURCE_ID = 'mvp-geography'

export const GEOGRAPHY_LAYER_IDS = [
  'mvp-geography-area',
  'mvp-geography-area-outline',
  'mvp-geography-river',
  'mvp-geography-linear-landform',
] as const

const LAYER_IDS_BY_GROUP: Record<LayerGroup, readonly string[]> = {
  geography: GEOGRAPHY_LAYER_IDS,
  places: PLACE_LAYER_IDS,
  routes: [],
}

export function addGeographyLayers(
  map: MapLibreMap,
  geography: MvpDataset['geography'],
): void {
  if (!map.getSource(GEOGRAPHY_SOURCE_ID)) {
    map.addSource(GEOGRAPHY_SOURCE_ID, {
      type: 'geojson',
      data: geography,
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
        'line-color': '#4f8191',
        'line-opacity': 0.8,
        'line-width': ['interpolate', ['linear'], ['zoom'], 5, 1.5, 8, 3],
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
