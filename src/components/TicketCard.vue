<script setup lang="ts">
import type { Ticket } from '@/types'

defineProps<{
  ticket: Ticket
}>()
</script>

<template>
  <article
    class="ticket-stub relative flex flex-col justify-between overflow-hidden rounded-xl border border-washi-border bg-[#FAF6EE] p-5 shadow-xs transition hover:border-washi-momiji/60"
  >
    <div>
      <!-- Top Stub Bar -->
      <div
        class="flex items-center justify-between gap-2 border-b border-dashed border-washi-border pb-3"
      >
        <span class="font-mono text-xs font-bold tracking-wider text-washi-momiji uppercase">
          🎟️ {{ ticket.date }} · {{ ticket.time }}
        </span>
        <span
          class="rounded border border-[#9BC1AE] bg-washi-jrgreen px-2 py-0.5 font-mono text-[11px] font-semibold text-washi-jrink"
        >
          {{ ticket.bookedOn }}
        </span>
      </div>

      <!-- Title & Hanko -->
      <div class="mt-3 flex items-start justify-between gap-3">
        <div>
          <h3 class="font-serif text-xl font-bold text-washi-ink">
            {{ ticket.name }}
          </h3>
          <p class="mt-0.5 font-mono text-xs font-semibold text-washi-persimmon">
            Timed Entry: {{ ticket.time }} JST
          </p>
        </div>
        <span class="hanko-seal shrink-0 rounded px-2 py-0.5 text-[11px]">入場券</span>
      </div>

      <p
        class="mt-3 rounded-lg border border-washi-border/80 bg-washi-warm/60 p-3 text-xs leading-relaxed text-washi-umber"
      >
        {{ ticket.notes }}
      </p>
    </div>

    <div class="mt-4 flex items-center justify-between border-t border-washi-border/70 pt-3">
      <span class="font-mono text-[11px] text-washi-umber">CONFIRMED VOUCHER</span>
      <a
        :href="ticket.url"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 rounded-full bg-washi-momiji px-3.5 py-1.5 font-mono text-xs font-semibold text-white transition hover:opacity-90"
      >
        <i class="ph-fill ph-map-pin"></i>
        <span>Open Location ↗</span>
      </a>
    </div>
  </article>
</template>
