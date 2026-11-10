<!-- src/components/HeroBanner.vue -->
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { heroAsciiFrames } from '@/data/ascii'
import { locationByKey } from '@/data/locations'
import { decodeWmo } from '@/data/weather'
import { useAsciiTicker } from '@/composables/useAsciiTicker'
import { useToast } from '@/composables/useToast'
import { useTripClock } from '@/composables/useTripClock'
import { useWeather } from '@/composables/useWeather'
import type { LeafMode, WeatherKey } from '@/types'

// v-model from App.vue: <HeroBanner v-model="leafMode" />
const leafMode = defineModel<LeafMode>({ default: 'breeze' })

const LEAF_OPTIONS: { mode: LeafMode; label: string }[] = [
  { mode: 'breeze', label: '🍁 Breeze' },
  { mode: 'calm', label: '🍂 Calm' },
  { mode: 'paused', label: '⏸ Paused' },
]

const { frame } = useAsciiTicker()
const { currentDay, formattedTime, activeCheckpointText, liveMode, toggleLiveMode } = useTripClock()
const { weatherMap, loading, error, fetchAll, getWeatherForDay } = useWeather()
const { showToast } = useToast()

const asciiBanner = computed(() => heroAsciiFrames[frame.value] ?? '')

const activeWeatherKey = computed(() => (currentDay.value.weatherKey as WeatherKey) || 'tokyo')

const activeWeather = computed(() => getWeatherForDay(currentDay.value))

const activeCityName = computed(
  () => locationByKey[activeWeatherKey.value]?.name ?? currentDay.value.cityShort,
)

onMounted(() => {
  if (Object.keys(weatherMap.value).length === 0 && !loading.value) {
    fetchAll()
  }
})

async function syncWeather(): Promise<void> {
  await fetchAll()
  if (error.value) {
    showToast(`Weather sync failed: ${error.value}`)
  } else {
    showToast('Synced live Open-Meteo weather across all 8 Japanese stops.')
  }
}
</script>

