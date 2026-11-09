<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useJournal } from '@/composables/useJournal'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const { entries, sourceLabel, load, discardDrafts } = useJournal()
const { showToast } = useToast()

const selectedDayId = ref('day1')
const lastSaved = ref('')

// Deep link from the Today view: #/journal?day=day3
watch(
  () => route.query.day,
  (day) => {
    if (typeof day === 'string') selectedDayId.value = day
  },
  { immediate: true },
)

const activeEntry = computed(
  () => entries.value.find((e) => e.dayId === selectedDayId.value) ?? entries.value[0],
)

onMounted(() => {
  void load()
})

// useJournal saves edits to localStorage automatically; this only updates the label.
function touch(): void {
  lastSaved.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const journalJson = (): string => JSON.stringify(entries.value, null, 2)

function downloadFile(filename: string, content: string, mimeType: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function copyJson(): Promise<void> {
  try {
    await navigator.clipboard.writeText(journalJson())
    showToast('Copied journal.json to clipboard! Commit it to public/journal.json in your repo.')
  } catch {
    showToast('Clipboard unavailable here. Use the Download button instead.')
  }
}

function downloadJson(): void {
  downloadFile('journal.json', journalJson(), 'application/json')
  showToast(
    'Downloaded journal.json. Replace public/journal.json in your repo with it, then redeploy.',
  )
}

function downloadMarkdown(): void {
  let md = '# Japan Autumn (Koyo) Field Journal (Nov 16 – Dec 1, 2026)\n\n'
  for (const e of entries.value) {
    md += `## ${e.dayLabel} (${e.dateStr}) — ${e.placeHeading}\n`
    md += `- **Highlight:** ${e.highlight} | **Weather:** ${e.moodWeather} | **Steps:** ${e.steps}\n\n`
    md += `${e.content}\n\n---\n\n`
  }
  downloadFile('JOURNAL.md', md, 'text/markdown')
  showToast('Exported JOURNAL.md!')
}

async function resetToRepo(): Promise<void> {
  if (!window.confirm('Discard all local edits and go back to journal.json?')) return
  await discardDrafts()
  showToast('Local edits discarded. Showing journal.json.')
}
</script>

<template>
  <section class="space-y-8">
    <!-- Header -->
    <div
      class="flex flex-col justify-between gap-4 border-b border-washi-border pb-5 lg:flex-row lg:items-end"
    >
      <div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-mono text-xs font-bold tracking-widest text-washi-momiji uppercase"
            >Goshuincho travelogue</span
          >
          <span
            class="rounded-full bg-washi-warm px-2.5 py-0.5 font-mono text-[11px] text-washi-umber"
            >{{ sourceLabel }}</span
          >
        </div>
        <h2 class="mt-1 font-serif text-2xl font-extrabold text-washi-ink sm:text-4xl">
          Daily Field Journal
        </h2>
        <p class="mt-1 text-xs text-washi-umber sm:text-sm">
          Headed by <strong>Day &amp; Place</strong>. Starts from <code>public/journal.json</code>;
          your edits are kept in this browser on top of it.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-full bg-washi-momiji px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-washi-ink"
          @click="copyJson"
        >
          <i class="ph-bold ph-copy" aria-hidden="true"></i> Copy journal.json
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-full border border-washi-border bg-[#FFFDF9] px-3.5 py-2 text-xs font-semibold text-washi-ink transition hover:bg-washi-warm"
          @click="downloadJson"
        >
          <i class="ph-bold ph-download-simple" aria-hidden="true"></i> Download journal.json
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-full border border-washi-border bg-[#FFFDF9] px-3.5 py-2 text-xs font-semibold text-washi-umber transition hover:bg-washi-warm"
          @click="downloadMarkdown"
        >
          <i class="ph-bold ph-file-md" aria-hidden="true"></i> Export .MD
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-full border border-washi-border bg-[#FFFDF9] px-3.5 py-2 text-xs font-semibold text-washi-umber transition hover:border-washi-momiji hover:text-washi-momiji"
          @click="resetToRepo"
        >
          <i class="ph-bold ph-arrow-counter-clockwise" aria-hidden="true"></i> Discard local edits
        </button>
      </div>
    </div>

    <p
      v-if="entries.length === 0"
      class="rounded-2xl border border-washi-border bg-[#FFFDF9] p-6 text-sm text-washi-umber"
    >
      No journal entries yet. Add <code>public/journal.json</code> to your project and reload.
    </p>

    <!-- Open goshuincho book -->
    <div v-else class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
      <!-- Day and place index -->
      <div class="max-h-[70vh] space-y-1.5 overflow-y-auto pr-1 lg:col-span-4">
        <button
          v-for="entry in entries"
          :key="entry.dayId"
          type="button"
          class="flex w-full items-start justify-between gap-2 rounded-2xl px-4 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-washi-momiji"
          :class="
            selectedDayId === entry.dayId
              ? 'bg-washi-ink text-[#FAF6EE] shadow-sm'
              : 'border border-washi-border/80 bg-[#FFFDF9] text-washi-ink hover:bg-washi-warm'
          "
          @click="selectedDayId = entry.dayId"
        >
          <div>
            <div class="font-mono text-[11px] opacity-75">
              {{ entry.dayLabel }} · {{ entry.dateStr }}
            </div>
            <div class="mt-0.5 font-serif text-sm font-bold">{{ entry.placeHeading }}</div>
          </div>
          <span
            class="shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px]"
            :class="
              selectedDayId === entry.dayId
                ? 'bg-white/20 text-white'
                : 'bg-washi-warm text-washi-umber'
            "
          >
            {{ entry.status === 'published' ? '済' : '筆' }}
          </span>
        </button>
      </div>

      <!-- Ruled page editor -->
      <div
        v-if="activeEntry"
        class="space-y-5 rounded-3xl border border-washi-border bg-[#FFFDF8] p-6 shadow-sm sm:p-8 lg:col-span-8"
      >
        <div
          class="flex flex-col justify-between gap-3 border-b-2 border-washi-ink pb-4 sm:flex-row sm:items-start"
        >
          <div>
            <div class="font-mono text-xs font-bold tracking-widest text-washi-momiji uppercase">
              {{ activeEntry.dateStr }} · Field dispatch
            </div>
            <h3 class="mt-1 font-serif text-xl font-extrabold text-washi-ink sm:text-3xl">
              {{ activeEntry.dayLabel }} — {{ activeEntry.placeHeading }}
            </h3>
          </div>
          <select
            v-model="activeEntry.status"
            aria-label="Entry status"
            class="rounded-full border border-washi-border bg-washi-warm px-3 py-1 text-xs font-semibold text-washi-ink"
            @change="touch"
          >
            <option value="draft">筆 Draft</option>
            <option value="published">済 Published</option>
          </select>
        </div>

        <div
          class="grid grid-cols-1 gap-4 border-b border-dashed border-washi-border pb-4 text-xs sm:grid-cols-3"
        >
          <div>
            <label for="j-highlight" class="block font-mono text-[10px] text-washi-bark uppercase"
              >🌟 Peak Highlight</label
            >
            <input
              id="j-highlight"
              v-model="activeEntry.highlight"
              type="text"
              class="w-full border-b border-transparent bg-transparent py-1 font-semibold text-washi-ink focus:border-washi-momiji focus:outline-none"
              @input="touch"
            />
          </div>
          <div>
            <label for="j-mood" class="block font-mono text-[10px] text-washi-bark uppercase"
              >🍁 Foliage &amp; Weather</label
            >
            <input
              id="j-mood"
              v-model="activeEntry.moodWeather"
              type="text"
              class="w-full border-b border-transparent bg-transparent py-1 font-semibold text-washi-ink focus:border-washi-momiji focus:outline-none"
              @input="touch"
            />
          </div>
          <div>
            <label for="j-steps" class="block font-mono text-[10px] text-washi-bark uppercase"
              >👣 Steps Walked</label
            >
            <input
              id="j-steps"
              v-model="activeEntry.steps"
              type="text"
              class="w-full border-b border-transparent bg-transparent py-1 font-semibold text-washi-ink focus:border-washi-momiji focus:outline-none"
              @input="touch"
            />
          </div>
        </div>

        <div>
          <label for="j-content" class="sr-only">Journal entry</label>
          <textarea
            id="j-content"
            v-model="activeEntry.content"
            rows="9"
            placeholder="Record your daily impressions, temple stamps, ramen bowls, and autumn foliage scenes..."
            class="notebook-ruled w-full resize-y px-2 font-serif text-sm text-washi-ink focus:outline-none sm:text-base"
            @input="touch"
          ></textarea>
          <div class="flex items-center justify-between pt-2 font-mono text-[11px] text-washi-bark">
            <span
              >Download journal.json and commit it to <code>public/</code> to publish
              permanently</span
            >
            <span v-if="lastSaved">Saved locally at {{ lastSaved }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
