<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import type { Pagination, RpeHistoricalEntryDto, RpeLastSessionOverviewDto } from '../../types/api'
import { ClientOnly } from '#components'
import { Activity, ArrowLeft, ChevronLeft, ChevronRight, History, TrendingUp, User2 } from 'lucide-vue-next'
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'

import { useI18n } from 'vue-i18n'
import notifications from '@/lib/notificationService'
// API
import { athleteApi } from '../../api/business'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
// UI
import { Card, CardContent } from '../ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

const { t } = useI18n()
const VueApexCharts = defineAsyncComponent(() => import('vue3-apexcharts'))

// --------------------
// STATE
// --------------------
const athletesOverview = ref<RpeLastSessionOverviewDto[]>([])
const historicalPagination = ref<Pagination<RpeHistoricalEntryDto> | null>(null)
const loading = ref(false)
const loadingHistory = ref(false)

const focusedAthleteId = ref<number | null>(null)
const selectedAthleteFilter = ref<string>('__all__')
// Pagination
const _pageIndex = ref(0)
const pageSize = 10
const _hasMoreHistory = ref(true)

// --------------------
// API CALLS
// --------------------
async function fetchOverview() {
  loading.value = true
  try {
    const res = await athleteApi.getLastSessionInfo()
    const data = res.data.value
    athletesOverview.value = Array.isArray(data) ? data : data ? [data] : []
  }
  catch {
    notifications.error(t('rpe.errors.loadOverview'))
  }
  finally {
    loading.value = false
  }
}

async function fetchHistory(athleteId: number, page = 1) {
  loadingHistory.value = true

  try {
    const res = await athleteApi.getHistoricalAnalysis(athleteId, page, pageSize)
    if (res.data.isSuccess) {
      historicalPagination.value = res.data.value
    }
  }
  catch {
    notifications.error(t('rpe.errors.loadHistory'))
  }
  finally {
    loadingHistory.value = false
  }
}

// --- LOGIC ---
const focusedAthlete = computed(() =>
  athletesOverview.value.find(a => a.athleteId === focusedAthleteId.value) ?? null,
)

function toggleFocus(id: number) {
  focusedAthleteId.value = id
  fetchHistory(id, 1)
}

function goBack() {
  focusedAthleteId.value = null
  historicalPagination.value = null
}

// --- UI HELPERS ---

function getRpeColor(val: number) {
  if (val === 0)
    return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
  if (val <= 2)
    return 'bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400'
  if (val <= 4)
    return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400'
  if (val <= 6)
    return 'bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400'
  if (val <= 8)
    return 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400'
  return 'bg-red-600/15 text-red-800 border-red-600/25 dark:text-red-300'
}

function getRpeDotColor(val: number) {
  if (val === 0) return 'bg-slate-400'
  if (val <= 2) return 'bg-green-500'
  if (val <= 4) return 'bg-yellow-500'
  if (val <= 6) return 'bg-orange-500'
  if (val <= 8) return 'bg-red-500'
  return 'bg-red-700'
}

function getRpeBarColor(val: number) {
  if (val === 0) return 'bg-slate-300'
  if (val <= 2) return 'bg-green-500'
  if (val <= 4) return 'bg-yellow-500'
  if (val <= 6) return 'bg-orange-500'
  if (val <= 8) return 'bg-red-500'
  return 'bg-red-700'
}

function getRpeLabel(val: number) {
  if (val === 0)
    return t('rpe.labels.none')
  if (val <= 2)
    return t('rpe.labels.light')
  if (val <= 4)
    return t('rpe.labels.moderate')
  if (val <= 6)
    return t('rpe.labels.challenging')
  if (val <= 8)
    return t('rpe.labels.hard')
  return t('rpe.labels.maximal')
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr)
    return '-'
  try {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }
  catch {
    return String(dateStr)
  }
}

const _hasOverview = computed(() => (athletesOverview.value && athletesOverview.value.length > 0))
const hasHistoryItems = computed(() => !!(historicalPagination.value && historicalPagination.value.items && historicalPagination.value.items.length > 0))

const filteredOverview = computed(() => {
  if (selectedAthleteFilter.value === '__all__') {
    return athletesOverview.value
  }
  return athletesOverview.value.filter(a => String(a.athleteId) === selectedAthleteFilter.value)
})

const athleteFilterOptions = computed(() => [
  ...athletesOverview.value.map(a => ({ id: String(a.athleteId), name: a.athleteName })),
])

// --------------------
// STATS & CHARTS
// --------------------
const rpeStats = computed(() => {
  const items = athletesOverview.value
  if (!items.length) return null
  const avg = items.reduce((s, a) => s + a.rpe, 0) / items.length
  const atRisk = items.filter(a => a.rpe >= 7).length
  const safe = items.filter(a => a.rpe > 0 && a.rpe <= 4).length
  return { total: items.length, avg: +avg.toFixed(1), atRisk, safe }
})

