// src/types.ts
export type BookingCategoryKey = 'flights' | 'stays' | 'transports' | 'tickets'

export interface BookingCategory {
  key: BookingCategoryKey
  label: string
  count: number
}

export type CheckpointType = 'sunrise' | 'daylight' | 'sunset' | 'night' | 'transit' | 'luggage'

export interface Checkpoint {
  time: string
  startMin: number
  endMin: number
  type: CheckpointType
  bookingTag: string
  title: string
  desc: string
}

export interface CheckpointStyle {
  label: string
  badge: string // Tailwind classes
  dot: string // Tailwind class
}

export interface CityDiorama {
  title: string
  frames: string[]
}

export interface Flight {
  id: string
  flightNo: string
  date: string // display string, e.g. '16 Nov 2026'
  sortKey: string // ISO-like, e.g. '2026-11-16T10:20' (used for sorting only)
  depTime: string
  arrTime: string
  from: string
  to: string
  direction: string
  statusNote: string
  layoverAlert: string
}

export interface ItineraryDay {
  id: string
  dayLabel: string
  shortLabel: string
  dateISO: string
  dateStr: string
  city: string
  cityShort: string
  weatherKey: string
  sunrise: string
  sunset: string
  expectedTemp: string
  weatherSummary: string
  staySummary: string
  stayMap: string
  clothingTip: string
  checkpoints: Checkpoint[]
}

export interface JournalEntry {
  dayId: string
  dayLabel: string
  dateStr: string
  placeHeading: string
  status: 'draft' | 'published'
  highlight: string
  moodWeather: string
  steps: string
  content: string
}

export interface Stay {
  id: string
  name: string
  city: string
  dates: string
  sortKey: string
  nights: string
  checkIn: string
  station: string
  walkNote: string
  mapUrl: string
}

export type TabId = 'today' | 'map' | 'flights' | 'stays' | 'trains' | 'tickets' | 'journal'

export interface NavTab {
  id: TabId
  label: string
  icon: string
  badge: string
}

export interface Ticket {
  id: string
  name: string
  date: string
  sortKey: string
  time: string
  bookedOn: string
  notes: string
  url: string
}

export interface Transport {
  id: string
  date: string
  sortKey: string
  time: string
  route: string
  trainName: string
  carAndSeats: string
  bookedOn: string
  notes: string
}

export interface UnifiedBooking {
  sortKey: string
  typeLabel: string
  date: string
  time: string
  title: string
  highlight?: string
  link?: string
}

export interface WeatherEntry {
  temp: number
  rain: number
  wind: number
  max: number
  min: number
  code: number
}

export type WeatherKey =
  'tokyo' | 'kamakura' | 'kawaguchiko' | 'kyoto' | 'nara' | 'osaka' | 'hiroshima' | 'okayama'

export interface WeatherLocation {
  key: WeatherKey
  name: string
  sub: string
  lat: number
  lon: number
}
