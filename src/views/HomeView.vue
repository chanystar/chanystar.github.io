<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import InstitutionCard from '@/components/InstitutionCard.vue'
import KindSegment from '@/components/KindSegment.vue'
import PriorityPicker from '@/components/PriorityPicker.vue'
import SearchBox from '@/components/SearchBox.vue'
import AppIcon from '@/components/AppIcon.vue'
import { parsePriorities } from '@/data/metrics'
import { SERVICE_REGIONS } from '@/data/regions'
import { findById } from '@/data/store'
import { useRecentViewed } from '@/composables/useRecentViewed'
import type { Institution, InstitutionSummary, KindFilter } from '@/types/institution'
import type { PriorityKey } from '@/types/metric'

const router = useRouter()
const { items: recentRaw, clear: clearRecent } = useRecentViewed()

const kind = ref<KindFilter>('all')
const priorities = ref<PriorityKey[]>([])

// 종류를 바꾸면 해당 종류에 없는 우선순위는 해제
watch(kind, (k) => {
  priorities.value = parsePriorities(priorities.value.join(','), k)
})

const recent = computed(() => recentRaw.value.flatMap((r) => findById(r.id) ?? []) as Institution[])

const searchQuery = computed(() => ({
  ...(kind.value === 'all' ? {} : { kind: kind.value }),
  ...(priorities.value.length ? { priority: priorities.value.join(',') } : {}),
}))

function goSearch(q: string) {
  router.push({ name: 'search', query: { q, ...searchQuery.value } })
}

function goDetail(item: InstitutionSummary) {
  router.push({
    name: item.kind === 'elementary' ? 'school' : 'kindergarten',
    params: { id: item.id },
    query: priorities.value.length ? { priority: priorities.value.join(',') } : {},
  })
}
</script>

<template>
  <main>
    <section class="hero" aria-labelledby="hero-title">
      <div class="container hero__inner">
        <p class="hero__eyebrow">유치원 · 초등학교 교육환경 정보</p>
        <h1 id="hero-title" class="hero__title">교육환경을 찾아보세요</h1>
        <p class="hero__sub">
          점수나 순위 대신, 공공데이터를 같은 지역 학교와 나란히 놓고 보여드려요.
        </p>

        <div class="hero__controls">
          <KindSegment v-model="kind" />
          <SearchBox :kind="kind" @select="goDetail" @submit="goSearch" />
          <PriorityPicker v-model="priorities" :kind="kind" />
          <RouterLink :to="{ name: 'search', query: searchQuery }" class="cta">
            이 기준으로 학교 보기
            <AppIcon name="arrow" :size="20" />
          </RouterLink>
        </div>
      </div>
    </section>

    <div class="container stack">
      <section aria-labelledby="region-title">
        <h2 id="region-title" class="sec-title">서비스 지역</h2>
        <ul class="regions">
          <li v-for="r in SERVICE_REGIONS" :key="r.sigungu">
            <RouterLink
              :to="{
                name: 'region',
                params: { sido: r.sido, sigungu: r.sigungu },
              }"
              class="region"
            >
              <strong>{{ r.sigungu }}</strong>
              <span>{{ r.sido }}{{ r.gus.length ? ` · ${r.gus.join(' ')}` : '' }}</span>
            </RouterLink>
          </li>
        </ul>
        <p class="note">현재 위 3개 시만 제공해요. 다른 지역은 순차적으로 추가할 예정이에요.</p>
      </section>

      <RouterLink :to="{ name: 'report' }" class="zone">
        <span class="zone__text">
          <strong>우리 동네 리포트</strong>
          <span>주소 주변의 통학 환경을 한 장으로 확인해요 (준비 중)</span>
        </span>
        <span class="zone__go" aria-hidden="true"><AppIcon name="arrow" :size="22" /></span>
      </RouterLink>

      <section v-if="recent.length" aria-labelledby="recent-title">
        <div class="sec-head">
          <h2 id="recent-title" class="sec-title">최근 본 학교</h2>
          <button type="button" class="link-btn" @click="clearRecent">전체 삭제</button>
        </div>
        <ul class="rail">
          <li v-for="it in recent" :key="it.id">
            <InstitutionCard :item="it" :priorities="priorities" />
          </li>
        </ul>
      </section>

      <p class="note">
        모든 수치는 공공데이터를 가공한 참고 정보이며 학교의 우열을 뜻하지 않아요.
        <RouterLink :to="{ name: 'guide-data' }" class="inline-link">데이터 안내 보기</RouterLink>
      </p>
    </div>
  </main>
</template>

<style scoped>
.hero {
  position: relative;
  z-index: 2;
  padding: 28px 0 32px;
  background:
    radial-gradient(420px 220px at 90% 0%, rgb(255 224 150 / 55%), transparent 70%),
    radial-gradient(380px 240px at 0% 30%, rgb(190 226 208 / 60%), transparent 70%);
}
.hero__eyebrow {
  font-size: 14px;
  font-weight: 700;
  color: var(--c-brand);
}
.hero__title {
  margin-top: 6px;
  font-size: clamp(30px, 7vw, 44px);
  line-height: 1.22;
  font-weight: 800;
  letter-spacing: -0.035em;
}
.hero__sub {
  margin-top: 8px;
  color: var(--c-ink-2);
}
.hero__controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}
.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 52px;
  border-radius: 14px;
  background: var(--c-brand);
  color: var(--c-brand-ink);
  font-weight: 800;
}
.stack {
  display: flex;
  flex-direction: column;
  gap: 36px;
  padding-block: 28px 40px;
}
.sec-title {
  margin-bottom: 12px;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
.sec-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.link-btn {
  min-height: 44px;
  font-size: 14px;
  color: var(--c-ink-2);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.regions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}
.region {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 16px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-m);
  background: var(--c-surface);
  box-shadow: var(--shadow-s);
}
.region:hover {
  border-color: var(--c-brand);
}
.region strong {
  font-size: 18px;
}
.region span {
  font-size: 13px;
  color: var(--c-ink-2);
}
.zone {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  border-radius: var(--radius-l);
  background: linear-gradient(135deg, #1f7a5c, #2a8f6e);
  color: #fff;
  box-shadow: var(--shadow-m);
}
.zone__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.zone__text strong {
  font-size: 18px;
}
.zone__go {
  display: grid;
  place-items: center;
  flex: none;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: rgb(255 255 255 / 20%);
}
.rail {
  display: flex;
  gap: 12px;
  margin-inline: calc(var(--gutter) * -1);
  padding: 4px var(--gutter) 12px;
  overflow-x: auto;
}
.rail > li {
  flex: none;
  width: min(260px, 74vw);
}
.rail :deep(.card) {
  height: 100%;
}
.note {
  font-size: 13px;
  line-height: 1.6;
  color: var(--c-ink-2);
}
.inline-link {
  margin-left: 6px;
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (min-width: 768px) {
  .hero {
    padding: 56px 0 48px;
  }
  .hero__controls {
    max-width: 640px;
  }
  .cta {
    align-self: flex-start;
    padding: 0 24px;
  }
  .rail {
    margin-inline: 0;
    padding-inline: 0;
  }
}
</style>
