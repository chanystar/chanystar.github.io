import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { APP_NAME } from '@/config'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
  }
}

// 홈 외 화면은 구현 전까지 공용 플레이스홀더로 연결 (경로·이름은 확정된 IA 기준)
const Placeholder = () => import('@/views/PlaceholderView.vue')

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: (to, _from, saved) => saved ?? (to.hash ? { el: to.hash } : { top: 0 }),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/search', name: 'search', component: Placeholder, meta: { title: '검색 결과' } },
    { path: '/map', name: 'map', component: Placeholder, meta: { title: '지도로 찾기' } },
    { path: '/compare', name: 'compare', component: Placeholder, meta: { title: '비교' } },
    { path: '/favorites', name: 'favorites', component: Placeholder, meta: { title: '찜한 학교' } },
    { path: '/zone', name: 'zone', component: Placeholder, meta: { title: '통학구역 조회' } },
    { path: '/region/:sido/:sigungu?', name: 'region', component: Placeholder, meta: { title: '지역별 학교' } },
    { path: '/school/:id(\\d+)', name: 'school', component: Placeholder, meta: { title: '초등학교 상세' } },
    { path: '/kindergarten/:id(\\d+)', name: 'kindergarten', component: Placeholder, meta: { title: '유치원 상세' } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: Placeholder, meta: { title: '페이지를 찾을 수 없어요' } },
  ],
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} | ${APP_NAME}` : `${APP_NAME} · 유치원·초등학교 정보`
})