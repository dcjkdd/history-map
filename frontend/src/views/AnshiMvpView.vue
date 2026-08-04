<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import ErrorState from '../components/common/ErrorState.vue'
import type { DisplayDataError } from '../components/common/ErrorState.vue'
import LoadingState from '../components/common/LoadingState.vue'
import DetailPanel from '../components/detail/DetailPanel.vue'
import HistoryMap from '../components/map/HistoryMap.vue'
import EventTimeline from '../components/timeline/EventTimeline.vue'
import TimelineControls from '../components/timeline/TimelineControls.vue'
import { loadMvpDataset } from '../data/mvpRepository'
import { MvpDataError } from '../domain/mvpTypes'
import type { LoadState, MvpDataset } from '../domain/mvpTypes'
import { useMvpStore } from '../stores/mvpStore'

const store = useMvpStore()
const dataset = ref<MvpDataset | null>(null)
const loadState = ref<LoadState>('idle')
const dataError = ref<DisplayDataError | null>(null)
const historyMap = ref<InstanceType<typeof HistoryMap> | null>(null)

const orderedEvents = computed(() => {
  if (!dataset.value) {
    return []
  }

  const eventsById = new Map(
    dataset.value.events.map((event) => [event.id, event]),
  )

  return store.orderedEventIds.flatMap((eventId) => {
    const event = eventsById.get(eventId)
    return event ? [event] : []
  })
})

let isActive = true
let loadAttemptId = 0

function displayError(error: unknown): DisplayDataError {
  if (error instanceof MvpDataError) {
    return {
      code: error.code,
      message: error.message,
      path: error.path,
    }
  }

  return {
    message: error instanceof Error ? error.message : String(error),
  }
}

async function retryLoadDataset(): Promise<void> {
  const attemptId = ++loadAttemptId
  loadState.value = 'loading'
  dataError.value = null

  try {
    const loadedDataset = await loadMvpDataset()

    if (!isActive || attemptId !== loadAttemptId) {
      return
    }

    dataset.value = loadedDataset
    store.initializeTimeline(
      loadedDataset.events,
      loadedDataset.topic.defaultEventId,
    )
    loadState.value = 'ready'
  } catch (error) {
    if (!isActive || attemptId !== loadAttemptId) {
      return
    }

    console.error('专题数据加载失败', error)
    dataError.value = displayError(error)
    loadState.value = 'error'
  }
}

function focusPlace(placeId: string): void {
  historyMap.value?.focusPlace(placeId)
}

function selectAndFocusPlace(placeId: string): void {
  store.selectPlace(placeId)
  void nextTick(() => focusPlace(placeId))
}

onMounted(() => {
  void retryLoadDataset()
})

onBeforeUnmount(() => {
  isActive = false
  loadAttemptId += 1
})
</script>

<template>
  <main id="main-content" class="app-shell" tabindex="-1">
    <header class="hero">
      <div>
        <p class="topic-label">当前专题 · 安史之乱</p>
        <h1>{{ dataset?.topic.title ?? '中国古代战争地形地图' }}</h1>
      </div>
      <p class="hero-description">
        {{
          dataset?.topic.subtitle ??
          '以地形、事件顺序和史料来源解释古代战争进程。'
        }}
      </p>
    </header>

    <LoadingState v-if="loadState === 'idle' || loadState === 'loading'" />
    <ErrorState
      v-else-if="loadState === 'error' && dataError"
      :error="dataError"
      @retry="retryLoadDataset"
    />

    <div
      v-else-if="loadState === 'ready' && dataset"
      class="mvp-workspace"
    >
      <section
        class="map-panel"
        aria-labelledby="map-panel-title"
      >
        <div class="map-panel__heading">
          <div>
            <p class="section-label">PHASE2-02</p>
            <h2 id="map-panel-title">地形基底与历史叠加</h2>
          </div>
          <p class="map-panel__hint">拖动浏览后可主动定位当前事件</p>
        </div>

        <HistoryMap
          ref="historyMap"
          :events="dataset.events"
          :geography="dataset.geography"
          :initial-view="dataset.topic.initialView"
          :places="dataset.places"
          :route-segments="dataset.routeSegments"
        />
      </section>

      <section
        class="timeline-panel"
        aria-labelledby="timeline-title"
      >
        <div class="timeline-panel__heading">
          <div>
            <p class="section-label">离散事件</p>
            <h2 id="timeline-title">事件时间轴</h2>
          </div>
          <p>按史料可支持的事件顺序浏览；时间文字不等同于精确公历日期。</p>
        </div>

        <TimelineControls
          :has-next="store.hasNext"
          :has-previous="store.hasPrevious"
          :selected-sequence="store.selectedSequence"
          :total="orderedEvents.length"
          @next="store.selectNextEvent()"
          @previous="store.selectPreviousEvent()"
        />
        <EventTimeline
          :events="orderedEvents"
          :selected-event-id="store.selectedEventId"
          @select="store.selectEvent"
        />
      </section>

      <DetailPanel
        :dataset="dataset"
        :selection="{
          selectedEventId: store.selectedEventId,
          selectedPlaceId: store.selectedPlaceId,
        }"
        @clear-place="store.clearSelectedPlace()"
        @focus-place="focusPlace"
        @select-place="selectAndFocusPlace"
      />
    </div>
  </main>
</template>
