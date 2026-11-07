import type {
  BookingCategory,
  BookingCategoryKey,
  Flight,
  Stay,
  Ticket,
  Transport,
  UnifiedBooking,
} from '@/types'

export const flightsData: Flight[] = [
  {
    id: 'fl1',
    flightNo: 'AI-2852',
    date: '16 Nov 2026',
    sortKey: '2026-11-16T10:20',
    depTime: '10:20',
    arrTime: '12:25',
    from: 'BLR · Terminal 2',
    to: 'BOM · Terminal 2',
    direction: 'Outbound Positioning Sector',
    statusNote: 'Layover: 4h 40m @ BOM (T2)',
    layoverAlert:
      '4h 40m layover at Mumbai Terminal 2 (T2). Both domestic arrival and international departure operate inside BOM T2.',
  },
  {
    id: 'fl2',
    flightNo: 'AI-356',
    date: '16 Nov 2026',
    sortKey: '2026-11-16T17:05',
    depTime: '17:05',
    arrTime: '04:55 (+1)',
    from: 'BOM · Terminal 2',
    to: 'HND · Terminal 3',
    direction: 'Non-Stop International to Tokyo',
    statusNote: 'Arrives 17 Nov 2026 @ 04:55 AM',
    layoverAlert:
      'Lands at Tokyo Haneda Terminal 3 at 04:55 AM on Nov 17. Direct Keikyu/Asakusa train to Higashi-Nihombashi departs at 06:02 AM.',
  },
  {
    id: 'fl3',
    flightNo: 'AI-357',
    date: '30 Nov 2026',
    sortKey: '2026-11-30T11:45',
    depTime: '11:45',
    arrTime: '18:20',
    from: 'HND · Terminal 3',
    to: 'DEL · Terminal 3',
    direction: 'Return International Sector',
    statusNote: 'Layover: 3h 10m @ DEL (T3) · Self-Transfer',
    layoverAlert:
      'IMPORTANT: 3h 10m Self-Transfer Luggage at Delhi T3. Clear immigration, collect checked bags, exit customs, and take elevator to DEL T3 Level 2 Domestic Departures before 20:30.',
  },
  {
    id: 'fl4',
    flightNo: 'AI-2412',
    date: '30 Nov 2026',
    sortKey: '2026-11-30T21:30',
    depTime: '21:30',
    arrTime: '00:25 (+1)',
    from: 'DEL · Terminal 3',
    to: 'BLR · Terminal 2',
    direction: 'Return Domestic Sector',
    statusNote: 'Arrives 1 Dec 2026 @ 00:25 AM',
    layoverAlert: 'Lands at Bengaluru (BLR) Terminal 2 at 00:25 AM on Tuesday, Dec 1, 2026.',
  },
]

export const staysData: Stay[] = [
  {
    id: 'st1',
    name: 'APA Hotel Nihombashi Bakurocho-Ekikita',
    city: 'Tokyo',
    dates: 'Nov 17 – Nov 20, 2026',
    sortKey: '2026-11-17T15:00',
    nights: '3N',
    checkIn: '15:00',
    station: 'Bakurochō Station (multiple)',
    walkNote: 'Nearest walk 230m (JR Bakurocho Exit 2 is 110m; Higashi-Nihombashi Exit A1 is 200m)',
    mapUrl: 'https://maps.app.goo.gl/S2RQFEtPSeCg8Rw88',
  },
  {
    id: 'st2',
    name: 'SEMINAR PLAZA ROYAL FUJI',
    city: 'Fujikawaguchiko',
    dates: 'Nov 20 – Nov 21, 2026',
    sortKey: '2026-11-20T16:00',
    nights: '1N',
    checkIn: '16:00',
    station: 'Kawaguchiko Station',
    walkNote: '2.0 km Car (5-min taxi ~¥1,000) or 1.6 km Walk (20 mins)',
    mapUrl: 'https://maps.app.goo.gl/HrL62cJjYMRoWyia6',
  },
  {
    id: 'st3',
    name: "Le Lion d'Or (City Pension Le Lion d'Or)",
    city: 'Kyoto',
    dates: 'Nov 21 – Nov 22, 2026',
    sortKey: '2026-11-21T16:00',
    nights: '1N',
    checkIn: '16:00',
    station: 'Nijojo-mae Sta. (Nijo-jo Castle)',
    walkNote: '400m walk (5 mins) from Tozai Subway Exit 2',
    mapUrl: 'https://maps.app.goo.gl/DvwMTNEWuwQvvuyJ8',
  },
  {
    id: 'st4',
    name: 'Rinn Kyoto Gion Shinbashi',
    city: 'Kyoto',
    dates: 'Nov 22 – Nov 23, 2026',
    sortKey: '2026-11-22T16:00',
    nights: '1N',
    checkIn: '16:00',
    station: 'Gion-Shijo Station (multiple)',
    walkNote: 'Nearest walk 450m (5 mins flat along Shirakawa Canal)',
    mapUrl: 'https://maps.app.goo.gl/cgRLywjQNdMc6hi37',
  },
  {
    id: 'st5',
    name: 'Hotel SUI Kyoto Kiyomizu',
    city: 'Kyoto',
    dates: 'Nov 23 – Nov 25, 2026',
    sortKey: '2026-11-23T15:00',
    nights: '2N',
    checkIn: '15:00',
    station: 'Kiyomizu-Gojō Station',
    walkNote: '65m walk (1 min from Exit 2 with elevator)',
    mapUrl: 'https://maps.app.goo.gl/26KqcLH8ePireazp8',
  },
  {
    id: 'st6',
    name: 'APA Hotel and Resort Midosuji Hommachi Ekimae Tower',
    city: 'Osaka',
    dates: 'Nov 25 – Nov 28, 2026',
    sortKey: '2026-11-25T15:00',
    nights: '3N',
    checkIn: '15:00',
    station: 'Hommachi Station',
    walkNote: '30m walk (Directly outside Exit 18)',
    mapUrl: 'https://maps.app.goo.gl/y4unhjXiDw7XB1ke8',
  },
  {
    id: 'st7',
    name: 'Hotel Livemax Nihonbashi-Ningyocho',
    city: 'Tokyo',
    dates: 'Nov 28 – Nov 30, 2026',
    sortKey: '2026-11-28T15:00',
    nights: '2N',
    checkIn: '15:00',
    station: 'Ningyōchō Station',
    walkNote: '49m walk (1 min from Exit A6 elevator; direct Airport Express to Haneda T3)',
    mapUrl: 'https://maps.app.goo.gl/qDwQL5N72YCP4hNM8',
  },
]

