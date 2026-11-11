<!-- src/views/EatsView.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { eateriesData, regionalSpecialities } from '@/data/eateries'
import { weatherLocations } from '@/data/locations'
import type { EateryItem, WeatherKey } from '@/types'

const selectedCity = ref<WeatherKey | 'all'>('all')
const showMap = ref(true)
const activePin = ref<EateryItem>(eateriesData[0]!)

const filteredEateries = computed(() => {
  if (selectedCity.value === 'all') return eateriesData
  return eateriesData.filter((e) => e.cityKey === selectedCity.value)
})

const currentRegionInfo = computed(() => {
  if (selectedCity.value === 'all') return null
  return regionalSpecialities[selectedCity.value]
})

function selectCity(key: WeatherKey | 'all'): void {
  selectedCity.value = key
  const firstMatch = key === 'all' ? eateriesData[0] : eateriesData.find((e) => e.cityKey === key)
  if (firstMatch) activePin.value = firstMatch
}

function focusOnMap(eatery: EateryItem): void {
  activePin.value = eatery
  showMap.value = true
}

const embedMapUrl = computed(() => {
  const pin = activePin.value
  const q = encodeURIComponent(`${pin.name} ${pin.japaneseName} ${pin.cityName}`)
  return `https://maps.google.com/maps?q=${q}&ll=${pin.lat},${pin.lon}&z=16&output=embed`
})
</script>

