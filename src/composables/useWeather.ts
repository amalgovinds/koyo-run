import { ref } from 'vue'
import { weatherLocations } from '@/data/locations'
import type { WeatherEntry, WeatherKey } from '@/types'

// Shape of one location in Open-Meteo's response (only the fields we request).
interface OpenMeteoRow {
  current: {
    temperature_2m: number
    precipitation: number | null
    weather_code: number
    wind_speed_10m: number
  }
  daily: {
    temperature_2m_max: number[]
    temperature_2m_min: number[]
  }
}

// Partial: the map is empty until the first fetch succeeds.
const weatherMap = ref<Partial<Record<WeatherKey, WeatherEntry>>>({})
const loading = ref(false)
const error = ref<string | null>(null)

export function useWeather() {
  async function fetchAll(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams({
        latitude: weatherLocations.map((l) => l.lat).join(','),
        longitude: weatherLocations.map((l) => l.lon).join(','),
        current: 'temperature_2m,precipitation,weather_code,wind_speed_10m',
        daily: 'temperature_2m_max,temperature_2m_min',
        timezone: 'Asia/Tokyo',
        forecast_days: '1',
      })
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

      const data = (await res.json()) as OpenMeteoRow | OpenMeteoRow[]
      const rows = Array.isArray(data) ? data : [data] // several locations return an array

      const next: Partial<Record<WeatherKey, WeatherEntry>> = {}
      weatherLocations.forEach((loc, i) => {
        const row = rows[i]
        if (!row) return // skip a location the API did not return
        next[loc.key] = {
          temp: Math.round(row.current.temperature_2m),
          rain: row.current.precipitation ?? 0,
          wind: Math.round(row.current.wind_speed_10m),
          max: Math.round(row.daily.temperature_2m_max[0] ?? 0),
          min: Math.round(row.daily.temperature_2m_min[0] ?? 0),
          code: row.current.weather_code,
        }
      })

      weatherMap.value = next
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }
  return { weatherMap, loading, error, fetchAll }
}
