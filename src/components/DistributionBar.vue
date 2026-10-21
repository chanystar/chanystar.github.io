<script setup lang="ts">
import { computed } from 'vue'
import { formatMetric } from '@/lib/format'
import type { Distribution, MetricDef } from '@/types/metric'

const props = defineProps<{
  def: MetricDef
  dist: Distribution
  value: number
}>()

const span = computed(() => props.dist.max - props.dist.min)
// min==max이면 위치 계산이 불가능하므로 가운데로 둔다
const pct = (v: number) =>
  span.value <= 0 ? 50 : Math.min(100, Math.max(0, ((v - props.dist.min) / span.value) * 100))

const band = computed(() => ({
  left: `${pct(props.dist.p25)}%`,
  width: `${Math.max(2, pct(props.dist.p75) - pct(props.dist.p25))}%`,
}))

const label = computed(() => {
  const { p25, p75 } = props.dist
  const where = props.value < p25 ? '낮은 편' : props.value > p75 ? '높은 편' : '중간 범위'
  return (
    `${props.def.label} ${formatMetric(props.def, props.value)}. ` +
    `${props.dist.scopeLabel} ${props.dist.n}곳 중 ${where}. ` +
    `최소 ${formatMetric(props.def, props.dist.min)}, 중앙값 ${formatMetric(props.def, props.dist.p50)}, ` +
    `최대 ${formatMetric(props.def, props.dist.max)}`
  )
})
</script>

<template>
  <figure class="dist">
    <div class="dist__track" role="img" :aria-label="label">
      <span class="dist__band" :style="band" />
      <span class="dist__median" :style="{ left: `${pct(dist.p50)}%` }" />
      <span class="dist__dot" :style="{ left: `${pct(value)}%` }" />
    </div>
    <div class="dist__ends" aria-hidden="true">
      <span>{{ formatMetric(def, dist.min) }}</span>
      <span>{{ formatMetric(def, dist.max) }}</span>
    </div>
    <figcaption class="dist__cap">
      {{ dist.scopeLabel }} {{ dist.n }}곳 · 중앙값 {{ formatMetric(def, dist.p50) }} · 진한 구간은
      가운데 50%
    </figcaption>
  </figure>
</template>

<style scoped>
.dist {
  margin: 0;
}
.dist__track {
  position: relative;
  height: 10px;
  margin: 10px 7px 0;
  border-radius: 999px;
  background: rgb(27 36 48 / 10%);
}
.dist__band {
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 999px;
  background: rgb(27 36 48 / 22%);
}
.dist__median {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 2px;
  margin-left: -1px;
  background: var(--c-ink-2);
}
.dist__dot {
  position: absolute;
  top: 50%;
  width: 18px;
  height: 18px;
  margin: -9px 0 0 -9px;
  border: 3px solid #fff;
  border-radius: 999px;
  background: var(--c-brand);
  box-shadow: 0 1px 4px rgb(27 36 48 / 35%);
}
.dist__ends {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 12px;
  color: var(--c-ink-2);
}
.dist__cap {
  margin-top: 2px;
  font-size: 12px;
  color: var(--c-ink-2);
}
</style>
