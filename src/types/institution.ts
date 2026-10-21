import type { MetricValue } from './metric'

export type InstitutionKind = 'kindergarten' | 'elementary'
export type KindFilter = 'all' | InstitutionKind
export type Founding = '국립' | '공립' | '사립'
export type AreaType = 'dong' | 'eupmyeon'

export const KIND_LABEL: Record<InstitutionKind, string> = {
  kindergarten: '유치원',
  elementary: '초등학교',
}

export const AREA_TYPE_LABEL: Record<AreaType, string> = {
  dong: '동 지역',
  eupmyeon: '읍·면 지역',
}

/** 목록·자동완성·최근 본 학교에서 공용으로 쓰는 요약 모델. id는 종류와 무관하게 유일 */
export interface InstitutionSummary {
  id: number
  kind: InstitutionKind
  name: string
  sido: string
  sigungu: string
  gu?: string
  area: string
  areaType: AreaType
  founding: Founding
}

export interface Institution extends InstitutionSummary {
  address: string
  metrics: MetricValue[]
}

export function toSummary(i: InstitutionSummary): InstitutionSummary {
  const { id, kind, name, sido, sigungu, gu, area, areaType, founding } = i
  return { id, kind, name, sido, sigungu, gu, area, areaType, founding }
}

export function isInstitutionSummary(v: unknown): v is InstitutionSummary {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    typeof o.id === 'number' &&
    (o.kind === 'kindergarten' || o.kind === 'elementary') &&
    typeof o.name === 'string' &&
    typeof o.sido === 'string' &&
    typeof o.sigungu === 'string' &&
    typeof o.area === 'string'
  )
}
