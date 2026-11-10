<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { itineraryDays } from '@/data/itinerary'
import { decodeWmo } from '@/data/weather'
import { useTripClock } from '@/composables/useTripClock'
import { useWeather } from '@/composables/useWeather'
import CheckpointRow from '@/components/CheckpointRow.vue'

const router = useRouter()
const {
  simDayIndex,
  simMinutesOfDay,
  setDay,
  getDayStatus,
  isCheckpointActiveNow,
  progressPercent,
  completedCheckpoints,
  totalCheckpoints,
} = useTripClock()

const { weatherMap, loading, fetchAll, getWeatherForDay } = useWeather()

onMounted(() => {
  if (Object.keys(weatherMap.value).length === 0 && !loading.value) {
    fetchAll()
  }
})

const expanded = ref<Record<string, boolean>>({
  [itineraryDays[simDayIndex.value]?.id ?? 'day1']: true,
})

function toggleDay(dayId: string) {
  expanded.value[dayId] = !expanded.value[dayId]
}

function openInToday(idx: number) {
  setDay(idx)
  router.push({ name: 'today' })
}

// Squiggly S-curve SVG path geometry
const rowHeight = 130
const svgHeight = itineraryDays.length * rowHeight + 60

const points = computed(() =>
  itineraryDays.map((_, idx) => ({
    x: 300 + Math.sin(idx * 1.15) * 185,
    y: 48 + idx * rowHeight,
  })),
)

