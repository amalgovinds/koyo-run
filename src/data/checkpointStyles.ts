// src/data/checkpointStyles.ts
import type { CheckpointStyle, CheckpointType } from '@/types'

// Class names are written out in full so Tailwind's source scanner picks them up.
export const checkpointStyles: Record<CheckpointType, CheckpointStyle> = {
  sunrise: {
    label: '🌅 Sunrise Light',
    badge: 'bg-amber-500/15 text-amber-900 border border-amber-500/30',
    dot: 'bg-amber-500',
  },
  daylight: {
    label: '☀️ Daylight',
    badge: 'bg-washi-jrgreen text-washi-jrink border border-[#9BC1AE]',
    dot: 'bg-washi-moss',
  },
  sunset: {
    label: '🌇 Sunset Hour',
    badge: 'bg-orange-500/15 text-orange-900 border border-orange-500/30',
    dot: 'bg-washi-persimmon',
  },
  night: {
    label: '🏮 Night Illumination',
    badge: 'bg-washi-momiji/15 text-washi-momiji border border-washi-momiji/30',
    dot: 'bg-washi-momiji',
  },
  transit: {
    label: '🚄 JR / Transit',
    badge: 'bg-washi-warm text-washi-ink border border-washi-border',
    dot: 'bg-washi-ink',
  },
  luggage: {
    label: '🧳 Check-In / 10:00 Out',
    badge: 'bg-washi-warm text-washi-umber border border-washi-border',
    dot: 'bg-washi-bark',
  },
}

export const getCheckpointStyle = (type: CheckpointType): CheckpointStyle =>
  checkpointStyles[type] ?? checkpointStyles.daylight
