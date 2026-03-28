import axios, { type InternalAxiosRequestConfig, AxiosError } from 'axios'
import { toast } from 'vue-sonner'
import { useAuthStore } from '../stores/auth'
import type { RefreshResponse, Result } from '../types/api'
import config from '@/config'

const t = (key: string) => {
  const translations: Record<string, string> = {
    logoutInProgress: 'Logout in corso...',
    operationFailed: 'Operazione fallita',
    refreshFailed: 'Sessione scaduta'
  }
  return translations[key] || key
}

const api = axios.create({
  baseURL: config.apiEndpoint,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  withCredentials: true
})

let isRefreshing = false
let isLoggingOut = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

const PUBLIC_ROUTES = ['/Auth/sign-in', '/Auth/sign-up', '/Auth/forgot-password']

// -------------------------
// REQUEST
// -------------------------
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (isLoggingOut && !config.url?.includes('/Auth/logout')) {
    return Promise.reject(new axios.Cancel(t('logoutInProgress')))
  }

  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }

  return config
})

// -------------------------
// RESPONSE
// -------------------------
api.interceptors.response.use(
  (response) => {
    const result = response.data as Result<any>
    if (result && Object.prototype.hasOwnProperty.call(result, 'isSuccess') && !result.isSuccess) {
      toast.error(result.error?.message || t('operationFailed'))
    }
    return response
  },

  async (error: AxiosError) => {
    if (axios.isCancel(error)) return Promise.reject(error)

    const authStore = useAuthStore()
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (isLoggingOut) return Promise.reject(error)

    const isAuthRoute =
      originalRequest.url?.includes('/Auth/refresh') ||
      originalRequest.url?.includes('/Auth/logout')

    if (isAuthRoute) {
      await forceLogout(authStore)
      return Promise.reject(error)
    }

    // -------------------------
    // GESTIONE 401
    // -------------------------
    if (error.response?.status === 401) {
      const isPublicRoute = PUBLIC_ROUTES.some(route => originalRequest.url?.includes(route))
      if (isPublicRoute) return Promise.reject(error)

      // ⛔ Se non ho refresh token → logout immediato
      if (!authStore.refreshToken) {
        await forceLogout(authStore)
        return Promise.reject(error)
      }

      // Se un refresh è già in corso → accoda
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      // Primo tentativo di refresh
      if (!originalRequest._retry) {
        originalRequest._retry = true
        isRefreshing = true

        try {
          const { data } = await axios.post<Result<RefreshResponse>>(
            `${config.apiEndpoint}/Auth/refresh`,
            { refreshToken: authStore.refreshToken }
          )

          if (data.isSuccess && data.value) {
            authStore.setTokens(data.value.accessToken, data.value.refreshToken)

            isRefreshing = false
            processQueue(null, data.value.accessToken)

            originalRequest.headers.Authorization = `Bearer ${data.value.accessToken}`
            return api(originalRequest)
          }

          throw new Error('Refresh failed')
        } catch (refreshError) {
          isRefreshing = false
          processQueue(refreshError, null)
          toast.error('Sessione scaduta')
          await forceLogout(authStore)
          return Promise.reject(refreshError)
        }
      }
    }

    return Promise.reject(error)
  }
)

// -------------------------
// LOGOUT FORZATO
// -------------------------
async function forceLogout(authStore: any) {
  if (isLoggingOut) return
  isLoggingOut = true

  authStore.setTokens(null, null)
  authStore.user = null

  if (import.meta.client) {
    localStorage.clear()
    window.location.replace('/login?reason=expired')
  }
}

export default api
