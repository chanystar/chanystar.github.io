<script setup lang="ts">
import { computed } from 'vue'
import { metricDef } from '@/data/metrics'
import { metricOf } from '@/data/store'
import { formatMetric } from '@/lib/format'
import type { Institution } from '@/types/institution'
import type { MetricKey } from '@/types/metric'

const props = defineProps<{ inst: Institution; metric: MetricKey }>()

const def = computed(() => metricDef(props.metric))
const mv = computed(() => metricOf(props.inst, props.metric))
const text = computed(() => {
  const m = mv.value
  if (!m || m.status === 'not_applicable') return null
  return m.status === 'ok' && m.value !== null ? formatMetric(def.value, m.value) : '공시되지 않음'
})
</script>

<template>
  <div v-if="text" class="mini">
    <dt>{{ def.short }}</dt>
    <dd :class="{ 'mini--missing': text === '공시되지 않음' }">{{ text }}</dd>
  </div>
</template>

<style scoped>
.mini {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 14px;
}
dt {
  color: var(--c-ink-2);
}
dd {
  margin: 0;
  font-weight: 700;
}
.mini--missing {
  font-weight: 400;
  color: var(--c-ink-2);
}
</style>
