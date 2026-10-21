<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, useTemplateRef, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import KindBadge from './KindBadge.vue'
import { suggest } from '@/api/institutions'
import type { InstitutionSummary, KindFilter } from '@/types/institution'

const props = defineProps<{ kind: KindFilter; initialQuery?: string }>()
const emit = defineEmits<{
  select: [item: InstitutionSummary]
  submit: [query: string]
}>()

const DEBOUNCE_MS = 250

const uid = useId()
const listId = `${uid}-list`
const optionId = (i: number) => `${uid}-opt-${i}`

const root = useTemplateRef<HTMLElement>('root')
const input = useTemplateRef<HTMLInputElement>('input')

const query = ref(props.initialQuery ?? '')
const items = ref<InstitutionSummary[]>([])
const loading = ref(false)
const failed = ref(false)
const open = ref(false)
const active = ref(-1)

let timer: ReturnType<typeof setTimeout> | undefined
let seq = 0 // 응답 순서 역전(stale response) 방지

const term = computed(() => query.value.trim())
// 마지막 옵션 = "전체 검색 결과 보기"
const optionCount = computed(() => (term.value ? items.value.length + 1 : 0))
const showPanel = computed(() => open.value && term.value.length > 0)

watch([term, () => props.kind], ([t, kind]) => {
  clearTimeout(timer)
  const mine = ++seq
  active.value = -1
  failed.value = false

  if (!t) {
    items.value = []
    loading.value = false
    return
  }

  loading.value = true
  timer = setTimeout(async () => {
    try {
      const res = await suggest(t, kind)
      if (mine === seq) items.value = res
    } catch {
      if (mine === seq) {
        items.value = []
        failed.value = true
      }
    } finally {
      if (mine === seq) loading.value = false
    }
  }, DEBOUNCE_MS)
})

onBeforeUnmount(() => clearTimeout(timer))

/** 일치 구간을 v-html 없이 안전하게 강조 */
function splitMatch(text: string): [string, string, string] {
  const i = text.toLowerCase().indexOf(term.value.toLowerCase())
  if (i < 0) return [text, '', '']
  return [text.slice(0, i), text.slice(i, i + term.value.length), text.slice(i + term.value.length)]
}

function submitQuery() {
  if (!term.value) return
  open.value = false
  emit('submit', term.value)
}

function choose(i: number) {
  const item = items.value[i]
  if (item) {
    open.value = false
    emit('select', item)
  } else {
    submitQuery()
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.isComposing) return // 한글 IME 조합 중 Enter/방향키 무시

  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    if (!optionCount.value) return
    e.preventDefault()
    open.value = true
    const step = e.key === 'ArrowDown' ? 1 : -1
    active.value = (active.value + step + optionCount.value) % optionCount.value
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (showPanel.value && active.value >= 0) choose(active.value)
    else submitQuery()
  } else if (e.key === 'Escape' && open.value) {
    e.preventDefault()
    open.value = false
    active.value = -1
  }
}

function onFocusOut(e: FocusEvent) {
  if (!root.value?.contains(e.relatedTarget as Node | null)) {
    open.value = false
    active.value = -1
  }
}

function clear() {
  query.value = ''
  input.value?.focus()
}

defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <div ref="root" class="search" role="search" @focusout="onFocusOut">
    <div class="search__field">
      <AppIcon name="search" :size="22" class="search__icon" />
      <input
        ref="input"
        v-model="query"
        class="search__input"
        type="text"
        role="combobox"
        placeholder="학교명 · 동네 · 주소로 검색"
        aria-label="학교명, 동네, 주소 검색"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        :aria-expanded="showPanel"
        :aria-controls="listId"
        :aria-activedescendant="active >= 0 ? optionId(active) : undefined"
        enterkeyhint="search"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        @focus="open = true"
        @input="open = true"
        @keydown="onKeydown"
      />
      <button
        v-if="query"
        type="button"
        class="search__clear"
        aria-label="검색어 지우기"
        @click="clear"
      >
        <AppIcon name="close" :size="18" />
      </button>
    </div>

    <div v-show="showPanel" class="search__panel">
      <ul :id="listId" class="search__list" role="listbox" aria-label="검색 추천">
        <li
          v-for="(it, i) in items"
          :id="optionId(i)"
          :key="`${it.kind}-${it.id}`"
          role="option"
          class="opt"
          :class="{ 'opt--active': active === i }"
          :aria-selected="active === i"
          @mousedown.prevent
          @mouseenter="active = i"
          @click="choose(i)"
        >
          <span class="opt__main">
            <span class="opt__name">
              <template v-for="(part, pi) in splitMatch(it.name)" :key="pi">
                <mark v-if="pi === 1 && part">{{ part }}</mark>
                <template v-else>{{ part }}</template>
              </template>
            </span>
            <span class="opt__region">{{ it.sido }} {{ it.sigungu }}</span>
          </span>
          <KindBadge :kind="it.kind" />
        </li>

        <li
          :id="optionId(items.length)"
          role="option"
          class="opt opt--all"
          :class="{ 'opt--active': active === items.length }"
          :aria-selected="active === items.length"
          @mousedown.prevent
          @mouseenter="active = items.length"
          @click="submitQuery"
        >
          <AppIcon name="search" :size="18" />
          <span>'{{ term }}' 전체 검색 결과 보기</span>
        </li>
      </ul>

      <p v-if="loading" class="search__status">검색 중…</p>
      <p v-else-if="failed" class="search__status search__status--error">
        검색 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.
      </p>
      <p v-else-if="!items.length" class="search__status">
        일치하는 학교가 없어요. 지역명으로도 검색해 보세요.
      </p>
    </div>

    <p class="sr-only" aria-live="polite">
      {{ showPanel && !loading ? `추천 결과 ${items.length}개` : '' }}
    </p>
  </div>
</template>

<style scoped>
.search {
  position: relative;
}
.search__field {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 58px;
  padding: 0 10px 0 16px;
  border: 2px solid var(--c-line);
  border-radius: var(--radius-m);
  background: var(--c-surface);
  box-shadow: var(--shadow-s);
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.search__field:focus-within {
  border-color: var(--c-brand);
  box-shadow: 0 0 0 4px rgb(31 122 92 / 14%);
}
.search__icon {
  flex: none;
  color: var(--c-brand);
}
.search__input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  background: transparent;
  color: var(--c-ink);
  font: inherit;
  font-size: 17px; /* iOS 포커스 확대 방지: 16px 이상 */
}
.search__input:focus {
  outline: none; /* 포커스 표시는 field의 focus-within이 담당 */
}
.search__input::placeholder {
  color: #7a8492;
}
.search__clear {
  display: grid;
  place-items: center;
  flex: none;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  color: var(--c-ink-2);
}
.search__clear:hover {
  background: rgb(27 36 48 / 7%);
}

.search__panel {
  position: absolute;
  z-index: 30;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  max-height: min(60vh, 440px);
  overflow-y: auto;
  padding: 6px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-m);
  background: var(--c-surface);
  box-shadow: var(--shadow-m);
}
.opt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 56px;
  padding: 8px 12px;
  border-radius: 12px;
  cursor: pointer;
}
.opt--active {
  background: var(--c-brand-soft);
}
.opt__main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.opt__name {
  font-weight: 600;
}
.opt__name mark {
  background: none;
  color: var(--c-brand);
  font-weight: 800;
}
.opt__region {
  font-size: 14px;
  color: var(--c-ink-2);
}
.opt--all {
  justify-content: flex-start;
  min-height: 48px;
  font-weight: 600;
  color: var(--c-brand);
}
.search__status {
  padding: 8px 12px 10px;
  font-size: 14px;
  color: var(--c-ink-2);
}
.search__status--error {
  color: var(--c-danger);
}
</style>
