<script setup lang="ts">
import { ref, onMounted, computed, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Users, Activity, AlertCircle, CheckCircle, Shield, TrendingUp, UserRound, ArrowUpRight,
  Calendar, Zap, Heart, Target, Clock, Flame, TrendingDown, Award, Radar, Percent,
  BarChart3, RefreshCw, AlertTriangle, ThumbsUp, PieChart
} from 'lucide-vue-next'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { athleteApi } from '@/api/business'
import type { CoachDashboardSummaryDto } from '@/types/api'
import type { ApexOptions } from 'apexcharts'

// 1. IMPORT SICURO PER SSR
const VueApexCharts = defineAsyncComponent(() =>
  (import.meta.client) // <--- Cambia qui
    ? import('vue3-apexcharts')
    : Promise.resolve({ render: () => null }) as any
)

const { t } = useI18n()

// State
const dashboardData = ref<CoachDashboardSummaryDto | null>(null)
const loading = ref(true)

// Actions
async function fetchDashboard() {
  loading.value = true
  try {
    const res = await athleteApi.getSummary()
    if (res.data.isSuccess && res.data.value) {
      dashboardData.value = res.data.value
    }
  } catch (error) {
    console.error('Errore caricamento dashboard:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchDashboard())

// CHART OPTIONS (Rimangono uguali, ma ora sono protette dal ClientOnly nel template)
const workloadChartOptions = computed<ApexOptions>(() => ({
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'system-ui'},
  colors: ['#3b82f6'],
  plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
  xaxis: {
    categories: dashboardData.value?.workloadComparison?.map(d => d.label) ?? [],
    labels: { style: { fontSize: '12px', fontWeight: 500 } }
  },
  grid: { borderColor: 'hsl(var(--muted-foreground) / 0.1)', strokeDashArray: 4 },
  tooltip: { theme: 'dark' }
}))

const workloadChartSeries = computed(() => [
  { name: 'Total Workload', data: dashboardData.value?.workloadComparison?.map(d => d.value) ?? [] }
])

const healthChartOptions = computed<ApexOptions>(() => ({
  chart: { type: 'donut', fontFamily: 'system-ui' },
  labels: dashboardData.value?.healthDistribution?.map(h => h.status) ?? [],
  colors: dashboardData.value?.healthDistribution?.map(h => h.color) ?? ['#10b981', '#f59e0b', '#ef4444'],
  stroke: { width: 2, colors: ['#fff'] },
  legend: { position: 'bottom', fontSize: '12px' },
  plotOptions: { pie: { donut: { size: '75%', labels: { show: true, name: { fontSize: '14px', fontWeight: 600 } } } } },
  dataLabels: { enabled: true }
}))

const healthChartSeries = computed(() => dashboardData.value?.healthDistribution?.map(h => h.count) ?? [])

const disciplineChartOptions = computed<ApexOptions>(() => ({
  chart: { type: 'pie', fontFamily: 'system-ui' },
  labels: dashboardData.value?.disciplineDistribution?.map(d => d.discipline) ?? [],
  legend: { position: 'bottom' },
  tooltip: { theme: 'dark' }
}))

const disciplineChartSeries = computed(() => dashboardData.value?.disciplineDistribution?.map(d => d.count) ?? [])

const radarChartOptions = computed<ApexOptions>(() => ({
  chart: { type: 'radar', fontFamily: 'system-ui', toolbar: { show: false } },
  colors: ['#3b82f6', '#ef4444'],
  xaxis: { categories: dashboardData.value?.athleteStatusMatrix?.map(a => a.name.split(' ')[0]) ?? [] },
  yaxis: { max: 100, show: false },
  tooltip: { theme: 'dark' }
}))

const radarChartSeries = computed(() => [
  { name: 'Readiness', data: dashboardData.value?.athleteStatusMatrix?.map(a => a.readiness) ?? [] },
  { name: 'ACWR Intensity', data: dashboardData.value?.athleteStatusMatrix?.map(a => Math.min(100, a.acwr * 40)) ?? [] }
])
</script>

<template>
  <div class="w-full min-h-screen bg-background space-y-8 font-sans pb-10">
    <div class="bg-gradient-to-r from-primary/5 to-transparent border-b border-primary/10 px-6 py-8">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-4xl font-bold text-foreground tracking-tight mb-2">{{ t('performanceDashboard.pageTitle') }}</h1>
          <p class="text-muted-foreground text-sm font-medium">{{ t('performanceDashboard.subtitle') }}</p>
        </div>
        <div class="text-right">
          <p class="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">{{ t('performanceDashboard.lastUpdated') }}</p>
          <p class="text-lg font-bold text-foreground">{{ new Date().toLocaleTimeString() }}</p>
        </div>
      </div>
    </div>

    <div class="px-6 space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card class="border border-foreground/10 shadow-md">
          <CardContent class="p-6">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Atleti Totali</p>
                <p class="text-3xl font-bold tracking-tight">{{ dashboardData?.totalMonitoredAthletes || 0 }}</p>
              </div>
              <Users class="h-6 w-6 text-muted-foreground/40" />
            </div>
          </CardContent>
        </Card>
        <Card class="border border-foreground/10 shadow-md">
          <CardContent class="p-6">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Readiness Media</p>
                <p class="text-3xl font-bold tracking-tight">{{ dashboardData?.averageReadinessScore || 0 }}%</p>
              </div>
              <Activity class="h-6 w-6 text-muted-foreground/40" />
            </div>
          </CardContent>
        </Card>
        <Card class="border border-foreground/10 shadow-md">
          <CardContent class="p-6">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">ACWR Critici</p>
                <p class="text-3xl font-bold tracking-tight text-red-600">{{ dashboardData?.criticalAcwrCount || 0 }}</p>
              </div>
              <Flame class="h-6 w-6 text-muted-foreground/40" />
            </div>
          </CardContent>
        </Card>
        <Card class="border border-foreground/10 shadow-md">
          <CardContent class="p-6">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Report Mancanti</p>
                <p class="text-3xl font-bold tracking-tight text-amber-600">{{ dashboardData?.missingReportsToday || 0 }}</p>
              </div>
              <CheckCircle class="h-6 w-6 text-muted-foreground/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card class="lg:col-span-8 border border-foreground/10 shadow-md">
          <CardHeader class="pb-3 border-b">
            <CardTitle class="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <BarChart3 class="h-4 w-4" /> Team Workload Trend (7D)
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-6">
            <ClientOnly>
              <VueApexCharts type="bar" :options="workloadChartOptions" :series="workloadChartSeries" height="300" />
              <template #fallback><div class="h-[300px] w-full flex items-center justify-center bg-muted/5 animate-pulse text-xs">Caricamento grafico...</div></template>
            </ClientOnly>
          </CardContent>
        </Card>

        <Card class="lg:col-span-4 border border-foreground/10 shadow-md">
          <CardHeader class="pb-3 border-b">
            <CardTitle class="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Shield class="h-4 w-4" /> Stato di Salute
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-6">
            <ClientOnly>
              <VueApexCharts type="donut" :options="healthChartOptions" :series="healthChartSeries" height="280" />
              <template #fallback><div class="h-[280px] w-full flex items-center justify-center bg-muted/5 animate-pulse text-xs">Caricamento...</div></template>
            </ClientOnly>
          </CardContent>
        </Card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card class="border border-foreground/10 shadow-md">
          <CardHeader class="pb-3 border-b">
            <CardTitle class="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Radar class="h-4 w-4" /> Readiness vs Load
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-6">
            <ClientOnly>
              <VueApexCharts type="radar" :options="radarChartOptions" :series="radarChartSeries" height="280" />
              <template #fallback><div class="h-[280px] w-full flex items-center justify-center bg-muted/5 animate-pulse text-xs">Caricamento...</div></template>
            </ClientOnly>
          </CardContent>
        </Card>

        <Card class="border border-foreground/10 shadow-md">
          <CardHeader class="pb-3 border-b">
            <CardTitle class="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <PieChart class="h-4 w-4" /> Discipline
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-6">
            <ClientOnly>
              <VueApexCharts type="pie" :options="disciplineChartOptions" :series="disciplineChartSeries" height="280" />
              <template #fallback><div class="h-[280px] w-full flex items-center justify-center bg-muted/5 animate-pulse text-xs">Caricamento...</div></template>
            </ClientOnly>
          </CardContent>
        </Card>

        <Card class="border border-foreground/10 shadow-md">
          <CardHeader class="pb-3 border-b">
            <CardTitle class="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Calendar class="h-4 w-4" /> Agenda Coach
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-4 px-2">
            <div class="space-y-3">
              <div v-for="item in dashboardData?.upcomingAgenda" :key="item.scheduledAt"
                class="flex items-center p-3 border border-foreground/5 rounded-lg bg-foreground/[0.02]">
                <div class="mr-4 text-center border-r pr-4 border-foreground/10">
                  <p class="text-[10px] font-bold uppercase text-primary">
                    {{ new Date(item.scheduledAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) }}
                  </p>
                </div>
                <div class="flex-1">
                  <p class="text-xs font-bold">{{ item.sessionType }}</p>
                  <p class="text-[10px] text-muted-foreground">{{ item.athleteName }}</p>
                </div>
                <Badge variant="outline" class="text-[9px]">
                  {{ new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>