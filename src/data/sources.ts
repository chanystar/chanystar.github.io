import type { SourceId } from '@/types/metric'

export interface SourceInfo {
  id: SourceId
  label: string
  provider: string
  cycle: string
  license: string
  note: string
  url: string
}

// 조사 내용 기준 (data.go.kr 메타데이터). 라이선스는 데이터셋별로 다시 확인할 것
export const SOURCES: Record<SourceId, SourceInfo> = {
  schoolinfo: {
    id: 'schoolinfo',
    label: '학교알리미',
    provider: '한국교육학술정보원(KERIS)',
    cycle: '연 2회 정기 공시(4월·9월)와 수시 공시',
    license: '출처표시(데이터셋별로 상이, 확인 필요)',
    note: '초·중·고 학급·학생·교원 현황, 교지·교사 면적 등',
    url: 'https://www.data.go.kr/biz/dcat/metadata/15154558.do',
  },
  kinderinfo: {
    id: 'kinderinfo',
    label: '유치원알리미',
    provider: '교육부',
    cycle: '연 1회 이상 (공시 기준월 4월)',
    license: '공공누리 제1유형(지자체 개방본 기준), 전국 데이터는 확인 필요',
    note: '유치원 학급·유아·교직원 구성, 방과후 과정, 교육비, 통학차량 등',
    url: 'https://e-childschoolinfo.moe.go.kr',
  },
  'child-zone': {
    id: 'child-zone',
    label: '전국어린이보호구역표준데이터',
    provider: '경찰청·교육부 (제공: 지방자치단체)',
    cycle: '반기',
    license: '데이터셋 페이지에 표기되지 않아 확인 필요',
    note: '어린이보호구역 지정 시설, CCTV 설치 대수, 도로폭',
    url: 'https://www.data.go.kr/data/15012891/standard.do',
  },
  koroad: {
    id: 'koroad',
    label: '도로교통공단 어린이 보행자 사고다발지역',
    provider: '도로교통공단',
    cycle: '연도별 집계',
    license: '이용허락범위 제한 없음(포털 표기)',
    note: '12세 이하 보행자 사고가 반복된 지점(200m 반경 3건 이상 등)의 위치와 사고 건수',
    url: 'https://www.data.go.kr/en/data/15058925/openapi.do',
  },
}
