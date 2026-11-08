<script setup lang="ts">
import { onMounted } from 'vue'
import { useJournal } from '@/composables/useJournal'
import { useToast } from '@/composables/useToast'

const { entries, sourceLabel, load, discardDrafts } = useJournal()
const { toastMessage, showToast } = useToast()

onMounted(() => {
  if (entries.value.length === 0) {
    load()
  }
})

async function copyRepoJson() {
  try {
    await navigator.clipboard.writeText(JSON.stringify(entries.value, null, 2))
    showToast('Copied public/journal.json to clipboard!')
  } catch {
    showToast('Clipboard blocked — use Download journal.json instead.')
  }
}

function downloadRepoJson() {
  const blob = new Blob([JSON.stringify(entries.value, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'journal.json'
  a.click()
  URL.revokeObjectURL(url)
  showToast('Downloaded journal.json — commit to public/journal.json!')
}

async function handleDiscard() {
  await discardDrafts()
  showToast('Local drafts discarded; reloaded public/journal.json.')
}
</script>

<template>
  <section class="space-y-6">
    <!-- Toast Notification Banner -->
    <div
      v-if="toastMessage"
      class="fixed right-5 bottom-5 z-50 rounded-xl border-2 border-washi-momiji bg-[#2B2520] px-4 py-2.5 font-mono text-xs font-semibold text-[#FAF6EE] shadow-lg"
    >
      🍁 {{ toastMessage }}
    </div>

    <!-- Header & Repo Sync Controls -->
    <div class="rounded-xl border border-washi-border bg-washi-warm/75 p-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span class="font-mono text-xs font-bold tracking-widest text-washi-momiji uppercase">
            御朱印帳・旅日記 · STATIC REPO TRAVELOGUE
          </span>
          <h2 class="mt-1 font-serif text-2xl font-bold text-washi-ink">
            Daily Field Journal ({{ entries.length }} Days)
          </h2>
          <p class="mt-0.5 text-xs text-washi-umber">
            Source: <strong class="font-mono text-washi-jrink">{{ sourceLabel }}</strong> · Commit
            exported
            <code class="rounded bg-[#FAF6EE] px-1.5 py-0.5 font-mono">public/journal.json</code> to
            update on GitHub Pages / Vercel deploy.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="rounded-lg bg-washi-momiji px-3 py-1.5 font-mono text-xs font-semibold text-white hover:opacity-90"
            @click="copyRepoJson"
          >
            Copy journal.json
          </button>
          <button
            type="button"
            class="rounded-lg bg-washi-ink px-3 py-1.5 font-mono text-xs font-semibold text-[#FAF6EE] hover:opacity-90"
            @click="downloadRepoJson"
          >
            Download journal.json
          </button>
          <button
            type="button"
            class="rounded-lg border border-washi-border bg-[#FAF6EE] px-3 py-1.5 font-mono text-xs text-washi-umber hover:border-washi-momiji hover:text-washi-ink"
            @click="handleDiscard"
          >
            Reset Local Edits
          </button>
        </div>
      </div>
    </div>

    <!-- Journal Day Entries -->
    <div class="space-y-5">
      <article
        v-for="entry in entries"
        :key="entry.dayId"
        class="rounded-xl border border-washi-border bg-[#FAF6EE] p-5 shadow-xs"
      >
        <!-- Required Heading: Day and Place -->
        <div
          class="flex flex-wrap items-center justify-between gap-2 border-b border-washi-border pb-3"
        >
          <div>
            <span class="font-mono text-xs font-bold text-washi-momiji">
              {{ entry.dayLabel }} · {{ entry.dateStr }}
            </span>
            <h3 class="font-serif text-xl font-bold text-washi-ink">
              {{ entry.placeHeading }}
            </h3>
          </div>

          <select
            v-model="entry.status"
            class="rounded-full border border-washi-border bg-washi-warm px-3 py-1 font-mono text-xs font-semibold text-washi-ink"
          >
            <option value="draft">📝 Draft</option>
            <option value="published">済 Published</option>
          </select>
        </div>

        <!-- Metadata Row -->
        <div class="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <label class="block font-mono text-[11px] text-washi-umber uppercase">
              Highlight of the Day
            </label>
            <input
              v-model="entry.highlight"
              type="text"
              placeholder="e.g., Sunset from Shibuya SKY"
              class="mt-1 w-full rounded-lg border border-washi-border bg-washi-warm/50 px-3 py-1.5 text-xs text-washi-ink focus:border-washi-momiji focus:outline-none"
            />
          </div>

          <div>
            <label class="block font-mono text-[11px] text-washi-umber uppercase">
              Mood & Weather
            </label>
            <input
              v-model="entry.moodWeather"
              type="text"
              placeholder="e.g., 16°C Crisp & Clear"
              class="mt-1 w-full rounded-lg border border-washi-border bg-washi-warm/50 px-3 py-1.5 text-xs text-washi-ink focus:border-washi-momiji focus:outline-none"
            />
          </div>

          <div>
            <label class="block font-mono text-[11px] text-washi-umber uppercase">
              Steps / Distance
            </label>
            <input
              v-model="entry.steps"
              type="text"
              placeholder="e.g., 21,400 steps"
              class="mt-1 w-full rounded-lg border border-washi-border bg-washi-warm/50 px-3 py-1.5 text-xs text-washi-ink focus:border-washi-momiji focus:outline-none"
            />
          </div>
        </div>

        <!-- Ruled Notebook Textarea -->
        <div class="mt-4">
          <label class="block font-mono text-[11px] text-washi-umber uppercase">
            Field Notes & Memories
          </label>
          <textarea
            v-model="entry.content"
            rows="4"
            placeholder="Record your memories, train snacks, stamp locations, and autumn foliage notes..."
            class="journal-ruled mt-1 w-full rounded-lg border border-washi-border bg-[#FAF6EE] p-3 text-sm leading-7 text-washi-ink focus:border-washi-momiji focus:outline-none"
          ></textarea>
        </div>
      </article>
    </div>
  </section>
</template>
