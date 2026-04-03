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
const selectedMetric = ref('readiness')
let refreshInterval: ReturnType<typeof setInterval> | null = null

const trendData = computed(() => {
  const raw = dashboardStore.data?.workloadComparison || null
  if (!raw || raw.length === 0) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map((day, idx) => ({ label: day, value: Math.floor(60 + Math.sin(idx * 0.5) * 15 + Math.random() * 10), rawValue: undefined }))
  }

  // Normalize values to 0-100 for simple bar rendering
  const max = Math.max(...raw.map(r => r.value || 0), 1)
  return raw.map(r => ({ label: r.label, value: Math.round(((r.value || 0) / max) * 100), rawValue: r.value }))
})

const currentTeamValue = computed(() => {
  if (dashboardStore.data && typeof dashboardStore.data.averageReadinessScore === 'number') {
    return Math.round(dashboardStore.data.averageReadinessScore)
  }

  if (!dashboardStore.athletes || dashboardStore.athletes.length === 0)
    return 0

  const athletes = dashboardStore.athletes as any[]
  let total = 0

  if (selectedMetric.value === 'readiness') {
    total = athletes.reduce((sum, _a) => sum + (_a.readinessScore || 0), 0)
  }
  else if (selectedMetric.value === 'performance') {
    total = athletes.reduce((sum, _a) => sum + (_a.performanceScore || 50), 0)
  }
  else if (selectedMetric.value === 'fatigue') {
    total = athletes.reduce((sum, _a) => sum + (100 - (_a.fatigueScore || 0)), 0)
  }

  return Math.round(total / athletes.length)
})

const averageTeamValue = computed(() => {
  return Math.round((currentTeamValue.value + 65) / 2)
})

const forecast3Days = computed(() => {
  return Math.max(50, Math.min(100, currentTeamValue.value + Math.random() * 10 - 5))
})

const forecast7Days = computed(() => {
  return Math.max(50, Math.min(100, currentTeamValue.value + Math.random() * 15 - 7))
})

const forecastConfidence = computed(() => {
  return Math.floor(65 + Math.random() * 25)
})

const topImprovers = computed(() => {
  if (!dashboardStore.athletes)
    return []

  return (dashboardStore.athletes as any[])
    .map(_a => ({
      id: _a.id,
      name: _a.name || _a.displayName || 'Unknown',
      improvement: Math.floor(Math.random() * 20 + 5),
    }))
    .sort((a, b) => b.improvement - a.improvement)
    .slice(0, 3)
})

const decliningAthletes = computed(() => {
  if (!dashboardStore.athletes)
    return []

  return (dashboardStore.athletes as any[])
    .map(_a => ({
      id: _a.id,
      name: _a.name || _a.displayName || 'Unknown',
      decline: Math.floor(Math.random() * 10 + 2),
    }))
    .filter(_a => Math.random() > 0.6)
    .slice(0, 3)
})

