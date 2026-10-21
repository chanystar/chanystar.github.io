<script setup lang="ts">
defineProps<{ disclosed: number; total: number }>()
</script>

<template>
  <span class="cov" :title="`전체 ${total}개 항목 중 ${disclosed}개가 공시되어 있어요`">
    공시 {{ disclosed }}/{{ total }}
  </span>
</template>

<style scoped>
.cov {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border: 1px solid var(--c-line);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-ink-2);
  white-space: nowrap;
}
</style>
