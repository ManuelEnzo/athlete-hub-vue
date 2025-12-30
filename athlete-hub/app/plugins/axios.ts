import { defineNuxtPlugin } from '#app'
import api from '../api/client' // <-- qui importi la tua istanza axios
import { useLoadingStore } from '~/stores/loadingStore'

export default defineNuxtPlugin((nuxtApp) => {
  const loadingStore = useLoadingStore()

  // Interceptor loader
  api.interceptors.request.use((config) => {
    loadingStore.start()
    return config
  })

  api.interceptors.response.use(
    (response) => {
      loadingStore.stop()
      return response
    },
    (error) => {
      loadingStore.stop()
      // 1. Verifichiamo se il server ha risposto con il tuo oggetto Result (es. 400 o 404)
      if (error.response && error.response.data) {
        // Estraiamo il corpo della risposta (il tuo Result<T> C#)
        const apiResult = error.response.data

        // Se la risposta contiene la struttura del tuo Result Pattern { error: { message: ... } }
        if (apiResult.error) {
          // Opzionale: puoi loggare qui il codice errore specifico (es. "EMAIL_EXISTS")
          console.warn(`[API Error] Code: ${apiResult.error.code} - ${apiResult.error.message}`)

          // Ritorna un oggetto normalizzato o rigetta con i dati dell'API
          return Promise.reject(apiResult)
        }
      }

      // 2. Se non è un errore gestito (es. 500 o Crash di rete)
      const fallbackError = {
        isSuccess: false,
        error: {
          code: 'NETWORK_OR_SERVER_ERROR',
          message: 'Il server non risponde o si è verificato un errore imprevisto'
        }
      }

      return Promise.reject(fallbackError)
    }
  )

  // Rende $api disponibile ovunque con useNuxtApp
  nuxtApp.provide('api', api)
})
