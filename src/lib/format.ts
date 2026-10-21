import type { MetricDef } from '@/types/metric'

export function formatNumber(v: number, decimals = 0): string {
  return v.toLocaleString('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatMetric(def: MetricDef, v: number): string {
  if (def.type === 'flag') return (v ? def.flagLabels?.[0] : def.flagLabels?.[1]) ?? ''
  return `${formatNumber(v, def.decimals)}${def.unit ?? ''}`
}

/** 2025-09-30 → 2025.09 */
export function formatAsOf(asOf: string): string {
  const [y, m] = asOf.split('-')
  return `${y}.${m}`
}
