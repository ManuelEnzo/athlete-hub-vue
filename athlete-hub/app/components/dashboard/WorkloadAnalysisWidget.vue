<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAthletesStore } from '~/stores/athletesStore'
import { useDashboardStore } from '~/stores/dashboardStore'

const dashboardStore = useDashboardStore()
const _athletesStore = useAthletesStore()
const { t } = useI18n()

const isLoading = ref(false)
const selectedTimeRange = ref('7d')
let refreshInterval: ReturnType<typeof setInterval> | null = null

const teamAverageWorkload = computed(() => {
  const d = dashboardStore.data
  if (d && d.workloadComparison && d.workloadComparison.length > 0) {
    const sum = d.workloadComparison.reduce((s, x) => s + (x.value || 0), 0)
    return Math.round(sum / d.workloadComparison.length)
  }

  const athletes = dashboardStore.athletes
  if (!athletes || athletes.length === 0)
    return 0
  const total = (athletes as any[]).reduce((sum, a) => sum + (a.recentWorkload || 0), 0)
  return Math.round(total / athletes.length)
})

const peakWorkload = computed(() => {
  const d = dashboardStore.data
  if (d && d.workloadComparison && d.workloadComparison.length > 0) {
    return Math.max(...d.workloadComparison.map(w => w.value || 0))
  }

  const athletes = dashboardStore.athletes
  if (!athletes || athletes.length === 0)
    return 0
  return Math.max(...(athletes as any[]).map(a => a.recentWorkload || 0))
})

const peakAthleteeName = computed(() => {
  const athletes = dashboardStore.athletes
  if (!athletes || athletes.length === 0)
    return '-'
  const athlete = (athletes as any[]).find(a => a.recentWorkload === peakWorkload.value)
  return athlete?.name || athlete?.displayName || 'Unknown'
})

const workloadTrend = computed(() => {
  const current = teamAverageWorkload.value
  const previous = current * 0.95 // Simulated previous week
  return Math.round(((current - previous) / previous) * 100)
})

const acwrStatuses = computed(() => {
  const athletes = dashboardStore.athletes
  if (!athletes || athletes.length === 0)
    return []

  const list = athletes as any[]
  const optimal = list.filter((a) => {
    const acwr = a.acwr || 0
    return acwr >= 0.8 && acwr <= 1.3
  }).length

  const high = list.filter(a => (a.acwr || 0) > 1.3).length
  const low = list.filter(a => (a.acwr || 0) < 0.8).length

  const total = list.length

  return [
    {
      category: 'Optimal',
      count: optimal,
      percentage: Math.round((optimal / total) * 100),
    },
    {
      category: 'High',
      count: high,
      percentage: Math.round((high / total) * 100),
    },
    {
      category: 'Low',
      count: low,
      percentage: Math.round((low / total) * 100),
    },
  ]
})

const weeklyTrend = computed(() => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map((day, idx) => ({
    day,
    value: Math.floor(100 + Math.sin(idx) * 30 + Math.random() * 20),
  }))
})

const spikes = computed(() => {
  const athletes = dashboardStore.athletes
  if (!athletes || athletes.length === 0)
    return []

  return (athletes as any[])
    .filter((a) => {
      const acwr = a.acwr || 0
      return acwr > 1.5
    })
    .map(a => ({
      id: a.id,
      athleteName: a.name || a.displayName,
      increase: Math.round(((a.acwr || 0) - 1.0) * 100),
    }))
    .slice(0, 3)
})

const topAthletesByWorkload = computed(() => {
  const athletes = dashboardStore.athletes
  if (!athletes || athletes.length === 0)
    return []

  return (athletes as any[])
    .map(a => ({
      id: a.id,
      name: a.name || a.displayName || 'Unknown',
      workload: Math.round(a.recentWorkload || 0),
      acwr: (a.acwr || 0).toFixed(2),
      acwrStatus: (a.acwr || 0) > 1.3 ? 'High' : (a.acwr || 0) < 0.8 ? 'Low' : 'Optimal',
    }))
    .sort((a, b) => b.workload - a.workload)
    .slice(0, 5)
})

async function refresh() {
  isLoading.value = true
  try {
    await dashboardStore.refresh()
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (!dashboardStore.data) {
    refresh()
  }

  refreshInterval = setInterval(() => {
    refresh()
  }, 180000) // 3 minutes
})

