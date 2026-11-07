import type { WeatherKey, WeatherLocation } from '@/types'

export const weatherLocations: WeatherLocation[] = [
  { key: 'tokyo', name: 'Tokyo', sub: 'Kanto Plain', lat: 35.6762, lon: 139.6503 },
  { key: 'kamakura', name: 'Kamakura', sub: 'Sagami Coast', lat: 35.3192, lon: 139.5467 },
  { key: 'kawaguchiko', name: 'Kawaguchiko', sub: 'Mt. Fuji (857m)', lat: 35.4982, lon: 138.7686 },
  { key: 'kyoto', name: 'Kyoto', sub: 'Kansai Basin', lat: 35.0116, lon: 135.7681 },
  { key: 'nara', name: 'Nara', sub: 'Nara Park', lat: 34.6851, lon: 135.8048 },
  { key: 'osaka', name: 'Osaka', sub: 'Hommachi / Namba', lat: 34.6937, lon: 135.5023 },
  { key: 'hiroshima', name: 'Hiroshima', sub: '& Miyajima', lat: 34.3853, lon: 132.4553 },
  { key: 'okayama', name: 'Okayama', sub: 'Korakuen', lat: 34.6551, lon: 133.9195 },
]

// Handy for `locationByKey[day.weatherKey].name` instead of .find() each time.
export const locationByKey = Object.fromEntries(
  weatherLocations.map((loc) => [loc.key, loc]),
) as Record<WeatherKey, WeatherLocation>
