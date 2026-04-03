/**
 * 🎨 DASHBOARD CONFIG - CENTRALIZZATO
 *
 * Configurazione centralizzata per:
 * - Colori temi
 * - Icone dashboard
 * - Metriche predefinite
 * - Widget disponibili
 * - i18n labels
 *
 * Save as: app/config/dashboardConfig.ts
 */

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  Flame,
  Heart,
  TrendingUp,
  Zap,
} from 'lucide-vue-next'

// ============================================
// THEME CONFIGURATION
// ============================================
export const DASHBOARD_THEMES = {
  light: {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#8b5cf6',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#06b6d4',
    success: '#10b981',
  },
  dark: {
    primary: '#60a5fa',
    secondary: '#34d399',
    accent: '#a78bfa',
    danger: '#f87171',
    warning: '#fbbf24',
    info: '#22d3ee',
    success: '#6ee7b7',
  },
}

// ============================================
// METRIC DEFINITIONS
// ============================================
export interface MetricDefinition {
  id: string
  label: string
  description: string
  icon: any
  unit: string
  threshold: {
    good: number
    warning: number
    critical: number
  }
  color: string
  format: 'number' | 'percent' | 'currency' | 'duration'
}

export const METRICS: Record<string, MetricDefinition> = {
  readiness: {
    id: 'readiness',
    label: 'Readiness',
    description: 'Athletic readiness score',
    icon: Zap,
    unit: '%',
    threshold: {
      good: 80,
      warning: 60,
      critical: 40,
    },
    color: '#green',
    format: 'percent',
  },
  workload: {
    id: 'workload',
    label: 'Workload',
    description: 'Training workload',
    icon: Activity,
    unit: 'AU',
    threshold: {
      good: 100,
      warning: 150,
      critical: 200,
    },
    color: '#yellow',
    format: 'number',
  },
  fatigue: {
    id: 'fatigue',
    label: 'Fatigue',
    description: 'Fatigue level',
    icon: Heart,
    unit: '%',
    threshold: {
      good: 30,
      warning: 60,
      critical: 80,
    },
    color: '#orange',
    format: 'percent',
  },
  soreness: {
    id: 'soreness',
    label: 'Soreness',
    description: 'Muscle soreness',
    icon: AlertTriangle,
    unit: '%',
    threshold: {
      good: 20,
      warning: 50,
      critical: 70,
    },
    color: '#red',
    format: 'percent',
  },
  sleep: {
    id: 'sleep',
    label: 'Sleep',
    description: 'Sleep quality & hours',
    icon: Clock,
    unit: 'hrs',
    threshold: {
      good: 8,
      warning: 6,
      critical: 4,
    },
    color: '#blue',
    format: 'duration',
  },
  heartrate: {
    id: 'heartrate',
    label: 'Heart Rate',
    description: 'Resting heart rate',
    icon: Heart,
    unit: 'bpm',
    threshold: {
      good: 60,
      warning: 70,
      critical: 80,
    },
    color: '#red',
    format: 'number',
  },
  performance: {
    id: 'performance',
    label: 'Performance',
    description: 'Overall performance score',
    icon: TrendingUp,
    unit: '%',
    threshold: {
      good: 85,
      warning: 70,
      critical: 50,
    },
    color: '#purple',
    format: 'percent',
  },
  injuries: {
    id: 'injuries',
    label: 'Injuries',
    description: 'Current injuries',
    icon: AlertTriangle,
    unit: 'count',
    threshold: {
      good: 0,
      warning: 1,
      critical: 3,
    },
    color: '#red',
    format: 'number',
  },
}

// ============================================
// DASHBOARD WIDGETS
// ============================================
export interface WidgetDefinition {
  id: string
  title: string
  description: string
  icon: any
  component: string
  size: 'small' | 'medium' | 'large'
  metrics: string[]
  refreshInterval: number // ms
  required: boolean
}