onUnmounted(() => {
  if (refreshInterval)
    clearInterval(refreshInterval)
})
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-foreground">
        {{ t('dashboard.workload.title') }}
      </h3>
      <div class="flex items-center gap-2">
        <select
          v-model="selectedTimeRange"
          class="text-xs px-2 py-1 rounded border border-border bg-background text-foreground"
        >
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
        <button
          :disabled="isLoading"
          class="p-1.5 hover:bg-muted rounded-md disabled:opacity-50"
          @click="refresh"
        >
          <RefreshCw :size="16" :class="{ 'animate-spin': isLoading }" />
        </button>
      </div>
    </div>

    <!-- Team Workload Overview -->
    <div v-if="!isLoading" class="space-y-4">
      <!-- Overall Status -->
      <div class="grid grid-cols-2 gap-3">
        <div class="p-3 rounded-lg border border-border bg-muted/50">
          <p class="text-xs text-muted-foreground mb-1">
            {{ t('dashboard.workload.averageWorkload') }}
          </p>
          <p class="text-2xl font-bold text-foreground">
            {{ teamAverageWorkload }}
          </p>
          <p class="text-xs text-muted-foreground mt-1" :class="workloadTrend > 0 ? 'text-yellow-600' : 'text-green-600'">
            {{ workloadTrend > 0 ? '📈 +' : '📉 ' }}{{ Math.abs(workloadTrend) }}% {{ t('dashboard.workload.fromLastWeek') }}
          </p>
        </div>

        <div class="p-3 rounded-lg border border-border bg-muted/50">
          <p class="text-xs text-muted-foreground mb-1">
            {{ t('dashboard.workload.peakWorkload') }}
          </p>
          <p class="text-2xl font-bold text-foreground">
            {{ peakWorkload }}
          </p>
          <p class="text-xs text-muted-foreground mt-1">
            {{ t('dashboard.workload.byPeakAthlete', { name: peakAthleteeName }) }}
          </p>
        </div>
      </div>

      <!-- ACWR Status (Acute:Chronic Workload Ratio) -->
      <div class="p-3 rounded-lg border border-border bg-muted/50">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-semibold text-foreground">
            {{ t('dashboard.workload.acwrStatus') }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ t('dashboard.workload.acwrOptimal') }}
          </p>
        </div>

        <div class="space-y-2">
          <!-- Optimal Zone -->
          <div v-for="status in acwrStatuses" :key="status.category" class="flex items-center gap-2">
            <div class="text-sm font-medium w-20">
              {{ status.category }}
            </div>
            <div
              class="flex-1 bg-muted rounded-full h-6 flex items-center px-2 relative"
              :class="{
                'bg-green-100 dark:bg-green-950': status.count === 0,
                'bg-yellow-100 dark:bg-yellow-950': status.category === 'High' && status.count > 0,
                'bg-blue-100 dark:bg-blue-950': status.category === 'Low' && status.count > 0,
              }"
            >
              <div class="text-xs font-bold flex-1">
                {{ t('dashboard.performance.athletesCount', { count: status.count }) }}
              </div>
              <div class="text-xs text-muted-foreground">
                {{ status.percentage }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Workload Trend Chart (Simplified) -->
      <div class="p-3 rounded-lg border border-border bg-muted/50">
        <p class="text-sm font-semibold text-foreground mb-3">
          {{ t('dashboard.workload.weeklyTrend') }}
        </p>
        <div class="h-32 flex items-end gap-1">
          <div
            v-for="(day, idx) in weeklyTrend"
            :key="idx"
            class="flex-1 bg-blue-400 dark:bg-blue-600 rounded-t opacity-80 hover:opacity-100 transition-opacity cursor-pointer relative group"
            :style="{ height: `${(day.value / 200) * 100}%` }"
          >
            <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {{ day.value }}
            </div>
            <div class="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {{ day.day }}
            </div>
          </div>
        </div>
      </div>

      <!-- Spike Detection -->
      <div v-if="spikes.length > 0" class="p-3 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
        <p class="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-2">
          {{ t('dashboard.workload.spikesDetected') }}
        </p>
        <div class="space-y-1">
          <div v-for="spike in spikes" :key="spike.id" class="text-xs text-orange-800 dark:text-orange-200">
            {{ t('dashboard.workload.spikeIncrease', { name: spike.athleteName, value: spike.increase }) }}
          </div>
        </div>
      </div>

      <!-- Athletes Details Grid -->
      <div class="space-y-2">
        <p class="text-sm font-semibold text-foreground">
          {{ t('dashboard.workload.individualStatus') }}
        </p>
        <div class="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
          <div
            v-for="athlete in topAthletesByWorkload"
            :key="athlete.id"
            class="p-2 rounded border border-border bg-muted/30 flex items-center justify-between"
          >
            <div>
              <p class="text-sm font-medium text-foreground">
                {{ athlete.name }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ t('dashboard.workload.acwrValue', { value: athlete.acwr }) }}
              </p>
            </div>
            <div class="text-right">
              <p class="font-semibold" :class="athlete.acwrStatus === 'High' ? 'text-orange-600' : 'text-green-600'">
                {{ athlete.workload }}
              </p>
              <p class="text-xs" :class="athlete.acwrStatus === 'High' ? 'text-orange-500' : 'text-green-500'">
                {{ athlete.acwrStatus }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-2" />
        <p class="text-sm text-muted-foreground">
          {{ t('dashboard.workload.loading') }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
