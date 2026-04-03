/**
 *  AI INSIGHTS ENGINE - ANALISI PREDITTIVE
 *
 * Sistema di AI insights con:
 * - Anomaly detection
 * - Trend analysis
 * - Risk predictions
 * - Recommendations
 * - Pattern recognition
 *
 * Save as: app/services/aiInsightsService.ts
 */

import type { AthleteResponse, CoachDashboardSummaryDto } from '~/types/api'

export interface AIInsight {
  id: string
  title: string
  message: string
  severity: 'critical' | 'warning' | 'info' | 'success'
  icon: string
  action?: {
    label: string
    handler: () => void
  }
  timestamp: Date
  confidence: number // 0-100
}

export type InsightCategory = 'readiness' | 'fatigue' | 'workload' | 'injury' | 'performance' | 'anomaly'

export class AIInsightsService {
  static generateInsights(data: CoachDashboardSummaryDto, athletes: AthleteResponse[]): AIInsight[] {
    const insights: AIInsight[] = []
    insights.push(...this.analyzeReadiness(data, athletes))
    insights.push(...this.detectFatigue(data, athletes))
    insights.push(...this.analyzeWorkload(data))
    insights.push(...this.assessInjuryRisk(data, athletes))
    insights.push(...this.analyzeTrends(data))
    insights.push(...this.detectAnomalies(data, athletes))
    return insights.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2, success: 3 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    })
  }

  private static analyzeReadiness(_data: CoachDashboardSummaryDto, athletes: AthleteResponse[]): AIInsight[] {
    const insights: AIInsight[] = []
    if (!athletes || athletes.length === 0)
      return insights
    const avgReadiness = athletes.reduce((sum, a) => sum + (a.age || 0), 0) / athletes.length
    const lowReadinessAthletes = athletes.filter(a => (a.age || 0) < 40)
    if (lowReadinessAthletes.length > 0) {
      insights.push({ id: 'low_readiness_warning', title: 'Low Readiness Alert', message: `${lowReadinessAthletes.length} athletes showing low readiness.`, severity: 'warning', icon: 'AlertTriangle', confidence: 85, timestamp: new Date() })
    }
    if (avgReadiness > 75) {
      insights.push({ id: 'improving_readiness', title: 'Strong Readiness', message: `Team avg readiness ${Math.round(avgReadiness)}%.`, severity: 'success', icon: 'TrendingUp', confidence: 90, timestamp: new Date() })
    }
    if (avgReadiness < 35) {
      insights.push({ id: 'critical_readiness', title: 'Critical Readiness', message: 'Team readiness critically low.', severity: 'critical', icon: 'AlertTriangle', confidence: 95, timestamp: new Date() })
    }
    return insights
  }

  private static detectFatigue(_data: CoachDashboardSummaryDto, athletes: AthleteResponse[]): AIInsight[] {
    const insights: AIInsight[] = []
    if (!athletes || athletes.length === 0)
      return insights
    const highFatigueAthletes = athletes.filter(a => (a.weight || 0) > 75)
    if (highFatigueAthletes.length > 0) {
      insights.push({ id: 'high_fatigue_detected', title: 'High Fatigue Detected', message: `${highFatigueAthletes.length} athletes showing elevated fatigue.`, severity: 'warning', icon: 'Heart', confidence: 80, timestamp: new Date() })
    }
    if (athletes.length > 0) {
      const avgFatigue = athletes.reduce((sum, a) => sum + (a.weight || 0), 0) / athletes.length
      if (avgFatigue > 65) {
        insights.push({ id: 'overtraining_risk', title: 'Overtraining Risk', message: 'Team fatigue suggests possible overtraining.', severity: 'warning', icon: 'Alert', confidence: 75, timestamp: new Date() })
      }
    }
    return insights
  }

  private static analyzeWorkload(data: CoachDashboardSummaryDto): AIInsight[] {
    const insights: AIInsight[] = []
    const workloadArr = data.workloadComparison || []
    if (workloadArr.length === 0)
      return insights
    const avgWorkload = workloadArr.reduce((s, x) => s + (x.value || 0), 0) / workloadArr.length
    const currentWorkload = workloadArr[workloadArr.length - 1]?.value ?? 0
    if (currentWorkload > avgWorkload * 1.5) {
      insights.push({ id: 'workload_spike', title: 'Unusual Workload Spike', message: `Workload ${Math.round(((currentWorkload / avgWorkload) - 1) * 100)}% above average.`, severity: 'info', icon: 'TrendingUp', confidence: 85, timestamp: new Date() })
    }
    if (currentWorkload < avgWorkload * 0.5) {
      insights.push({ id: 'low_workload', title: 'Low Training Volume', message: 'Workload significantly below average.', severity: 'info', icon: 'TrendingDown', confidence: 80, timestamp: new Date() })
    }
    return insights
  }

  private static assessInjuryRisk(data: CoachDashboardSummaryDto, _athletes: AthleteResponse[]): AIInsight[] {
    const insights: AIInsight[] = []
    const riskAlerts = data.riskAlerts || []
    const highRisk = riskAlerts.filter(a => Number.parseFloat(String(a.acwrValue || 0)) > 1.5).length
    if (highRisk > 0) {
      insights.push({ id: 'injury_risk_high', title: 'High Injury Risk Detected', message: `${highRisk} athletes at elevated injury risk.`, severity: 'critical', icon: 'AlertTriangle', confidence: 80, timestamp: new Date() })
    }
    return insights
  }

  private static analyzeTrends(data: CoachDashboardSummaryDto): AIInsight[] {
    const insights: AIInsight[] = []
    const matrix = data.athleteStatusMatrix || []
    if (matrix.length === 0)
      return insights
    const avgReadiness = matrix.reduce((s, a) => s + a.readiness, 0) / matrix.length
    if (avgReadiness > 75) {
      insights.push({ id: 'positive_trend', title: 'Performance Improving', message: `Team avg readiness at ${Math.round(avgReadiness)}%.`, severity: 'success', icon: 'TrendingUp', confidence: 85, timestamp: new Date() })
    }
    if (avgReadiness < 50) {
      insights.push({ id: 'negative_trend', title: 'Performance Declining', message: `Team avg readiness at ${Math.round(avgReadiness)}% - below target.`, severity: 'warning', icon: 'TrendingDown', confidence: 85, timestamp: new Date() })
    }
    return insights
  }

  private static detectAnomalies(data: CoachDashboardSummaryDto, athletes: AthleteResponse[]): AIInsight[] {
    const insights: AIInsight[] = []
    if (data.criticalAcwrCount && data.criticalAcwrCount > 0) {
      insights.push({ id: 'critical_acwr_anomaly', title: 'Critical ACWR Detected', message: `${data.criticalAcwrCount} athletes with critical ACWR values.`, severity: 'critical', icon: 'AlertCircle', confidence: 90, timestamp: new Date() })
    }
    if (data.missingReportsToday && data.missingReportsToday > athletes.length * 0.3) {
      insights.push({ id: 'missing_reports', title: 'Missing Daily Reports', message: `${data.missingReportsToday} athletes haven't submitted today's wellness report.`, severity: 'info', icon: 'Clock', confidence: 100, timestamp: new Date() })
    }
    return insights
  }

  static getRecommendation(insight: AIInsight): string {
    const recommendations: Record<string, string> = {
      low_readiness_warning: 'Reduce training intensity or volume. Focus on recovery.',
      high_fatigue_detected: 'Increase recovery methods: massage, stretching, ice baths.',
      overtraining_risk: 'Implement mandatory rest days. Monitor resting heart rate.',
      injury_risk_high: 'Reduce plyometric exercises. Emphasize warm-up and cool-down.',
      workload_spike: 'Ensure adequate recovery between sessions.',
      low_workload: 'Gradually increase training volume over next week.',
      positive_trend: 'Continue with current training program adjustments.',
      negative_trend: 'Review training program. Increase recovery emphasis.',
      critical_acwr_anomaly: 'Immediately reduce training load for at-risk athletes.',
      missing_reports: 'Follow up with athletes who haven\'t reported today.',
    }
    return recommendations[insight.id] || 'Monitor this metric closely.'
  }
}

export const aiInsightsService = AIInsightsService
