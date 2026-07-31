<script setup lang="ts">
import { computed } from 'vue'

import {
  getSelectedEvent,
  getSelectedPlace,
} from '../../domain/mvpSelectors'
import type { MvpDataset, SelectionState } from '../../domain/mvpTypes'
import EmptyDetail from './EmptyDetail.vue'
import EventDetail from './EventDetail.vue'
import PlaceDetail from './PlaceDetail.vue'

const props = defineProps<{
  dataset: MvpDataset
  selection: SelectionState
}>()

const emit = defineEmits<{
  clearPlace: []
  selectPlace: [placeId: string]
}>()

const selectedPlace = computed(() =>
  getSelectedPlace(props.dataset, props.selection),
)
const selectedEvent = computed(() =>
  getSelectedEvent(props.dataset, props.selection),
)
</script>

<template>
  <aside
    class="detail-panel"
    aria-label="事件与地点详情"
    :data-detail-mode="selectedPlace ? 'PLACE' : selectedEvent ? 'EVENT' : 'EMPTY'"
  >
    <PlaceDetail
      v-if="selectedPlace"
      :dataset="dataset"
      :place="selectedPlace"
      @close="emit('clearPlace')"
    />
    <EventDetail
      v-else-if="selectedEvent"
      :dataset="dataset"
      :event="selectedEvent"
      @select-place="emit('selectPlace', $event)"
    />
    <EmptyDetail v-else />
  </aside>
</template>
