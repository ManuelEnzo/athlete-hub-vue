<script setup lang="ts">
import type { FilterState } from '~/types/api'
import { Filter, RefreshCw, Settings } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
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

const { t, locale } = useI18n()
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
  const d = dashboardStore.filteredData
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

const athleteCount = computed(() => dashboardStore.filteredData?.totalMonitoredAthletes ?? 0)

// Upcoming agenda — uses filtered data, sorted and grouped by date
const upcomingAgenda = computed(() => dashboardStore.filteredData?.upcomingAgenda ?? [])

const agendaByDate = computed(() => {
  const items = [...upcomingAgenda.value].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  )
  const groups: { dateKey: string; dateLabel: string; items: typeof items }[] = []
  const seen = new Map<string, number>()
  for (const item of items) {
    const d = new Date(item.scheduledAt)
    const key = d.toISOString().split('T')[0]!
    if (!seen.has(key)) {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      let dateLabel: string
      if (d.toDateString() === today.toDateString()) {
        dateLabel = t('dashboard.agenda.today')
      }
      else if (d.toDateString() === tomorrow.toDateString()) {
        dateLabel = t('dashboard.agenda.tomorrow')
      }
      else {
        dateLabel = d.toLocaleDateString(locale.value === 'it' ? 'it-IT' : 'en-US', {
          weekday: 'long', day: 'numeric', month: 'long',
        })
      }
      seen.set(key, groups.length)
      groups.push({ dateKey: key, dateLabel, items: [] })
    }
    groups[seen.get(key)!]!.items.push(item)
  }
  return groups
})

const systemStatus = computed(() => {
  const d = dashboardStore.filteredData
  if (!d)
    return 'error'
  if ((d.criticalAcwrCount || 0) > 0)
    return 'warning'
  if ((d.missingReportsToday || 0) > 0)
    return 'warning'
  return 'healthy'
})

const visibleWidgets = computed(() => dashboardStore.visibleWidgets)
function isVisible(id: string): boolean {
  return visibleWidgets.value.includes(id)
}

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

function onFilterApply(filter: FilterState) {
  dashboardStore.setFilter(filter)
  showFilterModal.value = false
  // filteredData is a computed — UI updates instantly, no refresh needed
}

function clearFilters() {
  dashboardStore.clearFilters()
}

function onSettingsApply(s: { refreshInterval: string, defaultTimeRange: string }) {
  dashboardStore.applySettings(s)
  showSettings.value = false
}

function toggleAutoRefresh() {
  autoRefreshEnabled.value = !autoRefreshEnabled.value
  autoRefreshEnabled.value ? startAutoRefresh() : stopAutoRefresh()
}

const activeFilterCount = computed(() => dashboardStore.activeFilterCount)

