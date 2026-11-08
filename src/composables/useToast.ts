import { ref } from 'vue'

const toastMessage = ref<string>('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

export function useToast() {
  function showToast(msg: string, duration = 2300) {
    toastMessage.value = msg
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toastMessage.value = ''
    }, duration)
  }

  function clearToast() {
    if (toastTimer) clearTimeout(toastTimer)
    toastMessage.value = ''
  }

  return {
    toastMessage,
    showToast,
    clearToast,
  }
}
