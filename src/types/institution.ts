export type InstitutionKind = 'kindergarten' | 'elementary'
export type KindFilter = 'all' | InstitutionKind

export const KIND_LABEL: Record<InstitutionKind, string> = {
  kindergarten: '유치원',
  elementary: '초등학교',
}

/** 목록·자동완성·최근 본 학교에서 공용으로 쓰는 요약 모델 */
export interface InstitutionSummary {
  id: number
  kind: InstitutionKind
  name: string
  sido: string
  sigungu: string
  founding: '국립' | '공립' | '사립'
  /** 카드에 노출할 핵심 지표 한 줄 (결측이면 undefined → 숨김) */
  metric?: string
}

export function isInstitutionSummary(v: unknown): v is InstitutionSummary {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    typeof o.id === 'number' &&
    (o.kind === 'kindergarten' || o.kind === 'elementary') &&
    typeof o.name === 'string' &&
    typeof o.sido === 'string' &&
    typeof o.sigungu === 'string'
  )
}