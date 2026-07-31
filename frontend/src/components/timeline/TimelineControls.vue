<script setup lang="ts">
import { nextTick, ref } from 'vue'

const props = defineProps<{
  hasPrevious: boolean
  hasNext: boolean
  selectedSequence?: number
  total: number
}>()

const emit = defineEmits<{
  previous: []
  next: []
}>()

const previousButton = ref<HTMLButtonElement | null>(null)
const nextButton = ref<HTMLButtonElement | null>(null)

function selectPrevious(): void {
  const reachesFirstEvent = props.selectedSequence === 2
  emit('previous')

  if (reachesFirstEvent) {
    void nextTick(() => nextButton.value?.focus())
  }
}

function selectNext(): void {
  const reachesLastEvent = props.selectedSequence === props.total - 1
  emit('next')

  if (reachesLastEvent) {
    void nextTick(() => previousButton.value?.focus())
  }
}
</script>

<template>
  <div class="timeline-controls" role="group" aria-label="事件切换控制">
    <button
      ref="previousButton"
      type="button"
      :disabled="!hasPrevious"
      aria-label="上一事件"
      @click="selectPrevious"
    >
      <span aria-hidden="true">←</span>
      上一事件
    </button>

    <p class="timeline-controls__position" aria-live="polite">
      第 {{ selectedSequence ?? '—' }} / {{ total }} 个事件
    </p>

    <button
      ref="nextButton"
      type="button"
      :disabled="!hasNext"
      aria-label="下一事件"
      @click="selectNext"
    >
      下一事件
      <span aria-hidden="true">→</span>
    </button>
  </div>
</template>
