<script setup lang="ts">
import { AXIS_LABEL, METRICS } from '@/data/metrics'
import { SOURCES } from '@/data/sources'
import { IS_MOCK } from '@/config'

const sources = Object.values(SOURCES)
const POLARITY: Record<string, string> = {
  higher_better: '값이 클수록 여건이 여유로운 경향',
  lower_better: '값이 작을수록 여건이 여유로운 경향',
  neutral: '값의 크기로 판단하지 않음',
}
const PRINCIPLES = [
  '종합 점수·순위·별점은 만들지 않아요. 교육의 질을 하나의 숫자로 줄이기 어렵기 때문이에요.',
  '수치는 같은 시의 같은 종류 학교 분포 안에서의 위치로 보여드려요.',
  '공시되지 않은 항목은 0이 아니라 “공시되지 않음”으로 표시해요.',
  '지표값으로 정렬하지 않고, “N 이하” 같은 범위 조건만 지원해요.',
  '모든 수치에는 출처와 기준 시점을 함께 적어요.',
]
</script>

<template>
  <main class="container page">
    <h1 class="title">데이터 안내</h1>
    <p v-if="IS_MOCK" class="mock">
      현재 화면의 학교와 수치는 화면 검토용 가상 데이터예요. 실제 공공데이터 연동 전입니다.
    </p>

    <section>
      <h2>이 서비스의 원칙</h2>
      <ul class="bullets">
        <li v-for="p in PRINCIPLES" :key="p">{{ p }}</li>
      </ul>
    </section>

    <section>
      <h2>데이터 출처</h2>
      <ul class="cards">
        <li v-for="s in sources" :key="s.id" class="src">
          <strong>{{ s.label }}</strong>
          <span>{{ s.provider }}</span>
          <span>갱신: {{ s.cycle }}</span>
          <span>이용 조건: {{ s.license }}</span>
          <span>{{ s.note }}</span>
          <a :href="s.url" target="_blank" rel="noopener noreferrer">원본 보기</a>
        </li>
      </ul>
    </section>

    <section>
      <h2>지표 해설</h2>
      <ul class="cards">
        <li v-for="m in METRICS" :key="m.key" class="src">
          <strong>{{ m.label }}</strong>
          <span>{{ AXIS_LABEL[m.axis] }} · {{ POLARITY[m.polarity] }}</span>
          <span>{{ m.interpret }}</span>
          <span v-if="m.caveat" class="caveat">※ {{ m.caveat }}</span>
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding-block: 20px 48px;
}
.title {
  font-size: 26px;
  letter-spacing: -0.03em;
}
h2 {
  margin-bottom: 12px;
  font-size: 19px;
}
.mock {
  padding: 12px 14px;
  border-radius: 12px;
  background: #fff4d6;
  color: #6b4400;
}
.bullets {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 18px;
  list-style: disc;
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}
.src {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-m);
  background: var(--c-surface);
  font-size: 14px;
}
.src strong {
  font-size: 16px;
}
.src a {
  align-self: flex-start;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  text-decoration: underline;
  text-underline-offset: 3px;
  color: var(--c-brand);
}
.caveat {
  color: var(--c-ink-2);
}
</style>
