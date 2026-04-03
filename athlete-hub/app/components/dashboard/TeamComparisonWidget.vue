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

interface AthleteComparison {
  id: string
  name: string
  value: number
  percentage: number
  deviation: number
}

function getMetricValue(athlete: any, metric: string): number {
  switch (metric) {
    case 'readiness': return athlete.readinessScore || 0
    case 'fatigue': return athlete.fatigueScore || 0
    case 'soreness': return athlete.sorenessScore || 0
    case 'workload': return athlete.recentWorkload || 0
    default: return 0
  }
}

const athletesRanked = computed((): AthleteComparison[] => {
  if (!dashboardStore.athletes)
    return []

  const athletes = dashboardStore.athletes as any[]
  const values = athletes.map(a => getMetricValue(a, selectedMetric.value))
  const average = values.reduce((a, b) => a + b, 0) / values.length
  const maxValue = Math.max(...values)

  return athletes
    .map((athlete) => {
      const value = getMetricValue(athlete, selectedMetric.value)
      return {
        id: athlete.id,
        name: athlete.name || athlete.displayName || 'Unknown',
        value: Math.round(value),
        percentage: (value / maxValue) * 100,
        deviation: Math.round(value - average),
      }
    })
    .sort((a, b) => b.value - a.value)
})

const teamStats = computed(() => {
  const values = athletesRanked.value.map(a => a.value)
  const average = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0

  const variance = values.length > 0
    ? Math.round(
        Math.sqrt(
          values.reduce((sum, val) => sum + (val - average) ** 2, 0) / values.length,
        ),
      )
    : 0

  const range = values.length > 0 ? Math.max(...values) - Math.min(...values) : 0

  return { average, variance, range }
})

const performanceTiers = computed(() => {
  const values = athletesRanked.value.map(a => a.value)
  const avg = teamStats.value.average

  const excellent = values.filter(v => v >= avg + 20).length
  const good = values.filter(v => v >= avg && v < avg + 20).length
  const fair = values.filter(v => v >= avg - 20 && v < avg).length
  const poor = values.filter(v => v < avg - 20).length

  return [
    { label: `Excellent (>${avg + 20})`, count: excellent, color: 'bg-green-500' },
    { label: `Good (${avg}-${avg + 20})`, count: good, color: 'bg-blue-500' },
    { label: `Fair (${avg - 20}-${avg})`, count: fair, color: 'bg-yellow-500' },
    { label: `Needs Support (<${avg - 20})`, count: poor, color: 'bg-red-500' },
  ]
})

const topPerformers = computed(() => {
  return athletesRanked.value.slice(0, 3)
})

const bottomPerformers = computed(() => {
  return [...athletesRanked.value].reverse().slice(0, 3)
})

