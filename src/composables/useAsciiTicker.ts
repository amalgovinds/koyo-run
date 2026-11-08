// src/composables/useAsciiTicker.ts
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ASCII_FRAME_COUNT } from '@/data/ascii'

// One shared frame counter. The interval runs only while at least one component
// that called useAsciiTicker() is mounted (your original never cleared it).
const frame = ref(0)
let timer: number | undefined
let users = 0

export function useAsciiTicker(intervalMs = 420) {
  onMounted(() => {
    users += 1
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (users === 1 && !reduceMotion) {
      timer = window.setInterval(() => {
        frame.value = (frame.value + 1) % ASCII_FRAME_COUNT
      }, intervalMs)
    }
  })

  onBeforeUnmount(() => {
    users -= 1
    if (users === 0 && timer !== undefined) {
      window.clearInterval(timer)
      timer = undefined
    }
  })

  return { frame }
}
