import { ref } from 'vue'
import { isInstitutionSummary, type InstitutionSummary } from '@/types/institution'

const KEY = 'recent-institutions:v2'
const MAX = 10

function load(): InstitutionSummary[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isInstitutionSummary).slice(0, MAX) : []
  } catch {
    return [] // 시크릿 모드·손상된 값 등
  }
}

function persist(list: InstitutionSummary[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* quota / 접근 불가 시 메모리 상태만 유지 */
  }
}

// 모듈 싱글턴: 상세 페이지에서 add()한 결과가 홈에 그대로 반영된다
const items = ref<InstitutionSummary[]>(load())

export function useRecentViewed() {
  function add(item: InstitutionSummary) {
    items.value = [item, ...items.value.filter((i) => i.id !== item.id)].slice(0, MAX)
    persist(items.value)
  }

  function clear() {
    items.value = []
    persist(items.value)
  }

  return { items, add, clear }
}
