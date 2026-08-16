<script setup lang="ts">
import { nextTick, ref } from 'vue'

const props = defineProps<{
  hasPrevious: boolean
  hasNext: boolean
  currentTitle?: string
  currentDateLabel?: string
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

    <div class="timeline-controls__current" aria-live="polite">
      <p class="timeline-controls__position">
        第 {{ selectedSequence ?? '—' }} / {{ total }} 个事件
      </p>
      <p v-if="currentDateLabel" class="timeline-controls__date">
        {{ currentDateLabel }}
      </p>
      <strong v-if="currentTitle" class="timeline-controls__title">
        {{ currentTitle }}
      </strong>
    </div>

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
