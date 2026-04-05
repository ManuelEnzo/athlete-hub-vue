<script setup lang="ts">
import type { FilterState } from '~/types/api'
import { Filter, RefreshCw, Settings } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import AdvancedFilterModal from '~/components/dashboard/AdvancedFilterModal.vue'
import AthleteStatusTable from '~/components/dashboard/AthleteStatusTable.vue'
import DashboardSettings from '~/components/dashboard/DashboardSettings.vue'
import HealthAssessment from '~/components/dashboard/HealthAssessment.vue'
import MetricCard from '~/components/dashboard/MetricCard.vue'
import NotificationCenter from '~/components/dashboard/NotificationCenter.vue'
import RiskAssessmentWidget from '~/components/dashboard/RiskAssessmentWidget.vue'
import WorkloadChartWidget from '~/components/dashboard/WorkloadChartWidget.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'

import { useDashboardStore } from '~/stores/dashboardStore'

const { t } = useI18n()
const dashboardStore = useDashboardStore()

const isInitializing = ref(true)
const isRefreshing = ref(false)
const selectedTimeRange = ref('7d')
const showFilterModal = ref(false)
const showSettings = ref(false)
const lastUpdateTime = ref('--:--')
const autoRefreshEnabled = ref(true)
let refreshInterval: ReturnType<typeof setInterval> | null = null

const kpiCards = computed(() => {
  const d = dashboardStore.data
  if (!d)
    return []
  return [
    {
      id: 'athletes',
      title: t('dashboard.metrics.totalMonitoredAthletes'),
      value: d.totalMonitoredAthletes ?? 0,
      icon: 'Users',
      trend: '',
      trendPositive: true,
    },
    {
      id: 'readiness',
      title: t('dashboard.metrics.averageReadinessScore'),
      value: `${Math.round(d.averageReadinessScore ?? 0)}%`,
      icon: 'Zap',
      trend: '',
      trendPositive: (d.averageReadinessScore ?? 0) >= 70,
    },
    {
      id: 'acwr',
      title: t('dashboard.metrics.criticalAcwrCount'),
      value: d.criticalAcwrCount ?? 0,
      icon: 'TriangleAlert',
      trend: '',
      trendPositive: (d.criticalAcwrCount ?? 0) === 0,
    },
    {
      id: 'missing',
      title: t('dashboard.metrics.missingReportsToday'),
      value: d.missingReportsToday ?? 0,
      icon: 'MailWarning',
      trend: '',
      trendPositive: (d.missingReportsToday ?? 0) === 0,
    },
  ]
})

const athleteCount = computed(() => dashboardStore.data?.totalMonitoredAthletes ?? 0)

// Upcoming agenda (may be empty array)
const upcomingAgenda = computed(() => dashboardStore.data?.upcomingAgenda ?? [])

const systemStatus = computed(() => {
  const d = dashboardStore.data
  if (!d)
    return 'error'
  if ((d.criticalAcwrCount || 0) > 0)
    return 'warning'
  if ((d.missingReportsToday || 0) > 0)
    return 'warning'
  return 'healthy'
})

function updateLastTime() {
  const now = new Date()
  lastUpdateTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
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
  autoRefreshEnabled.value ? startAutoRefresh() : stopAutoRefresh()
}

