import axios from 'axios'
import config from '@/config'
import { useAuthStore } from '~/stores/auth'

const api = axios.create({
  baseURL: config.apiEndpoint,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 15000,
})

api.interceptors.request.use((cfg) => {
  const auth = useAuthStore()
  if (auth?.token) {
    if (!cfg.headers) {
      cfg.headers = {} as any
    }
    cfg.headers.Authorization = `Bearer ${auth.token}`
  }
  return cfg
})

api.interceptors.response.use(res => res, (err) => {
  // Preserve original behavior but ensure rejected reason is an Error
  const error = err instanceof Error ? err : new Error(String(err))
  return Promise.reject(error)
})

export default api
