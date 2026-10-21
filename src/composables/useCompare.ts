import { computed, ref } from 'vue'
import { findById } from '@/data/store'
import type { InstitutionSummary } from '@/types/institution'

const KEY = 'compare:v1'
export const COMPARE_MAX = 4

function load(): number[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter((v): v is number => typeof v === 'number' && !!findById(v))
  } catch {
    return []
  }
}

function persist(ids: number[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids))
  } catch {
    /* 메모리 상태만 유지 */
  }
}

const ids = ref<number[]>(load())
const notice = ref('')
let noticeTimer: ReturnType<typeof setTimeout> | undefined

function say(message: string) {
  notice.value = message
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => (notice.value = ''), 3000)
}

export function useCompare() {
  // 유치원과 초등학교는 항목이 달라 함께 비교하지 않는다. 담긴 첫 항목이 종류를 결정한다
  const kind = computed(() => {
    const first = ids.value[0]
    return first === undefined ? undefined : findById(first)?.kind
  })

  const has = (id: number) => ids.value.includes(id)

  function remove(id: number) {
    ids.value = ids.value.filter((i) => i !== id)
    persist(ids.value)
  }

  function toggle(item: InstitutionSummary) {
    if (has(item.id)) return remove(item.id)
    if (kind.value && kind.value !== item.kind) {
      return say('유치원과 초등학교는 함께 비교할 수 없어요.')
    }
    if (ids.value.length >= COMPARE_MAX) {
      return say(`최대 ${COMPARE_MAX}곳까지 비교할 수 있어요.`)
    }
    ids.value = [...ids.value, item.id]
    persist(ids.value)
  }

  function clear() {
    ids.value = []
    persist(ids.value)
  }

  return { ids, kind, notice, has, toggle, remove, clear }
}
