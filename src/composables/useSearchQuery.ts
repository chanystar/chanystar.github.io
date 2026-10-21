import { computed } from 'vue'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'
import { METRICS, appliesTo, parsePriorities } from '@/data/metrics'
import { first } from '@/lib/query'
import type { Founding, KindFilter } from '@/types/institution'
import type { MetricKey, PriorityKey } from '@/types/metric'

const FOUNDINGS: Founding[] = ['국립', '공립', '사립']

function parseKind(v: string | undefined): KindFilter {
  return v === 'kindergarten' || v === 'elementary' ? v : 'all'
}

/** 검색 화면의 모든 상태를 URL 쿼리로 읽고 쓴다 (새로고침·공유·뒤로가기가 그대로 동작) */
export function useSearchQuery() {
  const route = useRoute()
  const router = useRouter()

  const kind = computed(() => parseKind(first(route.query.kind)))
  const q = computed(() => first(route.query.q) ?? '')
  const sigungu = computed(() => first(route.query.sigungu))
  const gu = computed(() => first(route.query.gu))
  const founding = computed(() => FOUNDINGS.find((f) => f === first(route.query.founding)))
  const priorities = computed(() => parsePriorities(first(route.query.priority), kind.value))

  const limits = computed(() => {
    const out: Partial<Record<MetricKey, number>> = {}
    for (const def of METRICS) {
      if (!def.filter || !appliesTo(def, kind.value)) continue
      const raw = first(route.query[`f_${def.key}`])
      const n = raw === undefined ? NaN : Number(raw)
      if (Number.isFinite(n)) out[def.key] = n
    }
    return out
  })

  function update(patch: Record<string, string | undefined>) {
    const query: LocationQueryRaw = { ...route.query, ...patch }
    router.replace({ query })
  }

  function setKind(next: KindFilter) {
    const allowed = parsePriorities(first(route.query.priority), next)
    const patch: Record<string, string | undefined> = {
      kind: next === 'all' ? undefined : next,
      priority: allowed.join(',') || undefined,
    }
    // 새 종류에 적용되지 않는 범위 필터는 함께 해제
    for (const def of METRICS) {
      if (def.filter && !appliesTo(def, next)) patch[`f_${def.key}`] = undefined
    }
    update(patch)
  }

  const setPriorities = (list: PriorityKey[]) => update({ priority: list.join(',') || undefined })
  const setRegion = (next: string | undefined) => update({ sigungu: next, gu: undefined })
  const setLimit = (key: MetricKey, value: number | undefined) =>
    update({ [`f_${key}`]: value === undefined ? undefined : String(value) })

  return {
    kind,
    q,
    sigungu,
    gu,
    founding,
    priorities,
    limits,
    update,
    setKind,
    setPriorities,
    setRegion,
    setLimit,
  }
}
