<script setup lang="ts">
import { onMounted, computed, ref, defineAsyncComponent } from 'vue'
import type { ApexOptions } from 'apexcharts'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTestService } from '~/services/testService'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAthletesStore } from '~/stores/athletesStore'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const svc = useTestService()
const VueApexCharts = defineAsyncComponent(() => import('vue3-apexcharts'))
import { ClientOnly } from '#components'
const { data, loading, error } = svc

// Athlete selection (reuse store pattern used elsewhere)
const athletesStore = useAthletesStore()
const selectedAthleteId = ref<number | null>(null)
const athletes = computed(() => athletesStore.items)
const loadingAthletes = computed(() => athletesStore.loading)
const selectedTestIndex = ref<number | null>(null)

const comparisonsList = computed(() => data.value ?? [])

// selected test (one of the comparisons)
const selectedTest = computed(() => {
  if (selectedTestIndex.value == null) return null
  return comparisonsList.value[selectedTestIndex.value] ?? null
})

// athlete-specific comparison for the selected test
const selectedComparison = computed(() => {
  const st = selectedTest.value
  if (!selectedAthleteId.value || !st) return null
  return st.athleteComparisons.find((a: any) => a.athleteId === selectedAthleteId.value) ?? null
})

// helper to safely get metric result for the selected athlete
import type { AthleteMetricComparisonDto } from '~/types/api'
function getResultFor(metricId: number): AthleteMetricComparisonDto | undefined {
  return selectedComparison.value?.results?.find((r: AthleteMetricComparisonDto) => r.metricId === metricId)
}

onMounted(async () => {
  // load athletes for selector
  await athletesStore.initialize().catch(() => {})
  if (athletes.value.length > 0 && selectedAthleteId.value === null) {
    selectedAthleteId.value = athletes.value[0]?.id ?? null
  }
})

// When athlete changes, fetch comparisons for that athlete
import { watch } from 'vue'
watch(selectedAthleteId, async (val) => {
  if (!val) return
  try {
    await svc.fetchForAthlete(val)
    // default to first test
    if ((data.value ?? []).length > 0) selectedTestIndex.value = 0
    else selectedTestIndex.value = null
  }
  catch (err) {
    // swallow - error shown via svc.error
    selectedTestIndex.value = null
  }
}, { immediate: true })

const metrics = computed(() => selectedTest.value?.metrics ?? [])

// KPI values for the UI summary row
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

// Athlete-specific quick stats (for the selected athlete/comparison)
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

// Charts for selected test
const metricAvgSeries = computed(() => {
  const st = selectedTest.value
  if (!st) return []
  const names = (st.metrics ?? []).map((m: any) => m.name)
  const values = names.map((n: string) => {
    // average percentOfStandard across athletes for that metric
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
  xaxis: { categories: metrics.value.map((m: any) => m.name) },
  yaxis: { labels: { formatter: (v: number) => `${v}%` } },
  tooltip: { y: { formatter: (v: number) => `${v}%` } },
}))

const metricDeltaSeries = computed(() => {
  const st = selectedTest.value
  if (!st) return []
  // line series for average delta per metric
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
  xaxis: { categories: metrics.value.map((m: any) => m.name) },
  yaxis: { labels: { formatter: (v: number) => `${v}` } },
  tooltip: { y: { formatter: (v: number) => `${v}` } },
}))

function getStatusLabel(status?: string | null) {
  if (!status) return '-'
  // map known statuses to localized strings
  return t(`testComparison.statuses.${status}`) ?? status
}

function deltaValue(metricId: number): number | null {
  const r = getResultFor(metricId)
  if (!r || r.delta == null) return null
  return Number(r.delta)
}

function deltaClassFor(metricId: number) {
  const v = deltaValue(metricId)
  if (v == null) return 'text-gray-600'
  return v > 0 ? 'inline-flex items-center px-2 py-1 rounded text-green-700 bg-green-100' : (v < 0 ? 'inline-flex items-center px-2 py-1 rounded text-red-700 bg-red-100' : 'inline-flex items-center px-2 py-1 rounded text-gray-700 bg-gray-100')
}

function deltaText(metricId: number) {
  const v = deltaValue(metricId)
  if (v == null) return '-'
  return v > 0 ? `+${v}` : `${v}`
}

function percentText(metricId: number) {
  const r = getResultFor(metricId)
  if (!r || r.percentOfStandard == null) return null
  return Math.round(r.percentOfStandard) + '%'
}

function percentClass(metricId: number) {
  const r = getResultFor(metricId)
  if (!r) return 'text-gray-600'
  return r.status === 'Better' ? 'text-green-600' : (r.status === 'Worse' ? 'text-red-600' : 'text-gray-600')
}

const tableRows = computed(() => {
  return metrics.value.map((m: any) => {
    const r = getResultFor(m.id)
    const delta = r && r.delta != null ? Number(r.delta) : null
    const percent = r && r.percentOfStandard != null ? Math.round(r.percentOfStandard) + '%' : null
    const status = r?.status ?? null
    const deltaClass = delta == null ? null : (delta > 0 ? 'inline-flex items-center px-2 py-1 rounded text-green-700 bg-green-100' : (delta < 0 ? 'inline-flex items-center px-2 py-1 rounded text-red-700 bg-red-100' : 'inline-flex items-center px-2 py-1 rounded text-gray-700 bg-gray-100'))
    const percentClass = status === 'Better' ? 'text-green-600' : (status === 'Worse' ? 'text-red-600' : 'text-gray-600')
    return { metric: m, value: r?.value ?? null, delta, deltaClass, deltaText: delta == null ? null : (delta > 0 ? `+${delta}` : `${delta}`), percent, percentClass, status }
  })
})
</script>

