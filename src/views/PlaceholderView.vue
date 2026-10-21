<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <main class="container ph">
    <h1>{{ route.meta.title ?? route.name }}</h1>
    <p>아직 구현 전인 화면이에요.</p>
    <code>{{ route.fullPath }}</code>
    <RouterLink to="/" class="ph__home">홈으로</RouterLink>
  </main>
</template>

<style scoped>
.ph {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding-block: 48px;
}
h1 {
  font-size: 26px;
  letter-spacing: -0.02em;
}
code {
  padding: 4px 8px;
  border-radius: 6px;
  background: rgb(27 36 48 / 7%);
  font-size: 14px;
  word-break: break-all;
}
.ph__home {
  margin-top: 8px;
  padding: 10px 16px;
  border-radius: var(--radius-s);
  background: var(--c-brand);
  color: var(--c-brand-ink);
  font-weight: 700;
}
</style>