// Sync local time range selector when store updates (e.g. from DashboardSettings)
watch(() => dashboardStore.selectedTimeRange, (v) => {
  if (v !== selectedTimeRange.value) {
    selectedTimeRange.value = v
  }
})

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
      <div class="px-3 py-2.5 sm:px-6 sm:py-4 max-w-screen-2xl mx-auto flex items-center justify-between gap-2">
        <div class="min-w-0">
          <h1 class="text-lg sm:text-2xl font-bold text-foreground truncate">{{ t('dashboard.pageTitle') }}</h1>
          <p class="text-xs sm:text-sm text-muted-foreground hidden sm:block">{{ t('dashboard.subtitle') }}</p>
        </div>

        <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
            class="relative p-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 flex items-center gap-1.5 text-sm transition-colors"
            :class="{ 'ring-2 ring-primary ring-offset-1': activeFilterCount > 0 }"
            :title="t('dashboard.advancedFilter')"
            @click="showFilterModal = true"
          >
            <Filter :size="14" /><span class="hidden md:inline">{{ t('dashboard.advancedFilter') }}</span>
            <span
              v-if="activeFilterCount > 0"
              class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none"
            >{{ activeFilterCount }}</span>
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
      <div class="hidden sm:flex px-4 sm:px-6 py-1.5 items-center gap-4 text-xs text-muted-foreground border-t border-border bg-muted/30 max-w-screen-2xl mx-auto w-full justify-between">
        <div class="flex items-center gap-3">
          <span>{{ t('dashboard.lastUpdated') }}: <strong class="text-foreground">{{ lastUpdateTime }}</strong></span>
          <span class="opacity-40">•</span>
          <span>{{ athleteCount }} {{ t('dashboard.athletes') }}</span>
          <span class="opacity-40">•</span>
          <span v-if="systemStatus === 'healthy'" class="text-green-600 font-medium">● {{ t('dashboard.status.healthy') }}</span>
          <span v-else-if="systemStatus === 'warning'" class="text-yellow-600 font-medium">● {{ t('dashboard.status.warning') }}</span>
          <span v-else class="text-red-600 font-medium">● {{ t('dashboard.status.error') }}</span>
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


    <!-- Active-filters banner -->
    <Transition name="slide-down">
      <div
        v-if="activeFilterCount > 0"
        class="border-b border-primary/20 bg-primary/5 px-3 sm:px-6 py-1.5"
      >
        <div class="max-w-screen-2xl mx-auto flex items-center gap-2 text-xs">
          <Filter :size="11" class="text-primary shrink-0" />
          <span class="text-primary font-semibold">
            {{ activeFilterCount }} {{ activeFilterCount === 1 ? t('dashboard.filter.one') : t('dashboard.filter.many') }}
          </span>
          <span class="text-muted-foreground hidden sm:inline">&#x2014; {{ t('dashboard.filter.activeNote') }}</span>
          <button
            class="ml-auto text-primary hover:underline font-semibold shrink-0"
            @click="clearFilters"
          >
            {{ t('dashboard.filter.clear') }}
          </button>
        </div>
      </div>
    </Transition>
    <!-- â”€â”€ Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
    <div class="flex-1 overflow-auto">
      <div v-if="isInitializing" class="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>

      <div v-else class="p-3 sm:p-6 max-w-screen-2xl mx-auto space-y-4 sm:space-y-6">

        <!-- Row 1 â”€â”€ KPI Cards (4 cols) -->
        <div v-if="isVisible('kpi')" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
        <div v-if="isVisible('workload') || isVisible('risk')" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div v-if="isVisible('workload')" :class="isVisible('risk') ? 'lg:col-span-7' : 'lg:col-span-12'" class="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-5 min-h-56 sm:h-72">
            <WorkloadChartWidget />
          </div>
          <div v-if="isVisible('risk')" :class="isVisible('workload') ? 'lg:col-span-5' : 'lg:col-span-12'" class="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-5 min-h-56 sm:h-72">
            <RiskAssessmentWidget />
          </div>
        </div>

        <!-- Row 3 â”€â”€ Athlete status table + Health/Discipline distribution -->
        <div v-if="isVisible('athleteTable') || isVisible('health')" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div v-if="isVisible('athleteTable')" :class="isVisible('health') ? 'lg:col-span-7' : 'lg:col-span-12'" class="bg-card rounded-xl border border-border shadow-sm p-5">
            <AthleteStatusTable />
          </div>
          <div v-if="isVisible('health')" :class="isVisible('athleteTable') ? 'lg:col-span-5' : 'lg:col-span-12'" class="bg-card rounded-xl border border-border shadow-sm p-5">
            <HealthAssessment />
          </div>
        </div>

        <div v-if="isVisible('agenda')" class="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-5">
          <h3 class="text-base font-semibold text-foreground mb-4">
            {{ t('dashboard.agenda.title') }}
          </h3>

          <div v-if="agendaByDate.length" class="space-y-5">
            <div v-for="group in agendaByDate" :key="group.dateKey">

              <!-- Date header -->
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-primary">{{ group.dateLabel }}</span>
                <div class="flex-1 h-px bg-border" />
                <span class="text-[11px] text-muted-foreground shrink-0">
                  {{ group.items.length }} {{ t('dashboard.agenda.appointments') }}
                </span>
              </div>

              <!-- Entries for this date -->
              <div class="divide-y divide-border rounded-lg border border-border overflow-hidden">
                <div
                  v-for="(item, idx) in group.items"
                  :key="idx"
                  class="flex items-center justify-between gap-3 px-3 py-2.5 bg-background hover:bg-muted/30 transition-colors"
                >
                  <!-- Left: time + athlete -->
                  <div class="flex items-center gap-3 min-w-0">
                    <span class="text-xs text-muted-foreground tabular-nums w-12 shrink-0">
                      {{ new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                    </span>
                    <span class="font-semibold text-sm text-foreground truncate">{{ item.athleteFullName }}</span>
                  </div>
                  <!-- Right: session type + priority -->
                  <div class="flex items-center gap-2 shrink-0">
                    <span class="text-xs text-muted-foreground hidden sm:inline">{{ item.sessionType }}</span>
                    <span
                      v-if="item.priority"
                      class="text-[11px] px-2 py-0.5 rounded-full font-medium"
                      :class="{
                        'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400': item.priority === 'High',
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400': item.priority === 'Medium',
                        'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400': item.priority === 'Low',
                      }"
                    >
                      {{ item.priority }}
                    </span>
                    <span class="sm:hidden text-[11px] text-muted-foreground">{{ item.sessionType }}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <p v-else class="text-sm text-muted-foreground text-center py-6">
            {{ t('dashboard.agenda.empty') }}
          </p>
        </div>

      </div>
    </div>

    <!-- Modals & notifications -->
    <AdvancedFilterModal :is-open="showFilterModal" @apply="onFilterApply" @close="showFilterModal = false" />
    <DashboardSettings v-if="showSettings" @close="showSettings = false" @apply="onSettingsApply" />
    <NotificationCenter />
  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 40px;
  opacity: 1;
}
</style>
