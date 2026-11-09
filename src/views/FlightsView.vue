<script setup lang="ts">
import { flightsData } from '@/data/bookings'
</script>

<template>
  <section class="space-y-5">
    <div class="rounded-xl border border-washi-border bg-washi-warm/75 p-5">
      <span class="font-mono text-xs font-bold tracking-widest text-washi-momiji uppercase">
        航空搭乗券 · CONFIRMED AIR INDIA SECTORS
      </span>
      <h2 class="mt-1 font-serif text-2xl font-bold text-washi-ink">
        Boarding Passes & Terminal Transfer Notes ({{ flightsData.length }} Legs)
      </h2>
      <p class="mt-0.5 text-xs text-washi-umber">
        Outbound via Mumbai Terminal 2 (Nov 16) · Return via Delhi Terminal 3 Self-Transfer (Nov
        30).
      </p>
    </div>

    <div class="space-y-4">
      <article
        v-for="flight in flightsData"
        :key="flight.id"
        class="ticket-stub overflow-hidden rounded-xl border border-washi-border bg-[#FAF6EE] shadow-xs"
      >
        <!-- Top Strip -->
        <div
          class="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-washi-border bg-[#2B2520] px-5 py-2.5 text-[#FAF6EE]"
        >
          <div class="flex items-center gap-2 font-mono text-xs font-bold">
            <i class="ph-fill ph-airplane-tilt text-washi-persimmon"></i>
            <span>AIR INDIA · {{ flight.flightNo }}</span>
          </div>
          <div class="flex items-center gap-2 font-mono text-xs">
            <span class="rounded bg-washi-momiji px-2 py-0.5 text-[11px] font-semibold">
              {{ flight.direction }}
            </span>
            <span>{{ flight.date }}</span>
          </div>
        </div>

        <!-- Body -->
        <div class="grid gap-4 p-5 md:grid-cols-12 md:items-center">
          <div class="md:col-span-8">
            <div class="flex items-center justify-between gap-4">
              <div>
                <div class="font-mono text-xs text-washi-umber">DEPARTURE</div>
                <div class="font-serif text-2xl font-bold text-washi-ink">{{ flight.from }}</div>
                <div class="font-mono text-sm font-bold text-washi-momiji">
                  {{ flight.depTime }}
                </div>
              </div>

              <div class="flex flex-1 flex-col items-center px-3">
                <div class="my-1 flex w-full items-center">
                  <span class="h-2 w-2 rounded-full bg-washi-momiji"></span>
                  <span class="h-px flex-1 border-t-2 border-dashed border-washi-momiji"></span>
                  <i class="ph-fill ph-airplane-in-flight mx-1.5 text-lg text-washi-momiji"></i>
                  <span class="h-px flex-1 border-t-2 border-dashed border-washi-momiji"></span>
                  <span class="h-2 w-2 rounded-full bg-washi-jrink"></span>
                </div>
                <span class="font-mono text-[11px] text-washi-umber">{{ flight.statusNote }}</span>
              </div>

              <div class="text-right">
                <div class="font-mono text-xs text-washi-umber">ARRIVAL</div>
                <div class="font-serif text-2xl font-bold text-washi-ink">{{ flight.to }}</div>
                <div class="font-mono text-sm font-bold text-washi-jrink">{{ flight.arrTime }}</div>
              </div>
            </div>
          </div>

          <!-- Right Perforated Layover Note -->
          <div
            class="border-t border-dashed border-washi-border pt-3 md:col-span-4 md:border-t-0 md:border-l md:pl-5 md:pt-0"
          >
            <div class="flex items-center justify-between">
              <span class="font-mono text-[11px] font-bold text-washi-momiji uppercase">
                TRANSIT & BAGGAGE NOTE
              </span>
              <span class="hanko-seal rounded px-1.5 py-0.5 text-[10px]">予約済</span>
            </div>
            <p class="mt-1.5 text-xs leading-relaxed text-washi-umber">
              {{ flight.layoverAlert }}
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
