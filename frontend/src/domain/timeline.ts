import type { Event } from './mvpTypes'

export interface TimelineState {
  orderedEventIds: string[]
  selectedEventId?: string
  selectedSequence?: number
  hasPrevious: boolean
  hasNext: boolean
}

export function sortEvents(events: readonly Event[]): Event[] {
  return [...events].sort(
    (first, second) =>
      first.sequence - second.sequence || first.id.localeCompare(second.id),
  )
}

export function getPreviousEventId(
  events: readonly Event[],
  currentId: string,
): string | undefined {
  const orderedEvents = sortEvents(events)
  const currentIndex = orderedEvents.findIndex((event) => event.id === currentId)

  return currentIndex > 0 ? orderedEvents[currentIndex - 1]?.id : undefined
}

export function getNextEventId(
  events: readonly Event[],
  currentId: string,
): string | undefined {
  const orderedEvents = sortEvents(events)
  const currentIndex = orderedEvents.findIndex((event) => event.id === currentId)

  return currentIndex >= 0
    ? orderedEvents[currentIndex + 1]?.id
    : undefined
}
