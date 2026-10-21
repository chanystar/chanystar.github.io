<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import KindBadge from '@/components/KindBadge.vue'
import { AXIS_LABEL, AXES, metricsForKind, priorityDef, parsePriorities } from '@/data/metrics'
import { findById, metricOf } from '@/data/store'
import { COMPARE_MAX, useCompare } from '@/composables/useCompare'
import { formatMetric } from '@/lib/format'
import { first } from '@/lib/query'
import type { Institution } from '@/types/institution'
import type { MetricDef, MetricKey } from '@/types/metric'

const route = useRoute()
const cmp = useCompare()

// URL(ids)이 우선, 없으면 담아둔 목록. 첫 항목과 같은 종류만 남긴다
const items = computed<Institution[]>(() => {
  const raw = first(route.query.ids)
  const ids = raw ? raw.split(',').map(Number) : cmp.ids.value
  const found = ids.flatMap((id) => (Number.isInteger(id) ? (findById(id) ?? []) : []))
  const kind = found[0]?.kind
  return found.filter((i) => i.kind === kind).slice(0, COMPARE_MAX)
})

const kind = computed(() => items.value[0]?.kind)

const emphasized = computed(() => {
  const picked = kind.value ? parsePriorities(first(route.query.priority), kind.value) : []
  return new Set<MetricKey>(picked.flatMap((p) => priorityDef(p).metrics))
})

const groups = computed(() => {
  const k = kind.value
  if (!k) return []
  const defs = metricsForKind(k)
  return AXES.map((axis) => ({
    axis,
    defs: defs
      .filter((d) => d.axis === axis)
      .sort((a, b) => Number(emphasized.value.has(b.key)) - Number(emphasized.value.has(a.key))),
  })).filter((g) => g.defs.length)
})

function cell(i: Institution, def: MetricDef): string {
  const mv = metricOf(i, def.key)
  if (!mv || mv.status === 'not_applicable') return '해당 없음'
  return mv.status === 'ok' && mv.value !== null ? formatMetric(def, mv.value) : '공시되지 않음'
}

function isMissing(i: Institution, def: MetricDef): boolean {
  return metricOf(i, def.key)?.status !== 'ok'
}
</script>

<template>
  <main class="container page">
    <h1 class="title">학교 비교</h1>

    <div v-if="items.length < 2" class="empty">
      <p>
        비교할 학교를 2곳 이상 담아주세요. 유치원과 초등학교는 항목이 달라 함께 비교하지 않아요.
      </p>
      <RouterLink to="/search" class="empty__link">학교 찾기</RouterLink>
    </div>

    <template v-else>
      <p class="hint">
        좋고 나쁨을 가리지 않고 수치만 나란히 놓았어요. 공시되지 않은 항목은 그대로 표시해요.
      </p>
      <div class="scroll">
        <table class="tbl">
          <thead>
            <tr>
              <th scope="col" class="corner">
                <span class="sr-only">항목</span>
              </th>
              <th v-for="i in items" :key="i.id" scope="col">
                <KindBadge :kind="i.kind" />
                <RouterLink
                  :to="{
                    name: i.kind === 'elementary' ? 'school' : 'kindergarten',
                    params: { id: i.id },
                  }"
                  class="name"
                >
                  {{ i.name }}
                </RouterLink>
                <span class="area">{{ i.sigungu }} {{ i.area }}</span>
                <button type="button" class="rm" @click="cmp.remove(i.id)">빼기</button>
              </th>
            </tr>
          </thead>
          <tbody v-for="g in groups" :key="g.axis">
            <tr class="axis">
              <th :colspan="items.length + 1" scope="colgroup">
                {{ AXIS_LABEL[g.axis] }}
              </th>
            </tr>
            <tr v-for="d in g.defs" :key="d.key" :class="{ em: emphasized.has(d.key) }">
              <th scope="row">{{ d.short }}</th>
              <td v-for="i in items" :key="i.id" :class="{ miss: isMissing(i, d) }">
                {{ cell(i, d) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </main>
</template>

<style scoped>
.page {
  padding-block: 20px 120px;
}
.title {
  font-size: 24px;
  letter-spacing: -0.03em;
}
.hint {
  margin-block: 8px 16px;
  font-size: 14px;
  color: var(--c-ink-2);
}
.scroll {
  overflow-x: auto;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-m);
  background: var(--c-surface);
}
.tbl {
  width: 100%;
  min-width: 520px;
  border-collapse: collapse;
}
.tbl th,
.tbl td {
  padding: 10px 12px;
  border-top: 1px solid var(--c-line);
  text-align: left;
  vertical-align: top;
}
thead th {
  border-top: 0;
}
tbody th[scope='row'] {
  position: sticky;
  left: 0;
  background: var(--c-surface);
  font-weight: 600;
  white-space: nowrap;
}
.corner {
  position: sticky;
  left: 0;
  background: var(--c-surface);
}
.name {
  display: block;
  margin-top: 4px;
  font-weight: 800;
}
.area {
  display: block;
  font-size: 13px;
  font-weight: 400;
  color: var(--c-ink-2);
}
.rm {
  min-height: 44px;
  font-size: 13px;
  font-weight: 400;
  color: var(--c-ink-2);
  text-decoration: underline;
}
.axis th {
  background: rgb(27 36 48 / 5%);
  font-size: 14px;
}
.em th,
.em td {
  background: var(--c-brand-soft);
}
.miss {
  color: var(--c-ink-2);
}
.empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding-block: 24px;
  color: var(--c-ink-2);
}
.empty__link {
  padding: 10px 16px;
  border-radius: var(--radius-s);
  background: var(--c-brand);
  color: var(--c-brand-ink);
  font-weight: 700;
}
</style>
