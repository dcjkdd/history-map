<script setup lang="ts">
import type {
  Citation,
  CitationWithSource,
  Source,
} from '../../domain/mvpTypes'
import ConfidenceBadge from './ConfidenceBadge.vue'
import ViewpointBadge from './ViewpointBadge.vue'

defineProps<{
  citations: readonly CitationWithSource[]
  label?: string
  headingLevel?: 3 | 4
}>()

function sourceDetails(source: Source): string[] {
  const details = [source.author, source.edition]

  if (!source.edition) {
    details.push(
      [source.publisher, source.publishYear].filter(Boolean).join('，') || null,
    )
  }

  return details.filter((value): value is string => Boolean(value))
}

function pageLabel(citation: Citation): string | undefined {
  if (citation.pageStart === null) {
    return undefined
  }

  return citation.pageEnd !== null && citation.pageEnd !== citation.pageStart
    ? `第 ${citation.pageStart}—${citation.pageEnd} 页`
    : `第 ${citation.pageStart} 页`
}

function locatorDetails(citation: Citation): string[] {
  return [citation.chapter, pageLabel(citation), citation.locator].filter(
    (value): value is string => Boolean(value),
  )
}

function sourceUrl(source: Source): string | undefined {
  return source.provenance?.url ?? undefined
}
</script>

<template>
  <section class="citation-list" :aria-label="label ?? '引用资料'">
    <component :is="`h${headingLevel ?? 4}`">
      {{ label ?? '引用资料' }}
    </component>
    <ol>
      <li
        v-for="({ citation, source }, index) in citations"
        :key="`${citation.id}-${index}`"
        class="citation-card"
        :data-citation-id="citation.id"
      >
        <header class="citation-card__header">
          <div>
            <p class="citation-card__source">
              <a
                v-if="sourceUrl(source)"
                :href="sourceUrl(source)"
                target="_blank"
                rel="noopener"
              >
                {{ source.title }}
              </a>
              <span v-else>{{ source.title }}</span>
            </p>
            <p
              v-if="sourceDetails(source).length"
              class="citation-card__bibliography"
            >
              {{ sourceDetails(source).join(' · ') }}
            </p>
          </div>
          <ViewpointBadge
            kind="citation"
            :viewpoint-type="citation.viewpointType"
          />
        </header>

        <p v-if="locatorDetails(citation).length" class="citation-card__locator">
          <span class="detail-term">定位</span>
          {{ locatorDetails(citation).join(' · ') }}
        </p>

        <div class="citation-card__summary">
          <p class="detail-term">项目归纳</p>
          <p>{{ citation.summary }}</p>
        </div>

        <blockquote v-if="citation.quote" class="citation-card__quote">
          <p class="detail-term">原文短摘</p>
          <p>{{ citation.quote }}</p>
        </blockquote>

        <ConfidenceBadge :certainty="citation.certainty" />
      </li>
    </ol>
  </section>
</template>
