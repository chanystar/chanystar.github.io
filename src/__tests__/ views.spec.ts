import { describe, it, expect } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '../App.vue'
import { routes } from '@/router'
import { searchInstitutions } from '@/data/store'

async function render(path: string) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  router.push(path)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

describe('views', () => {
  it.each([
    ['/search?kind=elementary&priority=safety,class_size', '학교 찾기'],
    ['/school/1?priority=safety', '초등학교'],
    ['/kindergarten/101', '유치원'],
    ['/compare?ids=1,2,3', '학교 비교'],
    ['/compare?ids=1,101', '2곳 이상'],
    ['/favorites', '찜한 학교'],
    ['/region/경기/남양주시', '남양주시'],
    ['/region/서울', '준비 중'],
    ['/guide/data', '데이터 안내'],
    ['/school/9999', '찾을 수 없어요'],
  ])('%s renders', async (path, text) => {
    const w = await render(path)
    expect(w.text()).toContain(text)
  })

  it('range filter excludes undisclosed and over-limit', () => {
    const all = searchInstitutions({ kind: 'elementary' })
    const some = searchInstitutions({ kind: 'elementary', max: { class_size: 22 } })
    expect(some.items.length + some.excluded).toBeLessThanOrEqual(all.items.length)
    expect(some.items.every((i) => i.kind === 'elementary')).toBe(true)
  })
})
