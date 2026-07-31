import { defineStore } from 'pinia'

import type {
  LayerGroup,
  LayerVisibility,
  SelectionState,
} from '../domain/mvpTypes'

interface MvpStoreState extends SelectionState {
  layerVisibility: LayerVisibility
}

export const useMvpStore = defineStore('mvp', {
  state: (): MvpStoreState => ({
    layerVisibility: {
      geography: true,
      places: true,
      routes: true,
    },
    selectedEventId: undefined,
    selectedPlaceId: undefined,
  }),
  actions: {
    toggleLayer(layerGroup: LayerGroup): void {
      this.layerVisibility[layerGroup] =
        !this.layerVisibility[layerGroup]
    },
    selectPlace(placeId: string | undefined): void {
      this.selectedPlaceId = placeId
    },
  },
})
