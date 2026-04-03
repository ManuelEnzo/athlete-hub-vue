/**
 * 📊 DASHBOARD EXPORTS - Centralized Widget & Service Registry
 *
 * This file exports all dashboard components, services, stores,
 * and composables for easy importing throughout the app.
 *
 * Save as: app/composables/dashboard/index.ts
 */

import type { FilterState } from '~/types/api'
import { useDashboardStore } from '~/stores/dashboardStore'

export { default as AdvancedFilterModal } from '~/components/dashboard/AdvancedFilterModal.vue'
export { default as HealthAssessment } from '~/components/dashboard/HealthAssessment.vue'
export { default as PerformanceTrendsWidget } from '~/components/dashboard/PerformanceTrendsWidget.vue'
export { default as RiskAssessmentWidget } from '~/components/dashboard/RiskAssessmentWidget.vue'
export { default as TeamComparisonWidget } from '~/components/dashboard/TeamComparisonWidget.vue'
export { default as AIInsightsWidget } from '~/components/dashboard/widgets/AIInsightsWidget.vue'
// ============================================
// WIDGET COMPONENTS
// ============================================
export { default as ReadinessWidget } from '~/components/dashboard/widgets/ReadinessWidget.vue'
export { default as WorkloadAnalysisWidget } from '~/components/dashboard/WorkloadAnalysisWidget.vue'

// ============================================
// COMPOSABLES
// ============================================
export {
  useChartOptions,
  useDataFormatting,
  useHealthMetrics,
  usePerformanceForecast,
  useRealtimeUpdates,
  useRiskAssessment,
  useWorkloadAnalysis,
} from '~/composables/useDashboardComposables'

// ============================================
// TYPES
// ============================================
export type {
  HealthMetrics,
  PerformanceForecast,
  RiskAssessment,
  WorkloadAnalysis,
} from '~/composables/useDashboardComposables'

// ============================================
// CONFIGURATION
// ============================================
export {
  DASHBOARD_WIDGETS,
  DEFAULT_ALERT_RULES,
  DEFAULT_LAYOUT,
  METRICS,
  SEVERITY_LEVELS,
  TIME_RANGES,
} from '~/config/dashboardConfig'
// ============================================
// SERVICES
// ============================================
export { type AIInsight, aiInsightsService, type InsightCategory } from '~/services/aiInsightsService'
export { useAthletesStore } from '~/stores/athletesStore'

// ============================================
// STORES (PINIA)
// ============================================
export { useDashboardStore } from '~/stores/dashboardStore'

export { useNotificationStore } from '~/stores/notificationStore'

export type {
  AthleteResponse,
  CoachDashboardSummaryDto,
  FilterState,
} from '~/types/api'

// ============================================
// UTILS
// ============================================
/**
 * Initialize dashboard with data
 */
export async function initializeDashboard() {
  const store = useDashboardStore()
  await store.initialize()
}

/**
 * Refresh all dashboard data
 */
export async function refreshDashboard() {
  const store = useDashboardStore()
  await store.refresh()
}

/**
 * Get widget configuration by name
 */
export function getWidgetConfig(widgetName: string) {
  const { DASHBOARD_WIDGETS } = useDashboardConfig()
  return (DASHBOARD_WIDGETS as Record<string, any>[]).find(w => w.component === widgetName)
}

/**
 * Get all active widgets
 */
export function getActiveWidgets() {
  const { DEFAULT_LAYOUT } = useDashboardConfig()
  return (DEFAULT_LAYOUT as any[]).filter(w => w.visible)
}

function useDashboardConfig() {
  return {
    DASHBOARD_WIDGETS: [] as any[],
    DEFAULT_LAYOUT: [] as any[],
  }
}

/**
 * Apply filter to dashboard data
 */
export async function applyDashboardFilter(filter: FilterState) {
  const store = useDashboardStore()
  store.setFilter(filter)
  await store.refresh()
}
