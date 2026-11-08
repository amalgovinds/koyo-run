<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { LeafMode, WeatherKey } from '@/types'
import { ASCII_FRAME_COUNT, heroAsciiFrames } from '@/data/ascii'
import { decodeWmo } from '@/data/weather'
import { locationByKey } from '@/data/locations'
import { useTripClock } from '@/composables/useTripClock'
import { useWeather } from '@/composables/useWeather'

defineProps<{
  leafMode: LeafMode
}>()

const emit = defineEmits<{
  'update:leafMode': [mode: LeafMode]
}>()

const { currentDay, formattedTime, progressPercent, activeCheckpointText, daylightPhase } =
  useTripClock()

const { weatherMap, loading, fetchAll } = useWeather()

const frameIdx = ref(0)
let ticker: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  if (Object.keys(weatherMap.value).length === 0 && !loading.value) {
    fetchAll()
  }
  ticker = setInterval(() => {
    frameIdx.value = (frameIdx.value + 1) % ASCII_FRAME_COUNT
  }, 850)
})

onUnmounted(() => {
  if (ticker) clearInterval(ticker)
})

const currentHeroAscii = computed(() => heroAsciiFrames[frameIdx.value] ?? heroAsciiFrames[0] ?? '')

const activeWeatherKey = computed(() => (currentDay.value.weatherKey as WeatherKey) || 'tokyo')

const activeWeather = computed(() => weatherMap.value[activeWeatherKey.value])

const activeLocationName = computed(
  () => locationByKey[activeWeatherKey.value]?.name ?? currentDay.value.cityShort,
)

const leafModes: { mode: LeafMode; label: string }[] = [
  { mode: 'breeze', label: '🍁 Breeze' },
  { mode: 'calm', label: '🍂 Calm' },
  { mode: 'paused', label: '⏸ Paused' },
]
</script>

