<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
  }>(),
  {
    label: '正在加载专题数据',
  },
)
</script>

<template>
  <section class="loading-state" role="status" aria-live="polite">
    <div class="loading-state__indicator" aria-hidden="true"></div>
    <div>
      <p class="section-label">数据加载</p>
      <h2>{{ label }}</h2>
      <p>地图、时间轴与详情将在数据校验完成后显示。</p>
    </div>
  </section>
</template>
