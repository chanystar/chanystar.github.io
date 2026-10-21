<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import InstitutionCard from '@/components/InstitutionCard.vue'
import { findById } from '@/data/store'
import { useFavorites } from '@/composables/useFavorites'
import type { Institution } from '@/types/institution'

const { ids } = useFavorites()
const items = computed(() => ids.value.flatMap((id) => findById(id) ?? []) as Institution[])
</script>

<template>
  <main class="container page">
    <h1 class="title">찜한 학교</h1>
    <p class="hint">찜 목록은 이 기기의 브라우저에만 저장돼요.</p>

    <ul v-if="items.length" class="grid">
      <li v-for="it in items" :key="it.id"><InstitutionCard :item="it" /></li>
    </ul>
    <div v-else class="empty">
      <p>아직 찜한 학교가 없어요.</p>
      <RouterLink to="/search" class="empty__link">학교 찾기</RouterLink>
    </div>
  </main>
</template>

<style scoped>
.page {
  padding-block: 20px 40px;
}
.title {
  font-size: 24px;
  letter-spacing: -0.03em;
}
.hint {
  margin-block: 4px 16px;
  font-size: 14px;
  color: var(--c-ink-2);
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}
.grid :deep(.card) {
  height: 100%;
}
.empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  color: var(--c-ink-2);
}
.empty__link {
  padding: 10px 16px;
  border-radius: var(--radius-s);
  background: var(--c-brand);
  color: var(--c-brand-ink);
  font-weight: 700;
}
</style>