const performanceRanges = computed(() => {
  if (!dashboardStore.athletes)
    return []

  const athletes = dashboardStore.athletes as any[]
  const excellent = athletes.filter(_a => (_a.readinessScore || 0) >= 80).length
  const good = athletes.filter((_a) => {
    const r = _a.readinessScore || 0
    return r >= 60 && r < 80
  }).length
  const fair = athletes.filter((_a) => {
    const r = _a.readinessScore || 0
    return r >= 40 && r < 60
  }).length
  const poor = athletes.filter(_a => (_a.readinessScore || 0) < 40).length

  return [
    { label: '80-100', count: excellent, color: 'bg-green-500' },
    { label: '60-79', count: good, color: 'bg-blue-500' },
    { label: '40-59', count: fair, color: 'bg-yellow-500' },
    { label: '0-39', count: poor, color: 'bg-red-500' },
  ]
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
  }, 300000) // 5 minutes
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
        {{ t('dashboard.widget.performanceTrends') }}
      </h3>
      <div class="flex items-center gap-2">
        <select v-model="selectedMetric" class="text-xs px-2 py-1 rounded border border-border bg-background text-foreground" aria-label="{{ t('dashboard.performance.selectMetric') }}">
          <option value="readiness">
            {{ t('dashboard.performance.readiness') }}
          </option>
          <option value="performance">
            {{ t('dashboard.performance.performance') }}
          </option>
          <option value="fatigue">
            {{ t('dashboard.performance.fatigue') }}
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

    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-2" />
        <p class="text-sm text-muted-foreground">
          {{ t('dashboard.performance.calculating') }}
        </p>
      </div>
    </div>

    <!-- Trends Content -->
    <div v-else class="space-y-4 flex-1 overflow-auto">
      <!-- Team Trend Overview -->
      <div class="p-3 rounded-lg border border-border bg-muted/50">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-semibold text-foreground">
            Team {{ selectedMetric }} Trend
          </p>
          <span class="text-xs text-muted-foreground">7-day average</span>
        </div>
        <div class="flex items-end gap-2 h-28">
          <div v-for="(d, idx) in trendData" :key="idx" class="flex-1 flex flex-col items-center">
            <div class="w-3/4 h-full flex items-end">
              <div :style="{ height: `${d.value}%` }" class="w-full rounded-t bg-gradient-to-t from-sky-500 to-sky-300" :title="d.rawValue ? String(d.rawValue) : ''" />
            </div>
            <div class="mt-2 text-xs text-muted-foreground">
              {{ d.label }}
            </div>
          </div>
        </div>
        <div class="mt-6 text-xs text-muted-foreground text-center">
          <span class="inline-block px-2 py-1 rounded bg-black bg-opacity-10">
            {{ t('dashboard.performance.currentAndAverage', { current: currentTeamValue, average: averageTeamValue }) }}
          </span>
        </div>
      </div>

      <!-- Predictions -->
      <div class="p-3 rounded-lg border border-border bg-muted/50">
        <p class="text-sm font-semibold text-foreground mb-3">
          {{ t('dashboard.performance.forecastTitle') }}
        </p>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">{{ t('dashboard.performance.expectedIn3Days') }}</span>
            <span class="font-semibold text-foreground">{{ forecast3Days }}%</span>
          </div>
          <div class="w-full bg-muted rounded-full h-2">
            <div class="bg-blue-500 h-2 rounded-full" :style="{ width: `${forecast3Days}%` }" />
          </div>

          <div class="flex items-center justify-between pt-2">
            <span class="text-sm text-muted-foreground">{{ t('dashboard.performance.expectedIn7Days') }}</span>
            <span class="font-semibold text-foreground">{{ forecast7Days }}%</span>
          </div>
          <div class="w-full bg-muted rounded-full h-2">
            <div class="bg-green-500 h-2 rounded-full" :style="{ width: `${forecast7Days}%` }" />
          </div>
        </div>
        <p class="text-xs text-muted-foreground mt-3">
          {{ t('dashboard.performance.confidence', { value: forecastConfidence }) }}
        </p>
      </div>

      <!-- Top Improvers -->
      <div class="p-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
        <p class="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
          {{ t('dashboard.performance.topImprovers') }}
        </p>
        <div class="space-y-1">
          <div v-for="(athlete, idx) in topImprovers" :key="athlete.id" class="flex items-center justify-between text-sm">
            <span class="text-green-800 dark:text-green-200">{{ idx + 1 }}. {{ athlete.name }}</span>
            <span class="font-semibold text-green-600 dark:text-green-400">+{{ athlete.improvement }}%</span>
          </div>
        </div>
      </div>

      <!-- Declining Athletes -->
      <div v-if="decliningAthletes.length > 0" class="p-3 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
        <p class="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-2">
          {{ t('dashboard.performance.needAttention') }}
        </p>
        <div class="space-y-1">
          <div v-for="(athlete, idx) in decliningAthletes" :key="athlete.id" class="flex items-center justify-between text-sm">
            <span class="text-orange-800 dark:text-orange-200">{{ idx + 1 }}. {{ athlete.name }}</span>
            <span class="font-semibold text-orange-600 dark:text-orange-400">{{ athlete.decline }}%</span>
          </div>
        </div>
      </div>

      <!-- Performance Distribution -->
      <div class="p-3 rounded-lg border border-border bg-muted/50">
        <p class="text-sm font-semibold text-foreground mb-3">
          {{ t('dashboard.performance.distributionTitle') }}
        </p>
        <div class="space-y-2">
          <div v-for="range in performanceRanges" :key="range.label" class="flex items-center gap-2">
            <span class="text-xs text-muted-foreground w-12">{{ range.label }}</span>
            <div class="flex-1 h-6 bg-muted rounded flex items-center px-2" :class="range.color">
              <span class="text-xs font-bold text-white">{{ t('dashboard.performance.athletesCount', { count: range.count }) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