<template>
  <header
    class="overflow-hidden border-b border-washi-border bg-linear-to-b from-[#F5E6D3] via-[#FAF2E6] to-[#FAF6EE]"
  >
    <div class="mx-auto max-w-6xl px-4 pt-5 pb-2 sm:px-6">
      <div class="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <!-- Masthead -->
        <div class="space-y-1.5">
          <div
            class="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-widest text-washi-momiji uppercase"
          >
            <span class="h-2 w-2 rounded-full bg-washi-momiji"></span>
            <span>Autumn Koyo Run · Nov 16 – Dec 1, 2026</span>
          </div>
          <div class="flex flex-wrap items-baseline gap-3">
            <h1
              class="font-serif text-3xl font-extrabold tracking-tight text-washi-ink sm:text-4xl lg:text-5xl"
            >
              日本紅葉紀行 <span class="font-normal text-washi-momiji italic">Koyo ’26</span>
            </h1>
            <span class="hanko-seal rounded px-2 py-0.5 text-xs">旅のしおり</span>
          </div>
          <p class="max-w-xl text-xs text-washi-umber sm:text-sm">
            Sunrise-to-sunset rail &amp; foliage companion across <strong>Tokyo</strong>,
            <strong>Kawaguchiko</strong>, <strong>Kyoto</strong>, <strong>Nara</strong>,
            <strong>Osaka</strong>, <strong>Hiroshima</strong> &amp; <strong>Okayama</strong>.
          </p>
        </div>

        <!-- Controls -->
        <div
          class="flex flex-col items-start gap-2 sm:flex-row sm:items-center md:flex-col md:items-end"
        >
          <div
            class="rounded-xl border border-washi-border bg-[#F3ECE0]/90 px-3 py-1.5 font-mono text-[10px] leading-tight whitespace-pre text-washi-umber shadow-sm select-none"
            aria-hidden="true"
          >
            {{ asciiBanner }}
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- 3-Way Segmented Pill: 🍁 Breeze | 🍂 Calm | ⏸ Paused -->
            <div
              class="inline-flex items-center rounded-full border border-washi-border bg-[#FFFDF9] p-0.5 shadow-sm"
              role="group"
              aria-label="Maple leaf animation mode"
            >
              <button
                v-for="opt in LEAF_OPTIONS"
                :key="opt.mode"
                type="button"
                class="rounded-full px-2.5 py-1 font-mono text-[11px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-washi-momiji"
                :class="
                  leafMode === opt.mode
                    ? 'bg-washi-momiji font-semibold text-white shadow-xs'
                    : 'text-washi-umber hover:bg-washi-warm/70 hover:text-washi-ink'
                "
                @click="leafMode = opt.mode"
              >
                {{ opt.label }}
              </button>
            </div>

            <!-- Global Live JST vs Simulated Mode Toggle -->
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-semibold shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-washi-momiji"
              :class="
                liveMode
                  ? 'border-[#9BC1AE] bg-washi-jrgreen text-washi-jrink'
                  : 'border-washi-border bg-[#FFFDF9] text-washi-umber hover:bg-washi-warm hover:text-washi-ink'
              "
              @click="toggleLiveMode"
            >
              <span
                class="h-2 w-2 rounded-full"
                :class="liveMode ? 'bg-washi-jrink animate-ping' : 'bg-washi-persimmon'"
              ></span>
              <span>{{ liveMode ? `LIVE JST · ${formattedTime}` : `SIM · ${formattedTime}` }}</span>
            </button>

            <!-- Live Weather Pill: ⛅ Tokyo 10°C -->
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-full border border-washi-border bg-[#FFFDF9] px-3 py-1 font-mono text-[11px] font-medium text-washi-ink shadow-sm transition hover:bg-washi-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-washi-momiji disabled:opacity-60"
              :disabled="loading"
              @click="syncWeather"
            >
              <template v-if="activeWeather && !loading">
                <span>{{ decodeWmo(activeWeather.code).emoji }}</span>
                <span>{{ activeCityName }} {{ activeWeather.temp }}°C</span>
              </template>
              <template v-else>
                <i
                  class="ph-bold ph-arrows-clockwise"
                  :class="{ 'animate-spin text-washi-momiji': loading }"
                  aria-hidden="true"
                ></i>
                <span>{{ loading ? 'Syncing...' : 'Live Weather' }}</span>
              </template>
            </button>
          </div>

          <!-- Active Location & Checkpoint Readout -->
          <div class="font-mono text-[11px] text-washi-umber">
            📍 {{ currentDay.shortLabel }} · Now:
            <strong class="text-washi-ink">{{ activeCheckpointText }}</strong>
          </div>
        </div>
      </div>

      <!-- Ukiyo-e horizon: Hinomaru sun, Mt. Fuji, pagoda, torii and a gliding Shinkansen -->
      <div
        class="pointer-events-none mt-2 h-28 w-full overflow-hidden select-none sm:h-36"
        aria-hidden="true"
      >
        <svg viewBox="0 0 1200 165" class="h-full w-full" preserveAspectRatio="xMidYBottom slice">
          <defs>
            <linearGradient id="hinomaruGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#D94E34" stop-opacity="0.82" />
              <stop offset="100%" stop-color="#E89954" stop-opacity="0.25" />
            </linearGradient>
            <linearGradient id="fujiBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#3E4E63" />
              <stop offset="65%" stop-color="#6B7888" />
              <stop offset="100%" stop-color="#F3ECE0" stop-opacity="0.2" />
            </linearGradient>
            <linearGradient id="distantHills" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#C88A5A" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#FAF6EE" stop-opacity="0" />
            </linearGradient>
          </defs>

          <!-- Rising crimson sun -->
          <circle cx="600" cy="65" r="54" fill="url(#hinomaruGrad)" />

          <!-- Drifting mist bands -->
          <g class="cloud-drift" opacity="0.65">
            <rect x="440" y="68" width="110" height="7" rx="3.5" fill="#FAF6EE" />
            <rect x="665" y="52" width="135" height="8" rx="4" fill="#FAF6EE" />
            <rect x="260" y="82" width="95" height="6" rx="3" fill="#FAF6EE" />
          </g>

          <!-- Distant hills -->
          <path
            d="M0,150 Q180,95 390,145 T820,135 T1200,148 L1200,165 L0,165 Z"
            fill="url(#distantHills)"
          />

          <!-- Mount Fuji and snow cap -->
          <path d="M350,152 Q515,132 568,38 L632,38 Q685,132 850,152 Z" fill="url(#fujiBody)" />
          <path
            d="M568,38 L632,38 L654,74 L634,66 L619,82 L600,64 L583,80 L569,66 L546,74 Z"
            fill="#FFFDF9"
          />

          <!-- Five-storey pagoda -->
          <g transform="translate(115, 42)" fill="#2B211C">
            <rect x="28.5" y="0" width="3" height="16" />
            <path d="M12,18 Q30,13 48,18 L43,23 L17,23 Z" />
            <rect x="21" y="23" width="18" height="6" />
            <path d="M9,31 Q30,26 51,31 L45,36 L15,36 Z" />
            <rect x="19" y="36" width="22" height="7" />
            <path d="M6,45 Q30,40 54,45 L47,50 L13,50 Z" />
            <rect x="17" y="50" width="26" height="7" />
            <path d="M3,59 Q30,54 57,59 L49,64 L11,64 Z" />
            <rect x="15" y="64" width="30" height="8" />
            <path d="M0,74 Q30,68 60,74 L52,80 L8,80 Z" />
            <rect x="14" y="80" width="32" height="30" />
          </g>
          <circle cx="95" cy="78" r="22" fill="#C83E2B" opacity="0.85" />
          <circle cx="118" cy="56" r="18" fill="#D96B27" opacity="0.85" />
          <circle cx="182" cy="82" r="20" fill="#B83222" opacity="0.8" />

          <!-- Vermilion torii gate and stone lantern -->
          <g transform="translate(965, 58)">
            <path d="M-8,8 Q45,0 98,8 L94,15 Q45,8 -4,15 Z" fill="#C83E2B" />
            <rect x="2" y="24" width="86" height="6" rx="1" fill="#C83E2B" />
            <rect x="41" y="13" width="8" height="12" fill="#1E1916" />
            <rect x="12" y="14" width="7" height="80" fill="#C83E2B" />
            <rect x="71" y="14" width="7" height="80" fill="#C83E2B" />
            <rect x="9" y="86" width="13" height="8" fill="#1E1916" />
            <rect x="68" y="86" width="13" height="8" fill="#1E1916" />
            <g transform="translate(106, 56)">
              <path d="M0,8 L18,8 L14,2 L4,2 Z" fill="#5C4E43" />
              <rect x="4" y="8" width="10" height="9" fill="#3E3229" />
              <circle cx="9" cy="12.5" r="4" fill="#F59E0B" class="toro-glow" />
              <rect x="2" y="17" width="14" height="3" fill="#5C4E43" />
              <rect x="6" y="20" width="6" height="14" fill="#5C4E43" />
              <rect x="2" y="34" width="14" height="4" fill="#3E3229" />
            </g>
          </g>
          <circle cx="945" cy="114" r="19" fill="#D96B27" opacity="0.85" />
          <circle cx="1095" cy="100" r="24" fill="#C83E2B" opacity="0.85" />

          <!-- Viaduct and gliding bullet train -->
          <line x1="0" y1="152" x2="1200" y2="152" stroke="#BDA98E" stroke-width="2" />
          <g class="shinkansen-runner">
            <path
              d="M0,149 L155,149 L178,149 Q168,140 148,140 L0,140 Z"
              fill="#FFFDF9"
              stroke="#3E4E63"
              stroke-width="1.2"
            />
            <line x1="2" y1="146" x2="165" y2="146" stroke="#1D4ED8" stroke-width="1.8" />
            <rect x="15" y="142" width="8" height="2.5" fill="#3E4E63" />
            <rect x="28" y="142" width="8" height="2.5" fill="#3E4E63" />
            <rect x="41" y="142" width="8" height="2.5" fill="#3E4E63" />
            <rect x="60" y="142" width="8" height="2.5" fill="#3E4E63" />
            <rect x="73" y="142" width="8" height="2.5" fill="#3E4E63" />
            <rect x="86" y="142" width="8" height="2.5" fill="#3E4E63" />
            <rect x="105" y="142" width="8" height="2.5" fill="#3E4E63" />
            <rect x="118" y="142" width="8" height="2.5" fill="#3E4E63" />
            <rect x="131" y="142" width="8" height="2.5" fill="#3E4E63" />
          </g>
        </svg>
      </div>
    </div>
  </header>
</template>
