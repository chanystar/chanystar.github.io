<script setup lang="ts">
import { computed } from 'vue'
import { SOURCES } from '@/data/sources'
import { formatAsOf } from '@/lib/format'
import type { SourceId } from '@/types/metric'

const props = defineProps<{ source: SourceId; asOf: string }>()
const info = computed(() => SOURCES[props.source])
</script>

<template>
  <span class="src">출처 {{ info.label }} · {{ formatAsOf(asOf) }} 기준</span>
</template>

<style scoped>
.src {
  font-size: 12px;
  color: var(--c-ink-2);
}
</style>
