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

import type { CoachDashboardSummaryDto, FilterState } from '~/types/api'
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
    restorePreferences()
    try {
      // Fetch with the restored (or default) time range
      const days: Record<string, number> = { '1d': 1, '7d': 7, '30d': 30, '90d': 90 }
      const d = days[selectedTimeRange.value] ?? 7
      const to = new Date().toISOString().split('T')[0]!
      const from = new Date(Date.now() - d * 86400000).toISOString().split('T')[0]!
      const result = await dataService.fetch(from, to)
      data.value = result
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

  // Change time range — also triggers a refresh with the matching date range
  const setTimeRange = (range: string) => {
    selectedTimeRange.value = range
    dataService.invalidate()
    const days: Record<string, number> = { '1d': 1, '7d': 7, '30d': 30, '90d': 90 }
    const d = days[range] ?? 7
    const to = new Date().toISOString().split('T')[0]!
    const from = new Date(Date.now() - d * 86400000).toISOString().split('T')[0]!
    dataService.refresh(from, to)
      .then(result => { if (result) data.value = result })
      .catch(err => handler.handleError(err instanceof Error ? err : new Error(String(err))))
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

  // ─── Persistence ─────────────────────────────────────────────────────────
  const PERSIST_KEY = 'dashboard:preferences'
  const refreshIntervalKey = ref('5m')
  const visibleWidgets = ref<string[]>(['kpi', 'workload', 'risk', 'athleteTable', 'health', 'agenda'])

  // Local filters (from AdvancedFilterModal)
  const filters = ref<FilterState | null>(null)

  function savePreferences() {
    try {
      localStorage.setItem(PERSIST_KEY, JSON.stringify({
        timeRange: selectedTimeRange.value,
        filters: filters.value,
        refreshIntervalKey: refreshIntervalKey.value,
        visibleWidgets: visibleWidgets.value,
      }))
    }
    catch { /* storage unavailable */ }
  }

  function restorePreferences() {
    try {
      const raw = localStorage.getItem(PERSIST_KEY)
      if (!raw)
        return
      const prefs = JSON.parse(raw) as {
        timeRange?: string
        filters?: FilterState | null
        refreshIntervalKey?: string
        visibleWidgets?: string[]
      }
      if (prefs.timeRange)
        selectedTimeRange.value = prefs.timeRange
      if (prefs.filters)
        filters.value = prefs.filters
      if (prefs.refreshIntervalKey)
        refreshIntervalKey.value = prefs.refreshIntervalKey
      if (prefs.visibleWidgets && prefs.visibleWidgets.length > 0)
        visibleWidgets.value = prefs.visibleWidgets
    }
    catch { /* ignore */ }
  }

  const setFilter = (f: FilterState) => {
    filters.value = f
    dataService.invalidate()
    savePreferences()
  }

  const clearFilters = () => {
    filters.value = null
    savePreferences()
  }

  // How many filter dimensions are currently active
  const activeFilterCount = computed(() => {
    const f = filters.value
    if (!f)
      return 0
    let n = 0
    if (f.athletes.length > 0)
      n++
    if (f.dateRange?.from)
      n++
    if (f.metrics.readiness[0] !== 0 || f.metrics.readiness[1] !== 100)
      n++
    return n
  })

  // Client-side filtered view of data — ALL display components read from here
  const filteredData = computed(() => {
    if (!data.value)
      return null
    const f = filters.value
    const hasAthleteFilter = f && f.athletes.length > 0
    const hasReadinessFilter = f && (f.metrics.readiness[0] !== 0 || f.metrics.readiness[1] !== 100)
    const hasDateFilter = f && f.dateRange?.from
    if (!hasAthleteFilter && !hasReadinessFilter && !hasDateFilter)
      return data.value

    const result = { ...data.value }

    // Build name set: prefer pre-resolved names from the filter (set by the modal),
    // which avoids depending on agenda items to discover the mapping.
    let selectedNames: Set<string> | null = null
    if (hasAthleteFilter) {
      if (f!.athleteNames && f!.athleteNames.length > 0) {
        selectedNames = new Set(f!.athleteNames)
      }
      else {
        // Fallback: resolve via upcomingAgenda (legacy / restored-from-storage filters)
        selectedNames = new Set(
          (data.value.upcomingAgenda ?? [])
            .filter(item => f!.athletes.includes(item.athleteId))
            .map(item => item.athleteFullName),
        )
      }
    }

    // Filter athleteStatusMatrix
    let matrix = data.value.athleteStatusMatrix ?? []
    if (hasReadinessFilter) {
      const [min, max] = f!.metrics.readiness
      matrix = matrix.filter(a => a.readiness >= min && a.readiness <= max)
    }
    if (selectedNames && selectedNames.size > 0)
      matrix = matrix.filter(a => selectedNames!.has(a.name))
    result.athleteStatusMatrix = matrix

    // Recompute aggregate KPI fields from the filtered matrix
    // (these are the values shown in MetricCard KPIs)
    result.totalMonitoredAthletes = matrix.length
    if (matrix.length > 0) {
      result.averageReadinessScore = Math.round(
        matrix.reduce((s, a) => s + a.readiness, 0) / matrix.length,
      )
      result.criticalAcwrCount = matrix.filter(a => a.acwr > 1.5).length
    }
    else {
      result.averageReadinessScore = 0
      result.criticalAcwrCount = 0
    }

    // Filter riskAlerts
    if (selectedNames && selectedNames.size > 0)
      result.riskAlerts = (data.value.riskAlerts ?? []).filter(r => selectedNames!.has(r.athleteName))

    // Filter upcomingAgenda
    let agenda = data.value.upcomingAgenda ?? []
    if (hasDateFilter) {
      const from = new Date(f!.dateRange.from)
      const to = new Date(f!.dateRange.to)
      to.setHours(23, 59, 59, 999)
      agenda = agenda.filter((item) => {
        const d = new Date(item.scheduledAt)
        return d >= from && d <= to
      })
    }
    if (hasAthleteFilter)
      agenda = agenda.filter(item => f!.athletes.includes(item.athleteId))
    result.upcomingAgenda = agenda

    return result
  })

  // Apply settings from DashboardSettings modal
  const applySettings = (s: { refreshInterval: string, defaultTimeRange: string, visibleWidgets?: string[] }) => {
    refreshIntervalKey.value = s.refreshInterval
    const intervalMap: Record<string, number> = {
      'disabled': 0, '1m': 60000, '5m': 300000, '10m': 600000, '30m': 1800000,
    }
    const ms = intervalMap[s.refreshInterval] ?? 300000
    if (ms === 0) {
      autoRefreshEnabled.value = false
      stopAutoRefresh()
    }
    else {
      autoRefreshEnabled.value = true
      setRefreshInterval(ms)
    }
    if (s.defaultTimeRange && s.defaultTimeRange !== selectedTimeRange.value)
      setTimeRange(s.defaultTimeRange)
    if (s.visibleWidgets)
      visibleWidgets.value = s.visibleWidgets
    savePreferences()
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
    clearFilters,
    // Filtered data for display components
    filteredData,
    // Active filter count for UI badge
    activeFilterCount,
    // Widget visibility
    visibleWidgets: computed(() => visibleWidgets.value),
    // Apply settings from DashboardSettings
    applySettings,
    // Normalized fields
    athletes: computed(() => athletes.value),
    workload: computed(() => workload.value),
    filters: computed(() => filters.value),
    refreshIntervalKey,
  }
})
