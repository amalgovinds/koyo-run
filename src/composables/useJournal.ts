import { computed, ref, watch } from 'vue'
import type { JournalEntry } from '@/types'

const STORAGE_KEY = 'koyo_2026_journal_drafts_v1'

export type JournalSource = 'repo' | 'repo+local' | 'local' | 'empty'

const SOURCE_LABELS: Record<JournalSource, string> = {
  repo: 'Loaded from journal.json',
  'repo+local': 'journal.json + your local edits',
  local: 'Local browser draft',
  empty: 'No journal data yet',
}

// Every plain-text field on a JournalEntry (status is checked separately).
const TEXT_FIELDS = [
  'dayId',
  'dayLabel',
  'dateStr',
  'placeHeading',
  'highlight',
  'moodWeather',
  'steps',
  'content',
] as const satisfies readonly (keyof JournalEntry)[]

function isJournalEntry(value: unknown): value is JournalEntry {
  if (typeof value !== 'object' || value === null) return false
  const e = value as Record<string, unknown>
  return (
    TEXT_FIELDS.every((key) => typeof e[key] === 'string') &&
    (e['status'] === 'draft' || e['status'] === 'published')
  )
}

const isJournalList = (value: unknown): value is JournalEntry[] =>
  Array.isArray(value) && value.every(isJournalEntry)

const sameEntry = (a: JournalEntry, b: JournalEntry): boolean =>
  a.status === b.status && TEXT_FIELDS.every((key) => a[key] === b[key])

// Shared by every component that calls useJournal().
const entries = ref<JournalEntry[]>([])
const source = ref<JournalSource>('empty')
const sourceLabel = computed(() => SOURCE_LABELS[source.value])

// Untouched copy of public/journal.json, used to work out which entries you edited.
let baseline: JournalEntry[] = []

async function fetchRepoJournal(): Promise<JournalEntry[] | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}journal.json`, { cache: 'no-store' })
    if (!res.ok) return null
    // If the file is missing, the dev server may answer with index.html; json() then throws.
    const data: unknown = await res.json()
    return isJournalList(data) ? data : null
  } catch {
    return null
  }
}

function readDrafts(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) // string | null
    if (!raw) return []
    const data: unknown = JSON.parse(raw)
    return isJournalList(data) ? data : []
  } catch {
    return []
  }
}

// Repo entries first; a local draft replaces the repo entry with the same dayId.
// Drafts for days that are not in the repo file are kept at the end.
function mergeDrafts(base: JournalEntry[], drafts: JournalEntry[]): JournalEntry[] {
  const draftById = new Map(drafts.map((d) => [d.dayId, d]))
  const baseIds = new Set(base.map((b) => b.dayId))
  return [
    ...base.map((b) => draftById.get(b.dayId) ?? b),
    ...drafts.filter((d) => !baseIds.has(d.dayId)),
  ]
}

// Persist only the entries that differ from journal.json. That way, days you never
// touched keep following the repo file when you update it.
function saveDrafts(): void {
  const changed = entries.value.filter((entry) => {
    const original = baseline.find((b) => b.dayId === entry.dayId)
    return !original || !sameEntry(original, entry)
  })
  try {
    if (changed.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(changed))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage can be full or blocked (private mode); edits then live in memory only.
  }
}

// Registered once at module level, not inside useJournal(), so it is not duplicated per caller.
watch(entries, saveDrafts, { deep: true })

async function load(): Promise<void> {
  const repo = await fetchRepoJournal()
  const drafts = readDrafts()

  baseline = repo ? structuredClone(repo) : []
  entries.value = mergeDrafts(repo ?? [], drafts)

  if (repo) source.value = drafts.length > 0 ? 'repo+local' : 'repo'
  else source.value = drafts.length > 0 ? 'local' : 'empty'
}

// Throw away local edits and go back to exactly what is in journal.json.
async function discardDrafts(): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to remove if storage is unavailable.
  }
  await load()
}

export function useJournal() {
  return { entries, source, sourceLabel, load, discardDrafts }
}
