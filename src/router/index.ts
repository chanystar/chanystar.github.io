import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { APP_NAME } from '@/config'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
  }
}

const Placeholder = () => import('@/views/PlaceholderView.vue')

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/SearchView.vue'),
    meta: { title: '학교 찾기' },
  },
  {
    path: '/compare',
    name: 'compare',
    component: () => import('@/views/CompareView.vue'),
    meta: { title: '비교' },
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('@/views/FavoritesView.vue'),
    meta: { title: '찜한 학교' },
  },
  {
    path: '/region/:sido/:sigungu?',
    name: 'region',
    component: () => import('@/views/RegionView.vue'),
    meta: { title: '지역별 학교' },
  },
  {
    path: '/school/:id(\\d+)',
    name: 'school',
    component: () => import('@/views/DetailView.vue'),
    meta: { title: '초등학교 상세' },
  },
  {
    path: '/kindergarten/:id(\\d+)',
    name: 'kindergarten',
    component: () => import('@/views/DetailView.vue'),
    meta: { title: '유치원 상세' },
  },
  {
    path: '/guide/data',
    name: 'guide-data',
    component: () => import('@/views/GuideDataView.vue'),
    meta: { title: '데이터 안내' },
  },
  {
    path: '/report',
    name: 'report',
    component: Placeholder,
    meta: { title: '동네 리포트' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: Placeholder,
    meta: { title: '페이지를 찾을 수 없어요' },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: (to, _from, saved) => saved ?? (to.hash ? { el: to.hash } : { top: 0 }),
  routes,
})

router.afterEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} | ${APP_NAME}`
    : `${APP_NAME} · 유치원·초등학교 정보`
})
