import { ref } from 'vue'

// Module-level state: App.vue renders the toast, any view can trigger it.
const toast = ref({ visible: false, message: '' })
let timer: number | undefined

export function useToast() {
  function showToast(message: string): void {
    toast.value = { visible: true, message }
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      toast.value.visible = false
    }, 3800)
  }

  function hideToast(): void {
    window.clearTimeout(timer)
    toast.value.visible = false
  }

  return { toast, showToast, hideToast }
}