const rpeDistributionSeries = computed<number[]>(() => {
  const counts: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0]
  for (const a of athletesOverview.value) {
    if (a.rpe === 0) counts[0]++
    else if (a.rpe <= 2) counts[1]++
    else if (a.rpe <= 4) counts[2]++
    else if (a.rpe <= 6) counts[3]++
    else if (a.rpe <= 8) counts[4]++
    else counts[5]++
  }
  return counts
})

const rpeDistributionOptions = computed<ApexOptions>(() => ({
  chart: { type: 'donut', background: 'transparent', toolbar: { show: false } },
  labels: ['Riposo (0)', 'Leggero (1–2)', 'Moderato (3–4)', 'Impegnativo (5–6)', 'Duro (7–8)', 'Massimale (9–10)'],
  colors: ['#94a3b8', '#22c55e', '#eab308', '#f97316', '#ef4444', '#b91c1c'],
  legend: { show: false },
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: '68%', labels: { show: true, total: { show: true, label: 'Atleti', fontSize: '11px', fontWeight: 700, color: '#64748b', formatter: () => String(athletesOverview.value.length) } } } } },
  tooltip: { y: { formatter: (v: number) => `${v} atleti` } },
  stroke: { show: false },
}))

const historySparklineSeries = computed(() => {
  if (!historicalPagination.value?.items?.length) return []
  const items = [...historicalPagination.value.items].reverse()
  return [{ name: 'RPE', data: items.map(e => e.rpe) }]
})

const historySparklineCategories = computed(() => {
  if (!historicalPagination.value?.items?.length) return []
  return [...historicalPagination.value.items].reverse().map(e => formatDate(e.sessionDate))
})

const historySparklineOptions = computed<ApexOptions>(() => ({
  chart: { type: 'area', background: 'transparent', toolbar: { show: false }, animations: { enabled: true } },
  stroke: { curve: 'smooth', width: 2.5 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0.02 } },
  colors: ['#6366f1'],
  xaxis: {
    categories: historySparklineCategories.value,
    labels: { style: { fontSize: '10px' }, rotate: -30 },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { min: 0, max: 10, tickAmount: 5, labels: { style: { fontSize: '10px' }, formatter: (v: number) => v.toFixed(0) } },
  grid: { borderColor: 'rgba(148,163,184,0.2)', strokeDashArray: 4 },
  markers: { size: 4, strokeWidth: 0 },
  tooltip: { y: { formatter: (v: number) => `RPE ${v}/10` } },
  dataLabels: { enabled: false },
  annotations: {
    yaxis: [
      { y: 7, borderColor: '#ef4444', borderWidth: 1, strokeDashArray: 4, label: { text: 'Soglia rischio', style: { fontSize: '10px', color: '#ef4444', background: 'transparent' } } },
    ],
  },
}))

onMounted(fetchOverview)
</script>

