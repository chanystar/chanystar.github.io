import type { InstitutionKind } from './institution'

export type Axis = 'A' | 'B' | 'C'
export type Polarity = 'higher_better' | 'lower_better' | 'neutral'
export type SourceId = 'schoolinfo' | 'kinderinfo' | 'child-zone' | 'koroad'
export type DistScope = 'city' | 'area'

export type MetricKey =
  | 'class_size'
  | 'student_per_teacher'
  | 'senior_teacher_ratio'
  | 'care_program'
  | 'tuition'
  | 'area_per_student'
  | 'shuttle'
  | 'protection_zone'
  | 'cctv_count'
  | 'road_width'
  | 'hazard_spots'

export type PriorityKey = 'safety' | 'class_size' | 'staff' | 'care' | 'cost' | 'facility'

export interface MetricDef {
  key: MetricKey
  axis: Axis
  label: string
  /** 카드·한눈에 보기에서 쓰는 짧은 이름 */
  short: string
  type: 'number' | 'flag'
  unit?: string
  decimals?: number
  /** flag 타입의 [참, 거짓] 표기 */
  flagLabels?: [string, string]
  polarity: Polarity
  interpret: string
  caveat?: string
  kinds: InstitutionKind[]
  source: SourceId | Partial<Record<InstitutionKind, SourceId>>
  /** 목록 화면의 "N 이하" 범위 필터 설정 (정렬 대신 사용) */
  filter?: { min: number; max: number; step: number }
}

export interface MetricValue {
  key: MetricKey
  value: number | null
  status: 'ok' | 'not_disclosed' | 'not_applicable'
  /** 기준일 YYYY-MM-DD */
  asOf: string
}

export interface Distribution {
  key: MetricKey
  n: number
  min: number
  p25: number
  p50: number
  p75: number
  max: number
  scopeLabel: string
}

export interface PriorityDef {
  key: PriorityKey
  label: string
  hint: string
  /** 한눈에 보기·카드에 올리는 대표 지표 */
  headline: MetricKey
  metrics: MetricKey[]
  kinds: InstitutionKind[]
}
