export interface ServiceRegion {
  sido: string
  sigungu: string
  short: string
  gus: string[]
}

/** MVP 서비스 지역. 시 단위가 분포 비교의 기본 단위이고, 구는 필터로만 쓴다 */
export const SERVICE_REGIONS: ServiceRegion[] = [
  { sido: '경기', sigungu: '남양주시', short: '남양주', gus: [] },
  {
    sido: '충북',
    sigungu: '청주시',
    short: '청주',
    gus: ['상당구', '서원구', '흥덕구', '청원구'],
  },
  { sido: '전북', sigungu: '전주시', short: '전주', gus: ['완산구', '덕진구'] },
]

export function findRegion(sigungu: string): ServiceRegion | undefined {
  return SERVICE_REGIONS.find((r) => r.sigungu === sigungu)
}
