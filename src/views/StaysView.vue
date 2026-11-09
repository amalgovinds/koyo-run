<script setup lang="ts">
import { staysData } from '@/data/bookings'
</script>

<template>
  <section class="space-y-5">
    <div class="rounded-xl border border-washi-border bg-washi-warm/75 p-5">
      <span class="font-mono text-xs font-bold tracking-widest text-washi-momiji uppercase">
        宿泊予約一覧 · 7 CONFIRMED HOTELS (13 NIGHTS)
      </span>
      <h2 class="mt-1 font-serif text-2xl font-bold text-washi-ink">
        Accommodations & Station Exit Cheat Sheet
      </h2>
      <p class="mt-0.5 text-xs text-washi-umber">
        Check-out is strictly 10:00 AM at all properties. All inter-city transits are timed to
        arrive at check-in.
      </p>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <article
        v-for="(stay, idx) in staysData"
        :key="stay.id"
        class="washi-tape flex flex-col justify-between rounded-xl border border-washi-border bg-[#FAF6EE] p-5 shadow-xs"
      >
        <div>
          <div
            class="flex items-center justify-between gap-2 border-b border-washi-border/80 pb-2.5"
          >
            <span class="font-mono text-xs font-bold text-washi-momiji">
              STAY #{{ idx + 1 }} · {{ stay.dates }} ({{ stay.nights }})
            </span>
            <span
              class="rounded bg-washi-ink px-2 py-0.5 font-mono text-[11px] font-semibold text-[#FAF6EE]"
            >
              {{ stay.city }}
            </span>
          </div>

          <h3 class="mt-3 font-serif text-xl font-bold text-washi-ink">
            {{ stay.name }}
          </h3>

          <div class="mt-3 flex flex-wrap gap-2 font-mono text-xs">
            <span
              class="rounded border border-[#9BC1AE] bg-washi-jrgreen px-2.5 py-1 font-semibold text-washi-jrink"
            >
              Check-In: {{ stay.checkIn }}
            </span>
            <span
              class="rounded border border-washi-momiji/40 bg-washi-momiji/10 px-2.5 py-1 font-semibold text-washi-momiji"
            >
              Check-Out: 10:00
            </span>
          </div>

          <div
            class="mt-4 space-y-2 rounded-lg border border-washi-border/80 bg-washi-warm/60 p-3 text-xs"
          >
            <div>
              <strong class="font-mono text-washi-jrink">🚉 NEAREST STATION:</strong>
              <span class="ml-1 text-washi-ink">{{ stay.station }}</span>
            </div>
            <div>
              <strong class="font-mono text-washi-umber">🚶 WALK & EXIT:</strong>
              <span class="ml-1 text-washi-umber">{{ stay.walkNote }}</span>
            </div>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-between border-t border-washi-border/70 pt-3">
          <span class="hanko-seal rounded px-2 py-0.5 text-[10px]">宿泊確認済</span>
          <a
            :href="stay.mapUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 rounded-full bg-washi-ink px-3.5 py-1.5 font-mono text-xs font-semibold text-[#FAF6EE] transition hover:bg-washi-momiji"
          >
            <i class="ph-fill ph-map-pin"></i>
            <span>Open Google Maps ↗</span>
          </a>
        </div>
      </article>
    </div>
  </section>
</template>