<template>
  <div class="min-h-full bg-background">

    <!-- ── OVERVIEW VIEW ─────────────────────────────────────────── -->
    <template v-if="!focusedAthleteId">
      <!-- Page Header -->
      <div class="border-b border-border/60 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div class="px-6 py-5">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20">
              <Activity class="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h1 class="text-base font-semibold tracking-tight text-foreground leading-none">
                {{ t('rpe.dashboardTitle') }}
              </h1>
              <p class="text-xs text-muted-foreground mt-0.5">
                {{ t('rpe.pageDescription') || 'Monitora i livelli di sforzo percepito (RPE) dei tuoi atleti' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 py-6 space-y-5">
        <!-- Filter + Legend row -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Select v-model="selectedAthleteFilter">
            <SelectTrigger class="h-9 w-full sm:w-52 text-sm border-border/60">
              <SelectValue :placeholder="t('common.all') || 'Tutti gli atleti'" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">
                {{ t('common.all') || 'Tutti gli atleti' }}
              </SelectItem>
              <SelectItem v-for="opt in athleteFilterOptions" :key="opt.id" :value="opt.id">
                {{ opt.name }}
              </SelectItem>
            </SelectContent>
          </Select>

          <!-- Inline legend -->
          <div class="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-green-500 inline-block" />0–2 {{ t('rpe.labels.light') }}</span>
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-yellow-500 inline-block" />3–4 {{ t('rpe.labels.moderate') }}</span>
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-orange-500 inline-block" />5–6 {{ t('rpe.labels.challenging') }}</span>
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-red-500 inline-block" />7–8 {{ t('rpe.labels.hard') }}</span>
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-red-700 inline-block" />9–10 {{ t('rpe.labels.maximal') }}</span>
          </div>
        </div>

        <!-- Stats + Distribution Chart -->
        <div v-if="!loading && rpeStats" class="flex flex-col lg:flex-row gap-4">
          <!-- Stat cards -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
            <div class="rounded-xl border border-border/60 bg-card p-4 flex flex-col gap-1.5">
              <p class="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Atleti totali</p>
              <p class="text-2xl font-black text-foreground">{{ rpeStats.total }}</p>
            </div>
            <div class="rounded-xl border border-border/60 bg-card p-4 flex flex-col gap-1.5">
              <p class="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">RPE medio</p>
              <p
                class="text-2xl font-black"
                :class="rpeStats.avg >= 7 ? 'text-red-600 dark:text-red-400' : rpeStats.avg >= 5 ? 'text-orange-500' : 'text-green-600 dark:text-green-400'"
              >
                {{ rpeStats.avg }}
              </p>
            </div>
            <div class="rounded-xl border border-border/60 bg-card p-4 flex flex-col gap-1.5">
              <p class="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">A rischio (≥7)</p>
              <p class="text-2xl font-black" :class="rpeStats.atRisk > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">
                {{ rpeStats.atRisk }}
              </p>
            </div>
            <div class="rounded-xl border border-border/60 bg-card p-4 flex flex-col gap-1.5">
              <p class="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Zona verde (≤4)</p>
              <p class="text-2xl font-black text-green-600 dark:text-green-400">{{ rpeStats.safe }}</p>
            </div>
          </div>
          <!-- Donut chart -->
          <div class="rounded-xl border border-border/60 bg-card p-4 lg:w-56 shrink-0">
            <p class="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Zone RPE</p>
            <ClientOnly>
              <VueApexCharts type="donut" height="168" :options="rpeDistributionOptions" :series="rpeDistributionSeries" />
              <template #fallback>
                <div class="h-[168px] flex items-center justify-center text-xs text-muted-foreground">Caricamento...</div>
              </template>
            </ClientOnly>
          </div>
        </div>

        <!-- Athletes Grid -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="i in 6" :key="i" class="h-44 bg-muted/30 rounded-xl animate-pulse border border-border/40" />
        </div>

        <div v-else-if="filteredOverview.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            v-for="athlete in filteredOverview"
            :key="athlete.athleteId"
            class="group text-left rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 p-5 flex flex-col gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            @click="toggleFocus(athlete.athleteId)"
          >
            <!-- Header row -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User2 class="w-4 h-4 text-primary" />
                </div>
                <span class="text-sm font-semibold text-foreground truncate leading-tight">{{ athlete.athleteName }}</span>
              </div>
              <Badge variant="secondary" class="text-[10px] font-semibold shrink-0">
                {{ t('rpe.lastSession') }}
              </Badge>
            </div>

            <!-- Session info -->
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="space-y-0.5">
                <p class="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Tipo</p>
                <p class="font-semibold text-foreground truncate">{{ athlete.sessionType }}</p>
              </div>
              <div class="space-y-0.5">
                <p class="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Data</p>
                <p class="font-semibold text-foreground">{{ formatDate(athlete.sessionDate) }}</p>
              </div>
            </div>

            <!-- RPE bar -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">RPE</span>
                <div class="flex items-center gap-1.5">
                  <span :class="['text-xs font-bold px-2 py-0.5 rounded-md border', getRpeColor(athlete.rpe)]">
                    {{ athlete.rpe }}/10 · {{ getRpeLabel(athlete.rpe) }}
                  </span>
                </div>
              </div>
              <div class="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="getRpeBarColor(athlete.rpe)"
                  :style="{ width: `${athlete.rpe * 10}%` }"
                />
              </div>
            </div>
          </button>
        </div>

        <!-- Empty state -->
        <div v-else class="py-24 flex flex-col items-center gap-4 text-center">
          <div class="w-14 h-14 rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center text-muted-foreground/30">
            <User2 class="w-6 h-6" />
          </div>
          <div>
            <p class="text-sm font-semibold text-muted-foreground">{{ t('common.noRecords') }}</p>
            <p class="text-xs text-muted-foreground/60 mt-1">{{ t('rpe.noAthletes') || 'Nessun atleta con sessioni RPE recenti' }}</p>
          </div>
        </div>
      </div>
    </template>

    <!-- ── HISTORY VIEW ───────────────────────────────────────────── -->
    <template v-else-if="focusedAthlete">
      <!-- Header -->
      <div class="border-b border-border/60 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div class="px-6 py-4 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0">
            <button
              class="flex items-center justify-center w-8 h-8 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
              @click="goBack"
            >
              <ArrowLeft class="w-4 h-4" />
            </button>
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User2 class="w-4 h-4 text-primary" />
              </div>
              <div class="min-w-0">
                <h2 class="text-sm font-semibold text-foreground leading-none truncate">{{ focusedAthlete.athleteName }}</h2>
                <p class="text-xs text-muted-foreground mt-0.5">{{ t('rpe.historyDetail') }}</p>
              </div>
            </div>
          </div>
          <Badge variant="secondary" class="text-[10px] font-semibold shrink-0">
            <TrendingUp class="w-3 h-3 mr-1" />{{ t('rpe.historyTitle') }}
          </Badge>
        </div>
      </div>

      <div class="px-6 py-6 space-y-3">
        <!-- RPE Trend Sparkline -->
        <div v-if="!loadingHistory && hasHistoryItems" class="rounded-xl border border-border/60 bg-card p-4">
          <p class="text-xs font-semibold text-foreground leading-none">Andamento RPE</p>
          <p class="text-[10px] text-muted-foreground mt-0.5 mb-2">Sessioni in ordine cronologico · soglia rischio a 7</p>
          <ClientOnly>
            <VueApexCharts type="area" height="150" :options="historySparklineOptions" :series="historySparklineSeries" />
            <template #fallback>
              <div class="h-[150px] flex items-center justify-center text-xs text-muted-foreground">Caricamento grafico...</div>
            </template>
          </ClientOnly>
        </div>

        <!-- Loading -->
        <div v-if="loadingHistory" class="space-y-3">
          <div v-for="i in 5" :key="i" class="h-24 bg-muted/30 rounded-xl animate-pulse border border-border/40" />
        </div>

        <!-- History entries -->
        <template v-else-if="hasHistoryItems">
          <div
            v-for="entry in historicalPagination?.items"
            :key="entry.sessionDate + entry.sessionType"
            class="rounded-xl border border-border/60 bg-card p-5 space-y-3 hover:border-border transition-colors"
          >
            <!-- Row 1: date + rpe badge -->
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-0.5">
                <p class="text-sm font-semibold text-foreground leading-none">{{ formatDate(entry.sessionDate) }}</p>
                <p v-if="entry.nomeSessione" class="text-xs text-muted-foreground">{{ entry.nomeSessione }}</p>
              </div>
              <span :class="['text-sm font-bold px-3 py-1 rounded-lg border shrink-0', getRpeColor(entry.rpe)]">
                {{ entry.rpe }}<span class="text-[10px] font-medium opacity-70">/10</span>
              </span>
            </div>

            <!-- RPE bar -->
            <div class="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="getRpeBarColor(entry.rpe)"
                :style="{ width: `${entry.rpe * 10}%` }"
              />
            </div>

            <!-- Meta row -->
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span class="flex items-center gap-1">
                <span :class="['w-1.5 h-1.5 rounded-full inline-block', getRpeDotColor(entry.rpe)]" />
                {{ entry.sessionType }}
              </span>
              <span v-if="entry.targetRpe" class="flex items-center gap-1">
                Target: <strong class="text-foreground">{{ entry.targetRpe }}/10</strong>
              </span>
              <span v-if="entry.rpeStatus" class="font-medium text-foreground/70">{{ entry.rpeStatus }}</span>
              <span v-if="entry.notes" class="italic text-muted-foreground/70">{{ entry.notes }}</span>
            </div>
          </div>
        </template>

        <!-- Empty history -->
        <div v-else class="py-20 flex flex-col items-center gap-3 text-center">
          <div class="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center text-muted-foreground/30">
            <History class="w-5 h-5" />
          </div>
          <p class="text-sm font-semibold text-muted-foreground">{{ t('rpe.noHistory') || 'Nessuna sessione storica disponibile' }}</p>
        </div>

        <!-- Pagination -->
        <div v-if="historicalPagination && historicalPagination.totalPages > 1" class="flex items-center justify-between pt-2 border-t border-border/60">
          <Button
            variant="outline" size="sm"
            class="h-8 px-3 text-xs font-medium gap-1.5 border-border/60"
            :disabled="!historicalPagination.hasPrevious"
            @click="fetchHistory(focusedAthleteId!, historicalPagination.currentPage - 1)"
          >
            <ChevronLeft class="w-3.5 h-3.5" />{{ t('common.prev') }}
          </Button>
          <span class="text-xs text-muted-foreground font-medium">
            {{ t('rpe.pagination.pageInfo', { current: historicalPagination.currentPage, total: historicalPagination.totalPages }) }}
          </span>
          <Button
            variant="outline" size="sm"
            class="h-8 px-3 text-xs font-medium gap-1.5 border-border/60"
            :disabled="!historicalPagination.hasNext"
            @click="fetchHistory(focusedAthleteId!, historicalPagination.currentPage + 1)"
          >
            {{ t('common.next') }}<ChevronRight class="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </template>
  </div>
</template>
