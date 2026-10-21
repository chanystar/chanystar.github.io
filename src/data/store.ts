/**
 * 인메모리 데이터 저장소 (현재는 가상 데이터를 결정적으로 생성).
 * 실데이터 연동 시: 반기 ETL이 만든 JSON을 앱 시작 시 로드해 INSTITUTIONS를 채우고,
 * 분포(getDistribution)는 사전 계산 JSON으로 대체한다. 이 모듈의 함수 시그니처는 유지.
 */
import { METRICS, metricDef } from '@/data/metrics'
import {
  AREA_TYPE_LABEL,
  KIND_LABEL,
  type AreaType,
  type Founding,
  type Institution,
  type InstitutionKind,
  type InstitutionSummary,
  type KindFilter,
} from '@/types/institution'
import type {
  Distribution,
  DistScope,
  MetricDef,
  MetricKey,
  MetricValue,
  SourceId,
} from '@/types/metric'

// ── 가상 데이터 생성 ─────────────────────────────

interface AreaSeed {
  sido: string
  sigungu: string
  gu?: string
  area: string
  areaType: AreaType
}

// 행정동 이름만 실제 지명을 빌렸고, 학교·수치는 전부 가상이다
const AREAS: AreaSeed[] = [
  { sido: '경기', sigungu: '남양주시', area: '다산동', areaType: 'dong' },
  { sido: '경기', sigungu: '남양주시', area: '별내동', areaType: 'dong' },
  { sido: '경기', sigungu: '남양주시', area: '호평동', areaType: 'dong' },
  { sido: '경기', sigungu: '남양주시', area: '평내동', areaType: 'dong' },
  { sido: '경기', sigungu: '남양주시', area: '금곡동', areaType: 'dong' },
  { sido: '경기', sigungu: '남양주시', area: '와부읍', areaType: 'eupmyeon' },
  { sido: '경기', sigungu: '남양주시', area: '화도읍', areaType: 'eupmyeon' },
  { sido: '경기', sigungu: '남양주시', area: '진접읍', areaType: 'eupmyeon' },
  {
    sido: '충북',
    sigungu: '청주시',
    gu: '상당구',
    area: '용암동',
    areaType: 'dong',
  },
  {
    sido: '충북',
    sigungu: '청주시',
    gu: '서원구',
    area: '개신동',
    areaType: 'dong',
  },
  {
    sido: '충북',
    sigungu: '청주시',
    gu: '서원구',
    area: '사직동',
    areaType: 'dong',
  },
  {
    sido: '충북',
    sigungu: '청주시',
    gu: '흥덕구',
    area: '복대동',
    areaType: 'dong',
  },
  {
    sido: '충북',
    sigungu: '청주시',
    gu: '흥덕구',
    area: '가경동',
    areaType: 'dong',
  },
  {
    sido: '충북',
    sigungu: '청주시',
    gu: '청원구',
    area: '율량동',
    areaType: 'dong',
  },
  {
    sido: '충북',
    sigungu: '청주시',
    gu: '청원구',
    area: '내덕동',
    areaType: 'dong',
  },
  {
    sido: '충북',
    sigungu: '청주시',
    gu: '청원구',
    area: '오창읍',
    areaType: 'eupmyeon',
  },
  {
    sido: '전북',
    sigungu: '전주시',
    gu: '완산구',
    area: '효자동',
    areaType: 'dong',
  },
  {
    sido: '전북',
    sigungu: '전주시',
    gu: '완산구',
    area: '서신동',
    areaType: 'dong',
  },
  {
    sido: '전북',
    sigungu: '전주시',
    gu: '완산구',
    area: '중화산동',
    areaType: 'dong',
  },
  {
    sido: '전북',
    sigungu: '전주시',
    gu: '완산구',
    area: '삼천동',
    areaType: 'dong',
  },
  {
    sido: '전북',
    sigungu: '전주시',
    gu: '덕진구',
    area: '송천동',
    areaType: 'dong',
  },
  {
    sido: '전북',
    sigungu: '전주시',
    gu: '덕진구',
    area: '혁신동',
    areaType: 'dong',
  },
  {
    sido: '전북',
    sigungu: '전주시',
    gu: '덕진구',
    area: '인후동',
    areaType: 'dong',
  },
  {
    sido: '전북',
    sigungu: '전주시',
    gu: '덕진구',
    area: '만성동',
    areaType: 'dong',
  },
]

