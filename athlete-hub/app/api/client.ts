// api/axios.ts
import { i18n } from '../plugins/i18n' // Assicurati che il percorso sia corretto
import axios, { type InternalAxiosRequestConfig, AxiosError } from 'axios'
import { toast } from 'vue-sonner'
import { useAuthStore } from '../stores/auth'
import type { Result, UserSignInResponse } from '../types/api'

// Helper per la traduzione fuori dai componenti Vue
const t = (key: string) => i18n.global.t(key)

const api = axios.create({
  baseURL: 'http://localhost:5051/api/v1',
  headers: { 'Content-Type': 'application/json' },
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

const PUBLIC_ROUTES = ['/Auth/sign-in', '/Auth/sign-up', '/Auth/refresh']

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

api.interceptors.response.use(
  (response) => {
    const result = response.data as Result<any>
    // Controllo successo logico della business logic
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

    const isAuthRoute = originalRequest.url?.includes('/Auth/refresh') || 
                        originalRequest.url?.includes('/Auth/logout')

    if (isAuthRoute) {
      await forceLogout(authStore)
      return Promise.reject(error)
    }

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
          throw new Error('Refresh failed')
        } catch (refreshError) {
          isRefreshing = false
          processQueue(refreshError, null)
          toast.error(t('refreshFailed'))
          await forceLogout(authStore)
          return Promise.reject(refreshError)
        }
      }
    }

    return Promise.reject(error)
  }
)

async function forceLogout(authStore: any) {
  if (isLoggingOut) return
  isLoggingOut = true 
  
  authStore.token = null
  authStore.user = null

  // Pulizia rapida
  localStorage.clear()
  // Nota: I cookie HttpOnly non possono essere cancellati da JS, 
  // ci deve pensare il backend nella rotta /logout
  
  window.location.replace('/login?reason=expired') 
}

export default api