const squigglyPath = computed(() => {
  const pts = points.value
  const first = pts[0]
  if (!first) return ''
  let d = `M ${first.x} ${first.y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const curr = pts[i]
    const next = pts[i + 1]
    if (!curr || !next) continue
    const midY = (curr.y + next.y) / 2
    d += ` C ${curr.x} ${midY}, ${next.x} ${midY}, ${next.x} ${next.y}`
  }
  return d
})
</script>

<template>
  <section class="space-y-6">
    <!-- Top Progress Header -->
    <div
      class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-washi-border bg-washi-warm/75 p-5"
    >
      <div>
        <span class="font-mono text-xs font-bold tracking-widest text-washi-momiji uppercase">
          東海道・山陽道絵図 · DOWNWARD TREASURE TRAIL
        </span>
        <h2 class="mt-1 font-serif text-2xl font-bold text-washi-ink">
          15-Day Koyo Expedition Route
        </h2>
        <p class="mt-0.5 text-xs text-washi-umber">
          {{ completedCheckpoints }} of {{ totalCheckpoints }} checkpoints completed ({{
            progressPercent
          }}%). Click any day to expand inline.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div class="h-3 w-36 overflow-hidden rounded-full border border-washi-border bg-[#FAF6EE]">
          <div
            class="h-full bg-washi-momiji transition-all duration-300"
            :style="{ width: `${progressPercent}%` }"
          ></div>
        </div>
        <span class="hanko-seal rounded px-2 py-0.5 font-mono text-xs font-bold">
          {{ progressPercent }}%
        </span>
      </div>
    </div>

    <!-- Squiggly S-Curve Treasure Trail Container -->
    <div class="relative rounded-xl border border-washi-border bg-[#FAF6EE] p-4 sm:p-6">
      <!-- Squiggly Dotted SVG Line Behind Cards -->
      <svg
        :viewBox="`0 0 600 ${svgHeight}`"
        class="pointer-events-none absolute inset-0 hidden h-full w-full opacity-35 md:block"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          :d="squigglyPath"
          fill="none"
          stroke="#8C7A6B"
          stroke-width="4"
          stroke-dasharray="10 8"
          stroke-linecap="round"
        />
        <path
          :d="squigglyPath"
          fill="none"
          stroke="#B93829"
          stroke-width="4.5"
          stroke-linecap="round"
          pathLength="100"
          stroke-dasharray="100"
          :stroke-dashoffset="100 - progressPercent"
        />
      </svg>

      <!-- Alternating Winding Milestone Cards -->
      <div class="relative z-10 space-y-5">
        <div
          v-for="(day, idx) in itineraryDays"
          :key="day.id"
          class="transition-all"
          :class="idx % 2 === 0 ? 'md:mr-auto md:w-[82%]' : 'md:ml-auto md:w-[82%]'"
        >
          <article
            class="relative overflow-visible rounded-xl border p-4 shadow-xs transition"
            :class="
              getDayStatus(idx) === 'active'
                ? 'current-day-pulse border-2 border-washi-momiji bg-[#F5E6D3]/60'
                : getDayStatus(idx) === 'completed'
                  ? 'border-washi-border bg-[#FAF6EE]/50'
                  : 'border-washi-border/80 bg-[#FAF6EE]'
            "
          >
            <div
              v-if="getDayStatus(idx) === 'completed'"
              class="absolute inset-0 z-[1] bg-[#FFF3E8]/55 pointer-events-none"
            ></div>
            <div v-if="getDayStatus(idx) === 'completed'" class="completed-stamp">済 COMPLETED</div>
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="flex items-start gap-3">
                <!-- Node Circle -->
                <div
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 font-mono text-xs font-bold"
                  :class="
                    getDayStatus(idx) === 'active'
                      ? 'border-washi-momiji bg-washi-momiji text-white'
                      : getDayStatus(idx) === 'completed'
                        ? 'border-[#D96B27] bg-white/85 text-[#D96B27]'
                        : 'border-washi-border bg-washi-warm text-washi-umber'
                  "
                >
                  D{{ idx }}
                </div>

                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="font-mono text-xs font-bold text-washi-momiji">
                      {{ day.dateStr }}
                    </span>
                    <span
                      v-if="getDayStatus(idx) === 'active'"
                      class="rounded bg-washi-momiji px-2 py-0.5 font-mono text-[10px] font-bold text-white animate-pulse"
                    >
                      📍 YOU ARE HERE
                    </span>

                    <!-- Live Weather Pill -->
                    <span
                      v-if="getWeatherForDay(day)"
                      class="rounded-full border border-washi-border bg-washi-warm px-2 py-0.5 font-mono text-[11px] text-washi-ink"
                    >
                      {{ decodeWmo(getWeatherForDay(day)!.code).emoji }}
                      {{ getWeatherForDay(day)!.temp }}°C (H:{{ getWeatherForDay(day)!.max }}° L:{{
                        getWeatherForDay(day)!.min
                      }}° · Rain {{ getWeatherForDay(day)!.rain }}mm)
                    </span>
                  </div>

                  <h3 class="mt-1 font-serif text-lg font-bold text-washi-ink">
                    {{ day.city }}
                  </h3>
                  <p class="mt-0.5 font-mono text-xs text-washi-umber">
                    🌅 {{ day.sunrise }} · 🌇 {{ day.sunset }} · {{ day.staySummary }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="rounded-lg border border-washi-border bg-[#FAF6EE] px-2.5 py-1 font-mono text-xs text-washi-ink hover:border-washi-momiji"
                  @click="toggleDay(day.id)"
                >
                  {{ expanded[day.id] ? 'Hide Stops ▲' : `Stops (${day.checkpoints.length}) ▼` }}
                </button>
                <button
                  type="button"
                  class="rounded-lg bg-washi-momiji px-3 py-1 font-mono text-xs font-semibold text-white hover:opacity-90"
                  @click="openInToday(idx)"
                >
                  Inspect Day →
                </button>
              </div>
            </div>

            <!-- Inline Expandable Checkpoints -->
            <div v-if="expanded[day.id]" class="mt-4 border-t border-washi-border pt-3">
              <CheckpointRow
                v-for="(cp, cIdx) in day.checkpoints"
                :key="cIdx"
                :checkpoint="cp"
                :active="isCheckpointActiveNow(idx, cp)"
                :done="
                  getDayStatus(idx) === 'completed' ||
                  (getDayStatus(idx) === 'active' && simMinutesOfDay > cp.endMin)
                "
              />
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.current-day-pulse {
  animation: current-day-border 2s ease-in-out infinite;
}

@keyframes current-day-border {
  0%,
  100% {
    border-color: rgba(185, 56, 41, 0.4);
  }
  50% {
    border-color: rgba(185, 56, 41, 1);
  }
}

.completed-stamp {
  position: absolute;
  top: 35px;
  left: -62px;
  z-index: 10;

  width: 220px;
  transform: rotate(-45deg);
  text-align: center;

  color: #169b46;
  background: transparent;
  border: none;

  font-family: Georgia, serif;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 2px;
  white-space: nowrap;

  opacity: 1;
  pointer-events: none;
}
</style>
