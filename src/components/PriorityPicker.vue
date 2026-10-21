<script setup lang="ts">
import { computed } from 'vue'
import { prioritiesFor } from '@/data/metrics'
import type { KindFilter } from '@/types/institution'
import type { PriorityKey } from '@/types/metric'

const props = withDefaults(defineProps<{ kind: KindFilter; max?: number }>(), {
  max: 3,
})
const model = defineModel<PriorityKey[]>({ required: true })

const options = computed(() => prioritiesFor(props.kind))
const full = computed(() => model.value.length >= props.max)

function toggle(key: PriorityKey) {
  model.value = model.value.includes(key)
    ? model.value.filter((k) => k !== key)
    : full.value
      ? model.value
      : [...model.value, key]
}
</script>

<template>
  <div class="pp">
    <p class="pp__title">
      중요하게 보는 것
      <small>최대 {{ max }}개 · 점수나 순위로 바꾸지 않고 먼저 보여드려요</small>
    </p>
    <ul class="pp__list">
      <li v-for="p in options" :key="p.key">
        <button
          type="button"
          class="pp__chip"
          :aria-pressed="model.includes(p.key)"
          :disabled="full && !model.includes(p.key)"
          :title="p.hint"
          @click="toggle(p.key)"
        >
          {{ p.label }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.pp__title {
  margin-bottom: 8px;
  font-weight: 700;
}
.pp__title small {
  margin-left: 6px;
  font-weight: 400;
  color: var(--c-ink-2);
}
.pp__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.pp__chip {
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid var(--c-line);
  border-radius: 999px;
  background: var(--c-surface);
  font-weight: 600;
}
.pp__chip[aria-pressed='true'] {
  border-color: var(--c-brand);
  background: var(--c-brand-soft);
  color: var(--c-brand);
  font-weight: 800;
}
.pp__chip:disabled {
  opacity: 0.45;
}
</style>
