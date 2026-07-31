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
  { id: 'geography', label: '地理要素' },
  { id: 'places', label: '历史地点' },
  { id: 'routes', label: '行动路线', note: '待后续阶段绘制' },
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