export const ticketsData: Ticket[] = [
  {
    id: 'tk1',
    name: 'Tokyo Skytree',
    date: '17 Nov 2026',
    sortKey: '2026-11-17T16:00',
    time: '16:00',
    bookedOn: 'Klook',
    notes:
      'Timed entry for the 16:33 sunset over Tokyo and Mt. Fuji. Direct 12-min train from Higashi-Nihombashi to Oshiage.',
    url: 'https://maps.app.goo.gl/SnJbBQi3gQFgD6Us9?g_st=ic',
  },
  {
    id: 'tk2',
    name: 'Shibuya SKY',
    date: '19 Nov 2026',
    sortKey: '2026-11-19T15:40',
    time: '15:40',
    bookedOn: 'Klook',
    notes:
      'Max delay allowed is 20 mins — reach the 14F elevator by 15:20 early! Prime sunset slot (sunset at 16:32).',
    url: 'https://maps.app.goo.gl/xJ3Rsa1ZwEF3f6Pq6?g_st=ic',
  },
  {
    id: 'tk3',
    name: 'Gion Corner',
    date: '21 Nov 2026',
    sortKey: '2026-11-21T18:00',
    time: '18:00',
    bookedOn: 'kyoto-gioncorner.com',
    notes:
      '50-minute performance of Maiko Kyomai dance, tea ceremony, koto, gagaku & kyogen at Yasaka Hall in Gion.',
    url: 'https://www.kyoto-gioncorner.com/global/en.html',
  },
  {
    id: 'tk4',
    name: 'teamLab Borderless',
    date: '28 Nov 2026',
    sortKey: '2026-11-28T17:30',
    time: '17:30',
    bookedOn: 'Klook',
    notes:
      'Azabudai Hills evening session right after watching the 16:28 sunset at Tokyo Tower (11-min walk from Tokyo Tower).',
    url: 'https://maps.app.goo.gl/YibWJitYwzJrRz9QA',
  },
]

