<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { useMapLibre } from '../../composables/useMapLibre'
import type { InitialView } from '../../domain/mvpTypes'

const props = defineProps<{
  initialView: InitialView
}>()

const mapContainer = ref<HTMLElement | null>(null)
const mapInitializationError = ref<string | null>(null)

const {
  createMap,
  destroyMap,
  fitToTopic,
  mapStyleState,
  mapStyleWarning,
} = useMapLibre()

onMounted(() => {
  if (!mapContainer.value) {
    mapInitializationError.value = '地图容器不可用。'
    return
  }

  try {
    createMap(mapContainer.value, props.initialView)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    mapInitializationError.value = `地图初始化失败：${reason}`
  }
})

onBeforeUnmount(() => {
  destroyMap()
})

defineExpose({ fitToTopic })
</script>

<template>
  <section
    class="history-map"
    aria-label="安史之乱专题地图"
    :aria-busy="mapStyleState === 'loading' && !mapInitializationError"
  >
    <div ref="mapContainer" class="history-map__canvas"></div>

    <p
      v-if="mapInitializationError"
      class="history-map__message history-map__message--error"
      role="alert"
    >
      {{ mapInitializationError }}
    </p>
    <p
      v-else-if="mapStyleState === 'loading'"
      class="history-map__message"
      role="status"
    >
      地图底图加载中…
    </p>

    <p
      v-if="mapStyleWarning"
      class="history-map__warning"
      role="status"
    >
      {{ mapStyleWarning }}
    </p>
  </section>
</template>
