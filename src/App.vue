<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { APP_NAME } from '@/config'

const NAV = [
  { to: '/', label: '홈', icon: 'home' },
  { to: '/map', label: '지도', icon: 'map' },
  { to: '/compare', label: '비교', icon: 'compare' },
  { to: '/favorites', label: '찜', icon: 'heart' },
] as const
</script>

<template>
  <a href="#main" class="skip">본문으로 건너뛰기</a>

  <header class="top">
    <div class="container top__inner">
      <RouterLink to="/" class="logo">{{ APP_NAME }}</RouterLink>

      <!-- 데스크톱 GNB -->
      <nav class="gnb" aria-label="주요 메뉴">
        <RouterLink v-for="n in NAV" :key="n.to" :to="n.to" class="gnb__link" active-class="is-active" exact-active-class="is-active">
          {{ n.label }}
        </RouterLink>
      </nav>

      <!-- 모바일 전용 찜 바로가기 -->
      <RouterLink to="/favorites" class="top__fav" aria-label="찜한 학교">
        <AppIcon name="heart" :size="22" />
      </RouterLink>
    </div>
  </header>

  <div id="main" tabindex="-1" class="page">
    <RouterView />
  </div>

  <!-- 모바일 하단 탭바 -->
  <nav class="tabbar" aria-label="하단 메뉴">
    <RouterLink v-for="n in NAV" :key="n.to" :to="n.to" class="tabbar__link" active-class="is-active" exact-active-class="is-active">
      <AppIcon :name="n.icon" :size="24" />
      <span>{{ n.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.skip {
  position: absolute;
  left: 12px;
  top: -64px;
  z-index: 100;
  padding: 10px 14px;
  border-radius: var(--radius-s);
  background: var(--c-ink);
  color: #fff;
  font-weight: 700;
}
.skip:focus {
  top: 8px;
}

.top {
  position: sticky;
  top: 0;
  z-index: 40;
  height: var(--header-h);
  border-bottom: 1px solid var(--c-line);
  background: rgb(250 248 244 / 88%);
  backdrop-filter: saturate(1.4) blur(10px);
}
.top__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}
.logo {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--c-brand);
}
.top__fav {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin-right: -10px;
}

.gnb {
  display: none;
}

.page {
  min-height: calc(100svh - var(--header-h));
  padding-bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom));
}
.page:focus {
  outline: none;
}

.tabbar {
  position: fixed;
  inset: auto 0 0 0;
  z-index: 40;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  height: calc(var(--tabbar-h) + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  border-top: 1px solid var(--c-line);
  background: rgb(255 255 255 / 94%);
  backdrop-filter: blur(10px);
}
.tabbar__link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-ink-2);
}
.tabbar__link.is-active {
  color: var(--c-brand);
  font-weight: 800;
}

@media (min-width: 768px) {
  .tabbar,
  .top__fav {
    display: none;
  }
  .page {
    padding-bottom: 0;
  }
  .gnb {
    display: flex;
    gap: 4px;
  }
  .gnb__link {
    display: inline-flex;
    align-items: center;
    height: 44px;
    padding: 0 14px;
    border-radius: 999px;
    font-weight: 600;
    color: var(--c-ink-2);
  }
  .gnb__link:hover {
    background: rgb(27 36 48 / 6%);
  }
  .gnb__link.is-active {
    background: var(--c-brand-soft);
    color: var(--c-brand);
    font-weight: 800;
  }
}
</style>