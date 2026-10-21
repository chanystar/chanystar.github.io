import { INSTITUTIONS, textMatch } from '@/data/store'
import { toSummary, type InstitutionSummary, type KindFilter } from '@/types/institution'

/**
 * 자동완성. 지금은 인메모리 검색이지만 실제 연동 시에도 비동기 계약을 유지한다.
 * (정적 배포에서는 경량 인덱스 JSON을 로드해 클라이언트에서 검색)
 */
export async function suggest(
  query: string,
  kind: KindFilter,
  limit = 6,
): Promise<InstitutionSummary[]> {
  const q = query.trim()
  await new Promise((r) => setTimeout(r, 150)) // 네트워크 지연 흉내
  if (!q) return []
  return INSTITUTIONS.filter((i) => (kind === 'all' || i.kind === kind) && textMatch(i, q))
    .slice(0, limit)
    .map(toSummary)
}
