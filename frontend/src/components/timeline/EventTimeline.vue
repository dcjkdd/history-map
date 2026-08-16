<script setup lang="ts">
import { nextTick, ref } from 'vue'

import type { Event } from '../../domain/mvpTypes'

const props = defineProps<{
  events: readonly Event[]
  selectedEventId?: string
}>()

const emit = defineEmits<{
  select: [eventId: string]
}>()

const eventButtons = ref<Array<HTMLButtonElement | null>>([])

function selectAndFocus(eventIndex: number): void {
  const event = props.events[eventIndex]

  if (!event) {
    return
  }

  emit('select', event.id)
  void nextTick(() => {
    eventButtons.value[eventIndex]?.focus()
  })
}

function handleKeydown(keyboardEvent: KeyboardEvent, eventIndex: number): void {
  if (
    keyboardEvent.altKey ||
    keyboardEvent.ctrlKey ||
    keyboardEvent.metaKey ||
    keyboardEvent.shiftKey
  ) {
    return
  }

  if (keyboardEvent.key === 'ArrowLeft') {
    keyboardEvent.preventDefault()
    selectAndFocus(eventIndex - 1)
  } else if (keyboardEvent.key === 'ArrowRight') {
    keyboardEvent.preventDefault()
    selectAndFocus(eventIndex + 1)
  }
}
</script>

<template>
  <ol class="event-timeline" aria-label="离散事件时间轴">
    <li v-for="(event, index) in events" :key="event.id">
      <button
        :ref="(element) => (eventButtons[index] = element as HTMLButtonElement | null)"
        type="button"
        class="event-timeline__node"
        :class="{
          'event-timeline__node--selected': event.id === selectedEventId,
        }"
        :aria-current="event.id === selectedEventId ? 'step' : undefined"
        :aria-label="`第 ${event.sequence} 个事件：${event.dateLabel}，${event.title}`"
        :data-event-id="event.id"
        @click="$emit('select', event.id)"
        @keydown="handleKeydown($event, index)"
      >
        <span class="event-timeline__sequence" aria-hidden="true">
          {{ event.sequence }}
        </span>
        <span class="event-timeline__date visually-hidden">{{ event.dateLabel }}</span>
        <span class="event-timeline__title visually-hidden">{{ event.title }}</span>
      </button>
    </li>
  </ol>
</template>
