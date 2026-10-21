import type { InstitutionKind, KindFilter } from '@/types/institution'
import type { Axis, MetricDef, MetricKey, PriorityDef, PriorityKey, SourceId } from '@/types/metric'

export const AXIS_LABEL: Record<Axis, string> = {
  A: '교육 여건',
  B: '교육환경',
  C: '주변환경',
}

/** 상세 화면 섹션의 기본 순서 (차별 가치가 큰 주변환경을 먼저) */
export const AXES: Axis[] = ['C', 'A', 'B']

const BOTH: InstitutionKind[] = ['elementary', 'kindergarten']
const SRC_BY_KIND = {
  elementary: 'schoolinfo',
  kindergarten: 'kinderinfo',
} as const

// 순서 주의: protection_zone이 cctv_count / road_width보다 앞에 있어야 한다 (mock 생성 로직)
export const METRICS: MetricDef[] = [
  {
    key: 'class_size',
    axis: 'A',
    label: '학급당 학생(유아) 수',
    short: '학급당 인원',
    type: 'number',
    unit: '명',
    decimals: 1,
    polarity: 'lower_better',
    interpret: '학급 인원이 적을수록 개별 지도 시간이 늘어날 수 있어요.',
    caveat: '교육의 질을 직접 뜻하지는 않아요. 소규모 학교는 수치가 낮게 나올 수 있어요.',
    kinds: BOTH,
    source: SRC_BY_KIND,
    filter: { min: 10, max: 35, step: 1 },
  },
  {
    key: 'student_per_teacher',
    axis: 'A',
    label: '교원 1인당 학생(유아) 수',
    short: '교원당 인원',
    type: 'number',
    unit: '명',
    decimals: 1,
    polarity: 'lower_better',
    interpret: '교원 한 명이 맡는 학생 수예요. 적을수록 관심이 분산되지 않을 수 있어요.',
    caveat: '특수·보건·영양 교원을 포함하는지에 따라 값이 달라질 수 있어요.',
    kinds: BOTH,
    source: SRC_BY_KIND,
  },
  {
    key: 'senior_teacher_ratio',
    axis: 'A',
    label: '수석·정교사 비율',
    short: '정교사 비율',
    type: 'number',
    unit: '%',
    decimals: 0,
    polarity: 'neutral',
    interpret: '교원 중 수석교사·정교사 자격을 가진 분의 비율이에요.',
    caveat: '경력이나 교육 역량을 직접 뜻하지는 않아요.',
    kinds: ['kindergarten'],
    source: 'kinderinfo',
  },
  {
    key: 'care_program',
    axis: 'A',
    label: '방과후 과정 운영',
    short: '방과후 과정',
    type: 'flag',
    flagLabels: ['운영', '미운영'],
    polarity: 'higher_better',
    interpret: '방과후 과정을 운영하는지 여부예요.',
    caveat: '운영 시간·내용·비용은 따로 확인해야 해요.',
    kinds: ['kindergarten'],
    source: 'kinderinfo',
  },
  {
    key: 'tuition',
    axis: 'A',
    label: '월 교육비',
    short: '월 교육비',
    type: 'number',
    unit: '원',
    decimals: 0,
    polarity: 'lower_better',
    interpret: '학부모가 부담하는 월 교육비(방과후 과정 포함)예요.',
    caveat: '급식비·특성화 활동비 등 포함 항목이 유치원마다 다를 수 있어요.',
    kinds: ['kindergarten'],
    source: 'kinderinfo',
    filter: { min: 0, max: 400000, step: 10000 },
  },
  {
    key: 'area_per_student',
    axis: 'B',
    label: '학생당 교지 면적',
    short: '학생당 면적',
    type: 'number',
    unit: '㎡',
    decimals: 1,
    polarity: 'higher_better',
    interpret: '학생 한 명당 학교 부지 면적이에요. 넓을수록 활동 공간이 여유로울 수 있어요.',
    caveat: '학교 규모와 도심 입지에 따라 크게 달라요.',
    kinds: ['elementary'],
    source: 'schoolinfo',
  },
  {
    key: 'shuttle',
    axis: 'B',
    label: '통학차량 운영',
    short: '통학차량',
    type: 'flag',
    flagLabels: ['운영', '미운영'],
    polarity: 'higher_better',
    interpret: '통학차량을 운영하는지 여부예요.',
    caveat: '노선과 운행 시간은 따로 확인해야 해요.',
    kinds: ['kindergarten'],
    source: 'kinderinfo',
  },
  {
    key: 'protection_zone',
    axis: 'C',
    label: '어린이보호구역 지정',
    short: '보호구역',
    type: 'flag',
    flagLabels: ['지정', '미지정'],
    polarity: 'higher_better',
    interpret: '학교 주변 도로가 어린이보호구역으로 지정되어 있는지 여부예요.',
    caveat: '지정 여부만으로 실제 통학로의 안전을 보장하지는 않아요.',
    kinds: BOTH,
    source: 'child-zone',
  },
  {
    key: 'cctv_count',
    axis: 'C',
    label: '보호구역 CCTV 설치 대수',
    short: 'CCTV',
    type: 'number',
    unit: '대',
    decimals: 0,
    polarity: 'higher_better',
    interpret: '보호구역 안에 설치된 CCTV 수예요.',
    caveat: '보호구역으로 지정된 곳만 집계되고, 설치 위치는 알 수 없어요.',
    kinds: BOTH,
    source: 'child-zone',
  },
  {
    key: 'road_width',
    axis: 'C',
    label: '보호구역 도로폭',
    short: '도로폭',
    type: 'number',
    unit: 'm',
    decimals: 0,
    polarity: 'neutral',
    interpret: '보호구역으로 지정된 도로의 폭이에요.',
    caveat: '도로폭만으로 통학 위험을 판단하기는 어려워요.',
    kinds: BOTH,
    source: 'child-zone',
  },
  {
    key: 'hazard_spots',
    axis: 'C',
    label: '반경 500m 내 어린이 사고다발지역',
    short: '사고다발지역(500m)',
    type: 'number',
    unit: '곳',
    decimals: 0,
    polarity: 'lower_better',
    interpret: '학교 반경 500m 안에 걸쳐 있는 어린이 보행자 사고다발지역 수예요.',
    caveat:
      '0곳은 다발지역으로 지정되지 않았다는 뜻이지 사고가 없었다는 뜻은 아니에요. 조사 연도 기준이에요.',
    kinds: BOTH,
    source: 'koroad',
    filter: { min: 0, max: 3, step: 1 },
  },
]

