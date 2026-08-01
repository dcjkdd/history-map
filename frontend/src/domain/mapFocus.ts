import { deriveMapState } from './deriveMapState'
import type { Bounds, MvpDataset, Position } from './mvpTypes'

export type MapFocusTarget =
  | {
      kind: 'point'
      center: Position
    }
  | {
      kind: 'bounds'
      bounds: Bounds
    }

type FocusDataset = Pick<
  MvpDataset,
  'events' | 'places' | 'routeSegments'
>

function focusTargetFromPositions(
  positions: readonly Position[],
): MapFocusTarget | null {
  const uniquePositions = new Map<string, Position>()

  for (const position of positions) {
    uniquePositions.set(`${position[0]},${position[1]}`, position)
  }

  const coordinates = [...uniquePositions.values()]
  const first = coordinates[0]

  if (!first) {
    return null
  }

  if (coordinates.length === 1) {
    return {
      kind: 'point',
      center: [...first] as Position,
    }
  }

  let west = first[0]
  let east = first[0]
  let south = first[1]
  let north = first[1]

  for (const [longitude, latitude] of coordinates.slice(1)) {
    west = Math.min(west, longitude)
    east = Math.max(east, longitude)
    south = Math.min(south, latitude)
    north = Math.max(north, latitude)
  }

  return {
    kind: 'bounds',
    bounds: [
      [west, south],
      [east, north],
    ],
  }
}

export function getCurrentEventFocusTarget(
  dataset: FocusDataset,
  selectedEventId: string | undefined,
): MapFocusTarget | null {
  const mapState = deriveMapState(
    {
      events: dataset.events,
      routeSegments: dataset.routeSegments,
    },
    selectedEventId,
    undefined,
  )

  if (!mapState.currentEventId) {
    return null
  }

  const relatedPlaceIds = new Set(mapState.relatedPlaceIds)
  const visibleRouteSegmentIds = new Set(mapState.visibleRouteSegmentIds)
  const positions: Position[] = []

  for (const place of dataset.places.features) {
    if (relatedPlaceIds.has(place.properties.id)) {
      positions.push(place.geometry.coordinates)
    }
  }

  for (const routeSegment of dataset.routeSegments.features) {
    if (visibleRouteSegmentIds.has(routeSegment.properties.id)) {
      positions.push(...routeSegment.geometry.coordinates)
    }
  }

  return focusTargetFromPositions(positions)
}

export function getPlaceFocusTarget(
  places: MvpDataset['places'],
  placeId: string,
): MapFocusTarget | null {
  const place = places.features.find(
    (candidate) => candidate.properties.id === placeId,
  )

  return place
    ? {
        kind: 'point',
        center: [...place.geometry.coordinates] as Position,
      }
    : null
}
