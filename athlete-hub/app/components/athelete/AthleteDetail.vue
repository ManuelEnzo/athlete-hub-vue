<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import type { InjuriesAnalytics } from '@/types/api'

import { ClientOnly } from '#components'
import { Activity, Scale, TrendingUp, Zap } from 'lucide-vue-next'
import { computed, defineAsyncComponent, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAnalyticsService } from '~/services/dataService'
import type { RpeHistoricalEntryDto } from '@/types/api'
import { athleteApi } from '~/api/business'

const props = defineProps<{ athleteId: number, from?: string, to?: string }>()
const VueApexCharts = defineAsyncComponent(() => import('vue3-apexcharts'))
const { t } = useI18n()

const analyticsSvc = useAnalyticsService()
const data = computed(() => analyticsSvc.data.value)
const loading = computed(() => analyticsSvc.loading.value)
const selectedMetric = ref<string | null>(null)
const rpeHistory = ref<RpeHistoricalEntryDto[]>([])

enum RiskManagementAction {
  InsufficientData = 0,
  BaselinePhase = 1,
  LoadRising = 2,
  DangerSpike = 3,
  ModerateRisk = 4,
  HighFatigue = 5,
  Optimal = 6,
}

async function fetchAnalytics() {
  if (!props.athleteId)
    return
  const dateTo = props.to ?? new Date().toISOString()
  const dateFrom = props.from ?? (() => {
    const d = new Date()
    d.setDate(d.getDate() - 42)
    return d.toISOString()
  })()
  await analyticsSvc.fetch(props.athleteId, dateFrom, dateTo).catch(() => {
    // error tracked inside service
  })
  // Fetch RPE history for load comparison (fire-and-forget)
  athleteApi.getHistoricalAnalysis(props.athleteId, 0, 10)
    .then(res => { if (res.data.isSuccess) rpeHistory.value = res.data.value?.items ?? [] })
    .catch(() => {})
}

watch(() => props.athleteId, fetchAnalytics)
onMounted(fetchAnalytics)

const emit = defineEmits(['edit', 'add-injury', 'export', 'history', 'message'])

function onEdit() { emit('edit', data.value?.athlete?.id) }
function onAddInjury() { emit('add-injury', data.value?.athlete?.id) }
function onExport() { emit('export', data.value?.athlete?.id) }
function onHistory() { emit('history', data.value?.athlete?.id) }
function onMessage() { emit('message', data.value?.athlete?.id) }

/* ACWR */

const latestAcwr = computed(() => {
  const current = data.value?.acwr.find(a => a.week === 'Wk Corrente')
  if (!current || current.zone === RiskManagementAction.InsufficientData)
    return null
  return current
})

function getRiskColor(zone?: number) {
  switch (zone) {
    case RiskManagementAction.DangerSpike: return 'text-red-500'
    case RiskManagementAction.ModerateRisk:
    case RiskManagementAction.LoadRising: return 'text-yellow-500'
    case RiskManagementAction.HighFatigue: return 'text-orange-500'
    case RiskManagementAction.Optimal: return 'text-green-500'
    default: return 'text-gray-400'
  }
}

function getRiskLabel(zone?: number) {
  switch (zone) {
    case RiskManagementAction.InsufficientData: return t('analytics.acwr_insufficient_data')
    case RiskManagementAction.BaselinePhase: return t('analytics.risk.baseline')
    case RiskManagementAction.LoadRising: return t('analytics.risk.load_rising')
    case RiskManagementAction.DangerSpike: return t('analytics.risk.danger_spike')
    case RiskManagementAction.ModerateRisk: return t('analytics.risk.moderate_risk')
    case RiskManagementAction.HighFatigue: return t('analytics.risk.high_fatigue')
    case RiskManagementAction.Optimal: return t('analytics.risk.optimal')
    default: return t('fallback.notAvailable')
  }
}

const acwrChartSeries = computed(() => [{ name: t('analytics.acwr'), data: data.value?.acwr.map(a => a.acwr) ?? [] }])

