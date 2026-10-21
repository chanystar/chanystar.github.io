import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '../App.vue'
import { routes } from '@/router'

describe('App', () => {
  it('mounts renders properly', async () => {
    // 테스트마다 독립된 메모리 라우터 (전역 router 싱글턴·브라우저 history 미사용)
    const router = createRouter({ history: createMemoryHistory(), routes })
    router.push('/')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [router] } })

    expect(wrapper.find('h1').text()).toContain('한눈에 찾아보세요')
    expect(wrapper.findAll('nav a')).not.toHaveLength(0)
  })
})