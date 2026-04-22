<script setup lang="ts">
import { onMounted, computed, ref, defineAsyncComponent } from 'vue'
import type { ApexOptions } from 'apexcharts'
import { useI18n } from 'vue-i18n'
import { BarChart2, Loader2, User } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTestService } from '~/services/testService'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAthletesStore } from '~/stores/athletesStore'

const { t } = useI18n()

const svc = useTestService()
const VueApexCharts = defineAsyncComponent(() => import('vue3-apexcharts'))
import { ClientOnly } from '#components'
const { data, loading, error } = svc

// Athlete selection
const athletesStore = useAthletesStore()
const selectedAthleteId = ref<number | null>(null)
const athletes = computed(() => athletesStore.items)
const loadingAthletes = computed(() => athletesStore.loading)
const selectedTestIndex = ref<number | null>(null)

const comparisonsList = computed(() => data.value ?? [])

const selectedTest = computed(() => {
  if (selectedTestIndex.value == null) return null
  return comparisonsList.value[selectedTestIndex.value] ?? null
})

const selectedComparison = computed(() => {
  const st = selectedTest.value
  if (!selectedAthleteId.value || !st) return null
  return st.athleteComparisons.find((a: any) => a.athleteId === selectedAthleteId.value) ?? null
})

import type { AthleteMetricComparisonDto } from '~/types/api'
function getResultFor(metricId: number): AthleteMetricComparisonDto | undefined {
  return selectedComparison.value?.results?.find((r: AthleteMetricComparisonDto) => r.metricId === metricId)
}

onMounted(async () => {
  await athletesStore.initialize().catch(() => {})
  if (athletes.value.length > 0 && selectedAthleteId.value === null) {
    selectedAthleteId.value = athletes.value[0]?.id ?? null
  }
})

import { watch } from 'vue'
watch(selectedAthleteId, async (val) => {
  if (!val) return
  try {
    await svc.fetchForAthlete(val)
    if ((data.value ?? []).length > 0) selectedTestIndex.value = 0
    else selectedTestIndex.value = null
  }
  catch {
    selectedTestIndex.value = null
  }
}, { immediate: true })

const metrics = computed(() => selectedTest.value?.metrics ?? [])

const kpiTestsCount = computed(() => (comparisonsList.value ?? []).length)
const kpiAvgDelta = computed(() => {
  const vals: number[] = (comparisonsList.value ?? []).flatMap(c =>
    (c.athleteComparisons ?? []).flatMap((a: any) => (a.results ?? []).map((r: any) => Number(r.delta)).filter((v: number) => !Number.isNaN(v)))
  )
  if (vals.length === 0) return null
  return Math.round((vals.reduce((s, n) => s + n, 0) / vals.length) * 100) / 100
})

const kpiBestMetric = computed(() => {
  const map = new Map<string, number>()
  ;(comparisonsList.value ?? []).forEach(c => {
    (c.athleteComparisons ?? []).forEach((a: any) => {
      (a.results ?? []).forEach((r: any) => {
        const m = metrics.value.find((mm: any) => mm.id === r.metricId)
        if (!m) return
        const val = Number(r.value)
        const prev = map.get(m.name) ?? -Infinity
        if (!Number.isNaN(val) && val > prev) map.set(m.name, val)
      })
    })
  })
  if (map.size === 0) return null
  let best: string | null = null
  let bestVal = -Infinity
  for (const [k, v] of map) {
    if (v > bestVal) { bestVal = v; best = k }
  }
  return best
})

const athleteResults = computed(() => selectedComparison.value?.results ?? [])
const positiveCount = computed(() => athleteResults.value.filter(r => Number(r.delta) > 0).length)
const negativeCount = computed(() => athleteResults.value.filter(r => Number(r.delta) < 0).length)
const bestDeltaMetric = computed(() => {
  const res = athleteResults.value
  if (!res || res.length === 0) return null
  let best: any = null
  res.forEach(r => {
    if (!best || Number(r.delta) > Number(best.delta)) best = r
  })
  if (!best) return null
  const m = selectedTest.value?.metrics?.find((mm: any) => mm.id === best.metricId)
  return m ? `${m.name} (${best.delta > 0 ? '+' : ''}${best.delta})` : null
})

const metricAvgSeries = computed(() => {
  const st = selectedTest.value
  if (!st) return []
  const names = (st.metrics ?? []).map((m: any) => m.name)
  const values = names.map((n: string) => {
    const vals: number[] = (st.athleteComparisons ?? []).flatMap((a: any) =>
      (a.results ?? []).filter((r: any) => {
        const metric = st.metrics.find((mm: any) => mm.id === r.metricId)
        return metric && metric.name === n && r.percentOfStandard != null
      }).map((r: any) => Number(r.percentOfStandard))
    )
    if (vals.length === 0) return null
    return Math.round((vals.reduce((s, x) => s + x, 0) / vals.length) * 100) / 100
  })
  return [{ name: t('testComparison.percent'), data: values }]
})

