import api from '~/api/client'
import { useLoadingStore } from '~/stores/loadingStore'

export default defineNuxtPlugin(() => {
  // Se siamo sul server, non facciamo nulla
  if (import.meta.server) return

  // NON chiamare useLoadingStore() qui fuori!

  api.interceptors.request.use((config) => {
    // Chiamalo QUI dentro: Pinia è sicuramente attivo ora
    const loadingStore = useLoadingStore()
    loadingStore.start()
    return config
  })

  api.interceptors.response.use(
    (response) => {
      const loadingStore = useLoadingStore()
      loadingStore.stop()
      return response
    },
    (error) => {
      const loadingStore = useLoadingStore()
      loadingStore.stop()

      if (error.response?.data?.error) {
        return Promise.reject(error.response.data)
      }

      return Promise.reject({
        isSuccess: false,
        error: {
          code: 'NETWORK_OR_SERVER_ERROR',
          message: 'Il server non risponde o si è verificato un errore imprevisto'
        }
      })
    }
  )
})