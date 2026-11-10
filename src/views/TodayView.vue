<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { WeatherKey } from '@/types'
import { itineraryDays } from '@/data/itinerary'
import { ASCII_FRAME_COUNT, cityAsciiDioramas } from '@/data/ascii'
import { decodeWmo } from '@/data/weather'
import { locationByKey } from '@/data/locations'
import { useTripClock } from '@/composables/useTripClock'
import { useWeather } from '@/composables/useWeather'
import CheckpointRow from '@/components/CheckpointRow.vue'

const {
  simDayIndex,
  simMinutesOfDay,
  liveMode,
  currentDay,
  formattedTime,
  stepDay,
  setDay,
  isCheckpointActiveNow,
  daylightPhase,
} = useTripClock()

const { weatherMap, loading, error, fetchAll, getWeatherForDay } = useWeather()

const asciiFrame = ref(0)
let asciiTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  if (Object.keys(weatherMap.value).length === 0 && !loading.value) {
    fetchAll()
  }
  asciiTimer = setInterval(() => {
    asciiFrame.value = (asciiFrame.value + 1) % ASCII_FRAME_COUNT
  }, 850)
})

onUnmounted(() => {
  if (asciiTimer) clearInterval(asciiTimer)
})

const currentWeatherKey = computed(() => (currentDay.value.weatherKey as WeatherKey) || 'tokyo')

const currentDiorama = computed(
  () => cityAsciiDioramas[currentWeatherKey.value] ?? cityAsciiDioramas.tokyo,
)

const currentAsciiArt = computed(
  () => currentDiorama.value.frames[asciiFrame.value] ?? currentDiorama.value.frames[0] ?? '',
)

const liveWeather = computed(() => getWeatherForDay(currentDay.value))

const locationInfo = computed(() => locationByKey[currentWeatherKey.value])

const weatherAlerts = computed(() => {
  const alerts: string[] = []
  const w = liveWeather.value
  if (w) {
    if (w.rain > 0.5) {
      alerts.push(
        `Precipitation Alert (${w.rain}mm in ${locationInfo.value.name}): Carry a compact umbrella for temple walks.`,
      )
    }
    if (w.min <= 4 || w.temp <= 5) {
      alerts.push(
        `Cold Dusk Advisory (${w.min}°C low in ${locationInfo.value.name}): Pack thermal layers & gloves for evening illuminations.`,
      )
    }
  }
  return alerts
})
</script>

