<script setup lang="ts">
import { transportsData } from '@/data/bookings'
</script>

<template>
  <section class="space-y-5">
    <div class="rounded-xl border border-washi-border bg-washi-warm/75 p-5">
      <span class="font-mono text-xs font-bold tracking-widest text-washi-jrink uppercase">
        指定席特急券 · RESERVED RAIL, BUS & JR-WEST PASS
      </span>
      <h2 class="mt-1 font-serif text-2xl font-bold text-washi-ink">
        Reserved Shinkansen, Limited Express & Highway Bus Slips ({{ transportsData.length }})
      </h2>
      <p class="mt-0.5 text-xs text-washi-umber">
        Authentic JR Midori-no-Kenbaiki seat slips with Car & Window Seat numbers.
      </p>
    </div>

    <div class="space-y-4">
      <article
        v-for="tr in transportsData"
        :key="tr.id"
        class="ticket-stub jr-ticket-paper rounded-xl border-2 border-[#9BC1AE] bg-washi-jrgreen/70 p-5 shadow-xs"
      >
        <div
          class="flex flex-wrap items-center justify-between gap-2 border-b border-[#9BC1AE] pb-2.5"
        >
          <div class="flex items-center gap-2">
            <span
              class="rounded bg-washi-jrink px-2.5 py-0.5 font-mono text-xs font-bold text-white"
            >
              {{ tr.trainName }}
            </span>
            <span class="font-mono text-xs font-bold text-washi-ink">
              {{ tr.date }} · {{ tr.time }}
            </span>
          </div>
          <span class="font-mono text-xs font-semibold text-washi-jrink">
            Booked on {{ tr.bookedOn }}
          </span>
        </div>

        <div class="mt-3 grid gap-4 md:grid-cols-12 md:items-center">
          <div class="md:col-span-8">
            <div class="font-serif text-lg font-bold text-washi-ink sm:text-xl">
              {{ tr.route }}
            </div>
            <p
              class="mt-2 rounded-lg border border-[#9BC1AE] bg-[#FAF6EE]/90 p-3 text-xs leading-relaxed text-washi-umber"
            >
              {{ tr.notes }}
            </p>
          </div>

          <div class="rounded-lg border border-[#9BC1AE] bg-[#FAF6EE] p-3.5 md:col-span-4">
            <div class="font-mono text-[10px] text-washi-umber uppercase">CAR & RESERVED SEATS</div>
            <div class="mt-1 font-serif text-base font-bold text-washi-momiji">
              {{ tr.carAndSeats }}
            </div>
            <div
              class="mt-2 flex items-center justify-between border-t border-dashed border-washi-border pt-2"
            >
              <span class="font-mono text-[10px] text-washi-jrink">JR MAGNETIC PASS</span>
              <span class="hanko-seal rounded px-1.5 py-0.5 text-[10px]">指定席</span>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
