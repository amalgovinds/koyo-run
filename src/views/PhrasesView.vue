<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { phraseCategories, phrasesData, stationKanjiList } from '@/data/phrases'
import { useToast } from '@/composables/useToast'
import type { KanjiSign, PhraseCategoryKey, PhraseItem } from '@/types'

const { showToast } = useToast()

const selectedCategory = ref<PhraseCategoryKey | 'all'>('all')
const searchQuery = ref('')
const activeShowCard = ref<PhraseItem | null>(null)
const speakingId = ref<string | null>(null)
const speakingSpeed = ref<'normal' | 'slow' | null>(null)

// Web Speech API voice management
const availableJaVoices = ref<SpeechSynthesisVoice[]>([])
const selectedVoiceURI = ref<string>('')
let speakTimeout: number | undefined
let currentAudio: HTMLAudioElement | null = null

/**
 * Scores Japanese voices so natural/neural voices ("Google 日本語", "Nanami",
 * "Enhanced", "Premium", "O-Ren", "Siri") always beat compact robotic OS voices.
 */
function scoreJapaneseVoice(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase()
  let score = 0
  if (name.includes('natural') || name.includes('neural')) score += 100
  if (name.includes('google') && v.lang.startsWith('ja')) score += 90
  if (name.includes('nanami') || name.includes('keita')) score += 85
  if (name.includes('enhanced') || name.includes('premium') || name.includes('siri')) score += 80
  if (name.includes('o-ren') || name.includes('hattori')) score += 60
  if (name.includes('kyoko') || name.includes('otoya')) score += 40
  if (!v.localService) score += 25 // Cloud/network voices are much smoother in Chrome/Edge
  return score
}

function loadJapaneseVoices(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  const all = window.speechSynthesis.getVoices()
  const jaList = all
    .filter((v) => v.lang.toLowerCase().startsWith('ja'))
    .sort((a, b) => scoreJapaneseVoice(b) - scoreJapaneseVoice(a))

  availableJaVoices.value = jaList
  const best = jaList[0]
  if (best && !selectedVoiceURI.value) {
    selectedVoiceURI.value = best.voiceURI
  }
}

onMounted(() => {
  loadJapaneseVoices()
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.addEventListener('voiceschanged', loadJapaneseVoices)
  }
})

onBeforeUnmount(() => {
  window.clearTimeout(speakTimeout)
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    window.speechSynthesis.removeEventListener('voiceschanged', loadJapaneseVoices)
  }
})

const filteredPhrases = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return phrasesData.filter((p) => {
    const matchesCat = selectedCategory.value === 'all' || p.category === selectedCategory.value
    if (!matchesCat) return false
    if (!q) return true
    return (
      p.english.toLowerCase().includes(q) ||
      p.romaji.toLowerCase().includes(q) ||
      p.japanese.includes(q) ||
      p.hiragana.includes(q) ||
      p.pronunciation.toLowerCase().includes(q)
    )
  })
})

function parseProsody(pronunciation: string) {
  return pronunciation.split(/\s+/).map((word) =>
    word.split('-').map((syl) => ({
      text: syl.toLowerCase(),
      stressed: syl.length > 1 && syl === syl.toUpperCase() && /[A-Z]/.test(syl),
    })),
  )
}

function stopActiveAudio(): void {
  window.clearTimeout(speakTimeout)
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

/**
 * Fallback Web Speech synthesizer using the highest-ranked (or user-selected) Japanese voice.
 */
function speakWithWebSpeech(phrase: PhraseItem, mode: 'normal' | 'slow'): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    speakingId.value = null
    speakingSpeed.value = null
    showToast('Speech synthesis is not supported in this browser.')
    return
  }

  speakTimeout = window.setTimeout(() => {
    const textToSpeak =
      mode === 'slow' ? phrase.hiragana.replace(/([はをにでがも、])/g, '$1、 ') : phrase.japanese

    const utter = new SpeechSynthesisUtterance(textToSpeak)
    utter.lang = 'ja-JP'
    utter.rate = mode === 'slow' ? 0.55 : 0.92
    utter.pitch = 1.02

    const chosen =
      availableJaVoices.value.find((v) => v.voiceURI === selectedVoiceURI.value) ??
      availableJaVoices.value[0]
    if (chosen) utter.voice = chosen

    utter.onend = () => {
      speakingId.value = null
      speakingSpeed.value = null
    }
    utter.onerror = () => {
      speakingId.value = null
      speakingSpeed.value = null
    }

    window.speechSynthesis.speak(utter)
  }, 60)
}