const miniSparkSeries = computed(() => [{ name: t('analytics.acwr'), data: data.value?.acwr.map(a => a.acwr) ?? [] }])

const miniSparkOptions = computed<ApexOptions>(() => ({
  chart: { type: 'line', sparkline: { enabled: true }, toolbar: { show: false } },
  stroke: { width: 2, curve: 'smooth' },
  colors: ['#6366f1'],
  tooltip: { enabled: false },
}))

const readinessPercent = computed(() => {
  const v = data.value?.athlete?.readinessScore ?? 0
  return Math.max(0, Math.min(100, Math.round(v)))
})

const acwrChartOptions = computed<ApexOptions>(() => ({
  chart: { type: 'area', toolbar: { show: false } },
  stroke: { width: 3, curve: 'smooth' },
  colors: ['#6366f1'],
  fill: { type: 'gradient', gradient: { opacityFrom: 0.5, opacityTo: 0.08 } },
  xaxis: { categories: data.value?.acwr.map(a => a.week) ?? [] },
  yaxis: { min: 0, max: 2, title: { text: t('analytics.acwr') } },
  annotations: {
    yaxis: [
      { y: 0.8, y2: 1.3, fillColor: '#22c55e22' },
      { y: 1.3, y2: 1.5, fillColor: '#eab30822' },
      { y: 1.5, y2: 2, fillColor: '#ef444422' },
    ],
  },
}))

const acwrSparkOptions = computed<ApexOptions>(() => ({
  chart: { type: 'area', sparkline: { enabled: true }, toolbar: { show: false } },
  stroke: { width: 2, curve: 'smooth' },
  fill: { type: 'gradient', gradient: { opacityFrom: 0.6, opacityTo: 0.1 } },
  colors: ['#f43f5e'],
}))

const acutePercent = computed(() => {
  const v = latestAcwr.value?.acute ?? 0
  return Math.max(0, Math.min(100, Math.round((v / 2) * 100)))
})

const chronicPercent = computed(() => {
  const v = latestAcwr.value?.chronic ?? 0
  return Math.max(0, Math.min(100, Math.round((v / 2) * 100)))
})

/* PERFORMANCE */

const availableMetrics = computed(() => {
  if (!data.value?.performance.history)
    return []
  const set = new Set<string>()
  data.value.performance.history.forEach(h => h.metrics.forEach(m => set.add(m.metricName)))
  return Array.from(set)
})

watch(availableMetrics, (m) => {
  if (!selectedMetric.value && m.length > 0)
    selectedMetric.value = m[0] ?? null
})

const metricChartSeries = computed(() => {
  if (!selectedMetric.value)
    return []
  const values: (number | null)[] = []
  data.value?.performance.history.forEach((h) => {
    const metric = h.metrics.find(m => m.metricName === selectedMetric.value)
    values.push(metric ? metric.value : null)
  })
  return [{ name: selectedMetric.value, data: values }]
})

const metricChartOptions = computed<ApexOptions>(() => ({
  chart: { type: 'line', toolbar: { show: false } },
  stroke: { curve: 'smooth', width: 3 },
  colors: ['#8b5cf6'],
  markers: { size: 5 },
  xaxis: { categories: data.value?.performance.history.map(h => new Date(h.date).toLocaleDateString()) ?? [] },
}))

/* INJURIES */

const injuries = computed<InjuriesAnalytics[]>(() => data.value?.injuries ?? [])
const totalInjuries = computed(() => injuries.value.length)
const activeInjuries = computed(() => injuries.value.filter(i => i.status.toLowerCase() === 'active'))

function getInjuryBadgeClass(status: string) {
  switch (status.toLowerCase()) {
    case 'active': return 'bg-red-200 text-red-800'
    case 'rehabilitation': return 'bg-yellow-200 text-yellow-800'
    case 'returned': return 'bg-green-200 text-green-800'
    default: return 'bg-gray-200 text-gray-800'
  }
}

