import type { Map as MapLibreMap } from 'maplibre-gl'

import type { DerivedMapState } from '../../domain/deriveMapState'
import type { MvpDataset } from '../../domain/mvpTypes'

export const PLACE_SOURCE_ID = 'mvp-places'

export const PLACE_LAYER_IDS = [
  'mvp-places-uncertain',
  'mvp-places-other',
  'mvp-places-city',
  'mvp-places-pass-symbol',
  'mvp-places-related',
  'mvp-places-selected',
  'mvp-places-label',
  'mvp-places-pass-label',
] as const

export const PLACE_INTERACTIVE_LAYER_IDS = [
  'mvp-places-other',
  'mvp-places-city',
  'mvp-places-pass-symbol',
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
      type: 'symbol',
      source: PLACE_SOURCE_ID,
      filter: ['==', ['get', 'placeType'], 'PASS'],
      layout: {
        'text-field': '◆',
        'text-size': 20,
        'text-allow-overlap': true,
        'text-ignore-placement': true,
      },
      paint: {
        'text-color': '#49372b',
        'text-halo-color': '#fffdf7',
        'text-halo-width': 2.2,
      },
    })
  }

  if (!map.getLayer(PLACE_LAYER_IDS[4])) {
    map.addLayer({
      id: PLACE_LAYER_IDS[4],
      type: 'circle',
      source: PLACE_SOURCE_ID,
      filter: ['==', ['get', 'id'], ''],
      paint: {
        'circle-radius': 11,
        'circle-color': 'rgba(255, 253, 247, 0)',
        'circle-stroke-color': '#d08b2f',
        'circle-stroke-opacity': 0.95,
        'circle-stroke-width': 3,
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
        'circle-radius': 14,
        'circle-color': 'rgba(255, 253, 247, 0)',
        'circle-stroke-color': '#17231d',
        'circle-stroke-width': 4,
      },
    })
  }

  if (!map.getLayer(PLACE_LAYER_IDS[6])) {
    map.addLayer({
      id: PLACE_LAYER_IDS[6],
      type: 'symbol',
      source: PLACE_SOURCE_ID,
      filter: ['!=', ['get', 'placeType'], 'PASS'],
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 13,
        'text-offset': [0, 1.25],
        'text-anchor': 'top',
        'text-allow-overlap': false,
        'text-optional': false,
      },
      paint: {
        'text-color': '#17231d',
        'text-halo-color': '#fff8e7',
        'text-halo-width': 2,
      },
    })
  }

  if (!map.getLayer(PLACE_LAYER_IDS[7])) {
    map.addLayer({
      id: PLACE_LAYER_IDS[7],
      type: 'symbol',
      source: PLACE_SOURCE_ID,
      filter: ['==', ['get', 'placeType'], 'PASS'],
      layout: {
        'text-field': ['concat', ['get', 'name'], '（关隘代表点）'],
        'text-size': 14,
        'text-offset': [0, 1.25],
        'text-anchor': 'top',
        'text-allow-overlap': true,
        'text-ignore-placement': true,
      },
      paint: {
        'text-color': '#3d2618',
        'text-halo-color': '#fff8e7',
        'text-halo-width': 2.2,
      },
    })
  }
}

export function applyRelatedPlaceState(
  map: MapLibreMap,
  derivedState: DerivedMapState,
): void {
  const relatedLayerId = PLACE_LAYER_IDS[4]

  if (!map.getLayer(relatedLayerId)) {
    return
  }

  const relatedPlaceIds = derivedState.relatedPlaceIds.filter(
    (placeId) => placeId !== derivedState.selectedPlaceId,
  )

  map.setFilter(relatedLayerId, [
    'in',
    ['get', 'id'],
    ['literal', relatedPlaceIds],
  ])
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