/**
 * 1. Tries playing studio neural MP3 from `public/audio/{id}.mp3` (or `{id}-slow.mp3`) if present.
 * 2. Automatically falls back to the ranked Web Speech API voice if the MP3 doesn't exist yet.
 */
function speakJapanese(phrase: PhraseItem, mode: 'normal' | 'slow' = 'normal'): void {
  stopActiveAudio()
  speakingId.value = phrase.id
  speakingSpeed.value = mode

  const suffix = mode === 'slow' ? '-slow' : ''
  const mp3Path = `${import.meta.env.BASE_URL}audio/${phrase.id}${suffix}.mp3`
  const audio = new Audio(mp3Path)
  currentAudio = audio

  let fellBack = false
  const fallback = () => {
    if (fellBack) return
    fellBack = true
    currentAudio = null
    speakWithWebSpeech(phrase, mode)
  }

  audio.onended = () => {
    speakingId.value = null
    speakingSpeed.value = null
    currentAudio = null
  }
  audio.onerror = fallback

  audio.play().catch(fallback)
}

function speakKanji(sign: KanjiSign): void {
  stopActiveAudio()
  speakingId.value = sign.kanji
  speakingSpeed.value = 'normal'

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    speakingId.value = null
    speakingSpeed.value = null
    showToast('Speech synthesis is not supported in this browser.')
    return
  }

  speakTimeout = window.setTimeout(() => {
    // Strip parenthetical Romaji and replace '/' with a natural Japanese comma pause
    const kanaOnly = sign.reading.split('(')[0]?.replace(/\//g, '、').trim() || sign.kanji

    const utter = new SpeechSynthesisUtterance(kanaOnly)
    utter.lang = 'ja-JP'
    utter.rate = 0.85
    utter.pitch = 1.02

    const chosen =
      availableJaVoices.value.find((v) => v.voiceURI === selectedVoiceURI.value) ??
      availableJaVoices.value[0]
    if (chosen) utter.voice = chosen

    utter.onend = () => {
      speakingId.value = null
      speakingSpeed.value = null
    }
    utter.onerror = () => {
      speakingId.value = null
      speakingSpeed.value = null
    }

    window.speechSynthesis.speak(utter)
  }, 60)
}

async function copyPhrase(phrase: PhraseItem): Promise<void> {
  try {
    await navigator.clipboard.writeText(`${phrase.japanese} (${phrase.romaji})`)
    showToast(`Copied: ${phrase.japanese}`)
  } catch {
    showToast(phrase.japanese)
  }
}
</script>

