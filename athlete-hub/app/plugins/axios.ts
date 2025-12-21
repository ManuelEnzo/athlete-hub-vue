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
      return Promise.reject(error)
    }
  )

  // Rende $api disponibile ovunque con useNuxtApp
  nuxtApp.provide('api', api)
})
