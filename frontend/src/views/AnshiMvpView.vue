<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import HistoryMap from '../components/map/HistoryMap.vue'
import EventTimeline from '../components/timeline/EventTimeline.vue'
import TimelineControls from '../components/timeline/TimelineControls.vue'
import { loadMvpDataset } from '../data/mvpRepository'
import type { LoadState, MvpDataset } from '../domain/mvpTypes'
import { useMvpStore } from '../stores/mvpStore'

const store = useMvpStore()
const dataset = ref<MvpDataset | null>(null)
const loadState = ref<LoadState>('idle')
const dataError = ref<string | null>(null)

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

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

async function loadDataset(): Promise<void> {
  loadState.value = 'loading'
  dataError.value = null

  try {
    const loadedDataset = await loadMvpDataset()

    if (!isActive) {
      return
    }

    dataset.value = loadedDataset
    store.initializeTimeline(
      loadedDataset.events,
      loadedDataset.topic.defaultEventId,
    )
    loadState.value = 'ready'
  } catch (error) {
    if (!isActive) {
      return
    }

    dataError.value = errorMessage(error)
    loadState.value = 'error'
  }
}

onMounted(() => {
  void loadDataset()
})

onBeforeUnmount(() => {
  isActive = false
})
</script>

<template>
  <main class="app-shell">
    <header class="hero">
      <p class="topic-label">当前专题 · 安史之乱</p>
      <h1>{{ dataset?.topic.title ?? '中国古代战争地形地图' }}</h1>
      <p class="hero-description">
        {{
          dataset?.topic.subtitle ??
          '以地形、事件顺序和史料来源解释古代战争进程。'
        }}
      </p>
    </header>

    <section class="map-panel" aria-labelledby="map-panel-title">
      <div class="map-panel__heading">
        <div>
          <p class="section-label">MVP-06</p>
          <h2 id="map-panel-title">二维交互地图</h2>
        </div>
        <p v-if="loadState === 'loading'" class="data-status" role="status">
          正在加载专题数据
        </p>
      </div>

      <HistoryMap
        v-if="loadState === 'ready' && dataset"
        :geography="dataset.geography"
        :initial-view="dataset.topic.initialView"
        :places="dataset.places"
      />
      <p v-else-if="loadState === 'error'" class="data-error" role="alert">
        专题数据加载失败：{{ dataError }}
      </p>
      <div v-else class="map-placeholder" aria-hidden="true"></div>

      <section
        v-if="loadState === 'ready' && dataset"
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
    </section>
  </main>
</template>
