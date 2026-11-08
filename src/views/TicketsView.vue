<script setup lang="ts">
import { ref, computed } from 'vue'
import type { BookingCategoryKey } from '@/types'
import { ticketsData, bookingCategories, buildUnifiedBookings } from '@/data/bookings'
import TicketCard from '@/components/TicketCard.vue'

const selectedCategories = ref<BookingCategoryKey[]>(['flights', 'stays', 'transports', 'tickets'])

function toggleCategory(key: BookingCategoryKey) {
  const idx = selectedCategories.value.indexOf(key)
  if (idx >= 0) {
    selectedCategories.value.splice(idx, 1)
  } else {
    selectedCategories.value.push(key)
  }
}

function selectAll() {
  selectedCategories.value = ['flights', 'stays', 'transports', 'tickets']
}

const unifiedList = computed(() => buildUnifiedBookings(selectedCategories.value))
</script>

<template>
  <section class="space-y-8">
    <!-- Section 1: Timed-Entry Attraction Vouchers -->
    <div class="space-y-4">
      <div class="rounded-xl border border-washi-border bg-washi-warm/75 p-5">
        <span class="font-mono text-xs font-bold tracking-widest text-washi-momiji uppercase">
          施設入場券 · TIMED-ENTRY VOUCHERS
        </span>
        <h2 class="mt-1 font-serif text-2xl font-bold text-washi-ink">
          Booked Attraction Tickets ({{ ticketsData.length }})
        </h2>
        <p class="mt-0.5 text-xs text-washi-umber">
          Includes Tokyo Skytree (Nov 17), Shibuya SKY (Nov 19 — max 20m delay!), Gion Corner (Nov
          21), and teamLab Borderless (Nov 28).
        </p>
      </div>

      <div class="grid gap-5 md:grid-cols-2">
        <TicketCard v-for="tk in ticketsData" :key="tk.id" :ticket="tk" />
      </div>
    </div>

    <!-- Section 2: Multi-Select Master Chronological Filter -->
    <div class="rounded-xl border border-washi-border bg-[#FAF6EE] p-5 shadow-xs">
      <div
        class="flex flex-wrap items-center justify-between gap-3 border-b border-washi-border pb-4"
      >
        <div>
          <span class="font-mono text-xs font-bold text-washi-momiji uppercase">
            MULTI-SELECT DISPATCH FILTER
          </span>
          <h3 class="font-serif text-xl font-bold text-washi-ink">
            Chronological Master Ledger ({{ unifiedList.length }} Items)
          </h3>
        </div>

        <!-- Multi-Select Category Toggles -->
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="cat in bookingCategories"
            :key="cat.key"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs transition"
            :class="
              selectedCategories.includes(cat.key)
                ? 'border-washi-momiji bg-washi-momiji font-semibold text-white'
                : 'border-washi-border bg-washi-warm text-washi-umber hover:text-washi-ink'
            "
            @click="toggleCategory(cat.key)"
          >
            <span>{{ cat.label }}</span>
            <span class="rounded-full bg-black/15 px-1.5 text-[10px]">{{ cat.count }}</span>
          </button>

          <button
            type="button"
            class="font-mono text-xs underline text-washi-umber hover:text-washi-ink"
            @click="selectAll"
          >
            Select All
          </button>
        </div>
      </div>

      <!-- Unified Sorted List -->
      <div class="mt-3 divide-y divide-washi-border/70">
        <div
          v-for="(item, idx) in unifiedList"
          :key="idx"
          class="flex flex-wrap items-center justify-between gap-3 py-3 text-xs sm:text-sm"
        >
          <div class="flex flex-wrap items-center gap-2.5">
            <span
              class="w-24 shrink-0 rounded border border-washi-border bg-washi-warm px-2 py-0.5 text-center font-mono text-xs font-semibold text-washi-ink"
            >
              {{ item.typeLabel }}
            </span>
            <span class="font-mono text-xs font-bold text-washi-momiji">
              {{ item.date }} · {{ item.time }}
            </span>
            <span class="font-serif font-bold text-washi-ink">
              {{ item.title }}
            </span>
          </div>

          <div class="flex items-center gap-3">
            <span
              v-if="item.highlight"
              class="rounded bg-washi-jrgreen px-2 py-0.5 font-mono text-xs font-medium text-washi-jrink"
            >
              {{ item.highlight }}
            </span>
            <a
              v-if="item.link"
              :href="item.link"
              target="_blank"
              rel="noopener noreferrer"
              class="font-mono text-xs font-semibold text-washi-momiji underline"
            >
              Map ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
