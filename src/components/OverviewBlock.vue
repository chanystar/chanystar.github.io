<script setup lang="ts">
import { computed } from 'vue'
import { metricDef, priorityDef } from '@/data/metrics'
import { getDistribution, metricOf } from '@/data/store'
import { formatMetric } from '@/lib/format'
import type { Institution } from '@/types/institution'
import type { DistScope, MetricKey, PriorityKey } from '@/types/metric'

const props = defineProps<{ inst: Institution; priorities: PriorityKey[]; scope: DistScope }>()

interface Item {
  key: MetricKey
  label: string
  value: string
  position?: string
}

const items = computed<Item[]>(() => {
  const out: Item[] = []
  for (const p of props.priorities) {
    for (const key of priorityDef(p).metrics) {
      const def = metricDef(key)
      if (!def.kinds.includes(props.inst.kind) || out.some((o) => o.key === key)) continue
      const mv = metricOf(props.inst, key)
      if (!mv || mv.status === 'not_applicable') continue
      if (mv.status !== 'ok' || mv.value === null) {
        out.push({ key, label: def.short, value: '공시되지 않음' })
        continue
      }
      const d = getDistribution(key, props.inst, props.scope)
      const position = d
        ? mv.value < d.p25
          ? '같은 지역 학교보다 낮은 편'
          : mv.value > d.p75
            ? '같은 지역 학교보다 높은 편'
            : '같은 지역 학교와 비슷한 범위'
        : undefined
      out.push({ key, label: def.short, value: formatMetric(def, mv.value), position })
    }
  }
  return out
})
</script>

<template>
  <section class="ov" aria-labelledby="ov-title">
    <h2 id="ov-title" class="ov__title">내가 중요하게 본 항목</h2>
    <ul class="ov__list">
      <li v-for="it in items" :key="it.key" class="ov__item">
        <span class="ov__label">{{ it.label }}</span>
        <strong>{{ it.value }}</strong>
        <small v-if="it.position">{{ it.position }}</small>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.ov {
  padding: 16px;
  border-radius: var(--radius-m);
  background: var(--c-brand-soft);
}
.ov__title {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 800;
}
.ov__list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}
.ov__item {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--c-surface);
}
.ov__label,
small {
  font-size: 13px;
  color: var(--c-ink-2);
}
strong {
  font-size: 18px;
  letter-spacing: -0.02em;
}
</style>
