<script setup lang="ts">
import { computed, nextTick, useTemplateRef } from 'vue'
import type { KindFilter } from '@/types/institution'

const model = defineModel<KindFilter>({ required: true })

const OPTIONS: { value: KindFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'kindergarten', label: '유치원' },
  { value: 'elementary', label: '초등학교' },
]

const root = useTemplateRef<HTMLElement>('root')
const index = computed(() => OPTIONS.findIndex((o) => o.value === model.value))

// radiogroup 관례: 방향키로 이동 + 선택, roving tabindex
async function move(delta: number) {
  const next = (index.value + delta + OPTIONS.length) % OPTIONS.length
  model.value = OPTIONS[next]!.value
  await nextTick()
  root.value?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus()
}
</script>

<template>
  <div ref="root" class="seg" role="radiogroup" aria-label="학교 종류" :style="{ '--i': index }">
    <button
      v-for="o in OPTIONS"
      :key="o.value"
      type="button"
      role="radio"
      class="seg__item"
      :aria-checked="model === o.value"
      :tabindex="model === o.value ? 0 : -1"
      @click="model = o.value"
      @keydown.right.prevent="move(1)"
      @keydown.down.prevent="move(1)"
      @keydown.left.prevent="move(-1)"
      @keydown.up.prevent="move(-1)"
    >
      {{ o.label }}
    </button>
  </div>
</template>

<style scoped>
.seg {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 4px;
  border-radius: 14px;
  background: rgb(27 36 48 / 7%);
}
.seg::before {
  content: '';
  position: absolute;
  inset: 4px auto 4px 4px;
  width: calc((100% - 8px) / 3);
  border-radius: 10px;
  background: var(--c-surface);
  box-shadow: var(--shadow-s);
  transform: translateX(calc(var(--i) * 100%));
  transition: transform 0.22s cubic-bezier(0.3, 0.8, 0.3, 1);
}
.seg__item {
  position: relative;
  min-height: 44px;
  border-radius: 10px;
  font-weight: 600;
  color: var(--c-ink-2);
  transition: color 0.15s;
}
.seg__item[aria-checked='true'] {
  color: var(--c-ink);
  font-weight: 700;
}
</style>
