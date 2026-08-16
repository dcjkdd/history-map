<script setup lang="ts">
import { computed } from 'vue'

import { getCitationBundle } from '../../domain/mvpSelectors'
import {
  ROUTE_DISTANCE_METHOD_NOTE,
  type RoutePresentation,
} from '../../domain/routePresentation'
import type { MvpDataset } from '../../domain/mvpTypes'
import CitationList from './CitationList.vue'
import ConfidenceBadge from './ConfidenceBadge.vue'

const props = defineProps<{
  dataset: MvpDataset
  presentation: RoutePresentation
}>()

defineEmits<{
  close: []
}>()

const citations = computed(() =>
  getCitationBundle(props.dataset, props.presentation.citationIds),
)
</script>

<template>
  <article
    class="detail-article route-detail"
    :data-route-id="presentation.routeId"
  >
    <header class="detail-article__header">
      <div>
        <p class="section-label">路线详情 · display-only</p>
        <h2>{{ presentation.routeName }}</h2>
        <p class="detail-route-direction">{{ presentation.directionLabel }}</p>
      </div>
      <div class="detail-article__actions">
        <ConfidenceBadge :certainty="presentation.certainty" compact />
        <button type="button" class="detail-close" @click="$emit('close')">
          关闭路线详情
        </button>
      </div>
    </header>

    <section class="detail-claim route-detail__notes">
      <h3>方向与地形约束</h3>
      <ol>
        <li
          v-for="(note, index) in presentation.notes"
          :key="note"
          :data-route-note="index + 1"
        >
          {{ note }}
        </li>
      </ol>
    </section>

    <section class="detail-claim route-detail__distances">
      <h3>相邻节点距离</h3>
      <ul>
        <li
          v-for="segment in presentation.segments"
          :key="segment.id"
          :data-route-segment-id="segment.id"
        >
          <strong>{{ segment.fromName }}→{{ segment.toName }}</strong>
          <span>{{ segment.distanceLabel }}</span>
        </li>
      </ul>
    </section>

    <details class="detail-disclosure">
      <summary>
        完整引用、方法与不确定性（{{ citations.length }} 条引用关系）
      </summary>
      <div class="detail-disclosure__content">
        <section class="detail-disclosure__certainty" aria-label="路线不确定性说明">
          <h3>不确定性说明</h3>
          <ConfidenceBadge :certainty="presentation.certainty" />
          <p class="route-detail__method">{{ ROUTE_DISTANCE_METHOD_NOTE }}</p>
        </section>

        <section
          v-if="presentation.supplementalSources.length"
          class="detail-claim route-detail__supplemental-sources"
          aria-label="燕军区域地形补充来源"
        >
          <h3>区域地形补充来源</h3>
          <ul>
            <li
              v-for="source in presentation.supplementalSources"
              :key="source.id"
              :data-phase2-source-id="source.id"
            >
              <a :href="source.url" target="_blank" rel="noopener">
                {{ source.title }}
              </a>
              <span>{{ source.provider }}</span>
              <small>{{ source.scope }}</small>
            </li>
          </ul>
          <p class="route-detail__source-boundary">
            这些来源只支持区域地形与唐代交通背景，不证明燕军使用具体古道、支线、路基、驿站或渡口。
          </p>
        </section>

        <CitationList
          :citations="citations"
          :heading-level="3"
          label="路线节点、几何与历史关系依据"
        />
      </div>
    </details>
  </article>
</template>
