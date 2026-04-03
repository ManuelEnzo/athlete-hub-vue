/**
 * 📊 DASHBOARD STORE - CENTRALIZZATO
 *
 * Gestisce lo stato della dashboard con:
 * - Caching intelligente
 * - Auto-refresh / polling
 * - Error tracking
 * - Real-time updates
 *
 * Save as: app/stores/dashboardStore.ts
 */

import type { CoachDashboardSummaryDto } from '~/types/api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { useDashboardService } from '~/services/dataService'

export const useDashboardStore = defineStore('dashboard', () => {
  const dataService = useDashboardService()
  const handler = useErrorHandler({ component: 'DashboardStore' })
  let pollingInterval: ReturnType<typeof setInterval> | null = null

  // State
  const data = ref<CoachDashboardSummaryDto | null>(null)
  const autoRefreshEnabled = ref(true)
  const refreshInterval = ref(30000) // 30 seconds
  const selectedTimeRange = ref('7d')

  // Load data and setup auto-refresh
  const initialize = async () => {
    try {
      const result = await dataService.fetch()
      data.value = result

      // Setup auto-refresh
      if (autoRefreshEnabled.value) {
        startAutoRefresh()
      }
    }
    catch (err) {
      handler.handleError(err instanceof Error ? err : new Error(String(err)))
    }
  }

  // Fetch fresh data
  const refresh = async () => {
    try {
      const result = await dataService.refresh()
      data.value = result
    }
    catch (err) {
      handler.handleError(err instanceof Error ? err : new Error(String(err)))
    }
  }

  // Auto-refresh with polling
  function startAutoRefresh() {
    if (pollingInterval)
      clearInterval(pollingInterval)

    pollingInterval = dataService.startPolling(refreshInterval.value)
    if (pollingInterval) {
      dataService.fetch().catch(err => handler.handleError(err instanceof Error ? err : new Error(String(err))))
    }
  }

  const stopAutoRefresh = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  // Change refresh interval
  const setRefreshInterval = (ms: number) => {
    refreshInterval.value = ms
    if (autoRefreshEnabled.value) {
      startAutoRefresh()
    }
  }

  // Change time range
  const setTimeRange = (range: string) => {
    selectedTimeRange.value = range
    dataService.invalidate()
  }

  // Summary analytics
  const summary = computed(() => {
    if (!data.value) {
      return {
        totalAthletes: 0,
        healthyAthletes: 0,
        atRiskAthletes: 0,
        totalWorkload: 0,
        averageReadiness: 0,
      }
    }

    return {
      totalAthletes: data.value.totalMonitoredAthletes || 0,
      healthyAthletes: data.value.healthDistribution?.find(h => h.status === 'Healthy')?.count || 0,
      atRiskAthletes: data.value.healthDistribution?.find(h => h.status === 'At Risk')?.count || 0,
      totalWorkload: data.value.workloadComparison?.reduce((sum, w) => sum + w.value, 0) || 0,
      averageReadiness: data.value.athleteStatusMatrix
        ? Math.round(
            data.value.athleteStatusMatrix.reduce((sum, a) => sum + a.readiness, 0)
            / data.value.athleteStatusMatrix.length,
          )
        : 0,
    }
  })

  // Local filters (from AdvancedFilterModal)
  const filters = ref<any>(null)

  const setFilter = (f: any) => {
    filters.value = f
    // Invalidate cached data so next fetch will re-query backend
    dataService.invalidate()
  }

  // Normalize workload summary for UI
  const workload = computed(() => {
    if (!data.value)
      return { current: 0, trend: 0 }
    // Try to infer from workloadComparison or default values
    const arr = data.value.workloadComparison || []
    if (arr.length === 0)
      return { current: 0, trend: 0 }
    const current = Math.round(arr.reduce((s, x) => s + (x.value || 0), 0) / arr.length)
    // Simple trend estimation (placeholder)
    const first = arr[0]?.value ?? 0
    const last = arr[arr.length - 1]?.value ?? 0
    const trend = Math.round((last - first) / Math.max(1, first) * 100)
    return { current, trend }
  })

  // Computed getters
  const loading = computed(() => dataService.loading.value)
  const error = computed(() => dataService.error.value)
  const lastUpdated = dataService.lastUpdated
  // Expose a normalized athletes array for components expecting data.athletes
  const athletes = computed(() => {
    if (!data.value)
      return []
    // Prefer athleteStatusMatrix if present
    if (data.value.athleteStatusMatrix && data.value.athleteStatusMatrix.length > 0) {
      return data.value.athleteStatusMatrix.map(a => ({
        id: a.name ? a.name : 0,
        name: a.name,
        readinessScore: a.readiness,
        acwr: a.acwr,
      }))
    }

    // Fallback to athletesHealth dictionary
    if (data.value.athletesHealth) {
      return Object.values(data.value.athletesHealth).map(h => ({
        id: h.athleteId,
        name: `Athlete ${h.athleteId}`,
        readinessScore: h.readiness,
        acwr: h.acwr,
      }))
    }

    return []
  })

  return {
    // State
    data: computed(() => data.value),
    loading,
    error,
    lastUpdated,
    autoRefreshEnabled,
    selectedTimeRange,
    summary,

    // Methods
    initialize,
    refresh,
    startAutoRefresh,
    stopAutoRefresh,
    setRefreshInterval,
    setTimeRange,
    // Methods + compatibility
    setFilter,
    // Normalized fields
    athletes: computed(() => athletes.value),
    workload: computed(() => workload.value),
    filters: computed(() => filters.value),
  }
})
