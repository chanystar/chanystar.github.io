export interface PopularRegion {
  label: string
  sido: string
  sigungu: string
}

export const POPULAR_REGIONS: PopularRegion[] = [
  { label: '강남구', sido: '서울', sigungu: '강남구' },
  { label: '서초구', sido: '서울', sigungu: '서초구' },
  { label: '송파구', sido: '서울', sigungu: '송파구' },
  { label: '노원구', sido: '서울', sigungu: '노원구' },
  { label: '분당', sido: '경기', sigungu: '성남시 분당구' },
  { label: '수지', sido: '경기', sigungu: '용인시 수지구' },
  { label: '송도', sido: '인천', sigungu: '연수구' },
  { label: '해운대', sido: '부산', sigungu: '해운대구' },
]

export const SIDO_LIST = [
  '서울',
  '부산',
  '대구',
  '인천',
  '광주',
  '대전',
  '울산',
  '세종',
  '경기',
  '강원',
  '충북',
  '충남',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
] as const
