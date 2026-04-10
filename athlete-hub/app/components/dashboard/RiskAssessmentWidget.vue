<script setup lang="ts">
import { AlertTriangle, ArrowUp, CheckCircle2, Minus, TrendingUp } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '~/stores/dashboardStore'

const { t } = useI18n()
const dashboardStore = useDashboardStore()

// Backend RiskManagementAction enum values:
//   0=InsufficientData, 1=BaselinePhase, 2=LoadRising,
//   3=DangerSpike, 4=ModerateRisk, 5=HighFatigue, 6=Optimal
// Display scale: 0=Stabile, 1=InAumento, 2=Alto, 3=Critico
function toTrendLevel(riskAction: number): number {
  switch (riskAction) {
    case 3: // DangerSpike
    case 5: // HighFatigue
      return 3
    case 4: // ModerateRisk
      return 2
    case 2: // LoadRising
      return 1
    default: // InsufficientData(0), BaselinePhase(1), Optimal(6)
      return 0
  }
}

const riskAlerts = computed(() => dashboardStore.filteredData?.riskAlerts ?? [])

const criticalCount = computed(() => riskAlerts.value.filter(r => toTrendLevel(Number(r.riskTrend)) >= 3).length)
const warningCount = computed(() => riskAlerts.value.filter(r => { const l = toTrendLevel(Number(r.riskTrend)); return l === 1 || l === 2 }).length)
const safeCount = computed(() => riskAlerts.value.filter(r => toTrendLevel(Number(r.riskTrend)) === 0).length)

const sortedAlerts = computed(() => {
  return [...riskAlerts.value].sort((a, b) => {
    const trendDiff = toTrendLevel(Number(b.riskTrend)) - toTrendLevel(Number(a.riskTrend))
    if (trendDiff !== 0)
      return trendDiff
    return b.acwrValue - a.acwrValue
  })
})

function trendRowClass(trend: number): string {
  if (trend >= 3)
    return 'border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20'
  if (trend === 2)
    return 'border-l-4 border-l-orange-400 bg-orange-50/50 dark:bg-orange-950/20'
  if (trend === 1)
    return 'border-l-4 border-l-yellow-400 bg-yellow-50/50 dark:bg-yellow-950/20'
  return 'border-l-4 border-l-green-400 bg-green-50/50 dark:bg-green-950/20'
}

function acwrBadgeClass(acwr: number): string {
  if (acwr > 1.5)
    return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
  if (acwr > 1.3)
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
  if (acwr >= 0.8)
    return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
  return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
}

function trendLabel(trend: number): string {
  if (trend >= 3)
    return t('dashboard.riskTrend.critical')
  if (trend === 2)
    return t('dashboard.riskTrend.high')
  if (trend === 1)
    return t('dashboard.riskTrend.increasing')
  return t('dashboard.riskTrend.stable')
}

function trendTextClass(trend: number): string {
  if (trend >= 3)
    return 'text-red-600 dark:text-red-400'
  if (trend === 2)
    return 'text-orange-500 dark:text-orange-400'
  if (trend === 1)
    return 'text-yellow-600 dark:text-yellow-400'
  return 'text-green-600 dark:text-green-400'
}
</script>

<template>
  <div class="h-full flex flex-col gap-3 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between shrink-0">
      <h3 class="text-base font-semibold text-foreground">
        {{ t('dashboard.risk.title') }}
      </h3>
      <span class="text-xs text-muted-foreground">{{ riskAlerts.length }} {{ t('dashboard.athletes') }}</span>
    </div>

    <!-- Summary counters -->
    <div class="grid grid-cols-3 gap-2 shrink-0">
      <div
        class="rounded-lg p-2.5 text-center"
        :class="criticalCount > 0 ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800' : 'bg-muted border border-border'"
      >
        <p class="text-[11px] text-muted-foreground">
          {{ t('dashboard.riskTrend.critical') }}
        </p>
        <p class="text-xl font-bold" :class="criticalCount > 0 ? 'text-red-600' : 'text-muted-foreground'">
          {{ criticalCount }}
        </p>
      </div>
      <div
        class="rounded-lg p-2.5 text-center"
        :class="warningCount > 0 ? 'bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800' : 'bg-muted border border-border'"
      >
        <p class="text-[11px] text-muted-foreground">
          {{ t('dashboard.riskTrend.increasing') }}
        </p>
        <p class="text-xl font-bold" :class="warningCount > 0 ? 'text-yellow-600' : 'text-muted-foreground'">
          {{ warningCount }}
        </p>
      </div>
      <div
        class="rounded-lg p-2.5 text-center"
        :class="safeCount > 0 ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800' : 'bg-muted border border-border'"
      >
        <p class="text-[11px] text-muted-foreground">
          {{ t('dashboard.risk.safe') }}
        </p>
        <p class="text-xl font-bold" :class="safeCount > 0 ? 'text-green-600' : 'text-muted-foreground'">
          {{ safeCount }}
        </p>
      </div>
    </div>

    <!-- Alert list -->
    <div v-if="sortedAlerts.length" class="flex-1 overflow-auto flex flex-col gap-2">
      <div
        v-for="alert in sortedAlerts"
        :key="alert.athleteName"
        class="rounded-lg border p-3"
        :class="trendRowClass(toTrendLevel(Number(alert.riskTrend)))"
      >
        <div class="flex items-center justify-between gap-2">
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-foreground text-sm truncate">
              {{ alert.athleteName }}
            </p>
            <p class="text-[11px] text-muted-foreground">
              {{ alert.discipline }}
            </p>
          </div>
          <span
            class="text-xs font-mono font-bold px-2 py-0.5 rounded-full shrink-0"
            :class="acwrBadgeClass(alert.acwrValue)"
          >
            ACWR {{ alert.acwrValue.toFixed(2) }}
          </span>
          <span
            class="text-xs font-semibold shrink-0 flex items-center gap-0.5"
            :class="trendTextClass(toTrendLevel(Number(alert.riskTrend)))"
          >
            <AlertTriangle v-if="toTrendLevel(Number(alert.riskTrend)) >= 2" class="h-3.5 w-3.5" />
            <TrendingUp v-else-if="toTrendLevel(Number(alert.riskTrend)) === 1" class="h-3.5 w-3.5" />
            <CheckCircle2 v-else class="h-3.5 w-3.5" />
            {{ trendLabel(toTrendLevel(Number(alert.riskTrend))) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="flex-1 flex items-center justify-center text-center text-muted-foreground">
      <div>
        <CheckCircle2 :size="28" class="mx-auto mb-2 opacity-50" />
        <p class="text-sm">
          {{ t('dashboard.risk.noRisks') }}
        </p>
      </div>
    </div>
  </div>
</template>