<template>
  <section class="space-y-6">
    <!-- Day Navigation & Time Simulator Controls -->
    <div class="rounded-xl border border-washi-border bg-washi-warm/75 p-4 shadow-xs">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <button
            type="button"
            :disabled="liveMode || simDayIndex <= 0"
            class="rounded-lg border border-washi-border bg-[#FAF6EE] px-3 py-1.5 font-mono text-xs font-semibold text-washi-ink transition hover:border-washi-momiji disabled:cursor-not-allowed disabled:opacity-40"
            @click="stepDay(-1)"
          >
            ← Prev Day
          </button>
          <span class="font-mono text-xs font-bold text-washi-umber">
            {{ currentDay.dayLabel }} of 14 · {{ currentDay.dateStr }}
          </span>
          <button
            type="button"
            :disabled="liveMode || simDayIndex >= itineraryDays.length - 1"
            class="rounded-lg border border-washi-border bg-[#FAF6EE] px-3 py-1.5 font-mono text-xs font-semibold text-washi-ink transition hover:border-washi-momiji disabled:cursor-not-allowed disabled:opacity-40"
            @click="stepDay(1)"
          >
            Next Day →
          </button>
        </div>

        <!-- Simulated Time Scrubber (Strictly Locked in liveMode) -->
        <div class="flex flex-wrap items-center gap-3">
          <span
            class="rounded-full px-2.5 py-0.5 font-mono text-xs font-medium"
            :class="daylightPhase.classes"
          >
            {{ daylightPhase.icon }} {{ daylightPhase.label }}
          </span>
          <div class="flex items-center gap-2">
            <label for="time-slider" class="font-mono text-xs text-washi-umber">
              {{ liveMode ? '🔒 Live JST:' : 'JST Clock:' }}
            </label>
            <input
              id="time-slider"
              v-model.number="simMinutesOfDay"
              type="range"
              min="270"
              max="1380"
              step="5"
              :disabled="liveMode"
              class="w-32 accent-washi-momiji disabled:cursor-not-allowed disabled:opacity-45 sm:w-44"
            />
            <span
              class="rounded bg-washi-ink px-2 py-0.5 font-mono text-xs font-bold text-[#FAF6EE]"
            >
              {{ formattedTime }}
            </span>
          </div>
        </div>
      </div>

      <!-- Horizontal Day Pills (Also locked while liveMode is active) -->
      <div class="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        <button
          v-for="(day, idx) in itineraryDays"
          :key="day.id"
          type="button"
          :disabled="liveMode"
          class="shrink-0 rounded-full border px-3 py-1 font-mono text-xs transition disabled:cursor-not-allowed disabled:opacity-50"
          :class="
            idx === simDayIndex
              ? 'border-washi-momiji bg-washi-momiji font-bold text-white'
              : 'border-washi-border bg-[#FAF6EE] text-washi-umber hover:border-washi-momiji hover:text-washi-ink'
          "
          @click="setDay(idx)"
        >
          {{ day.shortLabel }} · {{ day.cityShort }}
        </button>
      </div>
    </div>

    <!-- Live Weather Alert Strip (if rain or freezing mountain temps) -->
    <div
      v-if="weatherAlerts.length > 0"
      class="rounded-xl border-2 border-washi-momiji bg-washi-momiji/10 p-4 text-xs text-washi-ink"
    >
      <div class="font-mono font-bold text-washi-momiji uppercase">⚠️ Active Field Advisories</div>
      <ul class="mt-1 space-y-1">
        <li v-for="(al, i) in weatherAlerts" :key="i">• {{ al }}</li>
      </ul>
    </div>

    <!-- Split Hero Card: Left Dispatch Summary & Live Weather | Right Multi-Frame ASCII Diorama -->
    <div class="grid gap-5 lg:grid-cols-12">
      <div class="rounded-xl border border-washi-border bg-[#FAF6EE] p-5 shadow-xs lg:col-span-7">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="font-mono text-xs font-bold tracking-wider text-washi-momiji uppercase">
            {{ currentDay.dayLabel }} · {{ currentDay.dateStr }}
          </span>
          <span
            class="rounded-full border border-washi-border bg-washi-warm px-2.5 py-0.5 font-mono text-xs text-washi-umber"
          >
            🌅 Sunrise {{ currentDay.sunrise }} · 🌇 Sunset {{ currentDay.sunset }}
          </span>
        </div>

        <h2 class="mt-2 font-serif text-2xl font-bold text-washi-ink sm:text-3xl">
          {{ currentDay.city }}
        </h2>

        <p class="mt-1.5 font-mono text-xs text-washi-umber">
          Expected: <strong>{{ currentDay.expectedTemp }}</strong> · {{ currentDay.weatherSummary }}
        </p>

        <!-- Live Open-Meteo Telemetry Box -->
        <div
          class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-washi-border bg-washi-warm/70 p-3.5"
        >
          <div v-if="liveWeather">
            <div class="font-mono text-[11px] text-washi-umber uppercase">
              {{
                liveWeather.isForecast
                  ? `DATE FORECAST (${currentDay.dateISO})`
                  : 'LIVE OPEN-METEO'
              }}· {{ locationInfo.name }} ({{ locationInfo.sub }})
            </div>
            <div class="mt-0.5 flex items-baseline gap-2">
              <span class="font-serif text-2xl font-bold text-washi-ink">
                {{ decodeWmo(liveWeather.code).emoji }} {{ liveWeather.temp }}°C
              </span>
              <span class="font-mono text-xs font-semibold text-washi-momiji">
                {{ decodeWmo(liveWeather.code).desc }}
              </span>
            </div>
            <div class="mt-0.5 font-mono text-xs text-washi-umber">
              High {{ liveWeather.max }}°C / Low {{ liveWeather.min }}°C · Rain
              {{ liveWeather.rain }}mm · Wind {{ liveWeather.wind }} km/h
            </div>
          </div>
          <div v-else-if="error" class="font-mono text-xs text-washi-momiji">
            Weather offline ({{ error }}) — using seasonal baseline {{ currentDay.expectedTemp }}
          </div>
          <div v-else class="font-mono text-xs text-washi-umber">
            Loading live Open-Meteo telemetry...
          </div>

          <button
            type="button"
            class="rounded-lg border border-washi-border bg-[#FAF6EE] px-3 py-1.5 font-mono text-xs font-semibold text-washi-ink hover:border-washi-momiji"
            :disabled="loading"
            @click="fetchAll"
          >
            ↻ {{ loading ? 'Updating...' : 'Refresh' }}
          </button>
        </div>

        <!-- Clothing & Stay Summary -->
        <div class="mt-4 space-y-2 border-t border-washi-border/70 pt-3 text-xs text-washi-umber">
          <div>
            <strong class="font-mono text-washi-ink">🧥 LAYERING TIP:</strong>
            {{ currentDay.clothingTip }}
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span>
              <strong class="font-mono text-washi-jrink">🏨 STAY:</strong>
              {{ currentDay.staySummary }}
            </span>
            <a
              v-if="currentDay.stayMap"
              :href="currentDay.stayMap"
              target="_blank"
              rel="noopener noreferrer"
              class="font-mono font-semibold text-washi-momiji underline"
            >
              Open Hotel Map ↗
            </a>
          </div>
        </div>
      </div>

      <!-- Right Column: Multi-Frame ASCII Woodblock Diorama -->
      <div
        class="flex flex-col justify-between rounded-xl border border-washi-border bg-[#2B2520] p-4 text-[#FAF6EE] shadow-xs lg:col-span-5"
      >
        <div
          class="flex items-center justify-between border-b border-white/15 pb-2 font-mono text-[11px] text-[#D8CEBE]"
        >
          <span>{{ currentDiorama.title }}</span>
          <span class="text-washi-persimmon"
            >● FRAME {{ asciiFrame + 1 }}/{{ ASCII_FRAME_COUNT }}</span
          >
        </div>

        <pre
          class="my-auto overflow-x-auto py-4 text-center font-mono text-xs leading-relaxed text-[#FAF6EE] select-none"
          >{{ currentAsciiArt }}</pre>

        <div class="border-t border-white/15 pt-2 font-mono text-[11px] text-[#C8B9A6]">
          Check-Out Strictly 10:00 AM · Zero-Luggage Sightseeing Plan
        </div>
      </div>
    </div>

    <!-- Minute-by-Minute Checkpoints -->
    <div class="rounded-xl border border-washi-border bg-[#FAF6EE] p-5 shadow-xs">
      <div
        class="flex flex-wrap items-center justify-between gap-2 border-b border-washi-border pb-3"
      >
        <h3 class="font-serif text-xl font-bold text-washi-ink">
          Minute-by-Minute Field Schedule ({{ currentDay.checkpoints.length }} Stops)
        </h3>
        <span class="font-mono text-xs text-washi-umber">
          {{
            liveMode
              ? '🔒 Locked to live JST — click LIVE JST in the header banner to unlock'
              : 'Scrub the JST clock slider above to test active checkpoints'
          }}
        </span>
      </div>

      <div class="mt-2">
        <CheckpointRow
          v-for="(cp, cIdx) in currentDay.checkpoints"
          :key="cIdx"
          :checkpoint="cp"
          :active="isCheckpointActiveNow(simDayIndex, cp)"
          :done="simMinutesOfDay > cp.endMin"
        />
      </div>
    </div>
  </section>
</template>