function translateInjuryStatus(status: string) {
  const s = (status || '').toLowerCase()
  switch (s) {
    case 'active': return t('injuries.statuses.active')
    case 'rehabilitation':
    case 'rehab': return t('injuries.statuses.rehab')
    case 'returned': return t('injuries.statuses.returned')
    default: return status || t('injuries.fallback.notAvailable')
  }
}

const athleteName = computed(() => data.value?.athlete?.name ?? '')
const athletePosition = computed(() => data.value?.athlete?.position ?? '')
const athleteInitials = computed(() => {
  const name = athleteName.value.trim()
  if (!name) return ''
  return name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
})

/* New charts data */
const injuriesDonutSeries = computed(() => {
  const map = { active: 0, rehabilitation: 0, returned: 0, other: 0 }
  injuries.value.forEach(i => {
    const s = (i.status || '').toLowerCase()
    if (s.includes('active')) map.active++
    else if (s.includes('rehab')) map.rehabilitation++
    else if (s.includes('return')) map.returned++
    else map.other++
  })
  return [map.active, map.rehabilitation, map.returned, map.other]
})

const injuriesDonutOptions = computed<ApexOptions>(() => ({
  labels: [t('injuries.statuses.active'), t('injuries.statuses.rehab'), t('injuries.statuses.returned'), t('common.other')],
  legend: { position: 'bottom' },
  colors: ['#ef4444', '#f59e0b', '#10b981', '#94a3b8']
}))

const readinessRadialSeries = computed(() => [readinessPercent.value])

const readinessRadialOptions = computed<ApexOptions>(() => ({
  plotOptions: { radialBar: { hollow: { size: '55%' }, dataLabels: { name: { show: true }, value: { show: true, formatter: (v:number) => `${v}%` } } } },
  colors: ['#6366f1']
}))

const lastTestsWithTrend = computed(() => {
  const tests = data.value?.performance.lastTests ?? []
  const history = [...(data.value?.performance.history ?? [])]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return tests.map((m) => {
    const entries = history
      .map(h => h.metrics.find(hm => hm.metricName === m.metricName))
      .filter((e): e is typeof m => e != null)
    const prev = entries[1]
    const change = prev != null ? m.value - prev.value : null
    const pct = prev && prev.value !== 0 ? Math.round((change! / prev.value) * 100) : null
    return { ...m, change, pct }
  })
})

const rpeLoadSessions = computed(() => {
  return rpeHistory.value
    .filter(s => s.targetRpe != null && s.targetRpe > 0)
    .slice(0, 7)
    .map((s) => {
      const target = s.targetRpe!
      const actual = s.rpe
      const diff = actual - target
      const pct = Math.round((diff / target) * 100)
      return {
        name: s.nomeSessione || s.sessionType,
        date: new Date(s.sessionDate).toLocaleDateString(),
        actual,
        target,
        diff,
        pct,
        status: pct > 20 ? 'over-high' : pct > 5 ? 'over' : pct < -20 ? 'under' : 'ok',
      }
    })
})

/* READINESS ZONE */
const readinessZone = computed(() => {
  const v = readinessPercent.value
  if (v >= 80) return { label: t('analytics.readiness_peak'), textClass: 'text-green-600', lightClass: 'bg-green-100 text-green-800' }
  if (v >= 60) return { label: t('analytics.readiness_good'), textClass: 'text-blue-600', lightClass: 'bg-blue-100 text-blue-800' }
  if (v >= 40) return { label: t('analytics.readiness_moderate'), textClass: 'text-yellow-600', lightClass: 'bg-yellow-100 text-yellow-800' }
  return { label: t('analytics.readiness_low'), textClass: 'text-red-600', lightClass: 'bg-red-100 text-red-800' }
})

const acwrAlertVisible = computed(() =>
  latestAcwr.value?.zone === RiskManagementAction.DangerSpike
  || latestAcwr.value?.zone === RiskManagementAction.HighFatigue,
)

