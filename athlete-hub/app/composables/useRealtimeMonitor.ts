/**
 * 🚨 REAL-TIME MONITOR COMPOSABLE
 *
 * Monitora cambiamenti in tempo reale negli atleti
 * - Richieste HTTP con polling intelligente
 * - Notifiche per cambiamenti critici
 * - Aggregazione statistiche
 *
 * Usage:
 * const { events, severity, stats } = useRealtimeMonitor()
 */

import { computed, onUnmounted, ref } from 'vue'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { useNotificationStore } from '~/stores/notificationStore'

export interface MonitorEvent {
  id: string
  timestamp: Date
  athleteId: string
  athleteName: string
  type: 'readiness_drop' | 'acwr_high' | 'injury_risk' | 'recovery_good' | 'performance_spike'
  severity: 'info' | 'warning' | 'critical'
  message: string
  previousValue?: number
  currentValue?: number
  recommended_action?: string
}

export function useRealtimeMonitor() {
  const notifications = useNotificationStore()
  const { handleError } = useErrorHandler({ component: 'RealtimeMonitor' })

  // State
  const events = ref<MonitorEvent[]>([])
  const isMonitoring = ref(false)
  const pollingInterval = ref<ReturnType<typeof setInterval> | null>(null)

  // Configuration
  const THRESHOLDS = {
    readinessDrop: 20, // percentage points drop
    acwrHigh: 1.5,
    injuryRiskScore: 70,
    recoveryThreshold: 80,
    performanceSpike: 15, // percentage increase
  }

  const POLLING_INTERVAL = 30000 // 30 seconds - not reactive, plain const

  // Fetch latest athletic data
  const fetchAthleteUpdates = async () => {
    try {
      // In real app: const response = await $fetch('/api/athletes/latest')
      // For now, return mock data
      return [
        {
          id: 'ath-001',
          name: 'Marco Rossi',
          readiness: 65,
          acwr: 1.8,
          rpe: 85,
          injuries: ['knee strain'],
          performance: 78,
        },
        {
          id: 'ath-002',
          name: 'Luca Bianchi',
          readiness: 35,
          acwr: 1.2,
          rpe: 88,
          injuries: [],
          performance: 72,
        },
      ]
    }
    catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)))
      return []
    }
  }

  // Analyze athlete data for critical events
  const analyzeAthlete = (athlete: any, previousData: Map<string, any>) => {
    const newEvents: MonitorEvent[] = []
    const prevAthlete = previousData.get(athlete.id)

    if (!prevAthlete) {
      previousData.set(athlete.id, athlete)
      return newEvents
    }

    // Check readiness drop
    const readinessDrop = prevAthlete.readiness - athlete.readiness
    if (readinessDrop > THRESHOLDS.readinessDrop) {
      newEvents.push({
        id: `event-${Date.now()}-readiness`,
        timestamp: new Date(),
        athleteId: athlete.id,
        athleteName: athlete.name,
        type: 'readiness_drop',
        severity: readinessDrop > 30 ? 'critical' : 'warning',
        message: `Readiness è bassa: ${athlete.readiness}% (era ${prevAthlete.readiness}%)`,
        previousValue: prevAthlete.readiness,
        currentValue: athlete.readiness,
        recommended_action: 'Aumenta riposo, riduci carico',
      })
    }

    // Check ACWR
    if (athlete.acwr > THRESHOLDS.acwrHigh && prevAthlete.acwr <= THRESHOLDS.acwrHigh) {
      newEvents.push({
        id: `event-${Date.now()}-acwr`,
        timestamp: new Date(),
        athleteId: athlete.id,
        athleteName: athlete.name,
        type: 'acwr_high',
        severity: athlete.acwr > 2.0 ? 'critical' : 'warning',
        message: `ACWR alto: ${athlete.acwr.toFixed(2)} - Rischio infortunio`,
        previousValue: prevAthlete.acwr,
        currentValue: athlete.acwr,
        recommended_action: 'Aumenta riposo strutturato',
      })
    }

    // Check injury risk (from medical data)
    if (athlete.injuries && athlete.injuries.length > 0) {
      newEvents.push({
        id: `event-${Date.now()}-injury`,
        timestamp: new Date(),
        athleteId: athlete.id,
        athleteName: athlete.name,
        type: 'injury_risk',
        severity: 'critical',
        message: `Infortunio segnalato: ${athlete.injuries.join(', ')}`,
        recommended_action: 'Valutazione medica consigliata',
      })
    }

    // Check good recovery
    if (athlete.readiness > THRESHOLDS.recoveryThreshold && prevAthlete.readiness <= THRESHOLDS.recoveryThreshold) {
      newEvents.push({
        id: `event-${Date.now()}-recovery`,
        timestamp: new Date(),
        athleteId: athlete.id,
        athleteName: athlete.name,
        type: 'recovery_good',
        severity: 'info',
        message: `${athlete.name} si è ripreso bene!`,
        recommended_action: 'Pronto per allenamento intenso',
      })
    }

    // Check performance spike
    const performanceIncrease = ((athlete.performance - prevAthlete.performance) / prevAthlete.performance) * 100
    if (performanceIncrease > THRESHOLDS.performanceSpike) {
      newEvents.push({
        id: `event-${Date.now()}-performance`,
        timestamp: new Date(),
        athleteId: athlete.id,
        athleteName: athlete.name,
        type: 'performance_spike',
        severity: 'info',
        message: `Picco di performance: +${performanceIncrease.toFixed(1)}%`,
        previousValue: prevAthlete.performance,
        currentValue: athlete.performance,
      })
    }

    // Update previous data
    previousData.set(athlete.id, athlete)
    return newEvents
  }

  // Start monitoring
  const startMonitoring = () => {
    if (isMonitoring.value)
      return

    isMonitoring.value = true
    const previousData = new Map() // Track previous state

    pollingInterval.value = setInterval(async () => {
      const athletes = await fetchAthleteUpdates()

      for (const athlete of athletes) {
        const newEvents = analyzeAthlete(athlete, previousData)

        for (const event of newEvents) {
          events.value.unshift(event) // Add to front

          // Keep only last 50 events
          if (events.value.length > 50) {
            events.value.pop()
          }

          // Send notification
          const notificationMap: Record<MonitorEvent['type'], { method: 'warning' | 'error' | 'success' | 'info', title: string }> = {
            readiness_drop: { method: 'warning', title: '⬇️ Readiness in calo' },
            acwr_high: { method: 'error', title: '⚠️ Rischio di overtraining' },
            injury_risk: { method: 'error', title: '🚨 Infortunio segnalato' },
            recovery_good: { method: 'success', title: '✅ Buona ripresa' },
            performance_spike: { method: 'success', title: '📈 Picco di performance' },
          }

          const notif = notificationMap[event.type]
          notifications[notif.method](notif.title, event.message, 6000)
        }
      }
    }, POLLING_INTERVAL)
  }

  // Stop monitoring
  const stopMonitoring = () => {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
    }
    isMonitoring.value = false
  }

  // Clear old events
  const clearEvents = () => {
    events.value = []
  }

  // Computed properties
  const stats = computed(() => {
    const severity_counts = {
      critical: 0,
      warning: 0,
      info: 0,
    }

    events.value.forEach((event) => {
      severity_counts[event.severity]++
    })

    return {
      total: events.value.length,
      ...severity_counts,
      lastEvent: events.value[0] || null,
    }
  })

  const maxSeverity = computed(() => {
    if (stats.value.critical > 0)
      return 'critical'
    if (stats.value.warning > 0)
      return 'warning'
    return 'info'
  })

  // Cleanup
  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    events,
    isMonitoring,
    stats,
    maxSeverity,
    startMonitoring,
    stopMonitoring,
    clearEvents,
  }
}
