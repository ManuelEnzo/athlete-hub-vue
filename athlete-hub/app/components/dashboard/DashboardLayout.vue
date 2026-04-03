<script setup lang="ts">
import type { FilterState } from '~/types/api'
import { Filter, RefreshCw, Settings } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import AdvancedFilterModal from '~/components/dashboard/AdvancedFilterModal.vue'
import DashboardSettings from '~/components/dashboard/DashboardSettings.vue'
import HealthAssessment from '~/components/dashboard/HealthAssessment.vue'
import MetricCard from '~/components/dashboard/MetricCard.vue'
import NotificationCenter from '~/components/dashboard/NotificationCenter.vue'
import PerformanceTrendsWidget from '~/components/dashboard/PerformanceTrendsWidget.vue'
import RiskAssessmentWidget from '~/components/dashboard/RiskAssessmentWidget.vue'
import TeamComparisonWidget from '~/components/dashboard/TeamComparisonWidget.vue'
import AIInsightsWidget from '~/components/dashboard/widgets/AIInsightsWidget.vue'
// Components
import ReadinessWidget from '~/components/dashboard/widgets/ReadinessWidget.vue'
import WorkloadAnalysisWidget from '~/components/dashboard/WorkloadAnalysisWidget.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'

// Stores
import { useDashboardStore } from '~/stores/dashboardStore'

const { t } = useI18n()
const dashboardStore = useDashboardStore()

// State
const isInitializing = ref(true)
const isRefreshing = ref(false)
const selectedTimeRange = ref('7d')
const showFilterModal = ref(false)
const showSettings = ref(false)
const lastUpdateTime = ref('--:--')
const autoRefreshEnabled = ref(true)
let refreshInterval: ReturnType<typeof setInterval> | null = null

// Responsive grid
const gridClass = computed(() => {
  return 'grid-cols-12'
})

// Display Metrics derived from CoachDashboardSummaryDto when available
const displayMetrics = computed(() => {
  const d = dashboardStore.data
  if (!d) {
    return [
      { id: 'placeholder', title: t('dashboard.metrics.teamReadiness'), value: '—', icon: '⚡', trend: '—', trendPositive: true },
    ]
  }

  return [
    {
      id: 'totalAthletes',
      title: t('dashboard.metrics.totalMonitoredAthletes'),
      value: d.totalMonitoredAthletes ?? 0,
      icon: '👥',
      trend: '',
      trendPositive: true,
    },
    {
      id: 'avgReadiness',
      title: t('dashboard.metrics.averageReadinessScore'),
      value: `${Math.round(d.averageReadinessScore ?? 0)}%`,
      icon: '⚡',
      trend: '',
      trendPositive: true,
    },
    {
      id: 'criticalAcwr',
      title: t('dashboard.metrics.criticalAcwrCount'),
      value: d.criticalAcwrCount ?? 0,
      icon: '🚨',
      trend: '',
      trendPositive: false,
    },
    {
      id: 'missingReports',
      title: t('dashboard.metrics.missingReportsToday'),
      value: d.missingReportsToday ?? 0,
      icon: '📨',
      trend: '',
      trendPositive: false,
    },
  ]
})

const athleteCount = computed(() => {
  return dashboardStore.data?.totalMonitoredAthletes ?? dashboardStore.athletes?.length ?? 0
})

const systemStatus = computed(() => {
  const d = dashboardStore.data
  if (!d)
    return 'error'

  // If many critical ACWR or many missing reports, mark warning/error
  if ((d.criticalAcwrCount || 0) > Math.max(1, Math.floor((d.totalMonitoredAthletes || 1) * 0.15)))
    return 'warning'
  if ((d.missingReportsToday || 0) > Math.max(1, Math.floor((d.totalMonitoredAthletes || 1) * 0.25)))
    return 'warning'
  return 'healthy'
})

// Methods
function updateLastTime() {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  lastUpdateTime.value = `${hours}:${minutes}`
}

