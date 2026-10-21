<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import AppIcon from './AppIcon.vue'
import DistributionBar from './DistributionBar.vue'
import SourceNote from './SourceNote.vue'
import { sourceOf } from '@/data/metrics'
import { getDistribution } from '@/data/store'
import { formatMetric } from '@/lib/format'
import type { Institution } from '@/types/institution'
import type { DistScope, MetricDef, MetricValue } from '@/types/metric'

const props = defineProps<{
  inst: Institution
  def: MetricDef
  mv: MetricValue
  scope: DistScope
  emphasized?: boolean
}>()

const open = ref(false)
const panelId = `${useId()}-info`

const hasValue = computed(() => props.mv.status === 'ok' && props.mv.value !== null)
const dist = computed(() =>
  hasValue.value ? getDistribution(props.def.key, props.inst, props.scope) : undefined,
)
</script>

<template>
  <div class="row" :class="{ 'row--em': emphasized }">
    <div class="row__head">
      <span class="row__label">{{ def.label }}</span>
      <strong v-if="hasValue && mv.value !== null" class="row__value">
        {{ formatMetric(def, mv.value) }}
      </strong>
      <span v-else class="row__missing">공시되지 않음</span>
    </div>

    <DistributionBar v-if="dist && mv.value !== null" :def="def" :dist="dist" :value="mv.value" />
    <p v-else-if="hasValue && def.type === 'number'" class="row__muted">
      비교할 학교가 부족해 분포는 표시하지 않아요.
    </p>

    <div class="row__foot">
      <SourceNote :source="sourceOf(def, inst.kind)" :as-of="mv.asOf" />
      <button
        type="button"
        class="row__help"
        :aria-expanded="open"
        :aria-controls="panelId"
        @click="open = !open"
      >
        <AppIcon name="help" :size="16" />
        어떻게 봐야 하나요?
      </button>
    </div>

    <div v-show="open" :id="panelId" class="row__info">
      <p>{{ def.interpret }}</p>
      <p v-if="def.caveat" class="row__caveat">※ {{ def.caveat }}</p>
    </div>
  </div>
</template>

<style scoped>
.row {
  padding: 14px 0;
  border-top: 1px solid var(--c-line);
}
.row:first-child {
  border-top: 0;
}
.row--em {
  margin-inline: -12px;
  padding-inline: 12px;
  border-radius: 12px;
  background: var(--c-brand-soft);
}
.row__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.row__label {
  font-weight: 600;
}
.row__value {
  font-size: 18px;
  letter-spacing: -0.02em;
}
.row__missing,
.row__muted {
  font-size: 14px;
  color: var(--c-ink-2);
}
.row__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 4px 12px;
  margin-top: 6px;
}
.row__help {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 44px;
  font-size: 13px;
  color: var(--c-ink-2);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.row__info {
  padding: 10px 12px;
  border-radius: 10px;
  background: rgb(27 36 48 / 5%);
  font-size: 14px;
}
.row__caveat {
  margin-top: 4px;
  color: var(--c-ink-2);
}
</style>
