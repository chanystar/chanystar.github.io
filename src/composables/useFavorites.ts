import { ref } from 'vue'
import { findById } from '@/data/store'

const KEY = 'favorites:v1'

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

export function useFavorites() {
  const has = (id: number) => ids.value.includes(id)

  function toggle(id: number) {
    ids.value = has(id) ? ids.value.filter((i) => i !== id) : [...ids.value, id]
    persist(ids.value)
  }

  return { ids, has, toggle }
}
