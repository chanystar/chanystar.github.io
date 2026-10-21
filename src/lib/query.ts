/** vue-router 쿼리 값(string | null | 배열)에서 첫 번째 문자열만 꺼낸다. 빈 문자열은 undefined */
export function first(v: unknown): string | undefined {
  const x = Array.isArray(v) ? v[0] : v
  return typeof x === 'string' && x ? x : undefined
}