const acwrBorderClass = computed(() => {
  const z = latestAcwr.value?.zone
  if (z === RiskManagementAction.DangerSpike || z === RiskManagementAction.HighFatigue) return 'border-l-4 border-l-red-500'
  if (z === RiskManagementAction.LoadRising || z === RiskManagementAction.ModerateRisk) return 'border-l-4 border-l-yellow-500'
  if (z === RiskManagementAction.Optimal) return 'border-l-4 border-l-green-500'
  return ''
})

/* INJURY TIMELINE */
const injuryTimeline = computed(() => {
  const today = new Date()
  const rangeMs = 90 * 24 * 60 * 60 * 1000
  const rangeStart = new Date(today.getTime() - rangeMs)
  return injuries.value
    .map((i) => {
      const start = new Date(i.date)
      const isActive = i.status.toLowerCase() === 'active'
      const isRehab = i.status.toLowerCase().includes('rehab')
      const end = isActive
        ? today
        : new Date(start.getTime() + Math.max(1, i.daysOut ?? 1) * 24 * 60 * 60 * 1000)
      const leftPct = Math.max(0, (start.getTime() - rangeStart.getTime()) / rangeMs * 100)
      const rawRight = (end.getTime() - rangeStart.getTime()) / rangeMs * 100
      const rightPct = Math.min(100, rawRight)
      const widthPct = Math.max(2, rightPct - leftPct)
      return { ...i, leftPct, widthPct, rightPct, isActive, isRehab }
    })
    .filter(i => i.rightPct > 0)
    .slice(0, 8)
})
</script>

