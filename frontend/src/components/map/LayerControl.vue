<script setup lang="ts">
import type { LayerGroup, LayerVisibility } from '../../domain/mvpTypes'

defineProps<{
  visibility: LayerVisibility
}>()

const emit = defineEmits<{
  toggle: [layerGroup: LayerGroup]
}>()

const layers: ReadonlyArray<{
  id: LayerGroup
  label: string
  note?: string
}> = [
  { id: 'hydrography', label: '水系与流向', note: '现代概览' },
  { id: 'geography', label: '山地、低地与通道' },
  { id: 'places', label: '历史地点' },
  { id: 'routes', label: '行动路线', note: '解释性示意' },
]
</script>

<template>
  <fieldset class="layer-control">
    <legend>图层</legend>
    <label v-for="layer in layers" :key="layer.id" class="layer-control__item">
      <input
        type="checkbox"
        :checked="visibility[layer.id]"
        :data-layer-group="layer.id"
        @change="emit('toggle', layer.id)"
      />
      <span>{{ layer.label }}</span>
      <small v-if="layer.note">{{ layer.note }}</small>
    </label>
  </fieldset>
</template>
