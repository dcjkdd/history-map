<script setup lang="ts">
import type { Certainty } from '../../domain/mvpTypes'

const props = defineProps<{
  certainty: Certainty
  compact?: boolean
}>()

const confidenceCopy: Record<
  Certainty,
  { label: string; description: string }
> = {
  HIGH: {
    label: '高可信度',
    description: '现有证据较充分，仍以所列资料的适用范围为准。',
  },
  MEDIUM: {
    label: '中等可信度',
    description: '现有证据可以支持该归纳，但仍有需要保留的限制。',
  },
  LOW: {
    label: '低可信度',
    description: '资料或重建依据有限，不应理解为精确复原。',
  },
  DISPUTED: {
    label: '存在争议',
    description: '来源、位置对应或解释存在冲突，当前展示保留争议。',
  },
  UNKNOWN: {
    label: '尚不确定',
    description: '现有资料不足以进一步确认，不能当作确定事实。',
  },
}
</script>

<template>
  <span
    class="confidence-badge"
    :class="[
      `confidence-badge--${props.certainty.toLowerCase()}`,
      { 'confidence-badge--compact': compact },
    ]"
  >
    <strong>{{ confidenceCopy[props.certainty].label }}</strong>
    <span v-if="!compact">{{ confidenceCopy[props.certainty].description }}</span>
  </span>
</template>
