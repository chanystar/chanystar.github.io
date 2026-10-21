<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import CoverageBadge from '@/components/CoverageBadge.vue'
import KindBadge from '@/components/KindBadge.vue'
import MapPlaceholder from '@/components/MapPlaceholder.vue'
import MetricRow from '@/components/MetricRow.vue'
import OverviewBlock from '@/components/OverviewBlock.vue'
import ScopeToggle from '@/components/ScopeToggle.vue'
import { APP_NAME } from '@/config'
import {
  AXIS_LABEL,
  axisOrder,
  defaultPriorities,
  metricDef,
  parsePriorities,
  priorityDef,
} from '@/data/metrics'
import { findInstitution } from '@/data/store'
import { useCompare } from '@/composables/useCompare'
import { useFavorites } from '@/composables/useFavorites'
import { useRecentViewed } from '@/composables/useRecentViewed'
import { first } from '@/lib/query'
import { toSummary, type InstitutionKind } from '@/types/institution'
import type { Axis, DistScope, MetricKey, MetricValue } from '@/types/metric'

const route = useRoute()
const fav = useFavorites()
const cmp = useCompare()
const recent = useRecentViewed()

const kind = computed<InstitutionKind>(() =>
  route.name === 'school' ? 'elementary' : 'kindergarten',
)
const inst = computed(() => findInstitution(kind.value, Number(route.params.id)))

const priorities = computed(() => {
  const picked = parsePriorities(first(route.query.priority), kind.value)
  return picked.length ? picked : defaultPriorities(kind.value)
})
const hasPicked = computed(() => !!first(route.query.priority))

const scope = ref<DistScope>('city')
const copied = ref(false)

watch(
  inst,
  (i) => {
    if (!i) return
    recent.add(toSummary(i))
    document.title = `${i.name} | ${APP_NAME}`
  },
  { immediate: true },
)

const emphasized = computed(
  () => new Set<MetricKey>(priorities.value.flatMap((p) => priorityDef(p).metrics)),
)

interface Section {
  axis: Axis
  rows: { key: MetricKey; mv: MetricValue }[]
  disclosed: number
}

const sections = computed<Section[]>(() => {
  const i = inst.value
  if (!i) return []
  const order = hasPicked.value ? axisOrder(priorities.value) : axisOrder([])
  return order
    .map((axis) => {
      const rows = i.metrics
        .filter((m) => m.status !== 'not_applicable' && metricDef(m.key).axis === axis)
        .map((mv) => ({ key: mv.key, mv }))
      // 우선순위 항목을 축 안에서 먼저
      rows.sort((a, b) => Number(emphasized.value.has(b.key)) - Number(emphasized.value.has(a.key)))
      return {
        axis,
        rows,
        disclosed: rows.filter((r) => r.mv.status === 'ok').length,
      }
    })
    .filter((s) => s.rows.length > 0)
})

async function share() {
  try {
    await navigator.clipboard.writeText(location.href)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <main class="container page">
    <div v-if="!inst" class="nf">
      <h1>학교를 찾을 수 없어요</h1>
      <RouterLink to="/search" class="nf__link">학교 찾기로 이동</RouterLink>
    </div>

    <template v-else>
      <header class="head">
        <KindBadge :kind="inst.kind" />
        <h1 class="head__name">{{ inst.name }}</h1>
        <p class="head__addr">{{ inst.address }} · {{ inst.founding }}</p>

        <div class="head__actions">
          <button
            type="button"
            class="btn"
            :aria-pressed="fav.has(inst.id)"
            @click="fav.toggle(inst.id)"
          >
            <AppIcon name="heart" :size="18" :filled="fav.has(inst.id)" />
            {{ fav.has(inst.id) ? '찜함' : '찜' }}
          </button>
          <button
            type="button"
            class="btn"
            :aria-pressed="cmp.has(inst.id)"
            @click="cmp.toggle(toSummary(inst))"
          >
            <AppIcon :name="cmp.has(inst.id) ? 'check' : 'plus'" :size="18" />
            비교 담기
          </button>
          <button type="button" class="btn" @click="share">
            <AppIcon name="share" :size="18" />
            {{ copied ? '링크 복사됨' : '공유' }}
          </button>
        </div>
      </header>

      <div class="body">
        <OverviewBlock :inst="inst" :priorities="priorities" :scope="scope" />

        <div class="scope">
          <p>같은 지역 학교와 비교</p>
          <ScopeToggle v-model="scope" :sigungu="inst.sigungu" :area-type="inst.areaType" />
        </div>

        <section v-for="s in sections" :key="s.axis" class="sec" :aria-labelledby="`sec-${s.axis}`">
          <div class="sec__head">
            <h2 :id="`sec-${s.axis}`">{{ AXIS_LABEL[s.axis] }}</h2>
            <CoverageBadge :disclosed="s.disclosed" :total="s.rows.length" />
          </div>
          <MetricRow
            v-for="r in s.rows"
            :key="r.key"
            :inst="inst"
            :def="metricDef(r.key)"
            :mv="r.mv"
            :scope="scope"
            :emphasized="hasPicked && emphasized.has(r.key)"
          />
          <MapPlaceholder v-if="s.axis === 'C'" :address="inst.address" class="sec__map" />
        </section>

        <p class="foot">
          이 화면의 수치는 공공데이터를 가공한 참고 정보예요. 학교의 우열을 뜻하지 않으며, 실제와
          다를 수 있으니 해당 기관에 확인해 주세요.
          <RouterLink :to="{ name: 'guide-data' }" class="foot__link">데이터 안내</RouterLink>
        </p>
      </div>
    </template>
  </main>
</template>

<style scoped>
.page {
  padding-block: 20px 40px;
}
.head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}
.head__name {
  font-size: 28px;
  letter-spacing: -0.035em;
  line-height: 1.25;
}
.head__addr {
  color: var(--c-ink-2);
}
.head__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid var(--c-line);
  border-radius: 999px;
  background: var(--c-surface);
  font-weight: 600;
}
.btn[aria-pressed='true'] {
  border-color: var(--c-brand);
  background: var(--c-brand-soft);
  color: var(--c-brand);
}
.body {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 24px;
}
.scope {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-weight: 700;
}
.sec {
  padding: 16px 16px 8px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-m);
  background: var(--c-surface);
}
.sec__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.sec__head h2 {
  font-size: 20px;
  letter-spacing: -0.03em;
}
.sec__map {
  margin-block: 8px 12px;
}
.foot {
  font-size: 13px;
  line-height: 1.6;
  color: var(--c-ink-2);
}
.foot__link {
  margin-left: 6px;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.nf {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding-block: 40px;
}
.nf__link {
  padding: 10px 16px;
  border-radius: var(--radius-s);
  background: var(--c-brand);
  color: var(--c-brand-ink);
  font-weight: 700;
}
</style>
