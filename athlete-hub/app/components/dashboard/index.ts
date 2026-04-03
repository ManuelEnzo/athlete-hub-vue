/**
 * 📦 DASHBOARD COMPONENTS BARREL EXPORT
 *
 * Centralized exports for all dashboard components
 * Simplifies imports throughout the application
 *
 * Usage:
 * import { DashboardLayout, ReadinessWidget, ... } from '~/components/dashboard'
 *
 * Save as: app/components/dashboard/index.ts
 */

// Utility Components
export { default as AdvancedFilterModal } from './AdvancedFilterModal.vue'

export { default as DashboardCard } from './DashboardCard.vue'
// Main Layout
export { default as DashboardLayout } from './DashboardLayout.vue'
export { default as DashboardSettings } from './DashboardSettings.vue'
export { default as HealthAssessment } from './HealthAssessment.vue'
export { default as MetricCard } from './MetricCard.vue'
export { default as NotificationCenter } from './NotificationCenter.vue'
export { default as PerformanceTrendsWidget } from './PerformanceTrendsWidget.vue'

export { default as RiskAssessmentWidget } from './RiskAssessmentWidget.vue'
export { default as TeamComparisonWidget } from './TeamComparisonWidget.vue'
export { default as AIInsightsWidget } from './widgets/AIInsightsWidget.vue'
// Widget Components
export { default as ReadinessWidget } from './widgets/ReadinessWidget.vue'
export { default as WorkloadAnalysisWidget } from './WorkloadAnalysisWidget.vue'

// Types
export type { FilterState } from '~/types/api'