async function refreshAll() {
  isRefreshing.value = true
  try {
    await dashboardStore.refresh()
    updateLastTime()
  }
  finally {
    isRefreshing.value = false
  }
}

function onTimeRangeChange() {
  dashboardStore.setTimeRange(selectedTimeRange.value)
  refreshAll()
}

async function onFilterApply(filter: FilterState) {
  dashboardStore.setFilter(filter)
  await refreshAll()
  showFilterModal.value = false
}

function toggleAutoRefresh() {
  autoRefreshEnabled.value = !autoRefreshEnabled.value
  if (autoRefreshEnabled.value) {
    startAutoRefresh()
  }
  else {
    stopAutoRefresh()
  }
}

function startAutoRefresh() {
  if (refreshInterval)
    return
  refreshInterval = setInterval(() => {
    refreshAll()
  }, 300000) // 5 minutes
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await dashboardStore.initialize()
    updateLastTime()
    startAutoRefresh()
  }
  finally {
    isInitializing.value = false
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<template>
  <div class="h-full w-full flex flex-col bg-background">
    <!-- Top Navigation Bar -->
    <div class="border-b border-border bg-card shadow-sm sticky top-0 z-40">
      <div class="px-6 py-4">
        <div class="max-w-screen-xl w-full mx-auto flex items-center justify-between">
          <!-- Title & Breadcrumb -->
          <div class="flex items-center gap-4">
            <div>
              <h1 class="text-2xl md:text-3xl font-bold text-foreground">
                {{ t('dashboard.pageTitle') }}
              </h1>
              <p class="text-sm md:text-base text-muted-foreground">
                {{ t('dashboard.subtitle') }}
              </p>
            </div>
          </div>

          <!-- Controls -->
          <div class="flex items-center gap-3">
            <!-- Time Range Selector -->
            <select
              v-model="selectedTimeRange"
              class="px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm"
              :aria-label="t('dashboard.timeRange.select')"
              @change="onTimeRangeChange"
            >
              <option value="1d">
                {{ t('dashboard.timeRange.1d') }}
              </option>
              <option value="7d">
                {{ t('dashboard.timeRange.7d') }}
              </option>
              <option value="30d">
                {{ t('dashboard.timeRange.30d') }}
              </option>
              <option value="90d">
                {{ t('dashboard.timeRange.90d') }}
              </option>
            </select>

            <!-- Filter Button -->
            <button
              class="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 flex items-center gap-2 transition-colors"
              :title="t('dashboard.actions.settings')"
              @click="showFilterModal = true"
            >
              <Filter :size="16" />
              <span class="text-sm">{{ t('dashboard.advancedFilter') }}</span>
            </button>

            <!-- Refresh Button -->
            <button
              :disabled="isRefreshing"
              class="p-2 rounded-md hover:bg-muted disabled:opacity-50 transition-colors"
              :aria-label="t('dashboard.actions.refresh')"
              :title="t('dashboard.actions.refresh')"
              @click="refreshAll"
            >
              <RefreshCw :size="18" :class="{ 'animate-spin': isRefreshing }" />
            </button>

            <!-- Settings -->
            <button
              class="p-2 rounded-md hover:bg-muted transition-colors"
              :aria-label="t('dashboard.actions.settings')"
              :title="t('dashboard.actions.settings')"
              @click="showSettings = true"
            >
              <Settings :size="18" />
            </button>
          </div>
        </div>
      </div>

      <!-- Status Bar -->
      <div class="px-6 py-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border bg-muted/30">
        <div class="max-w-screen-xl w-full mx-auto flex items-center justify-between">
          <div class="flex items-center gap-4">
            <span>{{ t('dashboard.lastUpdated') }}: {{ lastUpdateTime }}</span>
            <span class="opacity-60">•</span>
            <span>{{ athleteCount }} {{ t('dashboard.athletes') }}</span>
            <span class="opacity-60">•</span>
            <span v-if="systemStatus === 'healthy'" class="text-green-600">{{ t('dashboard.status.healthy') }}</span>
            <span v-else-if="systemStatus === 'warning'" class="text-yellow-600">{{ t('dashboard.status.warning') }}</span>
            <span v-else class="text-red-600">{{ t('dashboard.status.error') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              :class="autoRefreshEnabled ? 'text-green-600' : 'text-muted-foreground'"
              class="hover:underline flex items-center gap-2"
              :title="autoRefreshEnabled ? t('dashboard.autoRefresh.auto') : t('dashboard.autoRefresh.manual')"
              @click="toggleAutoRefresh"
            >
              <span class="text-sm">{{ autoRefreshEnabled ? t('dashboard.autoRefresh.auto') : t('dashboard.autoRefresh.manual') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 overflow-auto">
      <!-- Loading State -->
      <div v-if="isInitializing" class="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>

      <!-- Dashboard Grid -->
      <div v-else class="p-6 grid gap-6" :class="gridClass">
        <!-- Row 1: Key Metrics -->
        <div class="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            v-for="metric in displayMetrics"
            :key="metric.id"
            :title="metric.title"
            :value="metric.value"
            :icon="metric.icon"
            :trend="metric.trend"
            :trend-positive="metric.trendPositive"
          />
        </div>

        <!-- Row 2: Main Widgets -->
        <div class="col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-8">
            <div class="bg-card rounded-lg border border-border shadow-sm p-4 h-64 md:h-80 lg:h-96 overflow-hidden flex flex-col">
              <ReadinessWidget />
            </div>
          </div>
          <div class="lg:col-span-4">
            <div class="bg-card rounded-lg border border-border shadow-sm p-4 h-64 md:h-80 lg:h-96 overflow-hidden flex flex-col">
              <AIInsightsWidget />
            </div>
          </div>
        </div>

        <!-- Row 3: Analysis Widgets -->
        <div class="col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-card rounded-lg border border-border shadow-sm p-4 h-56 md:h-72 lg:h-80 overflow-hidden flex flex-col">
            <RiskAssessmentWidget />
          </div>
          <div class="bg-card rounded-lg border border-border shadow-sm p-4 h-56 md:h-72 lg:h-80 overflow-hidden flex flex-col">
            <WorkloadAnalysisWidget />
          </div>
        </div>

        <!-- Row 4: Trends & Comparison -->
        <div class="col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-7">
            <div class="bg-card rounded-lg border border-border shadow-sm p-4 h-56 md:h-72 lg:h-80 overflow-hidden flex flex-col">
              <PerformanceTrendsWidget />
            </div>
          </div>
          <div class="lg:col-span-5">
            <div class="bg-card rounded-lg border border-border shadow-sm p-4 h-56 md:h-72 lg:h-80 overflow-hidden flex flex-col">
              <TeamComparisonWidget />
            </div>
          </div>
        </div>

        <!-- Row 5: Health Assessment -->
        <div class="col-span-12">
          <div class="bg-card rounded-lg border border-border shadow-sm p-4 overflow-hidden">
            <HealthAssessment />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!isInitializing && !dashboardStore.data" class="flex items-center justify-center h-full">
        <EmptyState>
          <template #title>
            {{ t('dashboard.noData') }}
          </template>
          <template #description>
            {{ t('dashboard.noData') }}
          </template>
          <template #action>
            <button
              class="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              @click="refreshAll"
            >
              {{ t('dashboard.loadData') }}
            </button>
          </template>
        </EmptyState>
      </div>
    </div>

    <!-- Filter Modal -->
    <AdvancedFilterModal
      :is-open="showFilterModal"
      @apply="onFilterApply"
      @close="showFilterModal = false"
    />

    <!-- Settings Modal -->
    <DashboardSettings
      v-if="showSettings"
      @close="showSettings = false"
    />

    <!-- Notifications -->
    <NotificationCenter />
  </div>
</template>

<style scoped></style>
