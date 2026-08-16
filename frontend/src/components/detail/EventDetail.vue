<script setup lang="ts">
import { computed } from 'vue'

import {
  getCitationBundle,
  getPlaceById,
} from '../../domain/mvpSelectors'
import { getRoutePresentation } from '../../domain/routePresentation'
import type { Event, MvpDataset } from '../../domain/mvpTypes'
import CitationList from './CitationList.vue'
import ConfidenceBadge from './ConfidenceBadge.vue'
import ViewpointBadge from './ViewpointBadge.vue'

const props = defineProps<{
  dataset: MvpDataset
  event: Event
}>()

const emit = defineEmits<{
  selectPlace: [placeId: string]
  selectRoute: [routeId: string]
}>()

const timePrecisionLabels = {
  DAY: '精确到日',
  MONTH: '精确到月',
  YEAR: '精确到年',
  APPROXIMATE: '约略时间；未换算为精确公历日期',
} as const

const relatedPlaces = computed(() =>
  props.event.relatedPlaceIds.flatMap((placeId) => {
    const place = getPlaceById(props.dataset, placeId)
    return place ? [place] : []
  }),
)

const relatedRoutes = computed(() => {
  const routeIds = new Set(
    props.dataset.routeSegments.features
      .filter(
        (segment) => segment.properties.appearAtEventId === props.event.id,
      )
      .map((segment) => segment.properties.routeId),
  )

  return [...routeIds].flatMap((routeId) => {
    const presentation = getRoutePresentation(props.dataset, routeId)
    return presentation ? [presentation] : []
  })
})

const eventCitations = computed(() =>
  getCitationBundle(props.dataset, props.event.citationIds),
)
const summaryCitations = computed(() =>
  getCitationBundle(props.dataset, props.event.summary.citationIds),
)
const importanceCitations = computed(() =>
  getCitationBundle(props.dataset, props.event.whyItMatters.citationIds),
)
const citationRelationshipCount = computed(
  () =>
    eventCitations.value.length +
    summaryCitations.value.length +
    importanceCitations.value.length,
)
</script>

<template>
  <article class="detail-article event-detail" :data-event-id="event.id">
    <header class="detail-article__header">
      <div>
        <p class="section-label">事件详情</p>
        <h2>{{ event.title }}</h2>
        <p class="detail-date">{{ event.dateLabel }}</p>
        <p class="detail-precision">
          时间精度：{{ timePrecisionLabels[event.timePrecision] }}
        </p>
        <p v-if="event.normalizedDate" class="detail-normalized-date">
          标准化日期：{{ event.normalizedDate }}
        </p>
      </div>
      <ConfidenceBadge :certainty="event.certainty" compact />
    </header>

    <section class="detail-claim" :data-claim-id="event.summary.claimId">
      <div class="detail-claim__heading">
        <h3>发生了什么</h3>
        <div class="detail-claim__metadata">
          <ViewpointBadge
            kind="claim"
            :viewpoint-type="event.summary.viewpointType"
          />
          <ConfidenceBadge :certainty="event.summary.certainty" compact />
        </div>
      </div>
      <p>{{ event.summary.text }}</p>
    </section>

    <section class="detail-claim" :data-claim-id="event.whyItMatters.claimId">
      <div class="detail-claim__heading">
        <h3>为什么重要</h3>
        <div class="detail-claim__metadata">
          <ViewpointBadge
            kind="claim"
            :viewpoint-type="event.whyItMatters.viewpointType"
          />
          <ConfidenceBadge :certainty="event.whyItMatters.certainty" compact />
        </div>
      </div>
      <p>{{ event.whyItMatters.text }}</p>
    </section>

    <section v-if="relatedPlaces.length" class="detail-related">
      <h3>相关地点</h3>
      <ul>
        <li v-for="place in relatedPlaces" :key="place.properties.id">
          <button
            type="button"
            :data-related-place-id="place.properties.id"
            @click="emit('selectPlace', place.properties.id)"
          >
            {{ place.properties.name }}
          </button>
        </li>
      </ul>
    </section>

    <section v-if="relatedRoutes.length" class="detail-related">
      <h3>相关路线</h3>
      <ul>
        <li v-for="route in relatedRoutes" :key="route.routeId">
          <button
            type="button"
            :data-related-route-id="route.routeId"
            @click="emit('selectRoute', route.routeId)"
          >
            {{ route.directionLabel }}
          </button>
        </li>
      </ul>
    </section>

    <details class="detail-disclosure">
      <summary>
        完整引用与不确定性（{{ citationRelationshipCount }} 条引用关系）
      </summary>
      <div class="detail-disclosure__content">
        <section class="detail-disclosure__certainty" aria-label="事件不确定性说明">
          <h3>不确定性说明</h3>
          <ConfidenceBadge :certainty="event.certainty" />
          <ConfidenceBadge :certainty="event.summary.certainty" />
          <ConfidenceBadge :certainty="event.whyItMatters.certainty" />
        </section>

        <section v-if="event.actorLabels.length" class="detail-actors">
          <h3>参与者</h3>
          <ul>
            <li v-for="actor in event.actorLabels" :key="actor">{{ actor }}</li>
          </ul>
        </section>

        <div :data-claim-evidence-id="event.summary.claimId">
          <CitationList :citations="summaryCitations" label="事件摘要引用" />
        </div>
        <div :data-claim-evidence-id="event.whyItMatters.claimId">
          <CitationList :citations="importanceCitations" label="重要性说明引用" />
        </div>
        <CitationList
          :citations="eventCitations"
          :heading-level="3"
          label="事件时间与身份依据"
        />
      </div>
    </details>
  </article>
</template>