export const transportsData: Transport[] = [
  {
    id: 'tr1',
    date: '20 Nov 2026',
    sortKey: '2026-11-20T11:34',
    time: '11:34 – 13:31',
    route: 'Shinjuku Station (Platform 9) ➔ Kawaguchiko Station',
    trainName: 'Fuji Excursion 93',
    carAndSeats: 'CAR 3 · Seats 6A & 6B',
    bookedOn: 'Klook',
    notes:
      'Reconfirm Platform 9 at Shinjuku. Exchange Klook QR at a JR East green ticket machine before boarding.',
  },
  {
    id: 'tr2',
    date: '21 Nov 2026',
    sortKey: '2026-11-21T10:20',
    time: '10:20 – 11:50',
    route: 'Kawaguchiko Station ➔ Mishima Station North',
    trainName: 'Express Bus 0108-1',
    carAndSeats: 'Seats 6A & 6B',
    bookedOn: 'Klook',
    notes:
      'Line up at Bus Stop #6 by 10:00 AM to load 1 suitcase per person into the underfloor luggage trunk.',
  },
  {
    id: 'tr3',
    date: '21 Nov 2026',
    sortKey: '2026-11-21T13:46',
    time: '13:46 – 15:37',
    route: 'Mishima Station ➔ Kyoto Station',
    trainName: 'HIKARI 713',
    carAndSeats: 'CAR 14 · Seats 16D & 16E',
    bookedOn: 'smart-ex',
    notes: 'Seat 16E is the right-side Mt. Fuji window seat + last-row space!',
  },
  {
    id: 'tr4',
    date: '23 Nov – 27 Nov 2026',
    sortKey: '2026-11-23T10:20',
    time: 'Active till 27 Nov',
    route: 'JR-WEST Kansai-Hiroshima Area Pass',
    trainName: 'MUST PICKUP: 23 Nov 2026',
    carAndSeats: '5-Day Regional Pass',
    bookedOn: 'JR-West',
    notes:
      'Pick up at JR Kyoto Station green ticket machine with passport. Covers JR Arashiyama, JR Nara, Hiroshima & Okayama.',
  },
  {
    id: 'tr5',
    date: '26 Nov 2026',
    sortKey: '2026-11-26T06:00',
    time: '06:00–07:25 & 15:00–16:43',
    route: 'Shin-Osaka ⇔ Hiroshima',
    trainName: 'Mizuho 601 & Nozomi 36',
    carAndSeats: 'Mizuho Car 4 (7A, 7B) · Nozomi Car 14 (14D, 14E)',
    bookedOn: 'JR-West Pass',
    notes:
      'Train-1: Mizuho 601 (06:00–07:25, Car 4, Seats 7A & 7B). Train-2: Nozomi 36 (15:00–16:43, Car 14, Seats 14D & 14E).',
  },
  {
    id: 'tr6',
    date: '27 Nov 2026',
    sortKey: '2026-11-27T06:00',
    time: '06:00–06:50 & 12:14–12:59',
    route: 'Shin-Osaka ⇔ Okayama',
    trainName: 'Mizuho 601 & Sakura 746',
    carAndSeats: 'Mizuho Car 5 (7D, 8D) · Sakura Car 5 (9D, 11D)',
    bookedOn: 'JR-West Pass',
    notes:
      'Train-1: Mizuho 601 (06:00–06:50, Car 5, Seats 7D & 8D). Train-2: Sakura 746 (12:14–12:59, Car 5, Seats 9D & 11D).',
  },
  {
    id: 'tr7',
    date: '28 Nov 2026',
    sortKey: '2026-11-28T12:06',
    time: '12:06 – 14:33',
    route: 'Shin-Osaka Station ➔ Tokyo Station',
    trainName: 'NOZOMI 18',
    carAndSeats: 'CAR 3 · Seats 7E & 8E',
    bookedOn: 'smart-ex',
    notes:
      'Both 7E & 8E are left-side Mt. Fuji window seats (look out around 13:45 passing Shin-Fuji!).',
  },
]

export const bookingCategories: BookingCategory[] = [
  { key: 'flights', label: 'Flights', count: flightsData.length },
  { key: 'stays', label: 'Stays', count: staysData.length },
  { key: 'transports', label: 'Trains & Bus', count: transportsData.length },
  { key: 'tickets', label: 'Tickets', count: ticketsData.length },
]

// Pure function: no refs, no component state. A view wraps it in computed().
export function buildUnifiedBookings(selected: BookingCategoryKey[]): UnifiedBooking[] {
  const list: UnifiedBooking[] = []

  if (selected.includes('flights')) {
    for (const f of flightsData) {
      list.push({
        sortKey: f.sortKey,
        typeLabel: '✈️ Flight',
        date: f.date,
        time: `${f.depTime}–${f.arrTime}`,
        title: `${f.flightNo}: ${f.from} ➔ ${f.to}`,
        highlight: f.statusNote,
      })
    }
  }

  if (selected.includes('stays')) {
    for (const s of staysData) {
      list.push({
        sortKey: s.sortKey,
        typeLabel: '🏨 Stay',
        date: s.dates,
        time: `In ${s.checkIn} / Out 10:00`,
        title: `${s.name} (${s.city})`,
        highlight: s.station,
        link: s.mapUrl,
      })
    }
  }

  if (selected.includes('transports')) {
    for (const t of transportsData) {
      list.push({
        sortKey: t.sortKey,
        typeLabel: '🚄 Transit',
        date: t.date,
        time: t.time,
        title: `${t.trainName}: ${t.route}`,
        highlight: t.carAndSeats,
      })
    }
  }

  if (selected.includes('tickets')) {
    for (const tk of ticketsData) {
      list.push({
        sortKey: tk.sortKey,
        typeLabel: '🎟️ Ticket',
        date: tk.date,
        time: tk.time,
        title: tk.name,
        highlight: tk.bookedOn,
        link: tk.url,
      })
    }
  }

  return list.sort((a, b) => a.sortKey.localeCompare(b.sortKey))
}