export const PRIORITIES: PriorityDef[] = [
  {
    key: 'safety',
    label: '통학 안전',
    hint: '보호구역, CCTV, 사고다발지역',
    headline: 'hazard_spots',
    metrics: ['protection_zone', 'cctv_count', 'road_width', 'hazard_spots'],
    kinds: BOTH,
  },
  {
    key: 'class_size',
    label: '학급 규모',
    hint: '학급당·교원당 인원',
    headline: 'class_size',
    metrics: ['class_size', 'student_per_teacher'],
    kinds: BOTH,
  },
  {
    key: 'staff',
    label: '교원 구성',
    hint: '수석·정교사 비율',
    headline: 'senior_teacher_ratio',
    metrics: ['senior_teacher_ratio'],
    kinds: ['kindergarten'],
  },
  {
    key: 'care',
    label: '방과후·돌봄',
    hint: '방과후 과정 운영',
    headline: 'care_program',
    metrics: ['care_program'],
    kinds: ['kindergarten'],
  },
  {
    key: 'cost',
    label: '교육비',
    hint: '월 교육비 부담',
    headline: 'tuition',
    metrics: ['tuition'],
    kinds: ['kindergarten'],
  },
  {
    key: 'facility',
    label: '시설 여유',
    hint: '학생당 교지 면적',
    headline: 'area_per_student',
    metrics: ['area_per_student'],
    kinds: ['elementary'],
  },
]

const METRIC_MAP = new Map(METRICS.map((m) => [m.key, m]))
const PRIORITY_MAP = new Map(PRIORITIES.map((p) => [p.key, p]))

export function metricDef(key: MetricKey): MetricDef {
  const def = METRIC_MAP.get(key)
  if (!def) throw new Error(`unknown metric: ${key}`)
  return def
}

export function priorityDef(key: PriorityKey): PriorityDef {
  const def = PRIORITY_MAP.get(key)
  if (!def) throw new Error(`unknown priority: ${key}`)
  return def
}

/** 전체(all)는 두 종류에 모두 적용되는 항목만 해당 */
export function appliesTo(def: { kinds: InstitutionKind[] }, kind: KindFilter): boolean {
  return kind === 'all' ? def.kinds.length === BOTH.length : def.kinds.includes(kind)
}

export function metricsForKind(kind: InstitutionKind): MetricDef[] {
  return METRICS.filter((m) => m.kinds.includes(kind))
}

export function prioritiesFor(kind: KindFilter): PriorityDef[] {
  return PRIORITIES.filter((p) => appliesTo(p, kind))
}

/** 우선순위를 고르지 않았을 때 한눈에 보기에 쓰는 기본 3개 */
export function defaultPriorities(kind: InstitutionKind): PriorityKey[] {
  return ['safety', 'class_size', kind === 'kindergarten' ? 'staff' : 'facility']
}

export function sourceOf(def: MetricDef, kind: InstitutionKind): SourceId {
  return typeof def.source === 'string' ? def.source : (def.source[kind] ?? 'schoolinfo')
}

/** 선택한 우선순위에 속한 축을 앞에 두고, 나머지는 기본 순서로 */
export function axisOrder(priorities: PriorityKey[]): Axis[] {
  const first: Axis[] = []
  for (const p of priorities) {
    for (const key of priorityDef(p).metrics) {
      const axis = metricDef(key).axis
      if (!first.includes(axis)) first.push(axis)
    }
  }
  return [...first, ...AXES.filter((a) => !first.includes(a))]
}

export function parsePriorities(raw: string | undefined, kind: KindFilter, max = 3): PriorityKey[] {
  if (!raw) return []
  const allowed = prioritiesFor(kind).map((p) => p.key)
  const out: PriorityKey[] = []
  for (const k of raw.split(',')) {
    const key = allowed.find((a) => a === k)
    if (key && !out.includes(key)) out.push(key)
  }
  return out.slice(0, max)
}