<template>
  <header
    class="relative overflow-hidden border-b border-washi-border bg-linear-to-b from-[#F5E6D3] via-[#FAF2E6] to-[#FAF6EE]"
  >
    <div class="mx-auto max-w-6xl px-4 pt-5 pb-2 sm:px-6">
      <!-- Top Editorial Masthead Row -->
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="space-y-1.5">
          <div
            class="flex flex-wrap items-center gap-2 font-mono text-xs font-semibold tracking-widest text-washi-momiji"
          >
            <span>AUTUMN KOYO RUN · NOV 16 – DEC 1, 2026</span>
            <span class="rounded-full px-2 py-0.5 text-[11px]" :class="daylightPhase.classes">
              {{ daylightPhase.icon }} {{ daylightPhase.label }} · {{ formattedTime }} JST
            </span>
          </div>

          <div class="flex flex-wrap items-baseline gap-3">
            <h1
              class="font-serif text-3xl font-extrabold tracking-tight text-washi-ink sm:text-4xl lg:text-5xl"
            >
              日本紅葉紀行 <span class="font-normal text-washi-momiji italic">Koyo ’26</span>
            </h1>
            <span class="hanko-seal rounded px-2 py-0.5 text-xs">
              旅のしおり · {{ progressPercent }}%
            </span>
          </div>

          <p class="max-w-xl text-xs text-washi-umber sm:text-sm">
            Sunrise-to-sunset rail and foliage companion across Tokyo, Kawaguchiko, Kyoto, Nara,
            Osaka, Hiroshima and Okayama.
          </p>
        </div>

        <!-- Right Controls: Live ASCII Strip + Canopy Mode + Weather Sync -->
        <div class="flex flex-col items-end gap-2">
          <pre
            class="hidden rounded-lg border border-washi-border bg-[#2B2520] px-3 py-1.5 font-mono text-[11px] leading-tight text-[#FAF6EE] shadow-xs sm:block select-none"
            >{{ currentHeroAscii }}</pre>

          <div class="flex flex-wrap items-center gap-1.5">
            <div class="inline-flex rounded-full border border-washi-border bg-[#FAF6EE] p-0.5">
              <button
                v-for="item in leafModes"
                :key="item.mode"
                type="button"
                class="rounded-full px-2.5 py-1 font-mono text-[11px] transition-colors"
                :class="
                  leafMode === item.mode
                    ? 'bg-washi-momiji font-semibold text-white'
                    : 'text-washi-umber hover:text-washi-ink'
                "
                @click="emit('update:leafMode', item.mode)"
              >
                {{ item.label }}
              </button>
            </div>

            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-full border border-washi-border bg-[#FAF6EE] px-2.5 py-1 font-mono text-[11px] text-washi-ink hover:border-washi-momiji"
              :disabled="loading"
              @click="fetchAll"
            >
              <span v-if="activeWeather">
                {{ decodeWmo(activeWeather.code).emoji }} {{ activeLocationName }}
                {{ activeWeather.temp }}°C
              </span>
              <span v-else>{{ loading ? 'Syncing...' : '↻ Weather' }}</span>
            </button>
          </div>

          <div class="font-mono text-[11px] text-washi-umber">
            📍 {{ currentDay.shortLabel }} · Now:
            <strong class="text-washi-ink">{{ activeCheckpointText }}</strong>
          </div>
        </div>
      </div>

      <!-- Ukiyo-e Woodblock SVG Horizon (Centered Sun Over Mount Fuji) -->
      <div class="relative mt-2 h-24 w-full select-none sm:h-32">
        <svg
          viewBox="0 0 1200 180"
          class="h-full w-full overflow-visible"
          preserveAspectRatio="xMidYBottom slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="hinomaruSun" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#D94126" stop-opacity="0.92" />
              <stop offset="100%" stop-color="#B93829" stop-opacity="0.78" />
            </linearGradient>
            <linearGradient id="fujiSlope" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#3B4958" />
              <stop offset="68%" stop-color="#4F5D6B" />
              <stop offset="100%" stop-color="#EAE1D0" stop-opacity="0.2" />
            </linearGradient>
          </defs>

          <!-- Centered Crimson Sun Above Mount Fuji Summit (cx=600) -->
          <circle
            cx="600"
            cy="52"
            r="54"
            fill="none"
            stroke="#D94126"
            stroke-width="1"
            stroke-dasharray="4 4"
            opacity="0.35"
          />
          <circle
            cx="600"
            cy="52"
            r="44"
            fill="none"
            stroke="#D94126"
            stroke-width="1"
            opacity="0.25"
          />
          <circle cx="600" cy="52" r="36" fill="url(#hinomaruSun)" />

          <!-- Distant Foothills -->
          <path
            d="M0 165 Q 210 118, 430 165 T 900 160 T 1200 165 L 1200 180 L 0 180 Z"
            fill="#E5DBC8"
            opacity="0.75"
          />

          <!-- Mount Fuji Centered at x=600 -->
          <path
            d="M 355 168 Q 515 140, 568 68 L 632 68 Q 685 140, 845 168 Z"
            fill="url(#fujiSlope)"
          />
          <!-- Snow Cap -->
          <path
            d="M 568 68 L 632 68 Q 646 92, 658 106 L 638 98 L 622 110 L 605 95 L 590 110 L 575 96 L 542 106 Q 555 90, 568 68 Z"
            fill="#FAF6EE"
          />

          <!-- Left: 5-Story Kyoto Pagoda (Hokan-ji) -->
          <g transform="translate(150, 58)" fill="#2B2520" opacity="0.86">
            <rect x="28" y="0" width="4" height="18" />
            <polygon points="10,22 50,22 42,16 18,16" />
            <rect x="20" y="22" width="20" height="8" />
            <polygon points="7,35 53,35 44,29 16,29" />
            <rect x="18" y="35" width="24" height="9" />
            <polygon points="4,49 56,49 46,43 14,43" />
            <rect x="16" y="49" width="28" height="10" />
            <polygon points="1,64 59,64 48,58 12,58" />
            <rect x="15" y="64" width="30" height="11" />
            <polygon points="-2,81 62,81 50,74 10,74" />
            <rect x="13" y="81" width="34" height="28" />
          </g>

          <!-- Right: Vermilion Shinto Torii Gate -->
          <g transform="translate(975, 86)">
            <path d="M 0 12 Q 40 4, 80 12 L 77 19 Q 40 12, 3 19 Z" fill="#B93829" />
            <rect x="8" y="25" width="64" height="6" fill="#B93829" />
            <rect x="37" y="15" width="6" height="12" fill="#2B2520" />
            <rect x="16" y="17" width="7" height="65" fill="#B93829" />
            <rect x="57" y="17" width="7" height="65" fill="#B93829" />
            <rect x="14" y="74" width="11" height="8" fill="#2B2520" />
            <rect x="55" y="74" width="11" height="8" fill="#2B2520" />
          </g>

          <!-- Viaduct & Gliding Shinkansen -->
          <line x1="0" y1="168" x2="1200" y2="168" stroke="#C5B9A5" stroke-width="2" />
          <g class="shinkansen-glide">
            <path
              d="M 20 166 L 105 166 Q 125 166, 132 160 L 112 158 L 20 158 Z"
              fill="#FAF6EE"
              stroke="#2E6F5E"
              stroke-width="1.5"
            />
            <line x1="22" y1="163" x2="122" y2="163" stroke="#2E6F5E" stroke-width="1.5" />
          </g>
        </svg>
      </div>
    </div>
  </header>
</template>

<style scoped>
.shinkansen-glide {
  animation: glideTrain 18s linear infinite;
}
@keyframes glideTrain {
  0% {
    transform: translateX(-180px);
  }
  100% {
    transform: translateX(1260px);
  }
}
</style>