<template>
  <div class="w-full">
    <Card>
      <CardHeader>
        <CardTitle>{{ selectedTest?.testName ?? t('common.loading') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex items-center justify-between gap-4 mb-4">
          <div class="text-sm text-muted-foreground">{{ t('testComparison.eventId') }}: {{ selectedTest?.eventId ?? '-' }}</div>

          <div class="flex items-center gap-2">
            <Skeleton v-if="loadingAthletes" class="h-5 w-5" />
            <div class="relative min-w-[200px] sm:min-w-[260px] w-full sm:w-auto">
              <Select v-model="selectedAthleteId">
                <SelectTrigger class="w-full pl-9 font-semibold">
                  <SelectValue :placeholder="t('measurements.validation.selectAthlete')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="ath in athletes" :key="ath.id" :value="ath.id">
                    {{ ath.firstName }} {{ ath.lastName }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
              <div class="relative min-w-[220px] sm:min-w-[320px] w-full sm:w-auto">
                <Select v-model="selectedTestIndex">
                  <SelectTrigger class="w-full pl-3 font-semibold">
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

        <!-- KPI summary row -->
        <div class="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-4">
          <div class="p-4 bg-white/60 rounded border">
            <div class="text-sm text-muted-foreground">{{ t('testComparison.kpi.testsCount') }}</div>
            <div class="text-2xl font-bold">{{ kpiTestsCount }}</div>
          </div>

          <div class="p-4 bg-white/60 rounded border">
            <div class="text-sm text-muted-foreground">{{ t('testComparison.kpi.avgDelta') }}</div>
            <div class="text-2xl font-bold">{{ kpiAvgDelta !== null ? kpiAvgDelta : '-' }}</div>
          </div>

          <div class="p-4 bg-white/60 rounded border">
            <div class="text-sm text-muted-foreground">{{ t('testComparison.kpi.bestMetric') }}</div>
            <div class="text-2xl font-bold">{{ kpiBestMetric ?? '-' }}</div>
          </div>

          <div class="p-4 bg-white/60 rounded border">
            <div class="text-sm text-muted-foreground">Positive</div>
            <div class="text-2xl font-bold text-green-600">{{ positiveCount }}</div>
          </div>

          <div class="p-4 bg-white/60 rounded border">
            <div class="text-sm text-muted-foreground">Negative</div>
            <div class="text-2xl font-bold text-red-600">{{ negativeCount }}</div>
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
          <!-- Charts row -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <Card>
              <CardHeader>
                <CardTitle>{{ t('testComparison.kpi.bestMetric') }}</CardTitle>
              </CardHeader>
              <CardContent>
                <ClientOnly>
                  <VueApexCharts v-if="selectedTest" :options="metricAvgOptions" :series="metricAvgSeries" type="bar" height="220" />
                </ClientOnly>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{{ t('testComparison.delta') }}</CardTitle>
              </CardHeader>
              <CardContent>
                <ClientOnly>
                  <VueApexCharts v-if="selectedTest" :options="metricDeltaOptions" :series="metricDeltaSeries" type="line" height="220" />
                </ClientOnly>
              </CardContent>
            </Card>
          </div>
          <div class="mb-4 text-sm text-muted-foreground">{{ t('testComparison.metricsCount') }}: {{ metrics.length }}</div>

          <div v-if="!selectedComparison" class="py-8 text-center">
            <p class="text-muted-foreground">{{ t('testComparison.selectAthletePrompt') }}</p>
          </div>

          <div v-else class="overflow-auto">
            <table class="w-full table-auto border-collapse">
              <thead>
                <tr class="text-left">
                  <th class="p-2 border-b">{{ t('testComparison.metric') }}</th>
                  <th class="p-2 border-b">{{ t('testComparison.value') }}</th>
                  <th class="p-2 border-b">{{ t('testComparison.delta') }}</th>
                  <th class="p-2 border-b">{{ t('testComparison.percent') }}</th>
                  <th class="p-2 border-b">{{ t('testComparison.status') }}</th>
                </tr>
              </thead>
              <tbody>
                  <tr v-for="row in tableRows" :key="row.metric.id" class="odd:bg-white even:bg-slate-50">
                  <td class="p-2 border-b align-top">
                    <div class="font-semibold">{{ row.metric.name }}</div>
                    <div class="text-xs text-muted-foreground">{{ row.metric.unit }} · std: {{ row.metric.standardValue ?? '-' }}</div>
                  </td>
                  <td class="p-2 border-b align-top">
                    <div class="font-mono">{{ row.value ?? '-' }}</div>
                  </td>
                  <td class="p-2 border-b align-top">
                    <span v-if="row.delta != null" :class="row.deltaClass">{{ row.deltaText }}</span>
                    <span v-else>-</span>
                  </td>
                  <td class="p-2 border-b align-top">
                    <span v-if="row.percent != null" :class="row.percentClass">{{ row.percent }}</span>
                    <span v-else>-</span>
                  </td>
                  <td class="p-2 border-b align-top">
                    <span :class="{'text-green-600': row.status==='Better', 'text-red-600': row.status==='Worse'}">{{ getStatusLabel(row.status) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else>
          <p>{{ t('testComparison.noData') }}</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
