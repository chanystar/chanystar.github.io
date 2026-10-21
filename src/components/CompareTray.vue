<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { COMPARE_MAX, useCompare } from '@/composables/useCompare'
import { findById } from '@/data/store'

const route = useRoute()
const { ids, notice, remove, clear } = useCompare()

const visible = computed(() => ids.value.length > 0 && route.name !== 'compare')
const picked = computed(() => ids.value.flatMap((id) => findById(id) ?? []))
</script>

<template>
  <div class="sr-only" role="status">{{ notice }}</div>
  <aside v-if="visible || notice" class="tray" aria-label="비교 담기">
    <p v-if="notice" class="tray__notice">{{ notice }}</p>
    <div v-if="visible" class="tray__bar">
      <ul class="tray__list">
        <li v-for="p in picked" :key="p.id" class="tray__item">
          <span>{{ p.name }}</span>
          <button type="button" :aria-label="`${p.name} 빼기`" @click="remove(p.id)">
            <AppIcon name="close" :size="14" />
          </button>
        </li>
      </ul>
      <button type="button" class="tray__clear" @click="clear">비우기</button>
      <RouterLink
        :to="{ name: 'compare', query: { ids: ids.join(',') } }"
        class="tray__go"
        :aria-disabled="ids.length < 2"
        :class="{ 'tray__go--off': ids.length < 2 }"
      >
        {{ ids.length < 2 ? '2곳 이상 담아주세요' : `비교하기 (${ids.length}/${COMPARE_MAX})` }}
      </RouterLink>
    </div>
  </aside>
</template>

<style scoped>
.tray {
  position: fixed;
  z-index: 45;
  inset: auto 12px calc(var(--tabbar-h) + env(safe-area-inset-bottom) + 8px) 12px;
  max-width: 720px;
  margin-inline: auto;
}
.tray__notice {
  margin-bottom: 6px;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--c-ink);
  color: #fff;
  font-size: 14px;
}
.tray__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 8px 8px 12px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-m);
  background: var(--c-surface);
  box-shadow: var(--shadow-m);
}
.tray__list {
  display: flex;
  flex: 1;
  gap: 6px;
  min-width: 0;
  overflow-x: auto;
}
.tray__item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex: none;
  padding-left: 10px;
  border-radius: 999px;
  background: rgb(27 36 48 / 7%);
  font-size: 13px;
  font-weight: 600;
}
.tray__item button {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
}
.tray__clear {
  min-height: 44px;
  padding: 0 6px;
  font-size: 13px;
  color: var(--c-ink-2);
  text-decoration: underline;
}
.tray__go {
  display: inline-flex;
  align-items: center;
  flex: none;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  background: var(--c-brand);
  color: var(--c-brand-ink);
  font-size: 14px;
  font-weight: 800;
}
.tray__go--off {
  background: rgb(27 36 48 / 15%);
  color: var(--c-ink-2);
  pointer-events: none;
}

@media (min-width: 768px) {
  .tray {
    inset-block-end: 16px;
  }
}
</style>
