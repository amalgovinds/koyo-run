import { ref, computed } from 'vue'
import { itineraryDays } from '@/data/itinerary'
import type { Checkpoint, ItineraryDay } from '@/types'

export type DayStatus = 'completed' | 'active' | 'upcoming'

export interface DaylightPhase {
  icon: string
  label: string
  classes: string
}

// Module-level refs: every component that calls useTripClock() shares this state.
const simDayIndex = ref(1) // start on Day-1 Tokyo
const simMinutesOfDay = ref(970) // 16:10

const hmToMin = (hm: string): number => {
  const [h = 0, m = 0] = hm.split(':').map(Number)
  return h * 60 + m
}

// With noUncheckedIndexedAccess, itineraryDays[0] is `ItineraryDay | undefined`.
// The helper's declared return type is what carries the "not undefined" guarantee
// into useTripClock(); a plain `if (!x) throw` at module level would not.
function getFirstDay(): ItineraryDay {
  const day = itineraryDays[0]
  if (!day) {
    throw new Error('itineraryDays is empty: add at least one day to src/data/itinerary.ts')
  }
  return day
}
const firstDay = getFirstDay()

export function useTripClock() {
  const currentDay = computed<ItineraryDay>(() => itineraryDays[simDayIndex.value] ?? firstDay)

  const formattedTime = computed(() => {
    const h = Math.floor(simMinutesOfDay.value / 60)
    const m = simMinutesOfDay.value % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  })

  const stepDay = (delta: number): void => {
    const next = simDayIndex.value + delta
    if (next >= 0 && next < itineraryDays.length) simDayIndex.value = next
  }

  const setDay = (index: number): void => {
    if (index >= 0 && index < itineraryDays.length) simDayIndex.value = index
  }

  const getDayStatus = (dayIndex: number): DayStatus => {
    if (dayIndex < simDayIndex.value) return 'completed'
    if (dayIndex === simDayIndex.value) return 'active'
    return 'upcoming'
  }

  const isCheckpointActiveNow = (dayIndex: number, checkpoint: Checkpoint): boolean => {
    if (dayIndex !== simDayIndex.value) return false
    return (
      simMinutesOfDay.value >= checkpoint.startMin && simMinutesOfDay.value <= checkpoint.endMin
    )
  }

  const totalCheckpoints = computed(() =>
    itineraryDays.reduce((sum, d) => sum + d.checkpoints.length, 0),
  )

  const completedCheckpoints = computed(() => {
    let count = 0
    itineraryDays.forEach((d, idx) => {
      if (idx < simDayIndex.value) {
        count += d.checkpoints.length
      } else if (idx === simDayIndex.value) {
        count += d.checkpoints.filter((cp) => simMinutesOfDay.value >= cp.endMin).length
      }
    })
    return count
  })

  const progressPercent = computed(() =>
    totalCheckpoints.value === 0
      ? 0
      : Math.min(100, Math.round((completedCheckpoints.value / totalCheckpoints.value) * 100)),
  )

  const activeCheckpointText = computed(() => {
    const d = currentDay.value
    const match = d.checkpoints.find(
      (cp) => simMinutesOfDay.value >= cp.startMin && simMinutesOfDay.value <= cp.endMin,
    )
    return match ? (match.title.split('(')[0] ?? match.title).trim() : d.cityShort
  })

  const daylightPhase = computed<DaylightPhase>(() => {
    const d = currentDay.value
    const mins = simMinutesOfDay.value
    const sunrise = hmToMin(d.sunrise)
    const sunset = hmToMin(d.sunset)

    if (mins < sunrise - 20) {
      return {
        icon: '🌌',
        label: 'Pre-Dawn',
        classes: 'bg-washi-warm text-washi-ink border border-washi-border',
      }
    }
    if (mins <= sunrise + 75) {
      return {
        icon: '🌅',
        label: 'Sunrise Gold',
        classes: 'bg-amber-500/20 text-amber-900 border border-amber-500/40',
      }
    }
    if (mins < sunset - 45) {
      return {
        icon: '☀️',
        label: 'Full Daylight',
        classes: 'bg-washi-jrgreen text-washi-jrink border border-[#9BC1AE]',
      }
    }
    if (mins <= sunset + 25) {
      return {
        icon: '🌇',
        label: 'Sunset Hour',
        classes: 'bg-washi-persimmon/20 text-washi-momiji border border-washi-persimmon/40',
      }
    }
    return { icon: '🏮', label: 'Night Light-Up', classes: 'bg-washi-momiji text-white' }
  })

  return {
    simDayIndex,
    simMinutesOfDay,
    currentDay,
    formattedTime,
    stepDay,
    setDay,
    getDayStatus,
    isCheckpointActiveNow,
    totalCheckpoints,
    completedCheckpoints,
    progressPercent,
    activeCheckpointText,
    daylightPhase,
  }
}
