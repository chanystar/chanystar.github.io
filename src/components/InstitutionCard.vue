<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import KindBadge from './KindBadge.vue'
import MetricMini from './MetricMini.vue'
import { defaultPriorities, metricDef, priorityDef } from '@/data/metrics'
import { useCompare } from '@/composables/useCompare'
import { useFavorites } from '@/composables/useFavorites'
import { toSummary, type Institution } from '@/types/institution'
import type { MetricKey, PriorityKey } from '@/types/metric'

const props = defineProps<{
  item: Institution
  priorities?: PriorityKey[]
  compact?: boolean
}>()

const fav = useFavorites()
const cmp = useCompare()

const to = computed(() => ({
  name: props.item.kind === 'elementary' ? 'school' : 'kindergarten',
  params: { id: props.item.id },
  query: props.priorities?.length ? { priority: props.priorities.join(',') } : {},
}))

// 선택한 우선순위의 대표 지표(없으면 기본 3개)를 종류에 맞는 것만 보여준다
const keys = computed<MetricKey[]>(() => {
  const list = props.priorities?.length ? props.priorities : defaultPriorities(props.item.kind)
  const out: MetricKey[] = []
  for (const p of list) {
    const h = priorityDef(p).headline
    if (metricDef(h).kinds.includes(props.item.kind) && !out.includes(h)) out.push(h)
  }
  return out
})

const faved = computed(() => fav.has(props.item.id))
const inCompare = computed(() => cmp.has(props.item.id))
</script>

<template>
  <article class="card">
    <RouterLink :to="to" class="card__link">
      <KindBadge :kind="item.kind" />
      <strong class="card__name">{{ item.name }}</strong>
      <span class="card__meta">
        {{ item.sigungu }}{{ item.gu ? ` ${item.gu}` : '' }} {{ item.area }} ·
        {{ item.founding }}
      </span>
      <dl v-if="!compact && keys.length" class="card__metrics">
        <MetricMini v-for="k in keys" :key="k" :inst="item" :metric="k" />
      </dl>
    </RouterLink>

    <div class="card__actions">
      <button
        type="button"
        class="act"
        :aria-pressed="faved"
        :aria-label="`${item.name} 찜`"
        @click="fav.toggle(item.id)"
      >
        <AppIcon name="heart" :size="20" :filled="faved" />
      </button>
      <button
        type="button"
        class="act act--txt"
        :aria-pressed="inCompare"
        :aria-label="`${item.name} 비교 담기`"
        @click="cmp.toggle(toSummary(item))"
      >
        <AppIcon :name="inCompare ? 'check' : 'plus'" :size="16" />
        비교
      </button>
    </div>
  </article>
</template>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-m);
  background: var(--c-surface);
  box-shadow: var(--shadow-s);
  transition: box-shadow 0.15s;
}
.card:hover {
  box-shadow: var(--shadow-m);
}
.card__link {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 14px 16px 6px;
}
.card__name {
  margin-top: 4px;
  font-size: 17px;
  line-height: 1.3;
  letter-spacing: -0.02em;
}
.card__meta {
  font-size: 14px;
  color: var(--c-ink-2);
}
.card__metrics {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  margin: 8px 0 0;
  padding-top: 8px;
  border-top: 1px dashed var(--c-line);
}
.card__actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  padding: 0 8px 8px;
}
.act {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 999px;
  color: var(--c-ink-2);
}
.act--txt {
  padding: 0 12px;
  font-size: 14px;
  font-weight: 600;
}
.act:hover {
  background: rgb(27 36 48 / 6%);
}
.act[aria-pressed='true'] {
  color: var(--c-brand);
}
</style>