<template>
  <section class="space-y-8">
    <!-- 1. Sunlit Autumn Harvest & Chochin Lantern Editorial Header -->
    <div class="relative overflow-hidden border-b border-washi-border pb-6">
      <!-- Decorative SVG Hanging Autumn Lanterns & Maple Branch (Top Right) -->
      <svg
        viewBox="0 0 360 110"
        class="pointer-events-none absolute top-0 right-0 hidden h-28 w-80 opacity-90 md:block"
        aria-hidden="true"
      >
        <!-- Maple Branch -->
        <path d="M360,8 Q260,22 170,4" fill="none" stroke="#5C4E43" stroke-width="2" />
        <circle cx="220" cy="14" r="14" fill="#C83E2B" opacity="0.85" />
        <circle cx="242" cy="10" r="11" fill="#D96B27" opacity="0.85" />
        <circle cx="315" cy="18" r="16" fill="#C83E2B" opacity="0.8" />
        <!-- Hanging Lantern 1 -->
        <line x1="265" y1="14" x2="265" y2="32" stroke="#2B211C" stroke-width="1.5" />
        <rect x="256" y="32" width="18" height="4" rx="1" fill="#2B211C" />
        <ellipse cx="265" cy="52" rx="16" ry="18" fill="#C83E2B" />
        <ellipse
          cx="265"
          cy="52"
          rx="16"
          ry="9"
          fill="none"
          stroke="#FAF6EE"
          stroke-width="0.7"
          opacity="0.5"
        />
        <text
          x="265"
          y="56"
          text-anchor="middle"
          fill="#FFFDF9"
          font-size="11"
          font-family="serif"
          font-weight="bold"
        >
          味
        </text>
        <rect x="257" y="68" width="16" height="4" rx="1" fill="#2B211C" />
        <!-- Hanging Lantern 2 -->
        <line x1="330" y1="12" x2="330" y2="24" stroke="#2B211C" stroke-width="1.5" />
        <rect x="322" y="24" width="16" height="3.5" rx="1" fill="#2B211C" />
        <ellipse cx="330" cy="41" rx="14" ry="15" fill="#D96B27" />
        <text
          x="330"
          y="45"
          text-anchor="middle"
          fill="#FFFDF9"
          font-size="10"
          font-family="serif"
          font-weight="bold"
        >
          茶
        </text>
        <rect x="323" y="55" width="14" height="3.5" rx="1" fill="#2B211C" />
      </svg>

      <div class="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span class="font-mono text-xs font-bold tracking-widest text-washi-momiji uppercase">
            秋の味覚・懐石お品書き · AUTUMN CULINARY SCROLL
          </span>
          <h2
            class="mt-1 font-serif text-3xl font-extrabold tracking-tight text-washi-ink sm:text-4xl"
          >
            Local Eats &amp; Regional Specialities
          </h2>
          <p class="mt-1 max-w-xl text-xs text-washi-umber sm:text-sm">
            Curated ramen alleys, centuries-old temple tofu, steaming <em>Hōtō</em> iron pots, and
            street-food stalls pinned directly along your 15-day route.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-2 self-start rounded-full border border-washi-border bg-[#FFFDF9] px-4 py-2 font-mono text-xs font-semibold text-washi-ink shadow-xs transition hover:border-washi-momiji md:self-auto"
          @click="showMap = !showMap"
        >
          <span class="chochin-lantern h-5 w-5 text-[10px]">地図</span>
          <span>{{ showMap ? 'Hide Pinned Atlas ▲' : 'Show Pinned Atlas ▼' }}</span>
        </button>
      </div>

      <!-- City Filter Strip -->
      <div class="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-full border px-3.5 py-1.5 font-mono text-xs transition"
          :class="
            selectedCity === 'all'
              ? 'border-washi-momiji bg-washi-momiji font-semibold text-white shadow-xs'
              : 'border-washi-border bg-[#FFFDF9] text-washi-umber hover:border-washi-momiji hover:text-washi-ink'
          "
          @click="selectCity('all')"
        >
          All 8 Regions ({{ eateriesData.length }})
        </button>
        <button
          v-for="loc in weatherLocations"
          :key="loc.key"
          type="button"
          class="rounded-full border px-3.5 py-1.5 font-mono text-xs transition"
          :class="
            selectedCity === loc.key
              ? 'border-washi-momiji bg-washi-momiji font-semibold text-white shadow-xs'
              : 'border-washi-border bg-[#FFFDF9] text-washi-umber hover:border-washi-momiji hover:text-washi-ink'
          "
          @click="selectCity(loc.key)"
        >
          {{ loc.name }}
        </button>
      </div>
    </div>

    <!-- 2. Warm Persimmon & Gold Regional Speciality Scroll (When a City is Selected) -->
    <div
      v-if="currentRegionInfo"
      class="oshinagaki-sheet flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center sm:p-6"
    >
      <div class="space-y-1">
        <div
          class="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-washi-momiji uppercase"
        >
          <span>🍁 {{ currentRegionInfo.cityName }} Regional Palette</span>
        </div>
        <h3 class="font-serif text-xl font-extrabold text-washi-ink sm:text-2xl">
          {{ currentRegionInfo.signatureDishes }}
        </h3>
        <p class="text-xs leading-relaxed text-washi-umber sm:text-sm">
          {{ currentRegionInfo.overview }}
        </p>
      </div>
      <span class="hanko-seal shrink-0 self-start rounded px-3 py-1 text-xs sm:self-center">
        当地名物
      </span>
    </div>

    <!-- 3. Woodblock Ezu (絵図) Pinned Map Atlas -->
    <div v-if="showMap" class="oshinagaki-sheet overflow-hidden p-3 sm:p-4">
      <div class="grid gap-4 lg:grid-cols-12">
        <!-- Left Index: Lantern Pin Ledger -->
        <div class="flex flex-col justify-between p-2 lg:col-span-5">
          <div>
            <div class="flex items-center justify-between border-b border-washi-border pb-2.5">
              <span class="font-mono text-xs font-bold tracking-wider text-washi-momiji uppercase">
                🏮 CULINARY ATLAS PINS ({{ filteredEateries.length }})
              </span>
              <span class="font-mono text-[11px] text-washi-bark">Click any stop to pan</span>
            </div>

            <div class="mt-2.5 max-h-64 space-y-1 overflow-y-auto pr-1">
              <button
                v-for="(spot, pIdx) in filteredEateries"
                :key="spot.id"
                type="button"
                class="flex w-full items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-left transition"
                :class="
                  activePin.id === spot.id
                    ? 'bg-[#F5E6D3] font-semibold text-washi-ink'
                    : 'hover:bg-washi-warm/60 text-washi-umber'
                "
                @click="focusOnMap(spot)"
              >
                <div class="flex min-w-0 items-center gap-2.5">
                  <span
                    class="chochin-lantern h-6 w-6 shrink-0 font-mono text-[10px] font-bold"
                    :class="{ 'opacity-65': activePin.id !== spot.id }"
                  >
                    {{ pIdx + 1 }}
                  </span>
                  <div class="truncate">
                    <div class="truncate font-serif text-xs font-bold text-washi-ink">
                      {{ spot.name }}
                    </div>
                    <div class="truncate font-mono text-[10px] text-washi-bark">
                      {{ spot.cityName }} · {{ spot.speciality }}
                    </div>
                  </div>
                </div>
                <span class="shrink-0 font-mono text-[10px] font-semibold text-washi-momiji">
                  {{ spot.priceRange.split(' ')[0] }}
                </span>
              </button>
            </div>
          </div>

          <!-- Active Pin Summary Strip -->
          <div class="mt-3 border-t border-dashed border-washi-border pt-3 text-xs">
            <div class="flex items-baseline justify-between gap-2">
              <span class="font-serif text-sm font-bold text-washi-ink">{{ activePin.name }}</span>
              <span class="font-mono text-[11px] text-washi-bark">{{
                activePin.japaneseName
              }}</span>
            </div>
            <p class="mt-1 text-xs text-washi-umber">
              <strong class="text-washi-momiji">Must Order:</strong> {{ activePin.mustOrder }}
            </p>
            <div class="mt-2 flex items-center justify-between font-mono text-[11px]">
              <span class="text-washi-jrink">{{ activePin.dayTag }}</span>
              <a
                :href="activePin.mapUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="font-bold text-washi-momiji underline"
              >
                Open in Google Maps ↗
              </a>
            </div>
          </div>
        </div>

        <!-- Right Map Frame -->
        <div
          class="relative min-h-[330px] overflow-hidden rounded border border-washi-border bg-washi-warm lg:col-span-7"
        >
          <iframe
            :src="embedMapUrl"
            class="h-full min-h-[330px] w-full border-0"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            :title="`Map pin for ${activePin.name}`"
          ></iframe>
        </div>
      </div>
    </div>

    <!-- 4. Kaiseki Oshinagaki (お品書き) Menu Scroll Entries -->
    <div class="grid gap-6 md:grid-cols-2">
      <article
        v-for="(eat, eIdx) in filteredEateries"
        :key="eat.id"
        class="oshinagaki-sheet group relative flex flex-col justify-between overflow-hidden p-6 transition hover:-translate-y-0.5"
        :class="{ 'ring-2 ring-washi-momiji': activePin.id === eat.id }"
      >
        <!-- Decorative Vertical Tategaki Japanese Name Watermark on Right Margin -->
        <div
          class="tategaki pointer-events-none absolute top-6 right-3 max-h-52 overflow-hidden font-serif text-sm font-extrabold tracking-widest text-washi-bark/25 select-none"
          aria-hidden="true"
        >
          {{ eat.japaneseName }}
        </div>

        <div class="pr-6">
          <!-- Top Hairline: Chochin Lantern Number + Day Slot + Price -->
          <div
            class="flex flex-wrap items-center justify-between gap-2 border-b border-washi-border/70 pb-3"
          >
            <div class="flex items-center gap-2">
              <span class="chochin-lantern h-6 w-6 font-mono text-[11px] font-bold">
                {{ eIdx + 1 }}
              </span>
              <span class="font-mono text-xs font-bold text-washi-momiji">
                {{ eat.dayTag }}
              </span>
            </div>

            <span class="font-mono text-xs font-semibold text-washi-umber">
              {{ eat.cityName }} · <strong class="text-washi-ink">{{ eat.priceRange }}</strong>
            </span>
          </div>

          <!-- Restaurant Title & Japanese Subtitle -->
          <div class="mt-3.5">
            <div class="font-mono text-xs text-washi-bark">{{ eat.japaneseName }}</div>
            <h3
              class="mt-0.5 font-serif text-2xl font-extrabold text-washi-ink transition-colors group-hover:text-washi-momiji"
            >
              {{ eat.name }}
            </h3>
          </div>

          <!-- Open Editorial Dish Breakdown (No Boxy Containers) -->
          <div class="my-4 space-y-2.5 border-l-2 border-washi-momiji/60 pl-3.5">
            <div>
              <div
                class="font-mono text-[10px] font-bold tracking-widest text-washi-persimmon uppercase"
              >
                名物 · REGIONAL SPECIALITY
              </div>
              <div class="font-serif text-sm font-bold text-washi-ink">
                {{ eat.speciality }}
              </div>
            </div>

            <div>
              <div
                class="font-mono text-[10px] font-bold tracking-widest text-washi-jrink uppercase"
              >
                薦 · WHAT TO ORDER
              </div>
              <div class="text-xs font-medium text-washi-umber sm:text-sm">
                {{ eat.mustOrder }}
              </div>
            </div>
          </div>

          <!-- Station Proximity & Hours -->
          <div class="space-y-1 text-xs text-washi-umber">
            <p>
              <strong class="font-mono text-[11px] text-washi-ink">📍 ROUTE STOP:</strong>
              {{ eat.nearStop }}
            </p>
            <p class="font-mono text-[11px] text-washi-bark">🕒 {{ eat.hoursNote }}</p>
          </div>
        </div>

        <!-- Bottom Hairline Actions -->
        <div
          class="mt-5 flex items-center justify-between border-t border-dashed border-washi-border pt-3 text-xs"
        >
          <button
            type="button"
            class="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-washi-umber transition hover:text-washi-momiji"
            @click="focusOnMap(eat)"
          >
            <i class="ph-fill ph-map-pin text-washi-momiji"></i>
            <span>Pin #{{ eIdx + 1 }} on Atlas</span>
          </button>

          <a
            :href="eat.mapUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 font-serif text-xs font-bold text-washi-momiji group-hover:underline"
          >
            <span>Google Maps</span>
            <i class="ph-bold ph-arrow-up-right"></i>
          </a>
        </div>
      </article>
    </div>
  </section>
</template>
