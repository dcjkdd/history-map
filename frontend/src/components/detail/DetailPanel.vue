<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import {
  getSelectedEvent,
  getSelectedPlace,
} from '../../domain/mvpSelectors'
import { getRoutePresentation } from '../../domain/routePresentation'
import type { MvpDataset, SelectionState } from '../../domain/mvpTypes'
import EmptyDetail from './EmptyDetail.vue'
import EventDetail from './EventDetail.vue'
import PlaceDetail from './PlaceDetail.vue'
import RouteDetail from './RouteDetail.vue'

const props = defineProps<{
  dataset: MvpDataset
  selection: SelectionState
}>()

const emit = defineEmits<{
  clearPlace: []
  clearRoute: []
  focusPlace: [placeId: string]
  selectPlace: [placeId: string]
  selectRoute: [routeId: string]
}>()

const selectedPlace = computed(() =>
  getSelectedPlace(props.dataset, props.selection),
)
const selectedEvent = computed(() =>
  getSelectedEvent(props.dataset, props.selection),
)
const selectedRoute = computed(() =>
  props.selection.selectedRouteId
    ? getRoutePresentation(props.dataset, props.selection.selectedRouteId)
    : undefined,
)
const detailPanel = ref<HTMLElement | null>(null)

watch(
  () => [
    props.selection.selectedEventId,
    props.selection.selectedPlaceId,
    props.selection.selectedRouteId,
  ],
  () => {
    if (detailPanel.value) {
      detailPanel.value.scrollTop = 0
      detailPanel.value
        .querySelectorAll<HTMLDetailsElement>('details[open]')
        .forEach((details) => {
          details.open = false
        })
    }
  },
  { flush: 'post' },
)
</script>

<template>
  <aside
    ref="detailPanel"
    class="detail-panel"
    aria-label="事件、地点与路线详情"
    :data-detail-mode="
      selectedRoute ? 'ROUTE' : selectedPlace ? 'PLACE' : selectedEvent ? 'EVENT' : 'EMPTY'
    "
  >
    <RouteDetail
      v-if="selectedRoute"
      :dataset="dataset"
      :presentation="selectedRoute"
      @close="emit('clearRoute')"
    />
    <PlaceDetail
      v-else-if="selectedPlace"
      :dataset="dataset"
      :place="selectedPlace"
      @close="emit('clearPlace')"
      @focus="emit('focusPlace', selectedPlace.properties.id)"
    />
    <EventDetail
      v-else-if="selectedEvent"
      :dataset="dataset"
      :event="selectedEvent"
      @select-place="emit('selectPlace', $event)"
      @select-route="emit('selectRoute', $event)"
    />
    <EmptyDetail v-else />
  </aside>
</template>
