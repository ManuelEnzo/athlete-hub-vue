/**
 * 🤖 AI INSIGHTS WIDGET - VISUALIZZA INSIGHTS IA
 *
 * Widget che mostra:
 * - AI predictions
 * - Risk assessments
 * - Recommendations
 * - Anomalies
 *
 * Save as: app/components/dashboard/widgets/AIInsightsWidget.vue
 */

<script setup lang="ts">
import type { AIInsight } from '~/services/aiInsightsService'
import { AlertTriangle, Clock, Heart, Lightbulb, TrendingDown, TrendingUp, Zap } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { AIInsightsService } from '~/services/aiInsightsService'
import { useAthletesStore } from '~/stores/athletesStore'
import { useDashboardStore } from '~/stores/dashboardStore'

const dashStore = useDashboardStore()
const athletesStore = useAthletesStore()

const insights = ref<AIInsight[]>([])
const expandedId = ref<string | null>(null)
let refreshInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  generateInsights()
  // Refresh every 5 minutes
  refreshInterval = setInterval(generateInsights, 5 * 60 * 1000)
})

onUnmounted(() => {
  if (refreshInterval)
    clearInterval(refreshInterval)
})

function generateInsights() {
  if (dashStore.data) {
    insights.value = AIInsightsService.generateInsights(dashStore.data, athletesStore.items)
  }
}

function getIconComponent(iconName: string) {
  const icons: Record<string, any> = {
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Lightbulb,
    Zap,
    Heart,
    Clock,
  }
  return icons[iconName] || Lightbulb
}

function getSeverityColor(severity: string) {
  const colors: Record<string, string> = {
    critical: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
    success: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
  }
  return colors[severity] || colors.info
}

function getSeverityBadgeColor(severity: string) {
  const colors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  }
  return colors[severity] || colors.info
}

function getConfidenceColor(confidence: number) {
  if (confidence >= 85)
    return 'text-green-600'
  if (confidence >= 70)
    return 'text-blue-600'
  return 'text-yellow-600'
}

const getCriticalInsights = computed(() => insights.value.filter(i => i.severity === 'critical'))
const getWarningInsights = computed(() => insights.value.filter(i => i.severity === 'warning'))
const getOtherInsights = computed(() => insights.value.filter(i => ['info', 'success'].includes(i.severity)))

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}
</script>

<template>
  <div class="h-full flex flex-col overflow-auto space-y-4">
    <!-- No Insights -->
    <div v-if="insights.length === 0" class="text-center py-8 text-muted-foreground">
      <Lightbulb class="w-12 h-12 mx-auto mb-2 opacity-50" />
      <p>No significant insights at this time.</p>
      <p class="text-xs mt-1">
        System is monitoring regularly.
      </p>
    </div>

    <!-- Critical Insights -->
    <div v-if="getCriticalInsights.length > 0">
      <p class="text-xs font-semibold text-red-600 mb-2">
        CRITICAL ALERTS
      </p>
      <div class="space-y-2">
        <div
          v-for="insight in getCriticalInsights"
          :key="insight.id"
          class="rounded-lg border p-4 cursor-pointer transition hover:shadow-md" :class="[getSeverityColor(insight.severity)]"
          @click="toggleExpand(insight.id)"
        >
          <div class="flex items-start gap-3">
            <component :is="getIconComponent(insight.icon)" class="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" />
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <p class="font-semibold text-sm">
                  {{ insight.title }}
                </p>
                <span class="text-xs px-2 py-1 rounded-full" :class="[getSeverityBadgeColor(insight.severity)]">
                  {{ insight.severity.toUpperCase() }}
                </span>
              </div>
              <p class="text-sm text-foreground">
                {{ insight.message }}
              </p>
              <div class="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                <span class="flex items-center gap-1">
                  <span class="" :class="[getConfidenceColor(insight.confidence)]">●</span>
                  {{ insight.confidence }}% confidence
                </span>
                <span>{{ new Date(insight.timestamp).toLocaleTimeString() }}</span>
              </div>
            </div>
          </div>

          <!-- Expanded Details -->
          <div v-if="expandedId === insight.id" class="mt-3 pt-3 border-t border-current/10">
            <p class="text-sm font-medium mb-2">
              Recommendation:
            </p>
            <p class="text-sm bg-white dark:bg-black/20 rounded p-2">
              {{ AIInsightsService.getRecommendation(insight) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Warning Insights -->
    <div v-if="getWarningInsights.length > 0">
      <p class="text-xs font-semibold text-yellow-600 mb-2">
        WARNINGS
      </p>
      <div class="space-y-2">
        <div
          v-for="insight in getWarningInsights.slice(0, 3)"
          :key="insight.id"
          class="rounded-lg border p-4 cursor-pointer transition hover:shadow-md" :class="[getSeverityColor(insight.severity)]"
          @click="toggleExpand(insight.id)"
        >
          <div class="flex items-start gap-3">
            <component :is="getIconComponent(insight.icon)" class="w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-600" />
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <p class="font-semibold text-sm">
                  {{ insight.title }}
                </p>
                <span class="text-xs px-2 py-1 rounded-full" :class="[getSeverityBadgeColor(insight.severity)]">
                  {{ insight.severity.toUpperCase() }}
                </span>
              </div>
              <p class="text-sm text-foreground">
                {{ insight.message }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Insights -->
    <div v-if="getOtherInsights.length > 0">
      <p class="text-xs font-semibold text-blue-600 mb-2">
        RECOMMENDATIONS
      </p>
      <div class="grid grid-cols-1 gap-2">
        <div
          v-for="insight in getOtherInsights.slice(0, 2)"
          :key="insight.id"
          class="rounded-lg border p-3 text-sm" :class="[getSeverityColor(insight.severity)]"
        >
          <div class="flex items-center gap-2">
            <component :is="getIconComponent(insight.icon)" class="w-4 h-4 flex-shrink-0" />
            <span>{{ insight.message }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Last Updated -->
    <div class="text-xs text-muted-foreground text-center pt-2">
      Last updated: {{ new Date().toLocaleTimeString() }}
    </div>
  </div>
</template>
