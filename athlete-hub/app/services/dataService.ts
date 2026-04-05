/**
 * 🎯 DATA SERVICE LAYER - CENTRALIZZATO
 *
 * Centralizza tutto il data fetching, caching, errori e business logic
 * Evita duplicazione di codice nei componenti
 * Implementa retry logic e error tracking
 *
 * Save as: app/services/dataService.ts
 */

import type {
  AthleteResponse,
  CoachDashboardSummaryDto,
} from '~/types/api'
import { computed, ref } from 'vue'
import { authApi } from '~/api/auth'
import { athleteApi } from '~/api/business'
import { requestCache, throttler } from '~/api/client-optimized'

// ============================================
// ERROR HANDLING
// ============================================
export class DataServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public originalError?: Error,
  ) {
    super(message)
    this.name = 'DataServiceError'
  }

  static networkError() {
    return new DataServiceError('NETWORK_ERROR', 'Errore di connessione')
  }

  static notFound() {
    return new DataServiceError('NOT_FOUND', 'Risorsa non trovata', 404)
  }

  static unauthorized() {
    return new DataServiceError('UNAUTHORIZED', 'Sessione scaduta', 401)
  }

  static validationError(field: string) {
    return new DataServiceError('VALIDATION_ERROR', `Validazione fallita per: ${field}`)
  }
}

// ============================================
// RETRY LOGIC
// ============================================
interface RetryConfig {
  maxRetries: number
  initialDelay: number // ms
  maxDelay: number // ms
  backoffMultiplier: number
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 1,
  initialDelay: 500,
  maxDelay: 2000,
  backoffMultiplier: 2,
}

async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const cfg = { ...DEFAULT_RETRY_CONFIG, ...config }
  let lastError: Error | undefined

  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      return await fn()
    }
    catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < cfg.maxRetries) {
        // Calculate exponential backoff
        const delay = Math.min(
          cfg.initialDelay * cfg.backoffMultiplier ** attempt,
          cfg.maxDelay,
        )

        // Add jitter
        const jitterDelay = delay * (0.5 + Math.random() * 0.5)
        await new Promise(resolve => setTimeout(resolve, jitterDelay))
      }
    }
  }

  throw lastError || new Error('Unknown error')
}

// ============================================
// DASHBOARD DATA SERVICE
// ============================================
export function useDashboardService() {
  const data = ref<CoachDashboardSummaryDto | null>(null)
  const loading = ref(false)
  const error = ref<DataServiceError | null>(null)
  const lastUpdated = ref<Date | null>(null)
  let lastFrom: string | undefined
  let lastTo: string | undefined

  const isStale = computed(() => {
    if (!lastUpdated.value)
      return true
    const ageMs = Date.now() - lastUpdated.value.getTime()
    return ageMs > 2 * 60 * 1000 // 2 minutes
  })

  const fetch = async (from?: string, to?: string) => {
    // Return cached if fresh
    if (!isStale.value && data.value) {
      return data.value
    }
    if (from) lastFrom = from
    if (to) lastTo = to

    loading.value = true
    error.value = null

    try {
      const result = await withRetry(async () => {
        const res = await athleteApi.getSummary(lastFrom, lastTo)
        if (!res.data.isSuccess) {
          throw new DataServiceError(
            'API_ERROR',
            res.data.error?.message || 'Errore caricamento dashboard',
          )
        }
        return res.data.value
      })

      data.value = result
      lastUpdated.value = new Date()
      return result
    }
    catch (err) {
      const dataError = err instanceof DataServiceError
        ? err
        : new DataServiceError('UNKNOWN_ERROR', String(err))
      error.value = dataError
      throw dataError
    }
    finally {
      loading.value = false
    }
  }

  const refresh = async (from?: string, to?: string) => {
    lastUpdated.value = null
    return fetch(from ?? lastFrom, to ?? lastTo)
  }

  // Real-time updates (polling)
  const startPolling = (intervalMs: number = 30000) => {
    return setInterval(() => {
      if (!loading.value) {
        refresh().catch((err) => {
          // Centralizza tracking degli errori
          const svc = useErrorTracking()
          const dataErr = err instanceof DataServiceError ? err : new DataServiceError('UNKNOWN_ERROR', String(err))
          svc.trackError(dataErr)
        })
      }
    }, intervalMs)
  }

  const invalidate = () => {
    lastUpdated.value = null
  }

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    lastUpdated: computed(() => lastUpdated.value),
    isStale,
    fetch,
    refresh,
    invalidate,
    startPolling,
  }
}

