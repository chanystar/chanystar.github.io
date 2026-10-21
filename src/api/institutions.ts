import type { InstitutionSummary, KindFilter } from '@/types/institution'

/**
 * MOCK 데이터 (가상의 학교명). 실제 연동 시 suggest()만 BFF 호출로 교체한다.
 * 예) GET /api/institutions/suggest?q=...&kind=...&limit=6
 */
const MOCK: InstitutionSummary[] = [
  {
    id: 1,
    kind: 'elementary',
    name: '한빛초등학교',
    sido: '서울',
    sigungu: '강남구',
    founding: '공립',
    metric: '학급 32 · 학생 842',
  },
  {
    id: 2,
    kind: 'elementary',
    name: '가온초등학교',
    sido: '서울',
    sigungu: '서초구',
    founding: '공립',
    metric: '학급 28 · 학생 710',
  },
  {
    id: 3,
    kind: 'elementary',
    name: '별빛초등학교',
    sido: '서울',
    sigungu: '송파구',
    founding: '공립',
    metric: '학급 36 · 학생 951',
  },
  {
    id: 4,
    kind: 'elementary',
    name: '푸른솔초등학교',
    sido: '경기',
    sigungu: '성남시 분당구',
    founding: '공립',
    metric: '학급 30 · 학생 802',
  },
  {
    id: 5,
    kind: 'elementary',
    name: '새롬초등학교',
    sido: '경기',
    sigungu: '용인시 수지구',
    founding: '공립',
    metric: '학급 27 · 학생 690',
  },
  {
    id: 6,
    kind: 'elementary',
    name: '해든초등학교',
    sido: '인천',
    sigungu: '연수구',
    founding: '공립',
    metric: '학급 40 · 학생 1,020',
  },
  {
    id: 7,
    kind: 'elementary',
    name: '바다초등학교',
    sido: '부산',
    sigungu: '해운대구',
    founding: '공립',
    metric: '학급 24 · 학생 598',
  },
  {
    id: 8,
    kind: 'elementary',
    name: '다솜초등학교',
    sido: '서울',
    sigungu: '노원구',
    founding: '사립',
    metric: '학급 18 · 학생 432',
  },
  {
    id: 101,
    kind: 'kindergarten',
    name: '햇살유치원',
    sido: '서울',
    sigungu: '강남구',
    founding: '공립',
    metric: '학급 6 · 원아 128',
  },
  {
    id: 102,
    kind: 'kindergarten',
    name: '아기별유치원',
    sido: '서울',
    sigungu: '서초구',
    founding: '사립',
    metric: '학급 8 · 원아 154',
  },
  {
    id: 103,
    kind: 'kindergarten',
    name: '꿈나무유치원',
    sido: '경기',
    sigungu: '성남시 분당구',
    founding: '공립',
    metric: '학급 5 · 원아 96',
  },
  {
    id: 104,
    kind: 'kindergarten',
    name: '초롱유치원',
    sido: '경기',
    sigungu: '용인시 수지구',
    founding: '사립',
    metric: '학급 7 · 원아 141',
  },
  {
    id: 105,
    kind: 'kindergarten',
    name: '보름달유치원',
    sido: '인천',
    sigungu: '연수구',
    founding: '공립',
  },
  {
    id: 106,
    kind: 'kindergarten',
    name: '무지개유치원',
    sido: '서울',
    sigungu: '송파구',
    founding: '사립',
    metric: '학급 9 · 원아 170',
  },
]

export async function suggest(
  query: string,
  kind: KindFilter,
  limit = 6,
): Promise<InstitutionSummary[]> {
  const q = query.trim().toLowerCase()
  await new Promise((r) => setTimeout(r, 150)) // 네트워크 지연 흉내
  if (!q) return []
  return MOCK.filter((it) => kind === 'all' || it.kind === kind)
    .filter((it) => `${it.name} ${it.sido} ${it.sigungu}`.toLowerCase().includes(q))
    .slice(0, limit)
}