export const DASHBOARD_WIDGETS: Record<string, WidgetDefinition> = {
  readiness_overview: {
    id: 'readiness_overview',
    title: 'Readiness Overview',
    description: 'Team readiness at a glance',
    icon: Zap,
    component: 'ReadinessWidget',
    size: 'large',
    metrics: ['readiness'],
    refreshInterval: 60000,
    required: true,
  },
  workload_analysis: {
    id: 'workload_analysis',
    title: 'Workload Trends',
    description: 'Training load analysis',
    icon: Activity,
    component: 'WorkloadWidget',
    size: 'large',
    metrics: ['workload', 'fatigue'],
    refreshInterval: 120000,
    required: false,
  },
  risk_assessment: {
    id: 'risk_assessment',
    title: 'Risk Assessment',
    description: 'Athletes at risk',
    icon: AlertTriangle,
    component: 'RiskWidget',
    size: 'medium',
    metrics: ['fatigue', 'soreness', 'injuries'],
    refreshInterval: 60000,
    required: true,
  },
  performance_trends: {
    id: 'performance_trends',
    title: 'Performance Trends',
    description: '7-day performance changes',
    icon: TrendingUp,
    component: 'PerformanceWidget',
    size: 'large',
    metrics: ['performance'],
    refreshInterval: 300000,
    required: false,
  },
  team_health: {
    id: 'team_health',
    title: 'Team Health',
    description: 'Overall team wellness',
    icon: Heart,
    component: 'HealthWidget',
    size: 'medium',
    metrics: ['sleep', 'fatigue', 'soreness'],
    refreshInterval: 180000,
    required: true,
  },
  upcoming_events: {
    id: 'upcoming_events',
    title: 'Upcoming Events',
    description: 'Next scheduled activities',
    icon: Clock,
    component: 'EventsWidget',
    size: 'medium',
    metrics: [],
    refreshInterval: 600000,
    required: false,
  },
  ai_insights: {
    id: 'ai_insights',
    title: 'AI Insights',
    description: 'AI-powered recommendations',
    icon: Flame,
    component: 'AIInsightsWidget',
    size: 'large',
    metrics: ['readiness', 'fatigue', 'workload', 'performance'],
    refreshInterval: 300000,
    required: false,
  },
  team_comparison: {
    id: 'team_comparison',
    title: 'Team Comparison',
    description: 'Compare athletes',
    icon: BarChart3,
    component: 'ComparisonWidget',
    size: 'large',
    metrics: ['readiness', 'performance', 'workload'],
    refreshInterval: 300000,
    required: false,
  },
}

// ============================================
// TIME RANGE PRESETS
// ============================================
export const TIME_RANGES = {
  '1d': { label: '1 Day', days: 1, refreshInterval: 30000 },
  '7d': { label: '7 Days', days: 7, refreshInterval: 60000 },
  '30d': { label: '1 Month', days: 30, refreshInterval: 300000 },
  '90d': { label: '3 Months', days: 90, refreshInterval: 600000 },
  '1y': { label: '1 Year', days: 365, refreshInterval: 1800000 },
}

// ============================================
// SEVERITY LEVELS
// ============================================
export const SEVERITY_LEVELS = {
  critical: {
    label: 'critical',
    color: '#ef4444',
    icon: AlertTriangle,
    bg: 'bg-red-50 dark:bg-red-950',
  },
  warning: {
    label: 'warning',
    color: '#f59e0b',
    icon: AlertTriangle,
    bg: 'bg-yellow-50 dark:bg-yellow-950',
  },
  info: {
    label: 'info',
    color: '#06b6d4',
    icon: Clock,
    bg: 'bg-cyan-50 dark:bg-cyan-950',
  },
  success: {
    label: 'success',
    color: '#10b981',
    icon: TrendingUp,
    bg: 'bg-green-50 dark:bg-green-950',
  },
}

// ============================================
// DEFAULT DASHBOARD LAYOUT
// ============================================
export const DEFAULT_LAYOUT = [
  {
    id: 'readiness_overview',
    x: 0,
    y: 0,
    w: 12,
    h: 4,
    static: false,
  },
  {
    id: 'risk_assessment',
    x: 0,
    y: 4,
    w: 6,
    h: 4,
    static: false,
  },
  {
    id: 'team_health',
    x: 6,
    y: 4,
    w: 6,
    h: 4,
    static: false,
  },
  {
    id: 'workload_analysis',
    x: 0,
    y: 8,
    w: 12,
    h: 4,
    static: false,
  },
]

// ============================================
// ALERT RULES
// ============================================
export interface AlertRule {
  id: string
  metric: string
  operator: '>' | '<' | '=' | '!='
  threshold: number
  severity: 'critical' | 'warning' | 'info'
  message: string
}

export const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'fatigue_critical',
    metric: 'fatigue',
    operator: '>',
    threshold: 80,
    severity: 'critical',
    message: 'Athlete showing critical fatigue levels',
  },
  {
    id: 'readiness_low',
    metric: 'readiness',
    operator: '<',
    threshold: 40,
    severity: 'warning',
    message: 'Low readiness - consider reduced training',
  },
  {
    id: 'soreness_high',
    metric: 'soreness',
    operator: '>',
    threshold: 60,
    severity: 'warning',
    message: 'High soreness reported',
  },
  {
    id: 'sleep_low',
    metric: 'sleep',
    operator: '<',
    threshold: 6,
    severity: 'info',
    message: 'Sleep duration below recommended',
  },
]
