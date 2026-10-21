<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import KindBadge from './KindBadge.vue'
import type { InstitutionSummary } from '@/types/institution'

const props = defineProps<{ item: InstitutionSummary }>()

const to = computed(() => ({
  name: props.item.kind === 'elementary' ? 'school' : 'kindergarten',
  params: { id: props.item.id },
}))
</script>

<template>
  <RouterLink :to="to" class="card">
    <KindBadge :kind="item.kind" />
    <strong class="card__name">{{ item.name }}</strong>
    <span class="card__meta">{{ item.sigungu }} · {{ item.founding }}</span>
    <!-- 결측 지표는 자리 대신 숨긴다 (공시 데이터는 빈 값이 흔함) -->
    <span v-if="item.metric" class="card__metric">{{ item.metric }}</span>
  </RouterLink>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-height: 44px;
  padding: 14px 16px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-m);
  background: var(--c-surface);
  box-shadow: var(--shadow-s);
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-m);
}
.card__name {
  margin-top: 4px;
  font-size: 17px;
  line-height: 1.3;
  letter-spacing: -0.02em;
}
.card__meta {
  font-size: 14px;
  color: var(--c-ink-2);
}
.card__metric {
  margin-top: 2px;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-brand);
}
</style>