<template>
  <section class="space-y-10">
    <!-- 1. Editorial Header with Autumn Brush Accent -->
    <div class="relative overflow-hidden border-b border-washi-border pb-6">
      <div class="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div
            class="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-washi-momiji uppercase"
          >
            <span>言の葉のしおり · AUTUMN FIELD PHRASEBOOK</span>
          </div>
          <h2
            class="mt-1 font-serif text-3xl font-extrabold tracking-tight text-washi-ink sm:text-4xl"
          >
            Spoken Japanese &amp; Station Kanji
          </h2>
          <p class="mt-1 max-w-2xl text-xs text-washi-umber sm:text-sm">
            Written script, Hiragana reading, and pitch-accent rhythm strips—designed for quick
            glances at Shinkansen gates, ramen counters, and temple receptions.
          </p>
        </div>
      </div>

      <!-- Voice Selector + Search Input -->
      <div class="flex flex-wrap items-center gap-2">
        <div
          v-if="availableJaVoices.length > 0"
          class="inline-flex items-center gap-1.5 rounded-full border border-washi-border bg-[#FFFDF9] px-3 py-1.5 font-mono text-xs text-washi-umber"
        >
          <i class="ph-fill ph-waveform text-washi-momiji" aria-hidden="true"></i>
          <label for="ja-voice-select" class="sr-only">Japanese Voice</label>
          <select
            id="ja-voice-select"
            v-model="selectedVoiceURI"
            class="max-w-44 truncate bg-transparent font-mono text-xs font-semibold text-washi-ink focus:outline-none"
          >
            <option v-for="v in availableJaVoices" :key="v.voiceURI" :value="v.voiceURI">
              {{ v.name }} ({{ v.localService ? 'Offline' : 'Neural' }})
            </option>
          </select>
        </div>

        <div class="relative w-full sm:w-64">
          <i
            class="ph-bold ph-magnifying-glass absolute top-1/2 left-3.5 -translate-y-1/2 text-xs text-washi-bark"
            aria-hidden="true"
          ></i>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search English, Romaji, Kana..."
            class="w-full rounded-full border border-washi-border bg-[#FFFDF9] py-2 pr-4 pl-9 font-mono text-xs text-washi-ink placeholder:text-washi-bark focus:border-washi-momiji focus:outline-none"
          />
        </div>
      </div>

      <!-- Category Filter Pills -->
      <div class="mt-5 flex flex-wrap gap-2">
        <button
          v-for="cat in phraseCategories"
          :key="cat.key"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition"
          :class="
            selectedCategory === cat.key
              ? 'border-washi-momiji bg-washi-momiji font-semibold text-white shadow-xs'
              : 'border-washi-border bg-[#FFFDF9] text-washi-umber hover:border-washi-momiji hover:text-washi-ink'
          "
          @click="selectedCategory = cat.key"
        >
          <i :class="cat.icon" aria-hidden="true"></i>
          <span>{{ cat.label }}</span>
        </button>
      </div>
    </div>

    <!-- 2. Pentagonal Shrine Ema (絵馬) Wooden Plaques for Station & Menu Kanji -->
    <div class="space-y-4">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <span
            class="font-mono text-[11px] font-bold tracking-widest text-washi-persimmon uppercase"
          >
            絵馬札 · WAYFINDING KANJI PLAQUES
          </span>
          <h3 class="font-serif text-xl font-bold text-washi-ink sm:text-2xl">
            8 Essential Characters You Will See Every Day
          </h3>
        </div>
        <span class="font-mono text-xs text-washi-bark">
          Hung like wooden shrine <em>ema</em> plaques
        </span>
      </div>

      <div class="grid grid-cols-2 gap-4 pt-1 sm:grid-cols-4">
        <button
          v-for="sign in stationKanjiList"
          :key="sign.kanji"
          type="button"
          class="ema-plaque group relative cursor-pointer overflow-hidden px-4 pt-7 pb-4 text-center transition-all hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-washi-momiji"
          :class="{
            'ring-2 ring-washi-momiji -translate-y-1': speakingId === sign.kanji,
          }"
          :title="`Click to hear ${sign.kanji} (${sign.reading})`"
          @click="speakKanji(sign)"
        >
          <!-- Giant Faint Watermark Kanji in Background -->
          <span
            class="pointer-events-none absolute -right-2 -bottom-4 font-serif text-7xl font-extrabold text-washi-momiji/7 select-none"
            aria-hidden="true"
          >
            {{ sign.kanji }}
          </span>

          <div class="relative z-10">
            <div
              class="inline-flex items-center justify-center gap-1 font-mono text-[10px] font-bold tracking-wider text-washi-momiji uppercase"
            >
              <i
                class="ph-fill ph-speaker-high text-xs transition-transform group-hover:scale-110"
                :class="{ 'animate-bounce': speakingId === sign.kanji }"
                aria-hidden="true"
              ></i>
              <span>{{ sign.pronunciation }}</span>
            </div>

            <div
              class="mt-1 font-serif text-3xl font-extrabold transition-colors group-hover:text-washi-momiji"
              :class="speakingId === sign.kanji ? 'text-washi-momiji' : 'text-washi-ink'"
            >
              {{ sign.kanji }}
            </div>

            <div class="mt-0.5 font-mono text-[11px] text-washi-umber">
              {{ sign.reading }}
            </div>

            <div
              class="mt-2 inline-block rounded-full border border-washi-border/80 bg-[#FFFDF9]/90 px-2.5 py-0.5 font-serif text-xs font-bold text-washi-ink"
            >
              {{ sign.meaning }}
            </div>

            <p class="mt-2 text-[11px] leading-snug text-washi-umber">
              {{ sign.whereSeen }}
            </p>
          </div>
        </button>
      </div>
    </div>

    <!-- 3. Autumn Tanzaku (短冊) Poetry Strips Grid -->
    <div class="space-y-4">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <span class="font-mono text-[11px] font-bold tracking-widest text-washi-momiji uppercase">
            短冊帳 · SPOKEN PHRASE STRIPS ({{ filteredPhrases.length }})
          </span>
          <h3 class="font-serif text-xl font-bold text-washi-ink sm:text-2xl">
            How It’s Written &amp; How to Pronounce It
          </h3>
        </div>
        <span class="font-mono text-xs text-washi-bark">
          🍁 marks the stressed syllable in each phrase
        </span>
      </div>

      <div class="grid gap-5 md:grid-cols-2">
        <article
          v-for="(item, idx) in filteredPhrases"
          :key="item.id"
          class="tanzaku-strip group relative flex flex-col justify-between overflow-hidden px-6 pt-7 pb-5 transition hover:border-washi-momiji/60"
        >
          <!-- Subtle Vertical Tategaki Category Watermark on Right Margin -->
          <span
            class="tategaki pointer-events-none absolute top-7 right-3 font-serif text-xs font-bold text-washi-bark/35 select-none"
            aria-hidden="true"
          >
            第{{ idx + 1 }}句
          </span>

          <div>
            <!-- English Meaning & Audio Triggers -->
            <div class="flex items-start justify-between gap-3 pr-5">
              <div>
                <span
                  class="font-mono text-[10px] font-bold tracking-widest text-washi-persimmon uppercase"
                >
                  {{ item.category }}
                </span>
                <h4 class="font-serif text-lg font-bold text-washi-ink">
                  {{ item.english }}
                </h4>
              </div>

              <div class="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold transition"
                  :class="
                    speakingId === item.id && speakingSpeed === 'normal'
                      ? 'border-washi-momiji bg-washi-momiji text-white'
                      : 'border-washi-border bg-[#FFFDF9] text-washi-ink hover:border-washi-momiji'
                  "
                  title="Listen at normal speed"
                  @click="speakJapanese(item, 'normal')"
                >
                  <i
                    class="ph-fill ph-speaker-high"
                    :class="
                      speakingId === item.id && speakingSpeed === 'normal'
                        ? 'text-white'
                        : 'text-washi-momiji'
                    "
                  ></i>
                  <span>Listen</span>
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold transition"
                  :class="
                    speakingId === item.id && speakingSpeed === 'slow'
                      ? 'border-washi-jrink bg-washi-jrink text-white'
                      : 'border-washi-border bg-[#FFFDF9] text-washi-umber hover:border-washi-momiji hover:text-washi-ink'
                  "
                  title="Listen slowly syllable-by-syllable"
                  @click="speakJapanese(item, 'slow')"
                >
                  <span>🐢 Slow</span>
                </button>
              </div>
            </div>

            <!-- Written Script with Floating Furigana Reading -->
            <div class="my-4 border-y border-dashed border-washi-border/80 py-3.5">
              <div class="font-mono text-[11px] tracking-wide text-washi-umber">
                {{ item.hiragana }}
              </div>
              <div
                class="mt-0.5 font-serif text-2xl font-extrabold tracking-wide text-washi-ink sm:text-[26px]"
              >
                {{ item.japanese }}
              </div>
            </div>

            <!-- Flowing Prosody / Pronunciation Rhythm Line (Zero Boxy Pills) -->
            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between font-mono text-xs">
                <span class="text-[10px] tracking-wider text-washi-bark uppercase">ROMAJI</span>
                <span class="font-semibold text-washi-ink">{{ item.romaji }}</span>
              </div>

              <!-- Syllable Stress Wave -->
              <div class="flex flex-wrap items-end gap-x-3 gap-y-2 pt-1">
                <span class="font-mono text-[10px] tracking-wider text-washi-momiji uppercase">
                  SAY IT:
                </span>
                <div
                  v-for="(word, wIdx) in parseProsody(item.pronunciation)"
                  :key="wIdx"
                  class="inline-flex items-baseline"
                >
                  <template v-for="(syl, sIdx) in word" :key="sIdx">
                    <span
                      class="relative font-mono text-xs transition"
                      :class="
                        syl.stressed
                          ? 'border-b-2 border-washi-momiji px-0.5 font-extrabold text-washi-momiji'
                          : 'text-washi-umber'
                      "
                    >
                      <span v-if="syl.stressed" class="mr-0.5 text-[10px]" aria-hidden="true"
                        >🍁</span
                      >{{ syl.text }}
                    </span>
                    <span
                      v-if="sIdx < word.length - 1"
                      class="mx-0.5 font-mono text-[10px] text-washi-border"
                      >·</span
                    >
                  </template>
                </div>
              </div>
            </div>

            <!-- Context Whisper -->
            <p v-if="item.contextTip" class="mt-3 text-xs italic leading-relaxed text-washi-umber">
              “{{ item.contextTip }}”
            </p>
          </div>

          <!-- Subtle Bottom Actions -->
          <div class="mt-4 flex items-center justify-between pt-2 text-xs">
            <button
              type="button"
              class="font-mono text-[11px] text-washi-bark transition hover:text-washi-momiji"
              @click="copyPhrase(item)"
            >
              Copy phrase
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1 font-serif text-xs font-bold text-washi-momiji group-hover:underline"
              @click="activeShowCard = item"
            >
              <span>Point &amp; Show Staff</span>
              <i class="ph-bold ph-arrow-up-right"></i>
            </button>
          </div>
        </article>
      </div>
    </div>

    <!-- Fullscreen Washi Scroll Modal for Showing Staff -->
    <div
      v-if="activeShowCard"
      class="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1916]/65 p-4 backdrop-blur-xs"
      @click.self="activeShowCard = null"
    >
      <div class="oshinagaki-sheet relative w-full max-w-lg p-8 text-center shadow-2xl sm:p-10">
        <span class="hanko-seal rounded px-2 py-0.5 text-xs">指差し会話</span>

        <p class="mt-4 font-mono text-xs text-washi-umber">
          {{ activeShowCard.hiragana }}
        </p>
        <p class="mt-2 font-serif text-3xl font-extrabold leading-snug text-washi-ink sm:text-4xl">
          {{ activeShowCard.japanese }}
        </p>

        <div class="my-6 border-t border-dashed border-washi-border pt-4">
          <div class="font-mono text-sm font-bold text-washi-momiji">
            {{ activeShowCard.romaji }}
          </div>
          <div class="mt-1 font-serif text-base text-washi-umber">
            {{ activeShowCard.english }}
          </div>
        </div>

        <div class="flex justify-center gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full bg-washi-momiji px-5 py-2 font-mono text-xs font-bold text-white shadow-xs"
            @click="speakJapanese(activeShowCard, 'normal')"
          >
            <i class="ph-fill ph-speaker-high"></i> Speak Aloud
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border border-washi-border bg-[#FFFDF9] px-4 py-2 font-mono text-xs font-bold text-washi-ink"
            @click="speakJapanese(activeShowCard, 'slow')"
          >
            🐢 Slow
          </button>
          <button
            type="button"
            class="rounded-full border border-washi-border bg-washi-warm px-5 py-2 font-mono text-xs font-semibold text-washi-ink"
            @click="activeShowCard = null"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
