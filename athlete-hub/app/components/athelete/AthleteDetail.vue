<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import type { InjuriesAnalytics } from '@/types/api'
import { ClientOnly } from '#components'
import { Activity, AlertTriangle, BedDouble, Brain, Info, Scale, TrendingUp, Zap } from 'lucide-vue-next'
import { computed, defineAsyncComponent, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { athleteApi } from '~/api/business'
import { useAnalyticsService } from '~/services/dataService'
import type { RpeHistoricalEntryDto } from '@/types/api'

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
  if (!props.athleteId) return
  const dateTo = props.to ?? new Date().toISOString()
  const dateFrom = props.from ?? (() => {
    const d = new Date()
    d.setDate(d.getDate() - 42)
    return d.toISOString()
  })()
  await analyticsSvc.fetch(props.athleteId, dateFrom, dateTo).catch(() => {})
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

// ─── ACWR ────────────────────────────────────────────────────────────────────
const latestAcwr = computed(() => {
  const current = data.value?.acwr.find(a => a.week === 'Wk Corrente')
  if (!current || current.zone === RiskManagementAction.InsufficientData) return null
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

const acwrAlertVisible = computed(() =>
  latestAcwr.value?.zone === RiskManagementAction.DangerSpike
  || latestAcwr.value?.zone === RiskManagementAction.HighFatigue,
)

const acwrBorderClass = computed(() => {
  const z = latestAcwr.value?.zone
  if (z === RiskManagementAction.DangerSpike || z === RiskManagementAction.HighFatigue) return 'border-l-4 border-l-red-500'
  if (z === RiskManagementAction.LoadRising || z === RiskManagementAction.ModerateRisk) return 'border-l-4 border-l-yellow-400'
  if (z === RiskManagementAction.Optimal) return 'border-l-4 border-l-green-500'
  return ''
})

// ─── CURRENT STATE ────────────────────────────────────────────────────────────
const currentState = computed(() => data.value?.currentState ?? null)

const sleepFactorPercent = computed(() =>
  currentState.value != null ? Math.round(currentState.value.sleepFactor * 100) : null,
)

function sleepFactorLabel(v: number): string {
  if (v >= 70) return t('sleep.quality.excellent')
  if (v >= 50) return t('sleep.quality.good')
  if (v >= 35) return t('sleep.quality.fair')
  return t('sleep.quality.poor')
}

// invert=true → high value is bad (fatigue)
function colorBar(v: number, invert = false): string {
  const good = invert ? v <= 30 : v >= 70
  const ok = invert ? v <= 50 : v >= 50
  const warn = invert ? v <= 65 : v >= 30
  if (good) return 'bg-emerald-500'
  if (ok) return 'bg-blue-400'
  if (warn) return 'bg-amber-400'
  return 'bg-red-500'
}

function colorText(v: number, invert = false): string {
  const good = invert ? v <= 30 : v >= 70
  const ok = invert ? v <= 50 : v >= 50
  const warn = invert ? v <= 65 : v >= 30
  if (good) return 'text-emerald-600'
  if (ok) return 'text-blue-600'
  if (warn) return 'text-amber-600'
  return 'text-red-600'
}

// ─── PREDICTIONS ─────────────────────────────────────────────────────────────
const predicted = computed(() => data.value?.predicted ?? [])

const predictedChartSeries = computed(() => [
  { name: t('analytics.readiness'), data: predicted.value.map(p => +(p.readinessScore.toFixed(1))) },
  { name: t('analytics.recovery_score'), data: predicted.value.map(p => +(p.recoveryScore.toFixed(1))) },
  { name: t('analytics.fatigue_score'), data: predicted.value.map(p => +(p.fatigueScore.toFixed(1))) },
])

const predictedChartOptions = computed<ApexOptions>(() => ({
  chart: { type: 'line', toolbar: { show: false }, zoom: { enabled: false } },
  stroke: { curve: 'smooth', width: [3, 2, 2], dashArray: [0, 5, 5] },
  colors: ['#6366f1', '#10b981', '#f59e0b'],
  markers: { size: 4, strokeWidth: 0, hover: { size: 6 } },
  xaxis: {
    categories: predicted.value.map(p => {
      const d = new Date(p.date)
      return `${d.getDate()}/${d.getMonth() + 1}`
    }),
    labels: { style: { fontSize: '11px', fontWeight: '600' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { min: 0, max: 100, labels: { formatter: (v: number) => `${v.toFixed(0)}%` } },
  legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px' },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
  tooltip: { shared: true, y: { formatter: (v: number) => `${v?.toFixed(1)}%` } },
}))

// ─── ACWR CHARTS ─────────────────────────────────────────────────────────────
const acwrSeries = computed(() => [{ name: t('analytics.acwr'), data: data.value?.acwr.map(a => a.acwr) ?? [] }])

const acwrChartOptions = computed<ApexOptions>(() => ({
  chart: { type: 'area', toolbar: { show: false } },
  stroke: { width: 3, curve: 'smooth' },
  colors: ['#6366f1'],
  fill: { type: 'gradient', gradient: { opacityFrom: 0.45, opacityTo: 0.05 } },
  xaxis: {
    categories: data.value?.acwr.map(a => a.week) ?? [],
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { min: 0, max: 2, labels: { formatter: (v: number) => v.toFixed(1) } },
  annotations: {
    yaxis: [
      { y: 0.8, y2: 1.3, fillColor: '#22c55e', opacity: 0.06, label: { text: 'Optimal', style: { fontSize: '10px', color: '#16a34a' } } },
      { y: 1.3, y2: 1.5, fillColor: '#f59e0b', opacity: 0.08 },
      { y: 1.5, y2: 2, fillColor: '#ef4444', opacity: 0.08 },
    ],
  },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
  tooltip: { y: { formatter: (v: number) => v.toFixed(2) } },
}))

const acwrSparkOptions = computed<ApexOptions>(() => ({
  chart: { type: 'area', sparkline: { enabled: true }, toolbar: { show: false } },
  stroke: { width: 2, curve: 'smooth' },
  fill: { type: 'gradient', gradient: { opacityFrom: 0.5, opacityTo: 0.05 } },
  colors: ['#6366f1'],
  tooltip: { enabled: false },
}))

// ─── READINESS ───────────────────────────────────────────────────────────────
const readinessPercent = computed(() => Math.max(0, Math.min(100, Math.round(data.value?.athlete?.readinessScore ?? 0))))

const readinessZone = computed(() => {
  const v = readinessPercent.value
  if (v >= 80) return { label: t('analytics.readiness_peak'), lightClass: 'bg-green-100 text-green-800' }
  if (v >= 60) return { label: t('analytics.readiness_good'), lightClass: 'bg-blue-100 text-blue-800' }
  if (v >= 40) return { label: t('analytics.readiness_moderate'), lightClass: 'bg-yellow-100 text-yellow-800' }
  return { label: t('analytics.readiness_low'), lightClass: 'bg-red-100 text-red-800' }
})

// ─── PERFORMANCE ─────────────────────────────────────────────────────────────
const availableMetrics = computed(() => {
  const set = new Set<string>()
  data.value?.performance.history.forEach(h => h.metrics.forEach(m => set.add(m.metricName)))
  return Array.from(set)
})

watch(availableMetrics, (m) => {
  if (!selectedMetric.value && m.length > 0) selectedMetric.value = m[0] ?? null
})

const metricChartSeries = computed(() => {
  if (!selectedMetric.value) return []
  return [{
    name: selectedMetric.value,
    data: (data.value?.performance.history ?? []).map((h) => {
      const m = h.metrics.find(m => m.metricName === selectedMetric.value)
      return m ? m.value : null
    }),
  }]
})

const metricChartOptions = computed<ApexOptions>(() => ({
  chart: { type: 'line', toolbar: { show: false } },
  stroke: { curve: 'smooth', width: 3 },
  colors: ['#8b5cf6'],
  markers: { size: 5, strokeWidth: 0, hover: { size: 7 } },
  xaxis: {
    categories: (data.value?.performance.history ?? []).map(h => new Date(h.date).toLocaleDateString()),
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
}))

const lastTestsWithTrend = computed(() => {
  const tests = data.value?.performance.lastTests ?? []
  const history = [...(data.value?.performance.history ?? [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return tests.map((m) => {
    const entries = history.map(h => h.metrics.find(hm => hm.metricName === m.metricName)).filter((e): e is typeof m => e != null)
    const prev = entries[1]
    const change = prev != null ? m.value - prev.value : null
    const pct = prev && prev.value !== 0 ? Math.round((change! / prev.value) * 100) : null
    return { ...m, pct }
  })
})

// ─── INJURIES ─────────────────────────────────────────────────────────────────
const injuries = computed<InjuriesAnalytics[]>(() => data.value?.injuries ?? [])
const totalInjuries = computed(() => injuries.value.length)
const activeInjuries = computed(() => injuries.value.filter(i => i.status.toLowerCase() === 'active'))

function getInjuryBadgeClass(status: string) {
  switch ((status || '').toLowerCase()) {
    case 'active': return 'bg-red-100 text-red-700'
    case 'rehabilitation':
    case 'rehab': return 'bg-amber-100 text-amber-700'
    case 'returned': return 'bg-green-100 text-green-700'
    default: return 'bg-slate-100 text-slate-600'
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

const injuryTimeline = computed(() => {
  const today = new Date()
  const rangeMs = 90 * 24 * 60 * 60 * 1000
  const rangeStart = new Date(today.getTime() - rangeMs)
  return injuries.value.map((i) => {
    const start = new Date(i.date)
    const isActive = i.status.toLowerCase() === 'active'
    const isRehab = i.status.toLowerCase().includes('rehab')
    const end = isActive ? today : new Date(start.getTime() + Math.max(1, i.daysOut ?? 1) * 86400000)
    const leftPct = Math.max(0, (start.getTime() - rangeStart.getTime()) / rangeMs * 100)
    const rawRight = (end.getTime() - rangeStart.getTime()) / rangeMs * 100
    const rightPct = Math.min(100, rawRight)
    return { ...i, leftPct, widthPct: Math.max(2, rightPct - leftPct), rightPct, isActive, isRehab }
  }).filter(i => i.rightPct > 0).slice(0, 8)
})

// ─── ATHLETE INFO ─────────────────────────────────────────────────────────────
const athleteName = computed(() => data.value?.athlete?.name ?? '')
const athletePosition = computed(() => data.value?.athlete?.position ?? '')
const athleteInitials = computed(() => athleteName.value.trim().split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase())

// ─── RPE SESSIONS ─────────────────────────────────────────────────────────────
const rpeLoadSessions = computed(() =>
  rpeHistory.value
    .filter(s => s.targetRpe != null && s.targetRpe > 0)
    .slice(0, 7)
    .map((s) => {
      const target = s.targetRpe!
      const actual = s.rpe
      const pct = Math.round(((actual - target) / target) * 100)
      return {
        name: s.nomeSessione || s.sessionType,
        date: new Date(s.sessionDate).toLocaleDateString(),
        actual,
        target,
        pct,
        status: pct > 20 ? 'over-high' : pct > 5 ? 'over' : pct < -20 ? 'under' : 'ok' as string,
      }
    }),
)
</script>

<template>
  <TooltipProvider :delay-duration="300">
  <div class="w-full flex flex-col gap-8">
    <!-- SKELETON -->
    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4" role="status" aria-live="polite">
      <Skeleton v-for="i in 8" :key="i" class="h-28 w-full rounded-xl" />
    </div>

    <template v-else-if="data && data.athlete">

      <!-- ═══ HEADER ══════════════════════════════════════════════════════════ -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div class="flex items-center gap-4">
          <div class="h-12 w-12 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-lg shrink-0">
            {{ athleteInitials }}
          </div>
          <div>
            <h2 class="text-xl font-black tracking-tight">{{ athleteName }}</h2>
            <p class="text-sm text-muted-foreground font-medium">{{ athletePosition }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-muted-foreground hidden sm:block">
            {{ t('analytics.readiness_title') }}:
            <span class="font-semibold ml-1">{{ readinessPercent }}%</span>
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <button class="inline-flex items-center px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/40">
                {{ t('common.actions') }}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-48">
              <DropdownMenuItem @click="onEdit">{{ t('common.edit') }}</DropdownMenuItem>
              <DropdownMenuItem @click="onAddInjury">{{ t('analytics.add_injury') }}</DropdownMenuItem>
              <DropdownMenuItem @click="onHistory">{{ t('analytics.view_history') }}</DropdownMenuItem>
              <DropdownMenuItem @click="onExport">{{ t('common.export') }}</DropdownMenuItem>
              <DropdownMenuItem @click="onMessage">{{ t('common.message') }}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <!-- ACWR ALERT -->
      <div v-if="acwrAlertVisible" class="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3" role="alert">
        <Zap class="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p class="text-sm font-bold text-red-700">{{ t('analytics.acwr_alert_title') }}</p>
          <p class="text-xs text-red-600 mt-0.5">{{ getRiskLabel(latestAcwr?.zone) }} — {{ t('analytics.acwr_alert_desc') }}</p>
        </div>
      </div>

      <!-- ═══ 1. OVERVIEW ══════════════════════════════════════════════════════ -->
      <section>
        <div class="section-heading">
          <span class="section-accent" />
          <h3 class="section-title">{{ t('analytics.section_overview') }}</h3>
          <span class="section-rule" />
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

          <Card>
            <CardContent class="kpi-cell">
              <div class="flex items-start justify-between gap-2">
                <div class="flex flex-col gap-1 min-w-0">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <span class="kpi-label kpi-label--tip">
                        {{ t('analytics.readiness_title') }}
                        <Info class="h-3 w-3 opacity-40 shrink-0" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" class="max-w-[260px] text-xs leading-relaxed">
                      {{ t('analytics.readiness_title_tooltip') }}
                    </TooltipContent>
                  </Tooltip>
                  <span class="kpi-value">{{ readinessPercent }}<span class="kpi-unit">%</span></span>
                  <span class="kpi-badge w-fit" :class="readinessZone.lightClass">{{ readinessZone.label }}</span>
                </div>
                <div class="kpi-icon bg-indigo-100 text-indigo-600"><Activity class="h-5 w-5" /></div>
              </div>
            </CardContent>
          </Card>

          <Card :class="acwrBorderClass">
            <CardContent class="kpi-cell">
              <div class="flex items-start justify-between gap-2">
                <div class="flex flex-col gap-1 min-w-0">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <span class="kpi-label kpi-label--tip">
                        {{ t('analytics.current_acwr') }}
                        <Info class="h-3 w-3 opacity-40 shrink-0" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" class="max-w-[260px] text-xs leading-relaxed">
                      {{ t('analytics.current_acwr_tooltip') }}
                    </TooltipContent>
                  </Tooltip>
                  <span v-if="latestAcwr" class="kpi-value" :class="getRiskColor(latestAcwr.zone)">{{ latestAcwr.acwr.toFixed(2) }}</span>
                  <span v-else class="text-sm text-muted-foreground">{{ t('analytics.acwr_insufficient_data') }}</span>
                  <span class="text-[11px] text-muted-foreground">{{ getRiskLabel(latestAcwr?.zone) }}</span>
                </div>
                <div class="kpi-icon" :class="acwrAlertVisible ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'">
                  <Zap class="h-5 w-5" />
                </div>
              </div>
              <div class="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500" :style="{ width: latestAcwr ? `${Math.min(100, latestAcwr.acwr / 2 * 100)}%` : '0%' }" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent class="kpi-cell">
              <div class="flex items-start justify-between gap-2">
                <div class="flex flex-col gap-1 min-w-0">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <span class="kpi-label kpi-label--tip">
                        {{ t('analytics.recovery_score') }}
                        <Info class="h-3 w-3 opacity-40 shrink-0" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" class="max-w-[260px] text-xs leading-relaxed">
                      {{ t('analytics.recovery_score_tooltip') }}
                    </TooltipContent>
                  </Tooltip>
                  <span class="kpi-value">
                    {{ currentState?.recoveryScore != null ? currentState.recoveryScore.toFixed(1) : '—' }}<span v-if="currentState?.recoveryScore != null" class="kpi-unit">%</span>
                  </span>
                  <div v-if="currentState?.recoveryScore != null" class="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div class="h-full rounded-full" :class="colorBar(currentState.recoveryScore)" :style="{ width: `${currentState.recoveryScore}%` }" />
                  </div>
                </div>
                <div class="kpi-icon bg-emerald-100 text-emerald-600"><Brain class="h-5 w-5" /></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent class="kpi-cell">
              <div class="flex items-start justify-between gap-2">
                <div class="flex flex-col gap-1 min-w-0">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <span class="kpi-label kpi-label--tip">
                        {{ t('analytics.fatigue_score') }}
                        <Info class="h-3 w-3 opacity-40 shrink-0" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" class="max-w-[260px] text-xs leading-relaxed">
                      {{ t('analytics.fatigue_score_tooltip') }}
                    </TooltipContent>
                  </Tooltip>
                  <span class="kpi-value" :class="currentState?.fatigueScore != null && currentState.fatigueScore > 60 ? 'text-red-500' : ''">
                    {{ currentState?.fatigueScore != null ? currentState.fatigueScore.toFixed(1) : '—' }}<span v-if="currentState?.fatigueScore != null" class="kpi-unit">%</span>
                  </span>
                  <div v-if="currentState?.fatigueScore != null" class="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div class="h-full rounded-full" :class="colorBar(currentState.fatigueScore, true)" :style="{ width: `${currentState.fatigueScore}%` }" />
                  </div>
                </div>
                <div class="kpi-icon" :class="currentState?.fatigueScore != null && currentState.fatigueScore > 60 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'">
                  <AlertTriangle class="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- ═══ 2. LOAD ══════════════════════════════════════════════════════════ -->
      <section>
        <div class="section-heading">
          <span class="section-accent" />
          <h3 class="section-title">{{ t('analytics.section_load') }}</h3>
          <span class="section-rule" />
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card class="lg:col-span-2">
            <CardHeader class="pb-2">
              <CardTitle class="flex items-center gap-2 text-base font-bold">
                <TrendingUp class="h-4 w-4 text-primary" />
                {{ t('analytics.workload_trend') }}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClientOnly>
                <VueApexCharts type="area" height="230" :options="acwrChartOptions" :series="acwrSeries" />
              </ClientOnly>
            </CardContent>
          </Card>

          <div class="flex flex-col gap-4">
            <Card>
              <CardContent class="pt-5 pb-4 px-5">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <p class="kpi-label kpi-label--tip mb-1">
                      {{ t('analytics.acute_load') }}
                      <Info class="h-3 w-3 opacity-40 shrink-0" />
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="top" class="max-w-[260px] text-xs leading-relaxed">
                    {{ t('analytics.acuteload_title_tooltip') }}
                  </TooltipContent>
                </Tooltip>
                <p class="text-2xl font-black">{{ currentState?.acuteLoad != null ? Math.round(currentState.acuteLoad) : (latestAcwr?.acute ?? '—') }}</p>
                <p class="text-[11px] text-muted-foreground mt-0.5">{{ t('analytics.last_7_days') }}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent class="pt-5 pb-4 px-5">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <p class="kpi-label kpi-label--tip mb-1">
                      {{ t('analytics.chronic_load') }}
                      <Info class="h-3 w-3 opacity-40 shrink-0" />
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="top" class="max-w-[260px] text-xs leading-relaxed">
                    {{ t('analytics.chronicload_title_tooltip') }}
                  </TooltipContent>
                </Tooltip>
                <p class="text-2xl font-black">{{ currentState?.chronicLoad != null ? Math.round(currentState.chronicLoad) : (latestAcwr?.chronic ?? '—') }}</p>
                <p class="text-[11px] text-muted-foreground mt-0.5">{{ t('analytics.last_28_days') }}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent class="pt-4 pb-3 px-5">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <p class="kpi-label kpi-label--tip mb-2">
                      {{ t('analytics.acwr_trend') }}
                      <Info class="h-3 w-3 opacity-40 shrink-0" />
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="top" class="max-w-[260px] text-xs leading-relaxed">
                    {{ t('analytics.acwr_trend_tooltip') }}
                  </TooltipContent>
                </Tooltip>
                <ClientOnly>
                  <VueApexCharts type="area" height="56" :options="acwrSparkOptions" :series="acwrSeries" />
                </ClientOnly>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <!-- ═══ 3. RECOVERY / SLEEP ══════════════════════════════════════════════ -->
      <section v-if="currentState">
        <div class="section-heading">
          <span class="section-accent" />
          <h3 class="section-title">{{ t('analytics.section_recovery') }}</h3>
          <span class="section-rule" />
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

          <!-- Sleep Factor -->
          <Card>
            <CardContent class="pt-6 pb-5 px-6">
              <div class="flex items-center gap-2 mb-4">
                <BedDouble class="h-4 w-4 text-indigo-500" />
                <Tooltip>
                  <TooltipTrigger as-child>
                    <p class="kpi-label kpi-label--tip">
                      {{ t('analytics.sleep_factor') }}
                      <Info class="h-3 w-3 opacity-40 shrink-0" />
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="top" class="max-w-[260px] text-xs leading-relaxed">
                    {{ t('analytics.sleep_factor_tooltip') }}
                  </TooltipContent>
                </Tooltip>
              </div>
              <div class="flex flex-col items-center gap-2 py-2">
                <span class="text-5xl font-black leading-none" :class="sleepFactorPercent != null ? colorText(sleepFactorPercent) : 'text-muted-foreground'">
                  {{ sleepFactorPercent ?? '—' }}<span v-if="sleepFactorPercent != null" class="text-xl font-semibold">%</span>
                </span>
                <span v-if="sleepFactorPercent != null" class="text-xs font-bold px-2.5 py-1 rounded-full bg-muted">
                  {{ sleepFactorLabel(sleepFactorPercent) }}
                </span>
                <div v-if="sleepFactorPercent != null" class="w-full h-2.5 bg-muted rounded-full overflow-hidden mt-1">
                  <div class="h-full rounded-full transition-all" :class="colorBar(sleepFactorPercent)" :style="{ width: `${sleepFactorPercent}%` }" />
                </div>
                <p class="text-[10px] text-muted-foreground text-center mt-1">{{ t('analytics.sleep_factor_desc') }}</p>
              </div>
            </CardContent>
          </Card>

          <!-- Scores bars -->
          <Card>
            <CardContent class="pt-6 pb-5 px-6 flex flex-col gap-5">
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <p class="kpi-label kpi-label--tip">
                        {{ t('analytics.recovery_score') }}
                        <Info class="h-3 w-3 opacity-40 shrink-0" />
                      </p>
                    </TooltipTrigger>
                    <TooltipContent side="top" class="max-w-[260px] text-xs leading-relaxed">
                      {{ t('analytics.recovery_score_tooltip') }}
                    </TooltipContent>
                  </Tooltip>
                  <span class="text-sm font-black">{{ currentState.recoveryScore.toFixed(1) }}%</span>
                </div>
                <div class="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all" :class="colorBar(currentState.recoveryScore)" :style="{ width: `${currentState.recoveryScore}%` }" />
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <p class="kpi-label kpi-label--tip">
                        {{ t('analytics.fatigue_score') }}
                        <Info class="h-3 w-3 opacity-40 shrink-0" />
                        <span class="text-[10px] opacity-50 normal-case font-normal">({{ t('analytics.fatigue_high_bad') }})</span>
                      </p>
                    </TooltipTrigger>
                    <TooltipContent side="top" class="max-w-[260px] text-xs leading-relaxed">
                      {{ t('analytics.fatigue_score_tooltip') }}
                    </TooltipContent>
                  </Tooltip>
                  <span class="text-sm font-black" :class="currentState.fatigueScore > 60 ? 'text-red-500' : ''">
                    {{ currentState.fatigueScore.toFixed(1) }}%
                  </span>
                </div>
                <div class="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all" :class="colorBar(currentState.fatigueScore, true)" :style="{ width: `${currentState.fatigueScore}%` }" />
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <p class="kpi-label kpi-label--tip">
                        {{ t('analytics.readiness_title') }}
                        <Info class="h-3 w-3 opacity-40 shrink-0" />
                        <span class="text-[10px] opacity-50 normal-case font-normal">({{ t('analytics.computed') }})</span>
                      </p>
                    </TooltipTrigger>
                    <TooltipContent side="top" class="max-w-[260px] text-xs leading-relaxed">
                      {{ t('analytics.readiness_score_tooltip') }}
                    </TooltipContent>
                  </Tooltip>
                  <span class="text-sm font-black">{{ currentState.readinessScore.toFixed(1) }}%</span>
                </div>
                <div class="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div class="h-full rounded-full bg-indigo-500 transition-all" :style="{ width: `${currentState.readinessScore}%` }" />
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Anthropometrics -->
          <Card>
            <CardContent class="pt-6 pb-5 px-6">
              <div class="flex items-center gap-2 mb-4">
                <Scale class="h-4 w-4 text-purple-500" />
                <p class="kpi-label">{{ t('analytics.metrics_summary') }}</p>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between items-center py-2 border-b">
                  <span class="text-sm text-muted-foreground">{{ t('analytics.weight') }}</span>
                  <span class="font-bold">{{ data.athlete.antropometrics.weight }} {{ t('common.kg') }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b">
                  <span class="text-sm text-muted-foreground">{{ t('analytics.height') }}</span>
                  <span class="font-bold">{{ data.athlete.antropometrics.height }} {{ t('common.cm') }}</span>
                </div>
                <div class="flex justify-between items-center py-2">
                  <span class="text-sm text-muted-foreground">{{ t('analytics.bmi') }}</span>
                  <span class="font-bold">{{ data.athlete.antropometrics.bmi }}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- ═══ 4. PERFORMANCE ════════════════════════════════════════════════════ -->
      <section>
        <div class="section-heading">
          <span class="section-accent" />
          <h3 class="section-title">{{ t('analytics.section_performance') }}</h3>
          <span class="section-rule" />
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card class="lg:col-span-2">
            <CardHeader class="flex justify-between items-start gap-2">
              <CardTitle class="flex items-center gap-2 text-base font-bold">
                <Activity class="h-4 w-4 text-primary" />
                {{ t('analytics.performance_history') }}
              </CardTitle>
              <select v-model="selectedMetric" class="text-xs border border-border rounded-md px-2 py-1 bg-background focus:ring-2 focus:ring-primary/30 max-w-[180px]">
                <option v-for="metric in availableMetrics" :key="metric" :value="metric">{{ metric }}</option>
              </select>
            </CardHeader>
            <CardContent>
              <ClientOnly>
                <VueApexCharts v-if="metricChartSeries.length" type="line" height="230" :options="metricChartOptions" :series="metricChartSeries" />
                <div v-else class="h-[230px] flex items-center justify-center text-sm text-muted-foreground">{{ t('analytics.no_history') }}</div>
              </ClientOnly>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-base font-bold">{{ t('analytics.last_tests') }}</CardTitle>
              <p v-if="data.performance?.lastTestDate" class="text-[11px] text-muted-foreground">
                {{ new Date(data.performance.lastTestDate).toLocaleDateString() }}
              </p>
            </CardHeader>
            <CardContent class="px-5 pb-4">
              <div v-if="lastTestsWithTrend.length" class="divide-y">
                <div v-for="m in lastTestsWithTrend" :key="m.metricName" class="flex items-center justify-between py-3 gap-2">
                  <span class="text-xs text-muted-foreground truncate flex-1 min-w-0">{{ m.metricName }}</span>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <span class="text-sm font-bold tabular-nums">{{ m.value }}<span class="text-xs font-normal text-muted-foreground ml-0.5">{{ m.unit }}</span></span>
                    <span v-if="m.pct !== null" class="text-[11px] font-semibold px-1.5 py-0.5 rounded" :class="m.pct > 0 ? 'bg-green-100 text-green-700' : m.pct < 0 ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'">
                      {{ m.pct > 0 ? '+' : '' }}{{ m.pct }}%
                    </span>
                  </div>
                </div>
              </div>
              <p v-else class="py-8 text-center text-sm text-muted-foreground">{{ t('analytics.no_data_available') }}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- ═══ 5. PREDICTIONS ════════════════════════════════════════════════════ -->
      <section v-if="predicted.length">
        <div class="section-heading">
          <span class="section-accent" />
          <h3 class="section-title">{{ t('analytics.section_predictions') }}</h3>
          <span class="section-rule" />
        </div>
        <Card>
          <CardHeader class="pb-2">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle class="text-base font-bold">{{ t('analytics.predicted_title') }}</CardTitle>
                <p class="text-[11px] text-muted-foreground mt-0.5">{{ t('analytics.predicted_subtitle') }}</p>
              </div>
              <div class="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                <span class="flex items-center gap-1.5"><span class="inline-block w-5 h-0.5 bg-indigo-500 rounded-full" />{{ t('analytics.readiness') }}</span>
                <span class="flex items-center gap-1.5"><span class="inline-block w-5 h-0.5 bg-emerald-500 rounded-full opacity-70" />{{ t('analytics.recovery_score') }}</span>
                <span class="flex items-center gap-1.5"><span class="inline-block w-5 h-0.5 bg-amber-500 rounded-full opacity-70" />{{ t('analytics.fatigue_score') }}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ClientOnly>
              <VueApexCharts type="line" height="220" :options="predictedChartOptions" :series="predictedChartSeries" />
            </ClientOnly>
          </CardContent>
        </Card>
      </section>

      <!-- ═══ 6. INJURIES ═══════════════════════════════════════════════════════ -->
      <section v-if="totalInjuries > 0">
        <div class="section-heading">
          <span class="section-accent" />
          <h3 class="section-title">{{ t('analytics.section_injuries') }}</h3>
          <span class="section-rule" />
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-base font-bold">{{ t('analytics.injury_breakdown') }}</CardTitle>
            </CardHeader>
            <CardContent class="px-5 pb-4">
              <div v-if="injuryTimeline.length">
                <div class="flex flex-wrap items-center gap-3 mb-3 text-[11px]">
                  <span class="flex items-center gap-1.5"><span class="inline-block w-2 h-2 rounded-full bg-red-500" />{{ activeInjuries.length }} {{ t('injuries.statuses.active') }}</span>
                  <span class="flex items-center gap-1.5"><span class="inline-block w-2 h-2 rounded-full bg-amber-400" />{{ injuryTimeline.filter(i => i.isRehab).length }} {{ t('injuries.statuses.rehab') }}</span>
                  <span class="ml-auto text-muted-foreground">{{ t('analytics.last_90_days') }}</span>
                </div>
                <div class="space-y-3">
                  <div v-for="inj in injuryTimeline" :key="inj.date + inj.injury">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-xs font-medium truncate max-w-[55%]">{{ inj.injury }}</span>
                      <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0" :class="inj.isActive ? 'bg-red-100 text-red-700' : inj.isRehab ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'">
                        {{ translateInjuryStatus(inj.status) }}
                      </span>
                    </div>
                    <div class="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div class="absolute top-0 h-full rounded-full" :class="inj.isActive ? 'bg-red-500' : inj.isRehab ? 'bg-amber-400' : 'bg-green-400'" :style="{ left: `${inj.leftPct}%`, width: `${inj.widthPct}%` }" />
                    </div>
                  </div>
                </div>
                <div class="flex justify-between text-[10px] text-muted-foreground mt-2 pt-1 border-t">
                  <span>-90{{ t('common.days_short') }}</span>
                  <span>{{ new Date().toLocaleDateString() }}</span>
                </div>
              </div>
              <div v-else class="flex flex-col items-center justify-center py-8 text-center">
                <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <span class="text-green-600 font-bold">✓</span>
                </div>
                <p class="text-sm font-semibold text-green-700">{{ t('analytics.all_clear') }}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="pb-2">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <CardTitle class="flex items-center gap-2 text-base font-bold">
                  <Zap class="h-4 w-4 text-red-500" />
                  {{ t('analytics.injuries_status') }}
                </CardTitle>
                <div class="flex gap-2 text-[11px]">
                  <span class="bg-muted px-2 py-0.5 rounded-full font-bold">{{ t('analytics.total_injuries') }}: {{ totalInjuries }}</span>
                  <span v-if="activeInjuries.length" class="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">{{ t('analytics.active_injuries') }}: {{ activeInjuries.length }}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent class="px-5 pb-4">
              <ul class="space-y-2 max-h-64 overflow-y-auto">
                <li v-for="injury in injuries" :key="injury.date + injury.injury" class="flex justify-between items-center p-2.5 rounded-lg border hover:bg-muted/40 transition-colors">
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium truncate">{{ injury.injury }}</p>
                    <p class="text-[11px] text-muted-foreground">{{ new Date(injury.date).toLocaleDateString() }}</p>
                  </div>
                  <span class="ml-3 shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold" :class="getInjuryBadgeClass(injury.status)">
                    {{ translateInjuryStatus(injury.status) }} · {{ injury.daysOut }}{{ t('common.days_short') }}
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- ═══ 7. RPE LOAD ════════════════════════════════════════════════════════ -->
      <section v-if="rpeLoadSessions.length">
        <div class="section-heading">
          <span class="section-accent" />
          <h3 class="section-title">{{ t('analytics.rpe_load_title') }}</h3>
          <span class="section-rule" />
        </div>
        <div class="bg-card rounded-2xl border shadow-sm p-5">
          <p class="text-xs text-muted-foreground mb-4">{{ t('analytics.rpe_load_subtitle') }}</p>
          <div class="space-y-3">
            <div v-for="s in rpeLoadSessions" :key="s.date + s.name" class="rounded-xl border bg-background p-3">
              <div class="flex items-center justify-between mb-2.5">
                <div class="min-w-0">
                  <p class="text-sm font-semibold truncate">{{ s.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ s.date }}</p>
                </div>
                <span class="ml-3 shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full" :class="{ 'bg-red-100 text-red-700': s.status === 'over-high', 'bg-yellow-100 text-yellow-700': s.status === 'over', 'bg-blue-100 text-blue-700': s.status === 'under', 'bg-green-100 text-green-700': s.status === 'ok' }">
                  <template v-if="s.status === 'ok'">{{ t('analytics.rpe_ok') }}</template>
                  <template v-else-if="s.status === 'under'">{{ s.pct }}% {{ t('analytics.rpe_under_target') }}</template>
                  <template v-else>+{{ s.pct }}% {{ t('analytics.rpe_over_target') }}</template>
                </span>
              </div>
              <div class="space-y-1.5">
                <div class="flex items-center gap-2">
                  <span class="text-[11px] text-muted-foreground w-16 shrink-0 text-right">{{ t('analytics.rpe_actual') }}</span>
                  <div class="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500" :class="{ 'bg-red-500': s.status === 'over-high', 'bg-yellow-500': s.status === 'over', 'bg-blue-400': s.status === 'under', 'bg-green-500': s.status === 'ok' }" :style="{ width: `${(s.actual / 10) * 100}%` }" />
                  </div>
                  <span class="text-xs font-bold w-8 shrink-0 tabular-nums">{{ s.actual.toFixed(1) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[11px] text-muted-foreground w-16 shrink-0 text-right">{{ t('analytics.rpe_target') }}</span>
                  <div class="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div class="h-full rounded-full bg-slate-300 transition-all duration-500" :style="{ width: `${(s.target / 10) * 100}%` }" />
                  </div>
                  <span class="text-xs text-muted-foreground w-8 shrink-0 tabular-nums">{{ s.target.toFixed(1) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </template>

    <div v-else class="text-center py-16 text-muted-foreground">
      {{ t('analytics.no_data_available') }}
    </div>
  </div>
  </TooltipProvider>
</template>

<style scoped>
.section-heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.section-accent {
  display: block;
  height: 1.25rem;
  width: 0.25rem;
  border-radius: 9999px;
  background-color: hsl(var(--primary));
  flex-shrink: 0;
}
.section-title {
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: -0.015em;
  color: hsl(var(--foreground));
  flex-shrink: 0;
}
.section-rule {
  flex: 1 1 0%;
  display: block;
  height: 1px;
  background-color: hsl(var(--border));
}
.kpi-cell {
  padding: 1.25rem 1.25rem 1rem;
}
.kpi-label {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: hsl(var(--muted-foreground));
}
.kpi-value {
  font-size: 1.875rem;
  font-weight: 900;
  line-height: 1.25;
}
.kpi-unit {
  font-size: 1rem;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  margin-left: 0.125rem;
}
.kpi-badge {
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}
.kpi-icon {
  padding: 0.5rem;
  border-radius: 0.75rem;
  flex-shrink: 0;
}
.kpi-label--tip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  cursor: default;
}
</style>