<template>
  <div class="w-full flex flex-col gap-6">
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6" role="status" aria-live="polite">
      <Skeleton v-for="i in 3" :key="i" class="h-[320px] w-full rounded-xl" />
    </div>

    <template v-else-if="data && data.athlete">
      <!-- HERO -->
      <!-- ATHLETE HEADER -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="flex-none">
            <div class="h-12 w-12 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-semibold text-lg" aria-hidden="true">
              {{ athleteInitials }}
            </div>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-slate-900">{{ athleteName }}</h2>
            <p class="text-sm text-muted-foreground">{{ athletePosition }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
            <div class="text-sm text-muted-foreground">
              {{ t('analytics.readiness_title') }}:
              <span class="font-semibold ml-1">{{ readinessPercent }}%</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <button class="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400" aria-haspopup="true" aria-expanded="false">
                  {{ t('common.actions') || t('common.more') }}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-48">
                <DropdownMenuItem @click="onEdit">{{ t('common.edit') || 'Edit' }}</DropdownMenuItem>
                <DropdownMenuItem @click="onAddInjury">{{ t('analytics.add_injury') || 'Add injury' }}</DropdownMenuItem>
                <DropdownMenuItem @click="onHistory">{{ t('analytics.view_history') || 'History' }}</DropdownMenuItem>
                <DropdownMenuItem @click="onExport">{{ t('common.export') || 'Export' }}</DropdownMenuItem>
                <DropdownMenuItem @click="onMessage">{{ t('common.message') || 'Message' }}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      <!-- ACWR RISK ALERT -->
      <div
        v-if="acwrAlertVisible"
        class="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 px-4 py-3"
        role="alert"
      >
        <Zap class="h-5 w-5 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p class="text-sm font-semibold text-red-700 dark:text-red-400">{{ t('analytics.acwr_alert_title') }}</p>
          <p class="text-xs text-red-600 dark:text-red-500 mt-0.5">{{ getRiskLabel(latestAcwr?.zone) }} — {{ t('analytics.acwr_alert_desc') }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          :title="t('analytics.readiness_title_tooltip')"
        >
          <CardContent class="p-6">
            <p class="text-xs font-bold uppercase text-muted-foreground mb-2">
              {{ t('analytics.readiness_title') }}
            </p>
            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <div class="flex items-baseline gap-3">
                  <span class="text-4xl font-extrabold text-slate-900">{{ data.athlete.readinessScore }}</span>
                  <span class="text-sm text-muted-foreground">{{ t('common.out_of_100') }}</span>
                </div>
                <Activity class="h-6 w-6 text-indigo-600" />
              </div>

              <div class="w-full">
                <div class="h-2 bg-muted rounded-full overflow-hidden">
                  <div :style="{ width: `${readinessPercent}%` }" class="h-2 bg-gradient-to-r from-indigo-500 to-indigo-300" />
                </div>
                <div class="text-xs text-muted-foreground mt-1">
                  {{ readinessPercent }}% {{ t('analytics.readiness_label') }}
                </div>
              </div>

              <div class="w-full">
                <ClientOnly>
                  <VueApexCharts type="line" height="48" :options="miniSparkOptions" :series="miniSparkSeries" />
                </ClientOnly>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          :class="acwrBorderClass"
          :title="t('analytics.current_acwr_tooltip')"
        >
          <CardContent class="p-6">
            <p class="text-xs font-bold uppercase text-muted-foreground mb-2">
              {{ t('analytics.current_acwr') }}
            </p>
            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <div>
                  <span v-if="latestAcwr" class="text-3xl font-bold">{{ latestAcwr.acwr.toFixed(2) }}</span>
                  <span v-else class="text-sm text-muted-foreground">{{ t('analytics.acwr_insufficient_data') }}</span>
                </div>
                <Zap class="h-6 w-6" :class="getRiskColor(latestAcwr?.zone)" />
              </div>

              <div class="w-full">
                <div class="h-2 bg-muted rounded-full overflow-hidden">
                  <div :style="{ width: (latestAcwr ? `${latestAcwr.acwr / 2 * 100}%` : '0%') }" class="h-2 bg-gradient-to-r from-red-500 via-yellow-400 to-green-400" />
                </div>
                <div class="text-xs text-muted-foreground mt-1">
                  {{ getRiskLabel(latestAcwr?.zone) }}
                </div>
              </div>

              <div class="w-full">
                <ClientOnly>
                  <VueApexCharts type="area" height="48" :options="acwrSparkOptions" :series="miniSparkSeries" />
                </ClientOnly>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card :title="t('analytics.acuteload_title_tooltip')">
          <CardContent class="p-6">
            <p class="text-xs font-bold uppercase text-muted-foreground mb-2">
              {{ t('analytics.acute_load') }}
            </p>
            <div class="flex items-center justify-between">
              <span class="text-2xl font-bold">{{ latestAcwr?.acute ?? '-' }}</span>
              <div class="text-xs text-muted-foreground">
                {{ t('common.out_of_2') }}
              </div>
            </div>
            <div class="mt-3">
              <div class="h-2 bg-muted rounded-full overflow-hidden">
                <div :style="{ width: `${acutePercent}%` }" class="h-2 bg-gradient-to-r from-yellow-400 to-red-500" />
              </div>
              <div class="text-xs text-muted-foreground mt-1">
                {{ acutePercent }}% {{ t('analytics.of_max') }}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card :title="t('analytics.chronicload_title_tooltip')">
          <CardContent class="p-6">
            <p class="text-xs font-bold uppercase text-muted-foreground mb-2">
              {{ t('analytics.chronic_load') }}
            </p>
            <div class="flex items-center justify-between">
              <span class="text-2xl font-bold">{{ latestAcwr?.chronic ?? '-' }}</span>
              <div class="text-xs text-muted-foreground">
                {{ t('common.out_of_2') }}
              </div>
            </div>
            <div class="mt-3">
              <div class="h-2 bg-muted rounded-full overflow-hidden">
                <div :style="{ width: `${chronicPercent}%` }" class="h-2 bg-gradient-to-r from-indigo-500 to-green-400" />
              </div>
              <div class="text-xs text-muted-foreground mt-1">
                {{ chronicPercent }}% {{ t('analytics.of_max') }}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- CHARTS -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-sm font-bold uppercase">
              <TrendingUp class="h-4 w-4" />
              {{ t('analytics.workload_trend') }}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ClientOnly>
              <VueApexCharts
                type="area" height="260" :options="acwrChartOptions"
                :series="acwrChartSeries"
              />
            </ClientOnly>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex justify-between items-center">
            <CardTitle class="flex items-center gap-2 text-sm font-bold uppercase">
              <Activity class="h-4 w-4" />
              {{ t('analytics.performance_history') }}
            </CardTitle>
            <select v-model="selectedMetric" class="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-indigo-200" aria-label="Select metric">
              <option v-for="metric in availableMetrics" :key="metric" :value="metric">
                {{ metric }}
              </option>
            </select>
          </CardHeader>
          <CardContent>
            <ClientOnly>
              <VueApexCharts
                v-if="metricChartSeries.length" type="line" height="260"
                :options="metricChartOptions" :series="metricChartSeries"
              />
              <div v-else class="h-[260px] flex items-center justify-center text-muted-foreground">
                {{ t('analytics.no_history') }}
              </div>
            </ClientOnly>
          </CardContent>
        </Card>
      </div>

      <!-- RPE LOAD COMPARISON -->
      <div class="bg-card rounded-2xl border shadow-sm p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wide text-muted-foreground">{{ t('analytics.rpe_load_title') }}</h3>
            <p class="text-xs text-muted-foreground mt-0.5">{{ t('analytics.rpe_load_subtitle') }}</p>
          </div>
        </div>

        <div v-if="rpeLoadSessions.length" class="space-y-4">
          <div
            v-for="s in rpeLoadSessions"
            :key="s.date + s.name"
            class="group rounded-xl border border-border bg-background p-3 hover:shadow-sm transition-shadow"
          >
            <!-- Row header -->
            <div class="flex items-center justify-between mb-2.5">
              <div class="min-w-0">
                <p class="text-sm font-semibold text-foreground truncate">{{ s.name }}</p>
                <p class="text-xs text-muted-foreground">{{ s.date }}</p>
              </div>
              <span
                class="ml-3 shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full"
                :class="{
                  'bg-red-100 text-red-700': s.status === 'over-high',
                  'bg-yellow-100 text-yellow-700': s.status === 'over',
                  'bg-blue-100 text-blue-700': s.status === 'under',
                  'bg-green-100 text-green-700': s.status === 'ok',
                }"
              >
                <template v-if="s.status === 'over-high'">+{{ s.pct }}% {{ t('analytics.rpe_over_target') }}</template>
                <template v-else-if="s.status === 'over'">+{{ s.pct }}% {{ t('analytics.rpe_over_target') }}</template>
                <template v-else-if="s.status === 'under'">{{ s.pct }}% {{ t('analytics.rpe_under_target') }}</template>
                <template v-else>{{ t('analytics.rpe_ok') }}</template>
              </span>
            </div>

            <!-- Dual bars -->
            <div class="space-y-1.5">
              <!-- Actual RPE -->
              <div class="flex items-center gap-2">
                <span class="text-[11px] text-muted-foreground w-16 shrink-0 text-right">{{ t('analytics.rpe_actual') }}</span>
                <div class="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="{
                      'bg-red-500': s.status === 'over-high',
                      'bg-yellow-500': s.status === 'over',
                      'bg-blue-400': s.status === 'under',
                      'bg-green-500': s.status === 'ok',
                    }"
                    :style="{ width: `${(s.actual / 10) * 100}%` }"
                  />
                </div>
                <span
                  class="text-xs font-bold w-8 shrink-0 tabular-nums"
                  :class="{
                    'text-red-600': s.status === 'over-high',
                    'text-yellow-600': s.status === 'over',
                    'text-blue-600': s.status === 'under',
                    'text-green-600': s.status === 'ok',
                  }"
                >{{ s.actual.toFixed(1) }}</span>
              </div>
              <!-- Target RPE -->
              <div class="flex items-center gap-2">
                <span class="text-[11px] text-muted-foreground w-16 shrink-0 text-right">{{ t('analytics.rpe_target') }}</span>
                <div class="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full bg-slate-300 dark:bg-slate-600 transition-all duration-500"
                    :style="{ width: `${(s.target / 10) * 100}%` }"
                  />
                </div>
                <span class="text-xs text-muted-foreground w-8 shrink-0 tabular-nums">{{ s.target.toFixed(1) }}</span>
              </div>
            </div>
          </div>
        </div>

        <p v-else class="py-6 text-center text-sm text-muted-foreground">
          {{ t('analytics.rpe_no_data') }}
        </p>
      </div>

      <!-- QUICK KPIS / CHARTS -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

        <!-- READINESS ZONE CARD -->
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-bold uppercase">{{ t('analytics.readiness') }}</CardTitle>
          </CardHeader>
          <CardContent class="px-5 pb-5">
            <!-- Score + zone -->
            <div class="flex items-end gap-2 mb-3">
              <span class="text-5xl font-black tabular-nums leading-none" :class="readinessZone.textClass">{{ readinessPercent }}</span>
              <span class="text-base text-muted-foreground mb-0.5">/100</span>
            </div>
            <span class="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-4" :class="readinessZone.lightClass">
              {{ readinessZone.label }}
            </span>
            <!-- Gradient zone bar -->
            <div class="relative h-3 rounded-full overflow-hidden bg-gradient-to-r from-red-400 via-orange-400 via-yellow-400 to-green-500">
              <div
                class="absolute top-0 h-3 w-1 -translate-x-0.5 rounded-full bg-white shadow-md ring-1 ring-gray-300 pointer-events-none"
                :style="{ left: `${readinessPercent}%` }"
              />
            </div>
            <div class="flex justify-between text-[10px] text-muted-foreground mt-1.5">
              <span>0</span><span>40</span><span>60</span><span>80</span><span>100</span>
            </div>
          </CardContent>
        </Card>

        <!-- INJURY TIMELINE CARD -->
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-bold uppercase">{{ t('analytics.injury_breakdown') }}</CardTitle>
          </CardHeader>
          <CardContent class="px-5 pb-4">
            <div v-if="injuryTimeline.length > 0">
              <!-- legend -->
              <div class="flex items-center gap-3 mb-3 text-[11px]">
                <span class="flex items-center gap-1.5">
                  <span class="inline-block w-2 h-2 rounded-full bg-red-500" />
                  {{ activeInjuries.length }} {{ t('injuries.statuses.active') }}
                </span>
                <span class="flex items-center gap-1.5">
                  <span class="inline-block w-2 h-2 rounded-full bg-yellow-500" />
                  {{ injuryTimeline.filter(i => i.isRehab).length }} {{ t('injuries.statuses.rehab') }}
                </span>
                <span class="ml-auto text-muted-foreground">{{ t('analytics.last_90_days') }}</span>
              </div>
              <!-- bars -->
              <div class="space-y-3">
                <div v-for="inj in injuryTimeline" :key="inj.date + inj.injury">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-medium text-foreground truncate max-w-[55%]">{{ inj.injury }}</span>
                    <span
                      class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                      :class="inj.isActive ? 'bg-red-100 text-red-700' : inj.isRehab ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'"
                    >{{ translateInjuryStatus(inj.status) }}</span>
                  </div>
                  <div class="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      class="absolute top-0 h-full rounded-full"
                      :class="inj.isActive ? 'bg-red-500' : inj.isRehab ? 'bg-yellow-500' : 'bg-green-400'"
                      :style="{ left: `${inj.leftPct}%`, width: `${inj.widthPct}%` }"
                    />
                  </div>
                </div>
              </div>
              <div class="flex justify-between text-[10px] text-muted-foreground mt-2 pt-1 border-t border-border">
                <span>-90{{ t('common.days_short') }}</span>
                <span>{{ new Date().toLocaleDateString() }}</span>
              </div>
            </div>
            <div v-else class="flex flex-col items-center justify-center py-6 text-center">
              <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <span class="text-green-600 text-lg font-bold">✓</span>
              </div>
              <p class="text-sm font-semibold text-green-700">{{ t('analytics.all_clear') }}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-sm font-bold uppercase">{{ t('analytics.last_tests') }}</CardTitle>
          </CardHeader>
          <CardContent class="px-5 pb-4">
            <div v-if="lastTestsWithTrend.length" class="divide-y divide-border">
              <div
                v-for="m in lastTestsWithTrend"
                :key="m.metricName"
                class="flex items-center justify-between py-2.5 gap-2"
              >
                <span class="text-xs text-muted-foreground truncate min-w-0 flex-1">{{ m.metricName }}</span>
                <div class="flex items-center gap-2 shrink-0">
                  <span class="text-sm font-bold tabular-nums text-foreground">{{ m.value }}<span class="text-xs font-normal text-muted-foreground ml-0.5">{{ m.unit }}</span></span>
                  <span
                    v-if="m.pct !== null"
                    class="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                    :class="m.pct > 0 ? 'bg-green-100 text-green-700' : m.pct < 0 ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'"
                  >
                    {{ m.pct > 0 ? '+' : '' }}{{ m.pct }}%
                  </span>
                </div>
              </div>
            </div>
            <p v-else class="py-4 text-center text-sm text-muted-foreground">{{ t('analytics.no_data_available') }}</p>
          </CardContent>
        </Card>
      </div>

      <!-- BODY + INJURIES -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card class="rounded-2xl border bg-card text-card-foreground shadow-lg">
          <CardHeader class="px-6 py-4">
            <CardTitle class="flex items-center gap-2 text-sm font-bold uppercase text-muted-foreground">
              <Scale class="h-5 w-5 text-purple-500" />
              {{ t('analytics.metrics_summary') }}
            </CardTitle>
          </CardHeader>

          <CardContent class="space-y-3 px-6 py-4">
            <div class="flex justify-between">
              <span class="text-muted-foreground">{{ t('analytics.weight') }}</span>
              <span class="font-semibold">{{ data.athlete.antropometrics.weight }} {{ t('common.kg') }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">{{ t('analytics.height') }}</span>
              <span class="font-semibold">{{ data.athlete.antropometrics.height }} {{ t('common.cm') }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">{{ t('analytics.bmi')
              }}</span><span class="font-semibold">{{ data.athlete.antropometrics.bmi }}</span>
            </div>
          </CardContent>
        </Card>

        <Card v-if="totalInjuries > 0" class="rounded-2xl border bg-card text-card-foreground shadow-lg">
          <CardHeader class="px-6 py-4 border-b">
            <CardTitle class="flex items-center gap-2 text-sm font-bold uppercase text-muted-foreground">
              <Zap class="h-5 w-5 text-red-500" />
              {{ t('analytics.injuries_status') }}
            </CardTitle>
          </CardHeader>

          <CardContent class="space-y-3 px-6 py-4">
            <div class="flex justify-between">
              <span class="text-muted-foreground">{{
                t('analytics.total_injuries') }}</span><span class="font-semibold">{{ totalInjuries
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">{{
                t('analytics.active_injuries') }}</span><span class="font-semibold">{{
                activeInjuries.length }}</span>
            </div>

            <ul class="mt-3 space-y-2 text-sm max-h-64 overflow-y-auto">
              <li
                v-for="injury in injuries" :key="injury.date + injury.injury"
                class="injury-item flex justify-between items-center p-2 rounded-lg border"
                tabindex="0"
              >
                <span>{{ injury.injury }} ({{ new Date(injury.date).toLocaleDateString() }})</span>
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-semibold"
                  :class="getInjuryBadgeClass(injury.status)"
                >
                  {{ translateInjuryStatus(injury.status) }} - {{ injury.daysOut }}{{ t('common.days_short') }}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </template>

    <div v-else class="text-center py-16 text-muted-foreground">
      {{ t('analytics.no_data_available') }}
    </div>
  </div>
</template>

<style scoped>
.injury-item:focus,
.injury-item:hover {
  background-color: rgba(15, 23, 42, 0.04);
}

.athlete-avatar { /* fallback if needed */
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
