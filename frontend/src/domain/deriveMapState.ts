import type { MvpDataset } from './mvpTypes'

export interface DerivedMapState {
  visibleRouteSegmentIds: string[]
  activeRouteSegmentIds: string[]
  relatedPlaceIds: string[]
  selectedPlaceId?: string
  currentEventId?: string
}

type MapStateDataset = Pick<MvpDataset, 'events' | 'routeSegments'>

export function deriveMapState(
  dataset: MapStateDataset,
  selectedEventId: string | undefined,
  selectedPlaceId: string | undefined,
): DerivedMapState {
  const currentEvent = selectedEventId
    ? dataset.events.find((event) => event.id === selectedEventId)
    : undefined

  if (!currentEvent) {
    return {
      visibleRouteSegmentIds: [],
      activeRouteSegmentIds: [],
      relatedPlaceIds: [],
      selectedPlaceId,
      currentEventId: undefined,
    }
  }

  const sequenceByEventId = new Map(
    dataset.events.map((event) => [event.id, event.sequence]),
  )
  const visibleRouteSegmentIds: string[] = []
  const activeRouteSegmentIds: string[] = []

  for (const routeSegment of dataset.routeSegments.features) {
    const appearAtEventId = routeSegment.properties.appearAtEventId
    const appearSequence = sequenceByEventId.get(appearAtEventId)

    if (
      appearSequence !== undefined &&
      appearSequence <= currentEvent.sequence
    ) {
      visibleRouteSegmentIds.push(routeSegment.properties.id)
    }

    if (appearAtEventId === currentEvent.id) {
      activeRouteSegmentIds.push(routeSegment.properties.id)
    }
  }

  return {
    visibleRouteSegmentIds,
    activeRouteSegmentIds,
    relatedPlaceIds: [...new Set(currentEvent.relatedPlaceIds)],
    selectedPlaceId,
    currentEventId: currentEvent.id,
  }
}
