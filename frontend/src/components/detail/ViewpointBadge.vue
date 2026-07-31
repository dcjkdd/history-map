<script setup lang="ts">
import type { ViewpointType } from '../../domain/mvpTypes'

defineProps<{
  viewpointType: ViewpointType
  kind: 'claim' | 'citation'
}>()

const viewpointLabels: Record<ViewpointType, string> = {
  FACT: '事实资料',
  PRIMARY_RECORD: '原始记载',
  MODERN_RESEARCH: '现代研究',
  LATER_NARRATIVE: '后出叙述',
  INFERENCE: '项目推断',
  DISPUTE: '争议说明',
}
</script>

<template>
  <span
    class="viewpoint-badge"
    :class="`viewpoint-badge--${kind}`"
  >
    {{ kind === 'claim' ? '结论类型' : '资料观点' }}：{{
      viewpointLabels[viewpointType]
    }}
  </span>
</template>
