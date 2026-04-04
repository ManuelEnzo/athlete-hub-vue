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

const props = defineProps<{ athleteId: number, from?: string, to?: string }>()
const VueApexCharts = defineAsyncComponent(() => import('vue3-apexcharts'))
const { t } = useI18n()

const analyticsSvc = useAnalyticsService()
const data = computed(() => analyticsSvc.data.value)
const loading = computed(() => analyticsSvc.loading.value)
const selectedMetric = ref<string | null>(null)

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

const lastTestsSeries = computed(() => {
  const vals = data.value?.performance.lastTests.map(m => m.value) ?? []
  return [{ name: t('analytics.last_tests'), data: vals }]
})

const lastTestsOptions = computed<ApexOptions>(() => ({
  chart: { toolbar: { show: false } },
  xaxis: { categories: data.value?.performance.lastTests.map(m => m.metricName) ?? [] },
  colors: ['#8b5cf6']
}))
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
          :title="t('analytics.current_acwr_tooltip') "
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

      <!-- QUICK KPIS / CHARTS -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle class="text-sm font-bold uppercase">{{ t('analytics.readiness') }}</CardTitle>
          </CardHeader>
          <CardContent class="flex items-center justify-center">
            <ClientOnly>
              <VueApexCharts type="radialBar" height="160" :options="readinessRadialOptions" :series="readinessRadialSeries" />
            </ClientOnly>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-sm font-bold uppercase">{{ t('analytics.injury_breakdown') }}</CardTitle>
          </CardHeader>
          <CardContent class="flex items-center justify-center">
            <ClientOnly>
              <VueApexCharts type="donut" height="160" :options="injuriesDonutOptions" :series="injuriesDonutSeries" />
            </ClientOnly>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-sm font-bold uppercase">{{ t('analytics.last_tests') }}</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientOnly>
              <VueApexCharts type="bar" height="160" :options="lastTestsOptions" :series="lastTestsSeries" />
            </ClientOnly>
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
