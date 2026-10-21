<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import InstitutionCard from '@/components/InstitutionCard.vue'
import KindSegment from '@/components/KindSegment.vue'
import SearchBox from '@/components/SearchBox.vue'
import { POPULAR_REGIONS, SIDO_LIST } from '@/data/regions'
import { useRecentViewed } from '@/composables/useRecentViewed'
import type { InstitutionSummary, KindFilter } from '@/types/institution'

const router = useRouter()
const { items: recent, clear: clearRecent } = useRecentViewed()

const kind = ref<KindFilter>('all')
const searchBox = useTemplateRef<InstanceType<typeof SearchBox>>('searchBox')

// 'all'은 URL에서 생략 → 공유 URL이 짧고 기본값과 일관됨
const kindQuery = computed(() => (kind.value === 'all' ? {} : { kind: kind.value }))

function goSearch(q: string) {
  router.push({ name: 'search', query: { q, ...kindQuery.value } })
}

function goDetail(item: InstitutionSummary) {
  router.push({
    name: item.kind === 'elementary' ? 'school' : 'kindergarten',
    params: { id: item.id },
  })
}

// ── 내 주변 ─────────────────────────────────────
const geoLoading = ref(false)
const geoMessage = ref('')

function goNearby() {
  geoMessage.value = ''
  if (!('geolocation' in navigator)) {
    geoMessage.value = '이 브라우저에서는 위치를 사용할 수 없어요. 주소를 직접 입력해 주세요.'
    searchBox.value?.focus()
    return
  }
  geoLoading.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      geoLoading.value = false
      router.push({
        name: 'map',
        query: {
          lat: pos.coords.latitude.toFixed(5),
          lng: pos.coords.longitude.toFixed(5),
          ...kindQuery.value,
        },
      })
    },
    (err) => {
      geoLoading.value = false
      geoMessage.value =
        err.code === err.PERMISSION_DENIED
          ? '위치 권한이 꺼져 있어요. 주소를 직접 입력해 주세요.'
          : '현재 위치를 가져오지 못했어요. 주소를 직접 입력해 주세요.'
      searchBox.value?.focus()
    },
    { timeout: 8000, maximumAge: 60_000 },
  )
}
</script>

<template>
  <main>
    <!-- 1. Hero: 종류 선택 + 검색 -->
    <section class="hero" aria-labelledby="hero-title">
      <div class="container hero__inner">
        <p class="hero__eyebrow">유치원 · 초등학교 정보</p>
        <h1 id="hero-title" class="hero__title">우리 아이 학교,<br />한눈에 찾아보세요</h1>

        <div class="hero__controls">
          <KindSegment v-model="kind" />
          <SearchBox ref="searchBox" :kind="kind" @select="goDetail" @submit="goSearch" />

          <div class="quick">
            <button type="button" class="btn btn--soft" :disabled="geoLoading" @click="goNearby">
              <AppIcon name="pin" :size="20" />
              {{ geoLoading ? '위치 확인 중…' : '내 주변' }}
            </button>
            <RouterLink :to="{ name: 'map', query: kindQuery }" class="btn btn--soft">
              <AppIcon name="map" :size="20" />
              지도로 찾기
            </RouterLink>
          </div>
          <p v-if="geoMessage" class="hint" role="status">{{ geoMessage }}</p>
        </div>
      </div>
    </section>

    <div class="container stack">
      <!-- 2. 인기 지역 -->
      <section aria-labelledby="popular-title">
        <h2 id="popular-title" class="sec-title">인기 지역</h2>
        <ul class="chips">
          <li v-for="r in POPULAR_REGIONS" :key="r.label">
            <RouterLink
              :to="{ name: 'region', params: { sido: r.sido, sigungu: r.sigungu } }"
              class="chip"
            >
              {{ r.label }}
            </RouterLink>
          </li>
        </ul>
      </section>

      <!-- 3. 통학구역 배너 -->
      <RouterLink :to="{ name: 'zone' }" class="zone">
        <span class="zone__text">
          <strong>우리 집 배정 초등학교는?</strong>
          <span>주소만 입력하면 통학구역을 확인할 수 있어요</span>
          <small>실제 배정은 관할 교육지원청에서 꼭 확인해 주세요</small>
        </span>
        <span class="zone__go" aria-hidden="true"><AppIcon name="arrow" :size="22" /></span>
      </RouterLink>

      <!-- 4. 최근 본 학교 (없으면 섹션 자체를 숨김) -->
      <section v-if="recent.length" aria-labelledby="recent-title">
        <div class="sec-head">
          <h2 id="recent-title" class="sec-title">최근 본 학교</h2>
          <button type="button" class="link-btn" @click="clearRecent">전체 삭제</button>
        </div>
        <ul class="rail">
          <li v-for="it in recent" :key="`${it.kind}-${it.id}`">
            <InstitutionCard :item="it" />
          </li>
        </ul>
      </section>

      <!-- 5. 지역별 바로가기: 내부 링크 구조(SEO) -->
      <nav aria-labelledby="region-title">
        <h2 id="region-title" class="sec-title">지역별 바로가기</h2>
        <ul class="sido">
          <li v-for="s in SIDO_LIST" :key="s">
            <RouterLink :to="{ name: 'region', params: { sido: s } }" class="sido__link">{{
              s
            }}</RouterLink>
          </li>
        </ul>
      </nav>

      <p class="note">
        학교 정보는 공공데이터(학교알리미·유치원알리미·NEIS)를 기준으로 하며 실제와 다를 수 있어요.
        정확한 내용은 해당 기관에 확인해 주세요.
      </p>
    </div>
  </main>
