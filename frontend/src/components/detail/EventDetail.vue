<script setup lang="ts">
import { computed } from 'vue'

import {
  getCitationBundle,
  getPlaceById,
} from '../../domain/mvpSelectors'
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

const eventCitations = computed(() =>
  getCitationBundle(props.dataset, props.event.citationIds),
)
const summaryCitations = computed(() =>
  getCitationBundle(props.dataset, props.event.summary.citationIds),
)
const importanceCitations = computed(() =>
  getCitationBundle(props.dataset, props.event.whyItMatters.citationIds),
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
      <ConfidenceBadge :certainty="event.certainty" />
    </header>

    <section class="detail-claim" :data-claim-id="event.summary.claimId">
      <div class="detail-claim__heading">
        <h3>发生了什么</h3>
        <div class="detail-claim__metadata">
          <ViewpointBadge
            kind="claim"
            :viewpoint-type="event.summary.viewpointType"
          />
          <ConfidenceBadge :certainty="event.summary.certainty" />
        </div>
      </div>
      <p>{{ event.summary.text }}</p>
      <CitationList :citations="summaryCitations" label="事件摘要引用" />
    </section>

    <section class="detail-claim" :data-claim-id="event.whyItMatters.claimId">
      <div class="detail-claim__heading">
        <h3>为什么重要</h3>
        <div class="detail-claim__metadata">
          <ViewpointBadge
            kind="claim"
            :viewpoint-type="event.whyItMatters.viewpointType"
          />
          <ConfidenceBadge :certainty="event.whyItMatters.certainty" />
        </div>
      </div>
      <p>{{ event.whyItMatters.text }}</p>
      <CitationList :citations="importanceCitations" label="重要性说明引用" />
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

    <section v-if="event.actorLabels.length" class="detail-actors">
      <h3>参与者</h3>
      <ul>
        <li v-for="actor in event.actorLabels" :key="actor">{{ actor }}</li>
      </ul>
    </section>

    <CitationList
      :citations="eventCitations"
      :heading-level="3"
      label="事件时间与身份依据"
    />
  </article>
</template>