function startAutoRefresh() {
  if (refreshInterval)
    return
  refreshInterval = setInterval(refreshAll, 300000) // 5 min
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

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

onUnmounted(stopAutoRefresh)
</script>

<template>
  <div class="h-full w-full flex flex-col bg-background">

    <!-- â”€â”€ Top bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
    <div class="border-b border-border bg-card shadow-sm sticky top-0 z-40">
      <div class="px-6 py-4 max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-foreground">{{ t('dashboard.pageTitle') }}</h1>
          <p class="text-sm text-muted-foreground">{{ t('dashboard.subtitle') }}</p>
        </div>

        <div class="flex items-center gap-2">
          <select
            v-model="selectedTimeRange"
            class="px-3 py-1.5 rounded-md border border-border bg-background text-foreground text-sm"
            :aria-label="t('dashboard.timeRange.select')"
            @change="onTimeRangeChange"
          >
            <option value="1d">{{ t('dashboard.timeRange.1d') }}</option>
            <option value="7d">{{ t('dashboard.timeRange.7d') }}</option>
            <option value="30d">{{ t('dashboard.timeRange.30d') }}</option>
            <option value="90d">{{ t('dashboard.timeRange.90d') }}</option>
          </select>

          <button
            class="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 flex items-center gap-1.5 text-sm transition-colors"
            @click="showFilterModal = true"
          >
            <Filter :size="14" />{{ t('dashboard.advancedFilter') }}
          </button>

          <button
            :disabled="isRefreshing"
            class="p-2 rounded-md hover:bg-muted disabled:opacity-50 transition-colors"
            :title="t('dashboard.actions.refresh')"
            @click="refreshAll"
          >
            <RefreshCw :size="16" :class="{ 'animate-spin': isRefreshing }" />
          </button>

          <button
            class="p-2 rounded-md hover:bg-muted transition-colors"
            :title="t('dashboard.actions.settings')"
            @click="showSettings = true"
          >
            <Settings :size="16" />
          </button>
        </div>
      </div>

      <!-- Status strip -->
      <div class="px-6 py-1.5 flex items-center gap-4 text-xs text-muted-foreground border-t border-border bg-muted/30 max-w-screen-2xl mx-auto w-full justify-between">
        <div class="flex items-center gap-3">
          <span>{{ t('dashboard.lastUpdated') }}: <strong class="text-foreground">{{ lastUpdateTime }}</strong></span>
          <span class="opacity-40">â€¢</span>
          <span>{{ athleteCount }} {{ t('dashboard.athletes') }}</span>
          <span class="opacity-40">â€¢</span>
          <span v-if="systemStatus === 'healthy'" class="text-green-600 font-medium">â— {{ t('dashboard.status.healthy') }}</span>
          <span v-else-if="systemStatus === 'warning'" class="text-yellow-600 font-medium">â— {{ t('dashboard.status.warning') }}</span>
          <span v-else class="text-red-600 font-medium">â— {{ t('dashboard.status.error') }}</span>
        </div>
        <button
          :class="autoRefreshEnabled ? 'text-green-600' : 'text-muted-foreground'"
          class="hover:underline"
          @click="toggleAutoRefresh"
        >
          {{ autoRefreshEnabled ? t('dashboard.autoRefresh.auto') : t('dashboard.autoRefresh.manual') }}
        </button>
      </div>
    </div>

    <!-- â”€â”€ Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
    <div class="flex-1 overflow-auto">
      <div v-if="isInitializing" class="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>

      <div v-else class="p-6 max-w-screen-2xl mx-auto space-y-6">

        <!-- Row 1 â”€â”€ KPI Cards (4 cols) -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard
            v-for="kpi in kpiCards"
            :key="kpi.id"
            :title="kpi.title"
            :value="kpi.value"
            :icon="kpi.icon"
            :trend="kpi.trend"
            :trend-positive="kpi.trendPositive"
          />
        </div>

        <!-- Row 2 â”€â”€ Workload chart + Risk alerts -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-7 bg-card rounded-xl border border-border shadow-sm p-5 h-72">
            <WorkloadChartWidget />
          </div>
          <div class="lg:col-span-5 bg-card rounded-xl border border-border shadow-sm p-5 h-72">
            <RiskAssessmentWidget />
          </div>
        </div>

        <!-- Row 3 â”€â”€ Athlete status table + Health/Discipline distribution -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-7 bg-card rounded-xl border border-border shadow-sm p-5">
            <AthleteStatusTable />
          </div>
          <div class="lg:col-span-5 bg-card rounded-xl border border-border shadow-sm p-5">
            <HealthAssessment />
          </div>
        </div>

        <!-- Row 4 â”€â”€ Upcoming agenda -->
        <div class="bg-card rounded-xl border border-border shadow-sm p-5">
          <h3 class="text-base font-semibold text-foreground mb-4">
            {{ t('dashboard.agenda.title') }}
          </h3>
          <div v-if="upcomingAgenda.length" class="divide-y divide-border">
            <div
              v-for="(item, idx) in upcomingAgenda"
              :key="idx"
              class="py-2.5 flex items-center justify-between gap-4"
            >
              <div class="flex items-center gap-3">
                <span class="text-xs text-muted-foreground tabular-nums w-16">
                  {{ new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                </span>
                <span class="font-medium text-sm text-foreground">{{ item.athleteFullName }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-muted-foreground">{{ item.sessionType }}</span>
                <span
                  class="text-[11px] px-2 py-0.5 rounded-full font-medium"
                  :class="{
                    'bg-red-100 text-red-700': item.priority === 'High',
                    'bg-yellow-100 text-yellow-700': item.priority === 'Medium',
                    'bg-green-100 text-green-700': item.priority === 'Low',
                    'bg-muted text-muted-foreground': !item.priority,
                  }"
                >
                  {{ item.priority }}
                </span>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-muted-foreground text-center py-4">
            {{ t('dashboard.agenda.empty') }}
          </p>
        </div>

      </div>
    </div>

    <!-- Modals & notifications -->
    <AdvancedFilterModal :is-open="showFilterModal" @apply="onFilterApply" @close="showFilterModal = false" />
    <DashboardSettings v-if="showSettings" @close="showSettings = false" />
    <NotificationCenter />
  </div>
</template>

<style scoped></style>