</template>

<style scoped>
/* ── Hero ── */
.hero {
  position: relative;
  z-index: 2; /* 자동완성 패널이 아래 섹션 위로 뜨도록 */
  padding: 28px 0 32px;
  background:
    radial-gradient(420px 220px at 90% 0%, rgb(255 224 150 / 55%), transparent 70%),
    radial-gradient(380px 240px at 0% 30%, rgb(190 226 208 / 60%), transparent 70%);
}
.hero__eyebrow {
  font-size: 14px;
  font-weight: 700;
  color: var(--c-brand);
  letter-spacing: 0.02em;
}
.hero__title {
  margin-top: 6px;
  font-size: clamp(30px, 7vw, 46px);
  line-height: 1.22;
  font-weight: 800;
  letter-spacing: -0.035em;
}
.hero__controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}
.quick {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  padding: 0 16px;
  border-radius: 14px;
  font-weight: 700;
}
.btn--soft {
  background: var(--c-surface);
  border: 1px solid var(--c-line);
  box-shadow: var(--shadow-s);
}
.btn--soft:hover:not(:disabled) {
  border-color: var(--c-brand);
  color: var(--c-brand);
}
.btn--soft:disabled {
  opacity: 0.6;
}
.hint {
  font-size: 14px;
  color: var(--c-danger);
}

/* ── Sections ── */
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
.sec-head .sec-title {
  margin-bottom: 12px;
}
.link-btn {
  min-height: 44px;
  padding-inline: 4px;
  font-size: 14px;
  color: var(--c-ink-2);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid var(--c-line);
  border-radius: 999px;
  background: var(--c-surface);
  font-weight: 600;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
}
.chip:hover {
  border-color: var(--c-brand);
  background: var(--c-brand-soft);
  color: var(--c-brand);
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
  transition: transform 0.15s;
}
.zone:hover {
  transform: translateY(-2px);
}
.zone__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.zone__text strong {
  font-size: 18px;
  letter-spacing: -0.025em;
}
.zone__text small {
  margin-top: 4px;
  font-size: 13px;
  opacity: 0.85;
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
  scroll-snap-type: x proximity;
  scrollbar-width: thin;
}
.rail > li {
  flex: none;
  width: min(240px, 72vw);
  scroll-snap-align: start;
}
.rail :deep(.card) {
  height: 100%;
}

.sido {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
  gap: 8px;
}
.sido__link {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  border-radius: 12px;
  background: rgb(27 36 48 / 5%);
  font-weight: 600;
}
.sido__link:hover {
  background: var(--c-brand-soft);
  color: var(--c-brand);
}

.note {
  font-size: 13px;
  line-height: 1.6;
  color: var(--c-ink-2);
}

@media (min-width: 768px) {
  .hero {
    padding: 56px 0 48px;
  }
  .hero__controls {
    max-width: 640px;
  }
  .quick {
    grid-template-columns: repeat(2, auto);
    justify-content: start;
  }
  .rail {
    margin-inline: 0;
    padding-inline: 0;
  }
}
</style>