const metricAvgOptions = computed<ApexOptions>(() => ({
  chart: { type: 'bar', toolbar: { show: false } },
  plotOptions: { bar: { borderRadius: 6 } },
  xaxis: {
    categories: metrics.value.map((m: any) => m.name),
    labels: { rotate: -35, hideOverlappingLabels: true },
    title: { text: t('testComparison.metric') },
  },
  yaxis: {
    labels: { formatter: (v: number) => `${v}%` },
    title: { text: t('testComparison.percent') },
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: { formatter: (v: number) => (v == null ? '-' : `${v}%`) },
  },
  dataLabels: { enabled: true, formatter: (v: number) => (v == null ? '-' : `${v}%`) },
  legend: { show: false },
  responsive: [
    { breakpoint: 768, options: { plotOptions: { bar: { borderRadius: 4 } }, xaxis: { labels: { rotate: -25 } } } },
  ],
}))

const metricDeltaSeries = computed(() => {
  const st = selectedTest.value
  if (!st) return []
  const names = (st.metrics ?? []).map((m: any) => m.name)
  const vals = names.map((n: string) => {
    const deltas: number[] = (st.athleteComparisons ?? []).flatMap((a: any) =>
      (a.results ?? []).filter((r: any) => {
        const metric = st.metrics.find((mm: any) => mm.id === r.metricId)
        return metric && metric.name === n && r.delta != null
      }).map((r: any) => Number(r.delta))
    )
    if (deltas.length === 0) return null
    return Math.round((deltas.reduce((s, x) => s + x, 0) / deltas.length) * 100) / 100
  })
  return [{ name: t('testComparison.delta'), data: vals }]
})

const metricDeltaOptions = computed<ApexOptions>(() => ({
  chart: { type: 'line', toolbar: { show: false } },
  stroke: { curve: 'smooth', width: 3 },
  markers: { size: 4 },
  xaxis: {
    categories: metrics.value.map((m: any) => m.name),
    labels: { rotate: -35, hideOverlappingLabels: true },
    title: { text: t('testComparison.metric') },
  },
  yaxis: {
    labels: { formatter: (v: number) => `${v}` },
    title: { text: t('testComparison.delta') },
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: { formatter: (v: number) => (v == null ? '-' : `${v}`) },
  },
  dataLabels: { enabled: true, formatter: (v: number) => (v == null ? '-' : `${v}`) },
  legend: { show: false },
  responsive: [
    { breakpoint: 768, options: { markers: { size: 3 }, xaxis: { labels: { rotate: -25 } } } },
  ],
}))

function getStatusLabel(status?: string | null) {
  if (!status) return '-'
  return t(`testComparison.statuses.${status}`) ?? status
}

const tableRows = computed(() => {
  return metrics.value.map((m: any) => {
    const r = getResultFor(m.id)
    const delta = r && r.delta != null ? Number(r.delta) : null
    const percent = r && r.percentOfStandard != null ? Math.round(r.percentOfStandard) + '%' : null
    const status = r?.status ?? null
    const deltaClass = delta == null ? null : (delta > 0 ? 'inline-flex items-center px-2 py-1 rounded text-green-700 bg-green-100' : (delta < 0 ? 'inline-flex items-center px-2 py-1 rounded text-red-700 bg-red-100' : 'inline-flex items-center px-2 py-1 rounded text-gray-700 bg-gray-100'))
    const pClass = status === 'Better' ? 'text-green-600' : (status === 'Worse' ? 'text-red-600' : 'text-gray-600')
    return { metric: m, value: r?.value ?? null, delta, deltaClass, deltaText: delta == null ? null : (delta > 0 ? `+${delta}` : `${delta}`), percent, percentClass: pClass, status }
  })
})
</script>

