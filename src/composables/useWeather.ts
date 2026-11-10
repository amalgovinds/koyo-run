import { ref } from 'vue'
import { weatherLocations } from '@/data/locations'
import type { ItineraryDay, WeatherEntry, WeatherKey } from '@/types'

interface OpenMeteoRow {
  current: {
    temperature_2m: number
    precipitation: number | null
    weather_code: number
    wind_speed_10m: number
  }
  daily: {
    time: string[]
    temperature_2m_max: (number | null)[]
    temperature_2m_min: (number | null)[]
    precipitation_sum: (number | null)[]
    wind_speed_10m_max: (number | null)[]
    weather_code: (number | null)[]
  }
}

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
        daily:
          'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
        timezone: 'Asia/Tokyo',
        forecast_days: '16',
        past_days: '7',
      })
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

      const data = (await res.json()) as OpenMeteoRow | OpenMeteoRow[]
      const rows = Array.isArray(data) ? data : [data]

      const todayJST = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' })
      const next: Partial<Record<WeatherKey, WeatherEntry>> = {}

      weatherLocations.forEach((loc, i) => {
        const row = rows[i]
        if (!row) return

        const byDate: Record<string, WeatherEntry> = {}
        const dates = row.daily.time ?? []

        dates.forEach((iso, dIdx) => {
          const max = Math.round(row.daily.temperature_2m_max[dIdx] ?? row.current.temperature_2m)
          const min = Math.round(row.daily.temperature_2m_min[dIdx] ?? row.current.temperature_2m)
          const isToday = iso === todayJST

          byDate[iso] = {
            // If the itinerary day matches today's real JST date, use live current temp;
            // otherwise use the daytime representative temp (weighted toward afternoon high).
            temp: isToday
              ? Math.round(row.current.temperature_2m)
              : Math.round(max * 0.65 + min * 0.35),
            rain: isToday
              ? (row.current.precipitation ?? 0)
              : Math.round((row.daily.precipitation_sum[dIdx] ?? 0) * 10) / 10,
            wind: isToday
              ? Math.round(row.current.wind_speed_10m)
              : Math.round(row.daily.wind_speed_10m_max[dIdx] ?? row.current.wind_speed_10m),
            max,
            min,
            code: isToday
              ? row.current.weather_code
              : (row.daily.weather_code[dIdx] ?? row.current.weather_code),
            dateISO: iso,
            isForecast: !isToday,
          }
        })

        next[loc.key] = {
          temp: Math.round(row.current.temperature_2m),
          rain: row.current.precipitation ?? 0,
          wind: Math.round(row.current.wind_speed_10m),
          max: Math.round(row.daily.temperature_2m_max[0] ?? row.current.temperature_2m),
          min: Math.round(row.daily.temperature_2m_min[0] ?? row.current.temperature_2m),
          code: row.current.weather_code,
          isForecast: false,
          byDate,
        }
      })

      weatherMap.value = next
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  /**
   * Returns the weather entry for a specific location AND dateISO (e.g. 'kawaguchiko' on '2026-11-20').
   * Falls back to the location's current weather if the date is outside Open-Meteo's window.
   */
  function getWeatherForDate(key: WeatherKey, dateISO?: string): WeatherEntry | undefined {
    const locEntry = weatherMap.value[key]
    if (!locEntry) return undefined
    if (dateISO && locEntry.byDate?.[dateISO]) {
      return locEntry.byDate[dateISO]
    }
    return locEntry
  }

  /**
   * Convenience helper for an ItineraryDay: resolves both `day.weatherKey` and `day.dateISO`.
   */
  function getWeatherForDay(
    day: Pick<ItineraryDay, 'weatherKey' | 'dateISO'>,
  ): WeatherEntry | undefined {
    const key = (day.weatherKey as WeatherKey) || 'tokyo'
    return getWeatherForDate(key, day.dateISO)
  }

  return {
    weatherMap,
    loading,
    error,
    fetchAll,
    getWeatherForDate,
    getWeatherForDay,
  }
}
