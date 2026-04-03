<script setup lang="ts">
import { CheckCircle2, RefreshCw } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDataFormatting } from '~/composables/useDashboardComposables'
import { useAthletesStore } from '~/stores/athletesStore'
import { useDashboardStore } from '~/stores/dashboardStore'

const dashboardStore = useDashboardStore()
const _athletesStore = useAthletesStore()
const { formatDate: _formatDate } = useDataFormatting()
const { t } = useI18n()

const isLoading = ref(false)
const lastUpdateTime = ref('now')
const expandedIds = ref<string[]>([])
let refreshInterval: ReturnType<typeof setInterval> | null = null

interface RiskItem {
  id: string
  athleteName: string
  level: 'low' | 'medium' | 'high'
  score: number
  factors: string[]
  factorsCount: number
  readiness: number
  fatigue: number
  soreness: number
  workload: number
  action: string
}

const risksByAthlete = computed((): RiskItem[] => {
  const athletes = dashboardStore.athletes
  if (!athletes || athletes.length === 0)
    return []

  return (athletes as any[])
    .map((athlete) => {
      const readiness = athlete.readinessScore || 0
      const fatigue = athlete.fatigueScore || 0
      const soreness = athlete.sorenessScore || 0
      const workload = athlete.recentWorkload || 0

      // Risk score calculation
      const score = (fatigue * 0.4) + (soreness * 0.35) - (readiness * 0.25)
      let level: 'low' | 'medium' | 'high' = 'low'
      let action = 'Continue monitoring'

      if (score > 70) {
        level = 'high'
        action = 'Immediately reduce training load and increase recovery protocols'
      }
      else if (score > 50) {
        level = 'medium'
        action = 'Monitor closely, increase recovery time, reduce training intensity'
      }

      const factors: string[] = []
      if (readiness < 40)
        factors.push('Low readiness')
      if (readiness < 60)
        factors.push('Moderate readiness')
      if (fatigue > 75)
        factors.push('High fatigue')
      if (soreness > 60)
        factors.push('Elevated soreness')
      if (workload > 150)
        factors.push('High workload')

      return {
        id: athlete.id,
        athleteName: athlete.name || athlete.displayName || 'Unknown',
        level,
        score: Math.round(score),
        factors: factors.length > 0 ? factors : ['Monitoring'],
        factorsCount: factors.length,
        readiness,
        fatigue,
        soreness,
        workload,
        action,
      }
    })
    .sort((a, b) => b.score - a.score)
})

const highRiskCount = computed(() => risksByAthlete.value.filter(r => r.level === 'high').length)
const mediumRiskCount = computed(() => risksByAthlete.value.filter(r => r.level === 'medium').length)
const lowRiskCount = computed(() => risksByAthlete.value.filter(r => r.level === 'low').length)

function getRiskIcon(level: 'low' | 'medium' | 'high') {
  switch (level) {
    case 'high': return '🚨'
    case 'medium': return '⚠️'
    case 'low': return '✅'
  }
}

function getRiskColor(level: 'low' | 'medium' | 'high'): string {
  switch (level) {
    case 'high': return 'text-red-600'
    case 'medium': return 'text-yellow-600'
    case 'low': return 'text-green-600'
  }
}

function toggleExpanded(id: string) {
  const idx = expandedIds.value.indexOf(id)
  if (idx >= 0) {
    expandedIds.value.splice(idx, 1)
  }
  else {
    expandedIds.value.push(id)
  }
}

function updateLastTime() {
  const now = new Date()
  const hour = now.getHours().toString().padStart(2, '0')
  const min = now.getMinutes().toString().padStart(2, '0')
  lastUpdateTime.value = `${hour}:${min}`
}