<template>
  <div class="min-h-full bg-background">
    <!-- Page Header -->
    <div class="border-b border-border/60 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
      <div class="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20">
            <BarChart2 class="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 class="text-base font-semibold tracking-tight text-foreground leading-none">
              {{ t('testComparison.pageTitle') }}
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">
              {{ t('testComparison.pageDescription') }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <Loader2 v-if="loadingAthletes" class="h-4 w-4 animate-spin text-muted-foreground" />

          <Select v-model="selectedAthleteId">
            <SelectTrigger class="h-9 w-52 text-sm border-border/60 font-medium">
              <div class="flex items-center gap-2">
                <User class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <SelectValue :placeholder="t('measurements.validation.selectAthlete')" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="ath in athletes" :key="ath.id" :value="ath.id">
                {{ ath.firstName }} {{ ath.lastName }}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select v-model="selectedTestIndex">
            <SelectTrigger class="h-9 w-64 text-sm border-border/60 font-medium">
              <SelectValue :placeholder="t('testComparison.selectTest')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="(c, idx) in comparisonsList" :key="c.eventId" :value="idx">
                {{ c.testName }} ({{ c.eventId }})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <div class="px-6 py-6 space-y-6">
      <!-- KPI summary row -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div class="p-4 bg-card border border-border/60 rounded-xl">
          <div class="text-xs text-muted-foreground">{{ t('testComparison.kpi.testsCount') }}</div>
          <div class="text-2xl font-bold mt-1">{{ kpiTestsCount }}</div>
        </div>
        <div class="p-4 bg-card border border-border/60 rounded-xl">
          <div class="text-xs text-muted-foreground">{{ t('testComparison.kpi.avgDelta') }}</div>
          <div class="text-2xl font-bold mt-1">{{ kpiAvgDelta !== null ? kpiAvgDelta : '-' }}</div>
        </div>
        <div class="p-4 bg-card border border-border/60 rounded-xl">
          <div class="text-xs text-muted-foreground">{{ t('testComparison.kpi.bestMetric') }}</div>
          <div class="text-lg font-bold mt-1 truncate">{{ kpiBestMetric ?? '-' }}</div>
        </div>
        <div class="p-4 bg-card border border-border/60 rounded-xl">
          <div class="text-xs text-muted-foreground">Positive</div>
          <div class="text-2xl font-bold mt-1 text-green-600">{{ positiveCount }}</div>
        </div>
        <div class="p-4 bg-card border border-border/60 rounded-xl">
          <div class="text-xs text-muted-foreground">Negative</div>
          <div class="text-2xl font-bold mt-1 text-red-600">{{ negativeCount }}</div>
        </div>
      </div>

      <div v-if="loading">
        <Skeleton class="h-6 w-3/4 mb-4" />
        <Skeleton class="h-40 w-full" />
      </div>

      <div v-else-if="error">
        <p class="text-red-600">{{ error?.message }}</p>
      </div>

      <div v-else-if="data">
        <!-- Selected test info -->
        <div v-if="selectedTest" class="text-sm text-muted-foreground mb-2">
          <span class="font-medium text-foreground">{{ selectedTest.testName }}</span>
          &nbsp;·&nbsp;{{ t('testComparison.eventId') }}: {{ selectedTest.eventId }}
        </div>

        <!-- Charts row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle class="text-sm font-semibold">{{ t('testComparison.kpi.bestMetric') }}</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientOnly>
                <VueApexCharts v-if="selectedTest" :options="metricAvgOptions" :series="metricAvgSeries" type="bar" height="220" />
              </ClientOnly>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle class="text-sm font-semibold">{{ t('testComparison.delta') }}</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientOnly>
                <VueApexCharts v-if="selectedTest" :options="metricDeltaOptions" :series="metricDeltaSeries" type="line" height="220" />
              </ClientOnly>
            </CardContent>
          </Card>
        </div>

        <div class="mb-3 text-xs text-muted-foreground">{{ t('testComparison.metricsCount') }}: {{ metrics.length }}</div>

        <div v-if="!selectedComparison" class="py-16 flex flex-col items-center gap-3 text-center">
          <div class="w-14 h-14 rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center text-muted-foreground/30">
            <User class="h-6 w-6" />
          </div>
          <p class="text-sm text-muted-foreground">{{ t('testComparison.selectAthletePrompt') }}</p>
        </div>

        <div v-else class="overflow-auto rounded-xl border border-border/60">
          <table class="w-full table-auto border-collapse">
            <thead>
              <tr class="bg-muted/40">
                <th class="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{{ t('testComparison.metric') }}</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{{ t('testComparison.value') }}</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{{ t('testComparison.delta') }}</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{{ t('testComparison.percent') }}</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{{ t('testComparison.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in tableRows" :key="row.metric.id" class="border-t border-border/50 hover:bg-muted/30 transition-colors">
                <td class="px-3 py-2.5 align-top">
                  <div class="text-sm font-medium">{{ row.metric.name }}</div>
                  <div class="text-xs text-muted-foreground">{{ row.metric.unit }} · std: {{ row.metric.standardValue ?? '-' }}</div>
                </td>
                <td class="px-3 py-2.5 align-top font-mono text-sm">{{ row.value ?? '-' }}</td>
                <td class="px-3 py-2.5 align-top">
                  <span v-if="row.delta != null" :class="row.deltaClass">{{ row.deltaText }}</span>
                  <span v-else class="text-muted-foreground">-</span>
                </td>
                <td class="px-3 py-2.5 align-top">
                  <span v-if="row.percent != null" :class="row.percentClass">{{ row.percent }}</span>
                  <span v-else class="text-muted-foreground">-</span>
                </td>
                <td class="px-3 py-2.5 align-top">
                  <span :class="{'text-green-600 font-medium': row.status==='Better', 'text-red-600 font-medium': row.status==='Worse', 'text-muted-foreground': !row.status}">
                    {{ getStatusLabel(row.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="py-16 text-center text-sm text-muted-foreground">
        {{ t('testComparison.noData') }}
      </div>
    </div>
  </div>
</template>
