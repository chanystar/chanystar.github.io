<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import InstitutionCard from '@/components/InstitutionCard.vue'
import KindSegment from '@/components/KindSegment.vue'
import PriorityPicker from '@/components/PriorityPicker.vue'
import SearchBox from '@/components/SearchBox.vue'
import { METRICS, appliesTo } from '@/data/metrics'
import { findRegion, SERVICE_REGIONS } from '@/data/regions'
import { searchInstitutions } from '@/data/store'
import { useSearchQuery } from '@/composables/useSearchQuery'
import { formatMetric } from '@/lib/format'
import type { Founding, InstitutionSummary, KindFilter } from '@/types/institution'
import type { MetricKey, PriorityKey } from '@/types/metric'

const router = useRouter()
const s = useSearchQuery()

const kindModel = computed<KindFilter>({
  get: () => s.kind.value,
  set: (v) => s.setKind(v),
})
const prioModel = computed<PriorityKey[]>({
  get: () => s.priorities.value,
  set: (v) => s.setPriorities(v),
})

const region = computed(() => (s.sigungu.value ? findRegion(s.sigungu.value) : undefined))
const filterDefs = computed(() => METRICS.filter((d) => d.filter && appliesTo(d, s.kind.value)))

const result = computed(() =>
  searchInstitutions({
    q: s.q.value,
    kind: s.kind.value,
    sigungu: s.sigungu.value,
    gu: s.gu.value,
    founding: s.founding.value,
    max: s.limits.value,
  }),
)

const activeLimits = computed(() => Object.keys(s.limits.value).length)

function onRegion(e: Event) {
  s.setRegion((e.target as HTMLSelectElement).value || undefined)
}
function onGu(e: Event) {
  s.update({ gu: (e.target as HTMLSelectElement).value || undefined })
}
function onFounding(e: Event) {
  s.update({ founding: (e.target as HTMLSelectElement).value || undefined })
}
function onLimit(key: MetricKey, max: number, e: Event) {
  const n = Number((e.target as HTMLInputElement).value)
  s.setLimit(key, n >= max ? undefined : n)
}
function reset() {
  s.update({
    q: undefined,
    sigungu: undefined,
    gu: undefined,
    founding: undefined,
    ...Object.fromEntries(METRICS.map((d) => [`f_${d.key}`, undefined])),
  })
}
function goDetail(item: InstitutionSummary) {
  router.push({
    name: item.kind === 'elementary' ? 'school' : 'kindergarten',
    params: { id: item.id },
    query: s.priorities.value.length ? { priority: s.priorities.value.join(',') } : {},
  })
}

const FOUNDINGS: Founding[] = ['공립', '사립']
</script>

<template>
  <main class="container page">
    <h1 class="title">학교 찾기</h1>

    <div class="controls">
      <KindSegment v-model="kindModel" />
      <SearchBox
        :key="s.q.value"
        :kind="s.kind.value"
        :initial-query="s.q.value"
        @select="goDetail"
        @submit="(q) => s.update({ q })"
      />
      <PriorityPicker v-model="prioModel" :kind="s.kind.value" />

      <details class="filters" :open="activeLimits > 0 || !!s.sigungu.value">
        <summary>
          조건 설정 <span v-if="activeLimits">· 범위 {{ activeLimits }}개</span>
        </summary>

        <div class="filters__grid">
          <label class="field">
            <span>지역</span>
            <select :value="s.sigungu.value ?? ''" @change="onRegion">
              <option value="">전체</option>
              <option v-for="r in SERVICE_REGIONS" :key="r.sigungu" :value="r.sigungu">
                {{ r.sido }} {{ r.sigungu }}
              </option>
            </select>
          </label>
          <label v-if="region?.gus.length" class="field">
            <span>구</span>
            <select :value="s.gu.value ?? ''" @change="onGu">
              <option value="">전체</option>
              <option v-for="g in region.gus" :key="g" :value="g">
                {{ g }}
              </option>
            </select>
          </label>
          <label class="field">
            <span>설립</span>
            <select :value="s.founding.value ?? ''" @change="onFounding">
              <option value="">전체</option>
              <option v-for="f in FOUNDINGS" :key="f" :value="f">
                {{ f }}
              </option>
            </select>
          </label>
        </div>

        <div v-if="filterDefs.length" class="ranges">
          <p class="ranges__hint">
            범위 조건은 “N 이하”만 지원해요. 공시되지 않은 학교는 조건을 판단할 수 없어 제외돼요.
          </p>
          <label v-for="d in filterDefs" :key="d.key" class="range">
            <span class="range__head">
              {{ d.label }}
              <strong>
                {{
                  s.limits.value[d.key] === undefined || !d.filter
                    ? '제한 없음'
                    : `${formatMetric(d, s.limits.value[d.key] ?? 0)} 이하`
                }}
              </strong>
            </span>
            <input
              v-if="d.filter"
              type="range"
              :min="d.filter.min"
              :max="d.filter.max"
              :step="d.filter.step"
              :value="s.limits.value[d.key] ?? d.filter.max"
              @input="onLimit(d.key, d.filter.max, $event)"
            />
          </label>
        </div>

        <button type="button" class="reset" @click="reset">조건 초기화</button>
      </details>
    </div>

    <p class="count" role="status">
      <strong>{{ result.items.length }}곳</strong>
      <span v-if="result.excluded > 0">
        · 공시되지 않아 조건을 판단할 수 없는 {{ result.excluded }}곳은 제외했어요
      </span>
    </p>

    <ul v-if="result.items.length" class="grid">
      <li v-for="it in result.items" :key="it.id">
        <InstitutionCard :item="it" :priorities="s.priorities.value" />
      </li>
    </ul>
    <div v-else class="empty">
      <strong>조건에 맞는 학교가 없어요</strong>
      <p>범위를 넓히거나 조건을 초기화해 보세요. 결과는 이름순으로만 정렬돼요.</p>
      <button type="button" class="reset" @click="reset">조건 초기화</button>
    </div>
  </main>
</template>

<style scoped>
.page {
  padding-block: 20px 40px;
}
.title {
  font-size: 24px;
  letter-spacing: -0.03em;
}
.controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}
.filters {
  border: 1px solid var(--c-line);
  border-radius: var(--radius-m);
  background: var(--c-surface);
  padding: 0 16px;
}
.filters summary {
  min-height: 48px;
  display: flex;
  align-items: center;
  font-weight: 700;
  cursor: pointer;
}
.filters[open] {
  padding-bottom: 12px;
}
.filters__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: var(--c-ink-2);
}
.field select {
  min-height: 44px;
  padding: 0 10px;
  border: 1px solid var(--c-line);
  border-radius: 10px;
  background: #fff;
  font: inherit;
  color: var(--c-ink);
}
.ranges {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 16px;
}
.ranges__hint {
  font-size: 13px;
  color: var(--c-ink-2);
}
.range {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.range__head {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
}
.range input {
  width: 100%;
  min-height: 32px;
  accent-color: var(--c-brand);
}
.reset {
  min-height: 44px;
  margin-top: 8px;
  padding: 0 16px;
  border: 1px solid var(--c-line);
  border-radius: 12px;
  font-weight: 600;
}
.count {
  margin-block: 20px 12px;
  color: var(--c-ink-2);
}
.count strong {
  color: var(--c-ink);
  font-size: 18px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}
.grid :deep(.card) {
  height: 100%;
}
.empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 28px 0;
  color: var(--c-ink-2);
}
.empty strong {
  color: var(--c-ink);
  font-size: 18px;
}
</style>