const NAMES = [
  '가온',
  '한빛',
  '별빛',
  '푸른솔',
  '새롬',
  '해든',
  '다솜',
  '늘푸른',
  '한결',
  '소담',
  '아름',
  '도담',
  '나래',
  '보람',
  '하늘',
  '미래',
  '은빛',
  '초록',
  '햇살',
  '꿈나무',
  '샘물',
  '온누리',
  '함께',
  '푸름',
]

const AS_OF: Record<SourceId, string> = {
  schoolinfo: '2025-09-30',
  kinderinfo: '2026-04-01',
  'child-zone': '2026-09-22',
  koroad: '2025-12-31',
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const between = (r: number, lo: number, hi: number, step = 0.1) =>
  Math.round((lo + r * (hi - lo)) / step) * step

interface GenCtx {
  kind: InstitutionKind
  founding: Founding
  zone: boolean
}

function generate(def: MetricDef, ctx: GenCtx, rnd: () => number): MetricValue {
  const source = typeof def.source === 'string' ? def.source : def.source[ctx.kind]
  const asOf = AS_OF[source ?? 'schoolinfo']
  const base = { key: def.key, asOf }

  if ((def.key === 'cctv_count' || def.key === 'road_width') && !ctx.zone) {
    return { ...base, value: null, status: 'not_applicable' }
  }
  // 약 8%는 미공시로 만들어 결측 상태를 화면에서 확인할 수 있게 한다
  if (def.key !== 'protection_zone' && rnd() < 0.08) {
    return { ...base, value: null, status: 'not_disclosed' }
  }

  const el = ctx.kind === 'elementary'
  const r = rnd()
  let value: number
  switch (def.key) {
    case 'class_size':
      value = el ? between(r, 18, 31) : between(r, 12, 24)
      break
    case 'student_per_teacher':
      value = el ? between(r, 11, 19) : between(r, 7, 14)
      break
    case 'senior_teacher_ratio':
      value = Math.round(15 + r * 75)
      break
    case 'tuition':
      value =
        ctx.founding === '공립'
          ? Math.round((20000 + r * 100000) / 1000) * 1000
          : Math.round((150000 + r * 230000) / 1000) * 1000
      break
    case 'area_per_student':
      value = between(r, 8, 35)
      break
    case 'care_program':
      value = r < 0.65 ? 1 : 0
      break
    case 'shuttle':
      value = r < 0.5 ? 1 : 0
      break
    case 'protection_zone':
      value = r < 0.85 ? 1 : 0
      ctx.zone = value === 1
      break
    case 'cctv_count':
      value = Math.round(1 + r * 7)
      break
    case 'road_width':
      value = Math.round(6 + r * 10)
      break
    case 'hazard_spots':
      value = r < 0.6 ? 0 : r < 0.85 ? 1 : r < 0.96 ? 2 : 3
      break
  }
  return { ...base, value, status: 'ok' }
}

function make(kind: InstitutionKind, id: number, name: string, a: AreaSeed): Institution {
  const rnd = mulberry32(id * 7919)
  const founding: Founding =
    kind === 'elementary' ? (rnd() < 0.9 ? '공립' : '사립') : rnd() < 0.5 ? '공립' : '사립'
  const ctx: GenCtx = { kind, founding, zone: false }
  const metrics = METRICS.filter((d) => d.kinds.includes(kind)).map((d) => generate(d, ctx, rnd))
  const house = Math.floor(rnd() * 190) + 10
  return {
    id,
    kind,
    name,
    sido: a.sido,
    sigungu: a.sigungu,
    gu: a.gu,
    area: a.area,
    areaType: a.areaType,
    founding,
    address: `${a.sido} ${a.sigungu} ${a.gu ? `${a.gu} ` : ''}${a.area} ${house}`,
    metrics,
  }
}

const nameAt = (i: number) => NAMES[i % NAMES.length] ?? ''

function build(): Institution[] {
  const list: Institution[] = []
  // 초등학교 24곳: id 1~24 / 유치원 18곳: id 101~118 (종류와 무관하게 id 유일)
  AREAS.forEach((a, i) => list.push(make('elementary', i + 1, `${nameAt(i)}초등학교`, a)))
  for (let j = 0; j < 18; j++) {
    const a = AREAS[Math.floor(j / 6) * 8 + (j % 6)]
    if (a) list.push(make('kindergarten', 101 + j, `${nameAt(j * 5 + 3)}유치원`, a))
  }
  return list
}

export const INSTITUTIONS: Institution[] = build()

// ── 조회 ─────────────────────────────────────────

export function findById(id: number): Institution | undefined {
  return INSTITUTIONS.find((i) => i.id === id)
}

export function findInstitution(kind: InstitutionKind, id: number): Institution | undefined {
  const found = findById(id)
  return found && found.kind === kind ? found : undefined
}

export function metricOf(inst: Institution, key: MetricKey): MetricValue | undefined {
  return inst.metrics.find((m) => m.key === key)
}

export interface SearchParams {
  q?: string
  kind: KindFilter
  sigungu?: string
  gu?: string
  founding?: Founding
  /** 지표별 "N 이하" 조건 */
  max?: Partial<Record<MetricKey, number>>
}

const haystack = (i: Institution) =>
  `${i.name} ${i.sido} ${i.sigungu} ${i.gu ?? ''} ${i.area}`.toLowerCase()

export function textMatch(i: Institution, q: string): boolean {
  return haystack(i).includes(q.trim().toLowerCase())
}

/** 이름순 정렬만 제공한다. 지표값 정렬은 사실상 랭킹이라 의도적으로 두지 않는다 */
export function searchInstitutions(p: SearchParams): {
  items: Institution[]
  excluded: number
} {
  const q = p.q?.trim() ?? ''
  const base = INSTITUTIONS.filter(
    (i) =>
      (p.kind === 'all' || i.kind === p.kind) &&
      (!p.sigungu || i.sigungu === p.sigungu) &&
      (!p.gu || i.gu === p.gu) &&
      (!p.founding || i.founding === p.founding) &&
      (!q || textMatch(i, q)),
  )

  const limits = Object.entries(p.max ?? {}) as [MetricKey, number][]
  const items: Institution[] = []
  let excluded = 0 // 공시되지 않아 조건을 판단할 수 없어 제외된 곳

  for (const inst of base) {
    let state: 'pass' | 'fail' | 'unknown' = 'pass'
    for (const [key, limit] of limits) {
      if (!metricDef(key).kinds.includes(inst.kind)) continue
      const mv = metricOf(inst, key)
      if (mv?.status !== 'ok' || mv.value === null) {
        if (state === 'pass') state = 'unknown'
        continue
      }
      if (mv.value > limit) state = 'fail'
    }
    if (state === 'pass') items.push(inst)
    else if (state === 'unknown') excluded++
  }

  items.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  return { items, excluded }
}

// ── 분포 ─────────────────────────────────────────

const MIN_SAMPLE = 5

function quantile(sorted: number[], p: number): number {
  const pos = (sorted.length - 1) * p
  const lo = Math.floor(pos)
  const a = sorted[lo] ?? 0
  const b = sorted[lo + 1] ?? a
  return a + (b - a) * (pos - lo)
}

export function scopeLabel(inst: InstitutionSummary, scope: DistScope): string {
  const base = `${inst.sigungu} ${KIND_LABEL[inst.kind]}`
  return scope === 'area' ? `${base} · ${AREA_TYPE_LABEL[inst.areaType]}` : base
}

const distCache = new Map<string, Distribution | undefined>()

/** 같은 시·같은 종류(필요 시 같은 지역 유형) 안에서의 분포. 표본이 적으면 undefined */
export function getDistribution(
  key: MetricKey,
  inst: InstitutionSummary,
  scope: DistScope,
): Distribution | undefined {
  if (metricDef(key).type !== 'number') return undefined
  const cacheKey = [key, inst.kind, inst.sigungu, scope === 'area' ? inst.areaType : ''].join('|')
  if (distCache.has(cacheKey)) return distCache.get(cacheKey)

  const values: number[] = []
  for (const i of INSTITUTIONS) {
    if (i.kind !== inst.kind || i.sigungu !== inst.sigungu) continue
    if (scope === 'area' && i.areaType !== inst.areaType) continue
    const mv = metricOf(i, key)
    if (mv?.status === 'ok' && mv.value !== null) values.push(mv.value)
  }
  values.sort((a, b) => a - b)

  const result: Distribution | undefined =
    values.length >= MIN_SAMPLE
      ? {
          key,
          n: values.length,
          min: values[0] ?? 0,
          p25: quantile(values, 0.25),
          p50: quantile(values, 0.5),
          p75: quantile(values, 0.75),
          max: values[values.length - 1] ?? 0,
          scopeLabel: scopeLabel(inst, scope),
        }
      : undefined
  distCache.set(cacheKey, result)
  return result
}
