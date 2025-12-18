import axios, { type InternalAxiosRequestConfig, AxiosError } from 'axios'
import { toast } from 'vue-sonner'
import { useAuthStore } from '../stores/auth'
import type { Result, UserSignInResponse } from '../types/api'

const api = axios.create({
  baseURL: 'http://localhost:5051/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true 
})

// --- STATO GLOBALE DELL'INTERCEPTOR ---
let isRefreshing = false
let isLoggingOut = false // <--- NUOVO: Impedisce chiamate multiple di logout
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

const PUBLIC_ROUTES = ['/Auth/sign-in', '/Auth/sign-up', '/Auth/refresh']

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Se stiamo già uscendo, annulliamo ogni nuova richiesta in partenza
  if (isLoggingOut && !config.url?.includes('/Auth/logout')) {
    return Promise.reject(new axios.Cancel('Logout in corso...'))
  }

  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    const result = response.data as Result<any>
    if (result && Object.prototype.hasOwnProperty.call(result, 'isSuccess') && !result.isSuccess) {
      toast.error(result.error?.message || 'Operazione fallita')
    }
    return response
  },
  async (error: AxiosError) => {
    // Se la richiesta è stata annullata manualmente, non fare nulla
    if (axios.isCancel(error)) return Promise.reject(error)

    const authStore = useAuthStore()
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    
    // --- 1. IL "CIRCUIT BREAKER" (INTERRUTTORE DI EMERGENZA) ---
    // Se siamo già in fase di logout, ignoriamo qualsiasi altro errore
    if (isLoggingOut) return Promise.reject(error)

    const isAuthRoute = originalRequest.url?.includes('/Auth/refresh') || 
                        originalRequest.url?.includes('/Auth/logout')

    // Se fallisce il refresh o il logout, attiviamo il blocco totale
    if (isAuthRoute) {
      await forceLogout(authStore)
      return Promise.reject(error)
    }

    // --- 2. GESTIONE 401 ---
    if (error.response?.status === 401) {
      const isPublicRoute = PUBLIC_ROUTES.some(route => originalRequest.url?.includes(route))
      if (isPublicRoute) return Promise.reject(error)

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => Promise.reject(err))
      }

      if (!originalRequest._retry) {
        originalRequest._retry = true
        isRefreshing = true

        try {
          const { data } = await axios.post<Result<UserSignInResponse>>(
            'http://localhost:5051/api/v1/Auth/refresh', {}, { withCredentials: true }
          )
          
          if (data.isSuccess && data.value) {
            authStore.setTokens(data.value.accessToken, data.value.refreshToken)
            isRefreshing = false
            processQueue(null, data.value.accessToken)
            originalRequest.headers.Authorization = `Bearer ${data.value.accessToken}`
            return api(originalRequest)
          }
          throw new Error("Refresh failed")
        } catch (refreshError) {
          isRefreshing = false
          processQueue(refreshError, null)
          await forceLogout(authStore)
          return Promise.reject(refreshError)
        }
      }
    }

    return Promise.reject(error)
  }
)

async function forceLogout(authStore: any) {
  if (isLoggingOut) return // Evita esecuzioni multiple
  isLoggingOut = true 
  
  // Svuotiamo subito i dati in memoria per fermare i componenti Vue
  authStore.token = null
  authStore.user = null

  // Pulizia Cookie e Storage
  document.cookie.split(";").forEach((c) => {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
  })
  localStorage.clear()

  // Reindirizzamento atomico
  window.location.replace('/login?reason=expired') 
}

export default api