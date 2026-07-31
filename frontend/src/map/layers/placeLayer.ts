import type { Map as MapLibreMap } from 'maplibre-gl'

import type { MvpDataset } from '../../domain/mvpTypes'

export const PLACE_SOURCE_ID = 'mvp-places'

export const PLACE_LAYER_IDS = [
  'mvp-places-uncertain',
  'mvp-places-other',
  'mvp-places-city',
  'mvp-places-pass-outer',
  'mvp-places-pass-inner',
  'mvp-places-selected',
] as const

export const PLACE_INTERACTIVE_LAYER_IDS = [
  'mvp-places-other',
  'mvp-places-city',
  'mvp-places-pass-outer',
] as const

const UNCERTAIN_CERTAINTIES = ['LOW', 'DISPUTED', 'UNKNOWN']

export function addPlaceLayers(
  map: MapLibreMap,
  places: MvpDataset['places'],
): void {
  if (!map.getSource(PLACE_SOURCE_ID)) {
    map.addSource(PLACE_SOURCE_ID, {
      type: 'geojson',
      data: places,
    })
  }

  if (!map.getLayer(PLACE_LAYER_IDS[0])) {
    map.addLayer({
      id: PLACE_LAYER_IDS[0],
      type: 'circle',
      source: PLACE_SOURCE_ID,
      filter: ['in', ['get', 'certainty'], ['literal', UNCERTAIN_CERTAINTIES]],
      paint: {
        'circle-radius': 10,
        'circle-color': 'rgba(255, 253, 247, 0)',
        'circle-stroke-color': '#6f6253',
        'circle-stroke-opacity': 0.72,
        'circle-stroke-width': 2,
      },
    })
  }

  if (!map.getLayer(PLACE_LAYER_IDS[1])) {
    map.addLayer({
      id: PLACE_LAYER_IDS[1],
      type: 'circle',
      source: PLACE_SOURCE_ID,
      filter: [
        'all',
        ['!=', ['get', 'placeType'], 'CITY'],
        ['!=', ['get', 'placeType'], 'PASS'],
      ],
      paint: {
        'circle-radius': 5,
        'circle-color': '#f0b35d',
        'circle-opacity': 0.78,
        'circle-stroke-color': '#3f3328',
        'circle-stroke-width': 1.5,
      },
    })
  }

  if (!map.getLayer(PLACE_LAYER_IDS[2])) {
    map.addLayer({
      id: PLACE_LAYER_IDS[2],
      type: 'circle',
      source: PLACE_SOURCE_ID,
      filter: ['==', ['get', 'placeType'], 'CITY'],
      paint: {
        'circle-radius': 7,
        'circle-color': '#a4492d',
        'circle-opacity': 0.82,
        'circle-stroke-color': '#fffdf7',
        'circle-stroke-width': 2,
      },
    })
  }

  if (!map.getLayer(PLACE_LAYER_IDS[3])) {
    map.addLayer({
      id: PLACE_LAYER_IDS[3],
      type: 'circle',
      source: PLACE_SOURCE_ID,
      filter: ['==', ['get', 'placeType'], 'PASS'],
      paint: {
        'circle-radius': 8,
        'circle-color': 'rgba(255, 253, 247, 0.6)',
        'circle-stroke-color': '#49372b',
        'circle-stroke-width': 2.5,
      },
    })
  }

  if (!map.getLayer(PLACE_LAYER_IDS[4])) {
    map.addLayer({
      id: PLACE_LAYER_IDS[4],
      type: 'circle',
      source: PLACE_SOURCE_ID,
      filter: ['==', ['get', 'placeType'], 'PASS'],
      paint: {
        'circle-radius': 2.5,
        'circle-color': '#49372b',
      },
    })
  }

  if (!map.getLayer(PLACE_LAYER_IDS[5])) {
    map.addLayer({
      id: PLACE_LAYER_IDS[5],
      type: 'circle',
      source: PLACE_SOURCE_ID,
      filter: ['==', ['get', 'id'], ''],
      paint: {
        'circle-radius': 13,
        'circle-color': 'rgba(255, 253, 247, 0)',
        'circle-stroke-color': '#17231d',
        'circle-stroke-width': 3,
      },
    })
  }
}

export function setSelectedPlace(
  map: MapLibreMap,
  placeId: string | undefined,
): void {
  const selectedLayerId = PLACE_LAYER_IDS[5]

  if (!map.getLayer(selectedLayerId)) {
    return
  }

  map.setFilter(selectedLayerId, [
    '==',
    ['get', 'id'],
    placeId ?? '',
  ])
}
