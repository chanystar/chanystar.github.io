<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import InstitutionCard from '@/components/InstitutionCard.vue'
import { findRegion, SERVICE_REGIONS } from '@/data/regions'
import { searchInstitutions } from '@/data/store'
import { KIND_LABEL, type InstitutionKind } from '@/types/institution'

const route = useRoute()
const sido = computed(() => String(route.params.sido ?? ''))
const sigungu = computed(() => String(route.params.sigungu ?? ''))
const region = computed(() => (sigungu.value ? findRegion(sigungu.value) : undefined))
const inSido = computed(() => SERVICE_REGIONS.filter((r) => r.sido === sido.value))

const KINDS: InstitutionKind[] = ['elementary', 'kindergarten']
const groups = computed(() => {
  const r = region.value
  if (!r) return []
  return KINDS.map((kind) => ({
    kind,
    items: searchInstitutions({ kind, sigungu: r.sigungu }).items,
  }))
})
</script>

<template>
  <main class="container page">
    <template v-if="region">
      <h1 class="title">{{ region.sido }} {{ region.sigungu }}</h1>
      <ul v-if="region.gus.length" class="gus">
        <li v-for="g in region.gus" :key="g">
          <RouterLink
            :to="{ name: 'search', query: { sigungu: region.sigungu, gu: g } }"
            class="gu"
          >
            {{ g }}
          </RouterLink>
        </li>
      </ul>

      <section v-for="g in groups" :key="g.kind" class="grp">
        <h2>{{ KIND_LABEL[g.kind] }} {{ g.items.length }}곳</h2>
        <ul class="grid">
          <li v-for="it in g.items" :key="it.id">
            <InstitutionCard :item="it" compact />
          </li>
        </ul>
      </section>
    </template>

    <template v-else>
      <h1 class="title">{{ sido || '지역' }}</h1>
      <p v-if="inSido.length">이 지역에서 제공 중인 시</p>
      <p v-else>아직 이 지역은 준비 중이에요. 현재는 아래 3개 시만 제공해요.</p>
      <ul class="links">
        <li v-for="r in inSido.length ? inSido : SERVICE_REGIONS" :key="r.sigungu">
          <RouterLink
            :to="{
              name: 'region',
              params: { sido: r.sido, sigungu: r.sigungu },
            }"
            class="gu"
          >
            {{ r.sido }} {{ r.sigungu }}
          </RouterLink>
        </li>
      </ul>
    </template>
  </main>
</template>

<style scoped>
.page {
  padding-block: 20px 40px;
}
.title {
  margin-bottom: 12px;
  font-size: 26px;
  letter-spacing: -0.03em;
}
.gus,
.links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-block: 12px;
}
.gu {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid var(--c-line);
  border-radius: 999px;
  background: var(--c-surface);
  font-weight: 600;
}
.gu:hover {
  border-color: var(--c-brand);
  color: var(--c-brand);
}
.grp {
  margin-top: 28px;
}
.grp h2 {
  margin-bottom: 12px;
  font-size: 19px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}
</style>
