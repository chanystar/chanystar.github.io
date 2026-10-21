<script setup lang="ts">
import { AREA_TYPE_LABEL, type AreaType } from '@/types/institution'
import type { DistScope } from '@/types/metric'

defineProps<{ sigungu: string; areaType: AreaType }>()
const model = defineModel<DistScope>({ required: true })
</script>

<template>
  <div class="scope" role="radiogroup" aria-label="비교 범위">
    <button
      type="button"
      role="radio"
      class="scope__btn"
      :aria-checked="model === 'city'"
      @click="model = 'city'"
    >
      {{ sigungu }} 전체
    </button>
    <button
      type="button"
      role="radio"
      class="scope__btn"
      :aria-checked="model === 'area'"
      @click="model = 'area'"
    >
      {{ AREA_TYPE_LABEL[areaType] }}만
    </button>
  </div>
</template>

<style scoped>
.scope {
  display: inline-flex;
  padding: 3px;
  border-radius: 999px;
  background: rgb(27 36 48 / 7%);
}
.scope__btn {
  min-height: 44px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-ink-2);
}
.scope__btn[aria-checked='true'] {
  background: var(--c-surface);
  color: var(--c-ink);
  font-weight: 700;
  box-shadow: var(--shadow-s);
}
</style>