function getBarColor(value: number): string {
  const threshold = teamStats.value.average
  if (value >= threshold + 20)
    return 'bg-green-500'
  if (value >= threshold)
    return 'bg-blue-500'
  if (value >= threshold - 20)
    return 'bg-yellow-500'
  return 'bg-red-500'
}

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
        {{ t('dashboard.widget.teamComparison') }}
      </h3>
      <div class="flex items-center gap-2">
        <select
          v-model="selectedMetric"
          class="text-xs px-2 py-1 rounded border border-border bg-background text-foreground"
        >
          <option value="readiness">
            {{ t('dashboard.performance.readiness') }}
          </option>
          <option value="fatigue">
            {{ t('dashboard.performance.fatigue') }}
          </option>
          <option value="soreness">
            {{ t('dashboard.performance.soreness', 'Soreness') }}
          </option>
          <option value="workload">
            {{ t('dashboard.workload.title') }}
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
          {{ t('dashboard.team.comparing') }}
        </p>
      </div>
    </div>

    <!-- Comparison Content -->
    <div v-else class="space-y-4 flex-1 overflow-auto">
      <!-- Team Statistics -->
      <div class="grid grid-cols-3 gap-2">
        <div class="p-2 rounded-lg border border-border bg-muted/50 text-center">
          <p class="text-xs text-muted-foreground mb-1">
            {{ t('dashboard.team.average') }}
          </p>
          <p class="text-xl font-bold text-foreground">
            {{ teamStats.average }}
          </p>
        </div>
        <div class="p-2 rounded-lg border border-border bg-muted/50 text-center">
          <p class="text-xs text-muted-foreground mb-1">
            {{ t('dashboard.team.variance') }}
          </p>
          <p class="text-xl font-bold text-foreground">
            {{ teamStats.variance }}
          </p>
        </div>
        <div class="p-2 rounded-lg border border-border bg-muted/50 text-center">
          <p class="text-xs text-muted-foreground mb-1">
            {{ t('dashboard.team.range') }}
          </p>
          <p class="text-xl font-bold text-foreground">
            {{ teamStats.range }}
          </p>
        </div>
      </div>

      <!-- Horizontal Bar Chart -->
      <div class="space-y-2">
        <p class="text-sm font-semibold text-foreground">
          Athletes Ranking
        </p>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="(athlete, idx) in athletesRanked"
            :key="athlete.id"
            class="flex items-center gap-2"
          >
            <!-- Rank -->
            <div class="w-6 text-xs font-bold text-muted-foreground text-center">
              {{ idx + 1 }}
            </div>

            <!-- Name -->
            <div class="w-24 text-xs font-medium text-foreground truncate">
              {{ athlete.name }}
            </div>

            <!-- Bar -->
            <div class="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
              <div
                class="h-full rounded-full transition-all flex items-center px-2"
                :style="{ width: `${athlete.percentage}%` }"
                :class="getBarColor(athlete.value)"
              >
                <span v-if="athlete.percentage > 30" class="text-xs font-bold text-white">
                  {{ athlete.value }}
                </span>
              </div>
            </div>

            <!-- Value -->
            <div class="w-12 text-right text-xs font-semibold text-foreground">
              {{ athlete.value }}
            </div>

            <!-- Deviation from average -->
            <div class="w-16 text-right text-xs" :class="athlete.deviation >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ athlete.deviation >= 0 ? '+' : '' }}{{ athlete.deviation }}
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Tiers -->
      <div class="p-3 rounded-lg border border-border bg-muted/50">
        <p class="text-sm font-semibold text-foreground mb-3">
          Performance Tiers
        </p>
        <div class="space-y-2">
          <div v-for="tier in performanceTiers" :key="tier.label" class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded" :class="tier.color" />
              <span class="text-sm text-muted-foreground">{{ tier.label }}</span>
            </div>
            <span class="font-semibold text-foreground">{{ tier.count }} athletes</span>
          </div>
        </div>
      </div>

      <!-- Best & Worst Performers -->
      <div class="grid grid-cols-2 gap-2">
        <!-- Top Performers -->
        <div class="p-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
          <p class="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
            ⭐ Top 3
          </p>
          <div class="space-y-1">
            <div
              v-for="(athlete, idx) in topPerformers"
              :key="athlete.id"
              class="text-xs text-green-800 dark:text-green-200 flex items-center gap-1"
            >
              <span class="font-bold">{{ idx + 1 }}.</span>
              <span class="flex-1 truncate">{{ athlete.name }}</span>
              <span class="font-bold">{{ athlete.value }}</span>
            </div>
          </div>
        </div>

        <!-- Bottom Performers -->
        <div class="p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <p class="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
            📍 Bottom 3
          </p>
          <div class="space-y-1">
            <div
              v-for="(athlete, idx) in bottomPerformers"
              :key="athlete.id"
              class="text-xs text-red-800 dark:text-red-200 flex items-center gap-1"
            >
              <span class="font-bold">{{ idx + 1 }}.</span>
              <span class="flex-1 truncate">{{ athlete.name }}</span>
              <span class="font-bold">{{ athlete.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
        <p class="text-xs text-blue-800 dark:text-blue-200">
          💡 Lower variance indicates consistent team performance. Consider team building for more balanced results.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
