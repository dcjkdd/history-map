import { defineStore } from 'pinia'

import { sortEvents } from '../domain/timeline'
import type {
  Event,
  LayerGroup,
  LayerVisibility,
  SelectionState,
} from '../domain/mvpTypes'

interface MvpStoreState extends SelectionState {
  layerVisibility: LayerVisibility
  orderedEventIds: string[]
  defaultEventId?: string
}

export const useMvpStore = defineStore('mvp', {
  state: (): MvpStoreState => ({
    layerVisibility: {
      geography: true,
      places: true,
      routes: true,
    },
    orderedEventIds: [],
    defaultEventId: undefined,
    selectedEventId: undefined,
    selectedPlaceId: undefined,
  }),
  getters: {
    selectedSequence(state): number | undefined {
      const selectedIndex = state.selectedEventId
        ? state.orderedEventIds.indexOf(state.selectedEventId)
        : -1

      return selectedIndex >= 0 ? selectedIndex + 1 : undefined
    },
    hasPrevious(): boolean {
      return this.selectedSequence !== undefined && this.selectedSequence > 1
    },
    hasNext(state): boolean {
      return (
        this.selectedSequence !== undefined &&
        this.selectedSequence < state.orderedEventIds.length
      )
    },
  },
  actions: {
    initializeTimeline(events: readonly Event[], defaultEventId: string | null): void {
      this.orderedEventIds = sortEvents(events).map((event) => event.id)
      this.defaultEventId =
        defaultEventId && this.orderedEventIds.includes(defaultEventId)
          ? defaultEventId
          : undefined
      this.resetToDefaultEvent()
    },
    selectEvent(eventId: string): void {
      if (this.orderedEventIds.includes(eventId)) {
        this.selectedEventId = eventId
      }
    },
    selectPreviousEvent(): void {
      const selectedIndex = this.selectedEventId
        ? this.orderedEventIds.indexOf(this.selectedEventId)
        : -1
      const previousEventId =
        selectedIndex > 0 ? this.orderedEventIds[selectedIndex - 1] : undefined

      if (previousEventId) {
        this.selectedEventId = previousEventId
      }
    },
    selectNextEvent(): void {
      const selectedIndex = this.selectedEventId
        ? this.orderedEventIds.indexOf(this.selectedEventId)
        : -1
      const nextEventId =
        selectedIndex >= 0
          ? this.orderedEventIds[selectedIndex + 1]
          : undefined

      if (nextEventId) {
        this.selectedEventId = nextEventId
      }
    },
    resetToDefaultEvent(): void {
      this.selectedEventId = this.defaultEventId
    },
    toggleLayer(layerGroup: LayerGroup): void {
      this.layerVisibility[layerGroup] =
        !this.layerVisibility[layerGroup]
    },
    selectPlace(placeId: string | undefined): void {
      this.selectedPlaceId = placeId
    },
    clearSelectedPlace(): void {
      this.selectedPlaceId = undefined
    },
  },
})
