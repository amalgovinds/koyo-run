// src/data/navTabs.ts
import type { NavTab } from '@/types'
import { flightsData, staysData, ticketsData, transportsData } from '@/data/bookings'
import { itineraryDays } from '@/data/itinerary'

// `id` must match the route names in src/router/index.ts.
// Usage: <RouterLink :to="{ name: tab.id }" active-class="bg-washi-momiji text-white">
export const navTabs: NavTab[] = [
  { id: 'today', label: "Today's Run", icon: 'ph-fill ph-sun-horizon', badge: '#today' },
  {
    id: 'map',
    label: 'Treasure Trail',
    icon: 'ph-fill ph-path',
    badge: `${itineraryDays.length}D`,
  },
  {
    id: 'flights',
    label: 'Flights',
    icon: 'ph-fill ph-airplane-tilt',
    badge: String(flightsData.length),
  },
  { id: 'stays', label: 'Stays', icon: 'ph-fill ph-buildings', badge: String(staysData.length) },
  {
    id: 'trains',
    label: 'Trains & Pass',
    icon: 'ph-fill ph-train-regional',
    badge: String(transportsData.length),
  },
  {
    id: 'tickets',
    label: 'Tickets & Filter',
    icon: 'ph-fill ph-ticket',
    badge: String(ticketsData.length),
  },
  { id: 'journal', label: 'Field Journal', icon: 'ph-fill ph-book-open-text', badge: '' },
]
