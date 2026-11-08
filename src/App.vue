<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import HeroBanner from '@/components/HeroBanner.vue'
import MomijiCanvas from '@/components/MomijiCanvas.vue'
import type { LeafMode } from '@/types'
import { useTripClock } from '@/composables/useTripClock'
import { navTabs } from '@/data/navTabs'
import type { TabId } from '@/types'

const route = useRoute()
const { currentDay } = useTripClock()
const leafMode = ref<LeafMode>('breeze')

const isActive = (id: TabId) => route.name === id
const routeList = navTabs.map((t) => `#/${t.id}`).join(' · ')
</script>

<template>
  <div class="relative z-30 flex min-h-screen flex-col">
    <!-- Masthead. Later: hero SVG, ASCII banner, leaf-mode and weather buttons go here. -->
    <HeroBanner v-model:leaf-mode="leafMode" />
    <!-- Sticky nav: a direct child of the page container, NOT of <header>.
      A sticky element only sticks within its parent, so inside <header> it scrolls away. -->
    <div
      class="sticky top-0 z-40 border-b border-washi-border/80 bg-[#FAF6EE]/95 shadow-sm backdrop-blur-md"
    >
      <div
        class="mx-auto flex max-w-6xl items-center justify-between gap-2 overflow-x-auto px-3 py-2.5 sm:px-6"
      >
        <nav class="flex items-center gap-1.5 sm:gap-2" aria-label="Trip sections">
          <RouterLink
            v-for="tab in navTabs"
            :key="tab.id"
            :to="{ name: tab.id }"
            class="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-washi-momiji sm:text-sm"
            :class="
              isActive(tab.id)
                ? 'bg-washi-momiji font-semibold text-white shadow-sm'
                : 'text-washi-umber hover:bg-washi-warm/80 hover:text-washi-ink'
            "
          >
            <i :class="tab.icon" class="text-base" aria-hidden="true"></i>
            <span>{{ tab.label }}</span>
            <span
              v-if="tab.badge"
              class="rounded-full px-1.5 font-mono text-[10px]"
              :class="
                isActive(tab.id) ? 'bg-white/20 text-white' : 'bg-washi-warm text-washi-umber'
              "
            >
              {{ tab.badge }}
            </span>
          </RouterLink>
        </nav>

        <div class="hidden shrink-0 items-center font-mono text-xs text-washi-umber lg:flex">
          <span class="rounded-full border border-washi-border bg-washi-warm px-2.5 py-1">
            📍 {{ currentDay.shortLabel }} · {{ currentDay.cityShort }}
          </span>
        </div>
      </div>
    </div>
    <MomijiCanvas :mode="leafMode" />
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      <RouterView />
    </main>
    <footer
      class="mt-12 border-t border-washi-border bg-washi-warm/70 px-4 py-6 text-xs text-washi-umber"
    >
      <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 sm:flex-row">
        <span class="font-serif font-bold text-washi-ink">
          紅葉狩り KOYO 2026 · Japan Autumn Field Companion
        </span>
        <span class="font-mono text-[11px]">Hash-routed ({{ routeList }})</span>
      </div>
    </footer>
  </div>
</template>

<style scoped></style>
