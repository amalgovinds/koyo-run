export interface WmoInfo {
  emoji: string
  desc: string
}

// Same buckets as the original decodeWmo. Open-Meteo returns WMO weather codes.
export function decodeWmo(code: number): WmoInfo {
  if (code === 0) return { emoji: '☀️', desc: 'Clear sky' }
  if (code <= 3) return { emoji: '⛅', desc: 'Partly cloudy' }
  if (code <= 48) return { emoji: '🌫️', desc: 'Misty / Foggy' }
  if (code <= 67) return { emoji: '🌧️', desc: 'Rain showers' }
  if (code <= 77) return { emoji: '❄️', desc: 'Mountain snow' }
  return { emoji: '⛈️', desc: 'Thunderstorms / Showers' }
}
