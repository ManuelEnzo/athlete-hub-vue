/**
 * 🪝 DASHBOARD COMPOSABLES - RIUSABILI
 *
 * Utility functions per la dashboard:
 * - Chart data formatting
 * - Real-time data updates
 * - Performance metrics calculation
 * - Risk assessment
 *
 * Save as: app/composables/useDashboardComposables.ts
 */

import type { Ref } from 'vue'
import { computed, ref } from 'vue'

// ApexOptions local type placeholder (no import from api.ts)
type ApexOptions = Record<string, any>

// ============================================
// CHART UTILITIES
// ============================================
export function useChartOptions() {
  const defaultChartConfig = (_title?: string): ApexOptions => ({
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'system-ui',
    },
    colors: ['#3b82f6'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '50%',
      },
    },
    grid: {
      borderColor: 'hsl(var(--muted-foreground) / 0.1)',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'dark',
      x: { show: true },
      y: { formatter: (val: number) => `${val}` },
    },
  })

  const animationOptions = (): ApexOptions => ({
    animation: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 150,
      },
      dynamicAnimation: {
        enabled: true,
        speed: 150,
      },
    },
  })

  return {
    defaultChartConfig,
    animationOptions,
  }
}

// ============================================
// HEALTH STATUS UTILITIES
// ============================================
export interface HealthMetrics {
  status: 'healthy' | 'at-risk' | 'warning'
  score: number // 0-100
  trend: 'up' | 'down' | 'stable'
  recommendation: string
}

export function useHealthMetrics(athlete: any): HealthMetrics {
  const readiness = athlete?.readiness || 0
  const acwr = athlete?.acwr || 0
  const rpe = athlete?.rpe || 0

  // Calculate composite health score
  const score = Math.round((readiness * 0.5 + (100 - acwr * 10) * 0.3 + (100 - rpe) * 0.2))

  let status: HealthMetrics['status'] = 'healthy'
  let recommendation = ''

  if (score >= 80) {
    status = 'healthy'
    recommendation = 'Atleta in ottima condizione. Aumentare carico di allenamento.'
  }
  else if (score >= 60) {
    status = 'at-risk'
    recommendation = 'Monitorare attentamente. Mantieni carico moderato.'
  }
  else {
    status = 'warning'
    recommendation = 'Ridurre carico di allenamento. Incrementare recupero.'
  }

  return {
    status,
    score,
    trend: 'stable', // Would need historical data
    recommendation,
  }
}

// ============================================
// WORKLOAD ANALYSIS
// ============================================
export interface WorkloadAnalysis {
  current: number
  trend: number // percentage change
  status: 'optimal' | 'high' | 'low'
  recommendation: string
}

export function useWorkloadAnalysis(current: number, historical: number[] = []): WorkloadAnalysis {
  let trend = 0
  if (historical.length > 0) {
    const previous = historical[0]!
    if (previous !== 0) {
      trend = ((current - previous) / previous) * 100
    }
  }

  let status: WorkloadAnalysis['status'] = 'optimal'
  let recommendation = ''

  if (current > 100) {
    status = 'high'
    recommendation = 'Carico di allenamento alto. Aumentare recupero.'
  }
  else if (current < 50) {
    status = 'low'
    recommendation = 'Carico di allenamento basso. Aumentare stimolo.'
  }
  else {
    status = 'optimal'
    recommendation = 'Carico di allenamento ottimale.'
  }

  return {
    current,
    trend,
    status,
    recommendation,
  }
}

// ============================================
// PERFORMANCE PREDICTION
// ============================================
export interface PerformanceForecast {
  nextDay: number
  nextWeek: number
  confidence: number // 0-100
}

export function usePerformanceForecast(historicalData: number[]): PerformanceForecast {
  if (historicalData.length < 2) {
    return {
      nextDay: historicalData[0] || 0,
      nextWeek: historicalData[0] || 0,
      confidence: 20,
    }
  }

  // Simple moving average + trend
  const recentData = historicalData.slice(-7)
  const avg = recentData.reduce((a, b) => a + b, 0) / recentData.length
  const last = recentData[recentData.length - 1] ?? 0
  const first = recentData[0] ?? 0
  const trend = first !== 0 ? (last - first) / first : 0

  const nextDay = Math.round(avg * (1 + trend * 0.1))
  const nextWeek = Math.round(avg * (1 + trend * 0.5))

  // Calculate confidence based on data consistency
  const variance = recentData.reduce((sum, val) => sum + (val - avg) ** 2, 0) / recentData.length
  const stdDev = Math.sqrt(variance)
  const cv = stdDev / avg // Coefficient of variation
  const confidence = Math.max(30, Math.min(90, 100 - cv * 100))

  return {
    nextDay,
    nextWeek,
    confidence: Math.round(confidence),
  }
}

