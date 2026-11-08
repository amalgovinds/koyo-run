<script setup lang="ts">
import { computed } from 'vue'
import type { Checkpoint } from '@/types'
import { getCheckpointStyle } from '@/data/checkpointStyles'

const props = defineProps<{
  checkpoint: Checkpoint
  active?: boolean
  done?: boolean
}>()

const styleInfo = computed(() => getCheckpointStyle(props.checkpoint.type))
</script>

<template>
  <div
    class="group relative flex flex-col gap-2 border-b border-washi-border/70 py-3.5 pl-3 transition-colors sm:flex-row sm:items-start sm:gap-4"
    :class="{
      'rounded-r-lg border-l-4 border-l-washi-momiji bg-[#F5E6D3]/65 pr-3': active,
      'opacity-65 hover:opacity-100': done && !active,
    }"
  >
    <!-- Time & Status Column -->
    <div class="flex shrink-0 items-center gap-2 sm:w-40 sm:flex-col sm:items-start sm:gap-1">
      <div class="flex items-center gap-1.5 font-mono text-xs font-bold text-washi-ink sm:text-sm">
        <span class="inline-block h-2.5 w-2.5 rounded-full" :class="styleInfo.dot"></span>
        <span>{{ checkpoint.time }}</span>
      </div>

      <span
        v-if="active"
        class="inline-flex items-center gap-1 rounded bg-washi-momiji px-1.5 py-0.5 font-mono text-[10px] font-bold text-white animate-pulse"
      >
        ● NOW ACTIVE
      </span>
      <span
        v-else-if="done"
        class="inline-flex items-center gap-1 rounded border border-[#9BC1AE] bg-washi-jrgreen px-1.5 py-0.5 font-mono text-[10px] font-semibold text-washi-jrink"
      >
        済 COMPLETED
      </span>
    </div>

    <!-- Content Column -->
    <div class="min-w-0 flex-1 space-y-1">
      <div class="flex flex-wrap items-center gap-1.5">
        <span
          class="inline-flex items-center rounded px-2 py-0.5 font-mono text-[11px] font-medium"
          :class="styleInfo.badge"
        >
          {{ styleInfo.label }}
        </span>

        <span
          v-if="checkpoint.bookingTag"
          class="inline-flex items-center rounded border border-washi-momiji/40 bg-washi-momiji/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-washi-momiji"
        >
          🎟️ {{ checkpoint.bookingTag }}
        </span>
      </div>

      <h4
        class="font-serif text-base font-bold text-washi-ink"
        :class="{ 'line-through decoration-washi-momiji/40': done && !active }"
      >
        {{ checkpoint.title }}
      </h4>

      <p class="text-xs leading-relaxed text-washi-umber sm:text-sm">
        {{ checkpoint.desc }}
      </p>
    </div>
  </div>
</template>
