<script setup lang="ts">
import AppIcon from './AppIcon.vue'

defineProps<{ address: string }>()
</script>

<template>
  <div class="map">
    <AppIcon name="map" :size="28" />
    <strong>지도는 준비 중이에요</strong>
    <span>{{ address }}</span>
    <small>학교 위치·보호구역·사고다발지역을 함께 보여줄 예정이에요</small>
  </div>
</template>

<style scoped>
.map {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 28px 16px;
  border: 1px dashed var(--c-line);
  border-radius: var(--radius-m);
  background: repeating-linear-gradient(45deg, #f3efe7, #f3efe7 10px, #f8f5ee 10px, #f8f5ee 20px);
  color: var(--c-ink-2);
  text-align: center;
}
small {
  font-size: 13px;
}
</style>
