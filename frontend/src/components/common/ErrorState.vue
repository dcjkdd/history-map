<script setup lang="ts">
export interface DisplayDataError {
  message: string
  code?: string
  path?: string
}

withDefaults(
  defineProps<{
    error: DisplayDataError
    busy?: boolean
  }>(),
  {
    busy: false,
  },
)

defineEmits<{
  retry: []
}>()
</script>

<template>
  <section class="error-state" role="alert" aria-labelledby="data-error-title">
    <p class="section-label">数据不可用</p>
    <h2 id="data-error-title">专题数据加载失败</h2>
    <p class="error-state__message">{{ error.message }}</p>
    <dl v-if="error.code || error.path" class="error-state__details">
      <template v-if="error.code">
        <dt>错误代码</dt>
        <dd>{{ error.code }}</dd>
      </template>
      <template v-if="error.path">
        <dt>数据位置</dt>
        <dd>{{ error.path }}</dd>
      </template>
    </dl>
    <button
      type="button"
      class="error-state__retry"
      :disabled="busy"
      aria-label="重试加载专题数据"
      @click="$emit('retry')"
    >
      {{ busy ? '正在重试…' : '重试加载' }}
    </button>
  </section>
</template>
