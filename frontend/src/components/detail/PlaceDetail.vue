<script setup lang="ts">
import { computed } from 'vue'

import { getCitationBundle } from '../../domain/mvpSelectors'
import type { MvpDataset, PlaceFeature, PlaceType } from '../../domain/mvpTypes'
import CitationList from './CitationList.vue'
import ConfidenceBadge from './ConfidenceBadge.vue'
import ViewpointBadge from './ViewpointBadge.vue'

const props = defineProps<{
  dataset: MvpDataset
  place: PlaceFeature
}>()

defineEmits<{
  close: []
  focus: []
}>()

const placeTypeLabels: Record<PlaceType, string> = {
  CITY: '城市',
  PASS: '关隘',
  FERRY: '渡口',
  BATTLEFIELD: '战场',
  REGION: '区域',
  OTHER: '其他地点',
}

const placeCitations = computed(() =>
  getCitationBundle(props.dataset, props.place.properties.citationIds),
)
const summaryCitations = computed(() =>
  getCitationBundle(
    props.dataset,
    props.place.properties.summary.citationIds,
  ),
)
const strategicRoleCitations = computed(() =>
  getCitationBundle(
    props.dataset,
    props.place.properties.strategicRole.citationIds,
  ),
)
const coordinateCitations = computed(() =>
  props.place.properties.coordinateNote
    ? getCitationBundle(
        props.dataset,
        props.place.properties.coordinateNote.citationIds,
      )
    : [],
)
const citationRelationshipCount = computed(
  () =>
    placeCitations.value.length +
    summaryCitations.value.length +
    strategicRoleCitations.value.length +
    coordinateCitations.value.length,
)
</script>

<template>
  <article
    class="detail-article place-detail"
    :data-place-id="place.properties.id"
  >
    <header class="detail-article__header">
      <div>
        <p class="section-label">地点详情</p>
        <h2>{{ place.properties.name }}</h2>
        <p v-if="place.properties.modernName" class="detail-modern-name">
          现代对应：{{ place.properties.modernName }}
        </p>
        <p class="detail-place-type">
          地点类型：{{ placeTypeLabels[place.properties.placeType] }}
        </p>
      </div>
      <div class="detail-article__actions">
        <button
          type="button"
          class="detail-focus"
          aria-label="在地图上定位此地点"
          @click="$emit('focus')"
        >
          定位此地点
        </button>
        <button type="button" class="detail-close" @click="$emit('close')">
          关闭地点详情
        </button>
      </div>
    </header>

    <ConfidenceBadge :certainty="place.properties.certainty" compact />

    <section
      class="detail-claim"
      :data-claim-id="place.properties.summary.claimId"
    >
      <div class="detail-claim__heading">
        <h3>地点说明</h3>
        <div class="detail-claim__metadata">
          <ViewpointBadge
            kind="claim"
            :viewpoint-type="place.properties.summary.viewpointType"
          />
          <ConfidenceBadge :certainty="place.properties.summary.certainty" compact />
        </div>
      </div>
      <p>{{ place.properties.summary.text }}</p>
    </section>

    <section
      class="detail-claim"
      :data-claim-id="place.properties.strategicRole.claimId"
    >
      <div class="detail-claim__heading">
        <h3>战略作用</h3>
        <div class="detail-claim__metadata">
          <ViewpointBadge
            kind="claim"
            :viewpoint-type="place.properties.strategicRole.viewpointType"
          />
          <ConfidenceBadge
            :certainty="place.properties.strategicRole.certainty"
            compact
          />
        </div>
      </div>
      <p>{{ place.properties.strategicRole.text }}</p>
    </section>

    <section
      v-if="place.properties.coordinateNote"
      class="detail-claim detail-coordinate"
      :data-claim-id="place.properties.coordinateNote.claimId"
    >
      <div class="detail-claim__heading">
        <h3>坐标说明</h3>
        <div class="detail-claim__metadata">
          <ViewpointBadge
            kind="claim"
            :viewpoint-type="place.properties.coordinateNote.viewpointType"
          />
          <ConfidenceBadge
            :certainty="place.properties.coordinateNote.certainty"
            compact
          />
        </div>
      </div>
      <p>{{ place.properties.coordinateNote.text }}</p>
    </section>

    <details class="detail-disclosure">
      <summary>
        完整引用与不确定性（{{ citationRelationshipCount }} 条引用关系）
      </summary>
      <div class="detail-disclosure__content">
        <section class="detail-disclosure__certainty" aria-label="地点不确定性说明">
          <h3>不确定性说明</h3>
          <ConfidenceBadge :certainty="place.properties.certainty" />
          <ConfidenceBadge :certainty="place.properties.summary.certainty" />
          <ConfidenceBadge :certainty="place.properties.strategicRole.certainty" />
          <ConfidenceBadge
            v-if="place.properties.coordinateNote"
            :certainty="place.properties.coordinateNote.certainty"
          />
        </section>

        <div :data-claim-evidence-id="place.properties.summary.claimId">
          <CitationList :citations="summaryCitations" label="地点说明引用" />
        </div>
        <div :data-claim-evidence-id="place.properties.strategicRole.claimId">
          <CitationList :citations="strategicRoleCitations" label="战略作用引用" />
        </div>
        <div
          v-if="place.properties.coordinateNote"
          :data-claim-evidence-id="place.properties.coordinateNote.claimId"
        >
          <CitationList :citations="coordinateCitations" label="坐标说明引用" />
        </div>
        <CitationList
          :citations="placeCitations"
          :heading-level="3"
          label="地点与代表点依据"
        />
      </div>
    </details>
  </article>
</template>