async function refresh() {
  isLoading.value = true
  try {
    await dashboardStore.refresh()
    updateLastTime()
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // Initial load
  if (!dashboardStore.data) {
    refresh()
  }
  else {
    updateLastTime()
  }

  // Auto-refresh every 2 minutes
  refreshInterval = setInterval(() => {
    refresh()
  }, 120000)
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
        {{ t('dashboard.risk.title') }}
      </h3>
      <div class="flex items-center gap-2">
        <span class="text-xs text-muted-foreground">{{ t('dashboard.risk.updated') }} {{ lastUpdateTime }}</span>
        <button
          :disabled="isLoading"
          class="p-1.5 hover:bg-muted rounded-md disabled:opacity-50"
          @click="refresh"
        >
          <RefreshCw :size="16" :class="{ 'animate-spin': isLoading }" />
        </button>
      </div>
    </div>

    <!-- Risk Summary Cards -->
    <div v-if="!isLoading" class="grid grid-cols-3 gap-3 mb-4">
      <div
        class="p-3 rounded-lg border" :class="{
          'bg-red-50 border-red-200 dark:bg-red-950': highRiskCount > 0,
          'bg-muted border-border': highRiskCount === 0,
        }"
      >
        <div class="text-sm text-muted-foreground">
          {{ t('dashboard.risk.critical') }}
        </div>
        <div class="text-2xl font-bold" :class="highRiskCount > 0 ? 'text-red-600' : 'text-muted-foreground'">
          {{ highRiskCount }}
        </div>
      </div>

      <div
        class="p-3 rounded-lg border" :class="{
          'bg-yellow-50 border-yellow-200 dark:bg-yellow-950': mediumRiskCount > 0,
          'bg-muted border-border': mediumRiskCount === 0,
        }"
      >
        <div class="text-sm text-muted-foreground">
          {{ t('dashboard.risk.warning') }}
        </div>
        <div class="text-2xl font-bold" :class="mediumRiskCount > 0 ? 'text-yellow-600' : 'text-muted-foreground'">
          {{ mediumRiskCount }}
        </div>
      </div>

      <div
        class="p-3 rounded-lg border" :class="{
          'bg-green-50 border-green-200 dark:bg-green-950': lowRiskCount > 0,
          'bg-muted border-border': lowRiskCount === 0,
        }"
      >
        <div class="text-sm text-muted-foreground">
          {{ t('dashboard.risk.safe') }}
        </div>
        <div class="text-2xl font-bold" :class="lowRiskCount > 0 ? 'text-green-600' : 'text-muted-foreground'">
          {{ lowRiskCount }}
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-2" />
        <p class="text-sm text-muted-foreground">
          {{ t('dashboard.risk.loading') }}
        </p>
      </div>
    </div>

    <!-- Risk List -->
    <div v-else-if="risksByAthlete.length > 0" class="flex-1 overflow-auto">
      <div v-for="risk in risksByAthlete" :key="risk.id" class="mb-3 last:mb-0">
        <!-- Athlete Risk Card -->
        <div
          class="border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md"
          :class="{
            'bg-red-50 border-red-200 dark:bg-red-950': risk.level === 'high',
            'bg-yellow-50 border-yellow-200 dark:bg-yellow-950': risk.level === 'medium',
            'bg-green-50 border-green-200 dark:bg-green-950': risk.level === 'low',
          }"
          @click="toggleExpanded(risk.id)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 flex-1">
              <div class="text-2xl">
                {{ getRiskIcon(risk.level) }}
              </div>
              <div class="flex-1">
                <p class="font-semibold text-foreground">
                  {{ risk.athleteName }}
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ risk.factorsCount }} {{ t('dashboard.risk.riskFactors') }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold" :class="getRiskColor(risk.level)">
                {{ risk.score }}
              </div>
              <p class="text-xs text-muted-foreground capitalize">
                {{ risk.level }}
              </p>
            </div>
          </div>

          <!-- Expandable Details -->
          <Transition name="expand">
            <div v-if="expandedIds.includes(risk.id)" class="mt-3 pt-3 border-t border-current opacity-60">
              <!-- Risk Factors -->
              <div class="mb-2">
                <p class="text-xs font-semibold text-muted-foreground mb-1">
                  {{ t('dashboard.risk.riskFactorsHeader') }}
                </p>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="(factor, idx) in risk.factors"
                    :key="idx"
                    class="text-xs px-2 py-1 rounded-full bg-black bg-opacity-20"
                  >
                    {{ factor }}
                  </span>
                </div>
              </div>

              <!-- Metrics Detail -->
              <div class="grid grid-cols-2 gap-2 text-xs mb-2">
                <div>
                  <p class="text-muted-foreground">
                    {{ t('dashboard.health.readiness') }}
                  </p>
                  <p class="font-semibold">
                    {{ risk.readiness }}%
                  </p>
                </div>
                <div>
                  <p class="text-muted-foreground">
                    {{ t('dashboard.health.fatigue') }}
                  </p>
                  <p class="font-semibold">
                    {{ risk.fatigue }}%
                  </p>
                </div>
                <div>
                  <p class="text-muted-foreground">
                    {{ t('dashboard.health.soreness') }}
                  </p>
                  <p class="font-semibold">
                    {{ risk.soreness }}%
                  </p>
                </div>
                <div>
                  <p class="text-muted-foreground">
                    {{ t('dashboard.health.workload') }}
                  </p>
                  <p class="font-semibold">
                    {{ risk.workload }}
                  </p>
                </div>
              </div>

              <!-- Recommended Action -->
              <div class="bg-black bg-opacity-10 rounded p-2">
                <p class="text-xs font-semibold mb-1">
                  {{ t('dashboard.risk.recommendedAction') }}
                </p>
                <p class="text-xs leading-relaxed">
                  {{ risk.action }}
                </p>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex-1 flex items-center justify-center text-center text-muted-foreground">
      <div>
        <CheckCircle2 :size="32" class="mx-auto mb-2 opacity-50" />
        <p class="text-sm">
          {{ t('dashboard.risk.noRisks') }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