// ============================================
// REAL-TIME UPDATES
// ============================================
export function useRealtimeUpdates(dataRef: Ref<any>, updateFn: () => Promise<any>, intervalMs: number = 30000) {
  const isUpdateAvailable = ref(false)
  const lastUpdate = ref<Date>(new Date())
  let updateInterval: ReturnType<typeof setInterval> | null = null

  const startMonitoring = () => {
    if (updateInterval)
      return

    updateInterval = setInterval(async () => {
      try {
        const newData = await updateFn()
        if (JSON.stringify(newData) !== JSON.stringify(dataRef.value)) {
          isUpdateAvailable.value = true
          lastUpdate.value = new Date()
        }
      }
      catch (err) {
        console.error('Realtime update error:', err)
      }
    }, intervalMs)
  }

  const stopMonitoring = () => {
    if (updateInterval) {
      clearInterval(updateInterval)
      updateInterval = null
    }
  }

  const applyUpdate = async () => {
    try {
      const newData = await updateFn()
      dataRef.value = newData
      isUpdateAvailable.value = false
    }
    catch (err) {
      console.error('Apply update error:', err)
    }
  }

  return {
    isUpdateAvailable: computed(() => isUpdateAvailable.value),
    lastUpdate: computed(() => lastUpdate.value),
    startMonitoring,
    stopMonitoring,
    applyUpdate,
  }
}

// ============================================
// DATA FORMATTING
// ============================================
export function useDataFormatting() {
  const formatNumber = (value: number | undefined, decimals: number = 0): string => {
    if (!value)
      return '0'
    return value.toFixed(decimals)
  }

  const formatPercent = (value: number | undefined): string => {
    if (!value)
      return '0%'
    return `${Math.round(value)}%`
  }

  const formatDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('it-IT')
  }

  const formatTime = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleTimeString('it-IT')
  }

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const abbreviateNumber = (num: number): string => {
    if (num >= 1000000)
      return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000)
      return `${(num / 1000).toFixed(1)}K`
    return String(num)
  }

  return {
    formatNumber,
    formatPercent,
    formatDate,
    formatTime,
    formatDuration,
    abbreviateNumber,
  }
}

// ============================================
// RISK ASSESSMENT
// ============================================
export interface RiskAssessment {
  level: 'low' | 'medium' | 'high'
  factors: string[]
  score: number // 0-100
  action: string
}

export function useRiskAssessment(athlete: any): RiskAssessment {
  const factors: string[] = []
  let score = 0

  // Check readiness
  if (athlete?.readiness < 40) {
    factors.push('Readiness basso')
    score += 30
  }
  else if (athlete?.readiness < 60) {
    score += 15
  }

  // Check ACWR (Acute:Chronic Workload Ratio)
  const _idealAcwr = 0.8 // 0.8-1.3 is optimal
  const acwr = athlete?.acwr || 0
  if (acwr > 1.5) {
    factors.push('Carico acuto troppo alto')
    score += 35
  }
  else if (acwr < 0.6) {
    factors.push('Carico acuto troppo basso')
    score += 15
  }

  // Check RPE (Rate of Perceived Exertion)
  if (athlete?.rpe > 85) {
    factors.push('Sforzo percepito alto')
    score += 25
  }

  let level: RiskAssessment['level'] = 'low'
  let action = 'Continuare il programma di allenamento attuale'

  if (score >= 70) {
    level = 'high'
    action = 'Ridurre carico di allenamento immediatamente'
  }
  else if (score >= 40) {
    level = 'medium'
    action = 'Monitorare attentamente e aumentare recupero'
  }

  return {
    level,
    factors,
    score,
    action,
  }
}

// ============================================
// EXPORT
// ============================================
export default {
  useChartOptions,
  useHealthMetrics,
  useWorkloadAnalysis,
  usePerformanceForecast,
  useRealtimeUpdates,
  useDataFormatting,
  useRiskAssessment,
}
