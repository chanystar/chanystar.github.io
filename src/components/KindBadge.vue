<script setup lang="ts">
import { KIND_LABEL, type InstitutionKind } from '@/types/institution'

defineProps<{ kind: InstitutionKind }>()
</script>

<template>
  <span class="badge" :class="`badge--${kind}`">{{ KIND_LABEL[kind] }}</span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  flex: none;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -0.01em;
  white-space: nowrap;
}
.badge--kindergarten {
  background: var(--c-kg-bg);
  color: var(--c-kg-ink);
}
.badge--elementary {
  background: var(--c-el-bg);
  color: var(--c-el-ink);
}
</style>