// ============================================
// ATHLETES DATA SERVICE
// ============================================
export interface AthleteFilters {
  search?: string
  discipline?: string
  status?: string
  riskLevel?: string
}

export function useAthletesService() {
  const items = ref<AthleteResponse[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref<DataServiceError | null>(null)
  const filters = ref<AthleteFilters>({})
  const currentPage = ref(0)
  const pageSize = ref(20)

  const filtered = computed(() => {
    if (!filters.value.search)
      return items.value

    const search = filters.value.search.toLowerCase()
    return items.value.filter((athlete) => {
      const nameMatch = athlete.fullName?.toLowerCase().includes(search)
      const emailMatch = athlete.email?.toLowerCase().includes(search)
      return nameMatch || emailMatch
    })
  })

  const fetch = async (page: number = 0, size: number = 20) => {
    loading.value = true
    error.value = null

    try {
      const result = await withRetry(async () => {
        const res = await athleteApi.getAll()
        if (!res.data.isSuccess) {
          throw new DataServiceError('API_ERROR', 'Errore caricamento atleti')
        }
        return res.data.value
      })

      items.value = result || []
      total.value = result?.length || 0
      currentPage.value = page
      pageSize.value = size
      return { items: items.value, total: total.value }
    }
    catch (err) {
      const dataError = err instanceof DataServiceError
        ? err
        : new DataServiceError('UNKNOWN_ERROR', String(err))
      error.value = dataError
      throw dataError
    }
    finally {
      loading.value = false
    }
  }

  const setFilters = (newFilters: Partial<AthleteFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
    currentPage.value = 0 // Reset to first page
  }

  const nextPage = () => {
    const nextPageNumber = currentPage.value + 1
    const maxPage = Math.ceil(total.value / pageSize.value)
    if (nextPageNumber < maxPage) {
      return fetch(nextPageNumber, pageSize.value)
    }
  }

  const prevPage = () => {
    if (currentPage.value > 0) {
      return fetch(currentPage.value - 1, pageSize.value)
    }
  }

  return {
    items: computed(() => items.value),
    filtered: computed(() => filtered.value),
    total: computed(() => total.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    currentPage: computed(() => currentPage.value),
    pageSize: computed(() => pageSize.value),
    filters: computed(() => filters.value),
    fetch,
    setFilters,
    nextPage,
    prevPage,
  }
}

// ============================================
// PROFILE SERVICE
// ============================================
export function useProfileService() {
  const profile = ref<any>(null)
  const loading = ref(false)
  const error = ref<DataServiceError | null>(null)

  const fetch = async () => {
    if (profile.value)
      return profile.value // Return cached

    loading.value = true
    error.value = null

    try {
      const res = await authApi.getProfile()
      if (!res.data.isSuccess) {
        throw new DataServiceError('API_ERROR', 'Errore caricamento profilo')
      }
      profile.value = res.data.value
      return profile.value
    }
    catch (err) {
      const dataError = err instanceof DataServiceError
        ? err
        : new DataServiceError('UNKNOWN_ERROR', String(err))
      error.value = dataError
      throw dataError
    }
    finally {
      loading.value = false
    }
  }

  const invalidate = () => {
    profile.value = null
  }

  return {
    profile: computed(() => profile.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetch,
    invalidate,
  }
}

// ============================================
// CACHE MANAGEMENT
// ============================================
export function useCacheService() {
  const getStats = () => requestCache.getStats()

  const clear = (pattern?: string) => {
    requestCache.clear(pattern)
  }

  const getThrottleStatus = (endpoint: string) => {
    return throttler.getStatus(endpoint)
  }

  return {
    getStats,
    clear,
    getThrottleStatus,
  }
}

// ============================================
// ERROR TRACKING
// ============================================
type ErrorCallback = (error: DataServiceError) => void

const errorCallbacks: Set<ErrorCallback> = new Set()

export function useErrorTracking() {
  const subscribe = (callback: ErrorCallback) => {
    errorCallbacks.add(callback)
    return () => errorCallbacks.delete(callback)
  }

  const trackError = (error: DataServiceError) => {
    errorCallbacks.forEach(cb => cb(error))
  }

  return { subscribe, trackError }
}

// ============================================
// ANALYTICS SERVICE (per-athlete, cacheable)
// ============================================
export function useAnalyticsService() {
  const data = ref<import('~/types/api').AthleteAnalyticsDto | null>(null)
  const loading = ref(false)
  const error = ref<DataServiceError | null>(null)

  const fetch = async (athleteId: number, from: string, to: string) => {
    loading.value = true
    error.value = null
    data.value = null

    try {
      const result = await withRetry(async () => {
        const res = await athleteApi.getDatasForAnalytics(athleteId, from, to)
        if (!res.data.isSuccess) {
          throw new DataServiceError('API_ERROR', 'Errore caricamento analytics atleta')
        }
        return res.data.value
      })
      data.value = result
      return result
    }
    catch (err) {
      const dataError = err instanceof DataServiceError
        ? err
        : new DataServiceError('UNKNOWN_ERROR', String(err))
      error.value = dataError
      throw dataError
    }
    finally {
      loading.value = false
    }
  }

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetch,
  }
}

// ============================================
// INJURY SERVICE (per-athlete CRUD)
// ============================================
export function useInjuryService() {
  const items = ref<import('~/types/api').InjuryResponseDTO[]>([])
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref<DataServiceError | null>(null)

  const fetch = async (athleteId: number) => {
    loading.value = true
    error.value = null

    try {
      const result = await withRetry(async () => {
        const res = await athleteApi.getInjuries(athleteId)
        if (!res.data.isSuccess) {
          throw new DataServiceError('API_ERROR', 'Errore caricamento infortuni')
        }
        return res.data.value
      })
      items.value = result || []
      return items.value
    }
    catch (err) {
      const dataError = err instanceof DataServiceError
        ? err
        : new DataServiceError('UNKNOWN_ERROR', String(err))
      error.value = dataError
      throw dataError
    }
    finally {
      loading.value = false
    }
  }

  const create = async (payload: import('~/types/api').InjuryCreateDTO) => {
    submitting.value = true
    try {
      const res = await athleteApi.createInjury(payload)
      if (!res.data.isSuccess) throw new DataServiceError('API_ERROR', 'Errore creazione infortunio')
      if (res.data.value) items.value.push(res.data.value)
      return res.data.value
    }
    catch (err) {
      throw err instanceof DataServiceError ? err : new DataServiceError('UNKNOWN_ERROR', String(err))
    }
    finally {
      submitting.value = false
    }
  }

  const update = async (id: number, athleteId: number, payload: import('~/types/api').InjuryUpdateDTO) => {
    submitting.value = true
    try {
      const res = await athleteApi.updateInjury(id, payload)
      if (!res.data.isSuccess) throw new DataServiceError('API_ERROR', 'Errore aggiornamento infortunio')
      // re-fetch to get latest server state
      await fetch(athleteId)
      return res.data.value
    }
    catch (err) {
      throw err instanceof DataServiceError ? err : new DataServiceError('UNKNOWN_ERROR', String(err))
    }
    finally {
      submitting.value = false
    }
  }

  const remove = async (id: number) => {
    submitting.value = true
    try {
      const res = await athleteApi.deleteInjury(id)
      if (!res.data.isSuccess) throw new DataServiceError('API_ERROR', 'Errore eliminazione infortunio')
      items.value = items.value.filter(i => i.id !== id)
    }
    catch (err) {
      throw err instanceof DataServiceError ? err : new DataServiceError('UNKNOWN_ERROR', String(err))
    }
    finally {
      submitting.value = false
    }
  }

  return {
    items: computed(() => items.value),
    loading: computed(() => loading.value),
    submitting: computed(() => submitting.value),
    error: computed(() => error.value),
    fetch,
    create,
    update,
    remove,
  }
}

// ============================================
// MEASUREMENTS SERVICE
// ============================================
export function useMeasurementsService() {
  const items = ref<import('~/types/api').AthleteMeasurementsResponse[]>([])
  const loading = ref(false)
  const error = ref<DataServiceError | null>(null)

  const fetch = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await withRetry(async () => {
        const res = await athleteApi.getAllMeasurements()
        if (!res.data.isSuccess) {
          throw new DataServiceError('API_ERROR', 'Errore caricamento misurazioni')
        }
        return res.data.value
      })
      items.value = result || []
      return items.value
    }
    catch (err) {
      const dataError = err instanceof DataServiceError
        ? err
        : new DataServiceError('UNKNOWN_ERROR', String(err))
      error.value = dataError
      throw dataError
    }
    finally {
      loading.value = false
    }
  }

  return {
    items: computed(() => items.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetch,
  }
}

// ============================================
// SLEEP SERVICE
// ============================================
export function useSleepService() {
  const history = ref<import('~/types/api').SleepResponseDto[]>([])
  const selected = ref<import('~/types/api').SleepResponseDto | null>(null)
  const loading = ref(false)
  const loadingDetail = ref(false)
  const error = ref<DataServiceError | null>(null)

  const fetchHistory = async (athleteId: number, from?: string, to?: string) => {
    loading.value = true
    error.value = null
    try {
      const result = await withRetry(async () => {
        const res = await athleteApi.getSleepHistory(athleteId, from, to)
        if (!res.data.isSuccess) {
          throw new DataServiceError('API_ERROR', 'Errore caricamento storico sonno')
        }
        return res.data.value
      })
      history.value = result || []
      return history.value
    }
    catch (err) {
      const dataError = err instanceof DataServiceError
        ? err
        : new DataServiceError('UNKNOWN_ERROR', String(err))
      error.value = dataError
      throw dataError
    }
    finally {
      loading.value = false
    }
  }

  const fetchDay = async (athleteId: number, date: string) => {
    loadingDetail.value = true
    try {
      const result = await withRetry(async () => {
        const res = await athleteApi.getSleepData(athleteId, date)
        if (!res.data.isSuccess) {
          throw new DataServiceError('API_ERROR', 'Errore caricamento dati sonno')
        }
        return res.data.value
      })
      selected.value = result
      return result
    }
    catch (err) {
      throw err instanceof DataServiceError ? err : new DataServiceError('UNKNOWN_ERROR', String(err))
    }
    finally {
      loadingDetail.value = false
    }
  }

  const setSelected = (entry: import('~/types/api').SleepResponseDto | null) => {
    selected.value = entry
  }

  return {
    history: computed(() => history.value),
    selected: computed(() => selected.value),
    loading: computed(() => loading.value),
    loadingDetail: computed(() => loadingDetail.value),
    error: computed(() => error.value),
    fetchHistory,
    fetchDay,
    setSelected,
  }
}

// ============================================
// EXPORTS
// ============================================
export {
  DEFAULT_RETRY_CONFIG,
  withRetry,
}
