<script setup lang="ts">
import { ref, onMounted, computed, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Users, Activity, AlertCircle, CheckCircle, Shield, TrendingUp, UserRound, ArrowUpRight,
  Calendar, Zap, Heart, Target, Clock, Flame, TrendingDown, Award, Radar, Percent,
  BarChart3, RefreshCw, AlertTriangle, ThumbsUp
} from 'lucide-vue-next'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { athleteApi } from '@/api/business'
import type { CoachDashboardSummaryDto } from '@/types/api'
import type { ApexOptions } from 'apexcharts'

const VueApexCharts = defineAsyncComponent(() => import('vue3-apexcharts'))
const { t, locale } = useI18n()

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

// Computed - Main KPIs
const readinessPercentage = computed(() => Math.round(dashboardData.value?.averageReadinessScore ?? 0))
const missingRpeCount = computed(() => Math.max(dashboardData.value?.missingReportsToday ?? 0, 0))
const safeAthletes = computed(() => dashboardData.value?.athleteStatusMatrix?.filter(a => a.readiness >= 80 && a.acwr <= 1.3).length ?? 0)
const warningAthletes = computed(() => dashboardData.value?.athleteStatusMatrix?.filter(a => a.readiness < 80 || a.acwr > 1.3).length ?? 0)
const totalAthletes = computed(() => dashboardData.value?.athleteStatusMatrix?.length ?? 0)
const complianceRate = computed(() => totalAthletes.value > 0 ? Math.round(((totalAthletes.value - missingRpeCount.value) / totalAthletes.value) * 100) : 100)
const avgAcwr = computed(() => {
  const matrix = dashboardData.value?.athleteStatusMatrix ?? []
  if (matrix.length === 0) return 0
  return (matrix.reduce((sum, a) => sum + a.acwr, 0) / matrix.length).toFixed(2)
})

// Chart: Readiness Distribution (Area)
const readinessChartOptions = computed<ApexOptions>(() => ({
  chart: { 
    type: 'area', 
    toolbar: { show: false }, 
    fontFamily: 'system-ui',
    foreColor: '#000'
  },
  colors: ['#3b82f6'],
  stroke: { curve: 'smooth', width: 3 },
  fill: { 
    type: 'gradient', 
    gradient: { 
      shadeIntensity: 0.5, 
      opacityFrom: 0.4, 
      opacityTo: 0.05,
      stops: [20, 100] 
    } 
  },
  xaxis: {
    categories: dashboardData.value?.athleteStatusMatrix?.map(a => a.name) ?? [],
    labels: { style: { fontSize: '12px', fontWeight: 500 } },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: { 
    min: 0,
    max: 100,
    labels: { style: { fontSize: '12px' } },
    axisBorder: { show: false }
  },
  grid: { 
    borderColor: 'hsl(var(--muted-foreground) / 0.1)', 
    strokeDashArray: 4 
  },
  tooltip: { enabled: true, theme: 'dark' as const },
  dataLabels: { enabled: false }
}))

const readinessChartSeries = computed(() => [
  { name: 'Readiness %', data: dashboardData.value?.athleteStatusMatrix?.map(a => a.readiness) ?? [] }
])

// Chart: ACWR Distribution (Bar)
const acwrChartOptions = computed<ApexOptions>(() => ({
  chart: { 
    type: 'bar', 
    toolbar: { show: false }, 
    fontFamily: 'system-ui',
    foreColor: '#000'
  },
  colors: ['#10b981'],
  plotOptions: { 
    bar: { 
      borderRadius: 4, 
      columnWidth: '50%'
    } 
  },
  xaxis: {
    categories: dashboardData.value?.athleteStatusMatrix?.map(a => a.name) ?? [],
    labels: { style: { fontSize: '12px', fontWeight: 500 } },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: { 
    labels: { style: { fontSize: '12px' } },
    axisBorder: { show: false }
  },
  grid: { 
    borderColor: 'hsl(var(--muted-foreground) / 0.1)', 
    strokeDashArray: 4 
  },
  tooltip: { theme: 'dark' },
  dataLabels: { enabled: false }
}))

const acwrChartSeries = computed(() => [
  { name: 'ACWR', data: dashboardData.value?.athleteStatusMatrix?.map(a => a.acwr) ?? [] }
])

// Chart: Health Status Donut
const statusChartOptions = computed<ApexOptions>(() => ({
  chart: { type: 'donut', fontFamily: 'system-ui', toolbar: { show: false } },
  labels: ['Safe Zone', 'Warning'],
  colors: ['#10b981', '#f59e0b'],
  stroke: { width: 2, colors: ['#fff'] },
  legend: { position: 'bottom', fontSize: '12px', labels: { colors: 'inherit' } },
  plotOptions: { pie: { donut: { size: '75%', labels: { show: true, name: { fontSize: '14px', fontWeight: 600 } } } } },
  dataLabels: { enabled: true, formatter: (val: number) => val.toFixed(0) + '%' }
}))

const statusChartSeries = computed(() => {
  const total = dashboardData.value?.athleteStatusMatrix?.length ?? 1
  return [
    Math.round((safeAthletes.value / total) * 100),
    Math.round((warningAthletes.value / total) * 100)
  ]
})

// Chart: Radar Chart (Comparison)
const radarChartOptions = computed<ApexOptions>(() => ({
  chart: { type: 'radar', fontFamily: 'system-ui', toolbar: { show: false }, foreColor: '#000' },
  colors: ['#3b82f6', '#ef4444'],
  stroke: { width: 2 },
  plotOptions: { radar: { size: 140, polygons: { strokeColors: 'hsl(var(--muted-foreground) / 0.1)', fill: { colors: ['#fff', '#f3f4f6'] } } } },
  xaxis: { categories: dashboardData.value?.athleteStatusMatrix?.map(a => a.name.split(' ')[0]) ?? [] },
  yaxis: { max: 100, labels: { style: { fontSize: '11px' } } },
  legend: { position: 'bottom', fontSize: '12px', labels: { colors: 'inherit' } },
  tooltip: { theme: 'dark' }
}))

const radarChartSeries = computed(() => [
  { name: 'Readiness', data: dashboardData.value?.athleteStatusMatrix?.map(a => a.readiness) ?? [] },
  { name: 'ACWR Safe (100-acwr*50)', data: dashboardData.value?.athleteStatusMatrix?.map(a => Math.max(0, 100 - (a.acwr * 50))) ?? [] }
])

// Chart: Compliance Rate (Gauge-like with radialBar)
const complianceChartOptions = computed<ApexOptions>(() => ({
  chart: { type: 'radialBar', fontFamily: 'system-ui', toolbar: { show: false }, foreColor: '#000' },
  colors: ['#10b981'],
  plotOptions: {
    radialBar: {
      hollow: { size: '75%', },
      dataLabels: {
        name: { fontSize: '14px', fontWeight: 600 },
        value: { fontSize: '20px', fontWeight: 700 },
        total: { show: true, label: 'Compliance', formatter: () => complianceRate.value + '%' }
      }
    }
  },
  labels: ['RPE Compliance'],
  tooltip: { theme: 'dark' }
}))

const complianceChartSeries = computed(() => [complianceRate.value])


</script>

<template>
<div class="w-full min-h-screen bg-background space-y-8 font-sans">
  
  <!-- HERO HEADER -->
  <div class="bg-gradient-to-r from-primary/5 to-transparent border-b border-primary/10 px-6 py-8">
    <div class="flex justify-between items-start">
      <div>
        <h1 class="text-4xl font-bold text-foreground tracking-tight mb-2">{{ t('performanceDashboard.pageTitle') }}</h1>
        <p class="text-muted-foreground text-sm font-medium">{{ t('performanceDashboard.subtitle') }}</p>
      </div>
      <div class="text-right">
        <p class="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">{{ t('performanceDashboard.lastUpdated') }}</p>
        <p class="text-lg font-bold text-foreground">{{ new Date().toLocaleTimeString(locale === 'it' ? 'it-IT' : 'en-US', { hour: '2-digit', minute: '2-digit' }) }}</p>
      </div>
    </div>
  </div>

  <div class="px-6 space-y-8">

    <!-- MAIN METRICS CARDS -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <!-- Total Athletes -->
      <Card class="border border-foreground/10 shadow-md hover:shadow-lg transition-shadow">
        <CardContent class="p-6">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{{ t('performanceDashboard.teamSize') }}</p>
              <p class="text-3xl font-bold tracking-tight">{{ totalAthletes }}</p>
              <p class="text-[10px] text-muted-foreground mt-2">{{ t('performanceDashboard.athletesMonitored') }}</p>
            </div>
            <Users class="h-6 w-6 text-muted-foreground/40" />
          </div>
        </CardContent>
      </Card>

      <!-- Readiness -->
      <Card class="border border-foreground/10 shadow-md hover:shadow-lg transition-shadow">
        <CardContent class="p-6">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{{ t('performanceDashboard.avgReadiness') }}</p>
              <p class="text-3xl font-bold tracking-tight">{{ readinessPercentage }}<span class="text-sm text-muted-foreground">/100</span></p>
              <div class="mt-3 h-1 bg-muted rounded-full overflow-hidden">
                <div class="h-full bg-green-500" :style="{ width: readinessPercentage + '%' }"></div>
              </div>
            </div>
            <Activity class="h-6 w-6 text-muted-foreground/40" />
          </div>
        </CardContent>
      </Card>

      <!-- ACWR -->
      <Card class="border border-foreground/10 shadow-md hover:shadow-lg transition-shadow">
        <CardContent class="p-6">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{{ t('performanceDashboard.avgAcwr') }}</p>
              <p class="text-3xl font-bold tracking-tight">{{ avgAcwr }}</p>
              <Badge :class="[
                parseFloat(avgAcwr as string) > 1.5 ? 'bg-red-500/10 text-red-700 border-red-200' :
                parseFloat(avgAcwr as string) > 1.3 ? 'bg-yellow-500/10 text-yellow-700 border-yellow-200' :
                'bg-green-500/10 text-green-700 border-green-200'
              ]" variant="outline" class="mt-3 text-[10px] font-bold">
                {{ parseFloat(avgAcwr as string) > 1.5 ? t('performanceDashboard.critical') : parseFloat(avgAcwr as string) > 1.3 ? t('performanceDashboard.warning') : t('performanceDashboard.safe') }}
              </Badge>
            </div>
            <Flame class="h-6 w-6 text-muted-foreground/40" />
          </div>
        </CardContent>
      </Card>

      <!-- Compliance -->
      <Card class="border border-foreground/10 shadow-md hover:shadow-lg transition-shadow">
        <CardContent class="p-6">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{{ t('performanceDashboard.rpeSurveyStatus') }}</p>
              <p class="text-3xl font-bold tracking-tight">{{ complianceRate }}%</p>
              <p class="text-[10px] text-muted-foreground mt-2">{{ totalAthletes - missingRpeCount }}/{{ totalAthletes }} {{ t('performanceDashboard.atleti') }}</p>
            </div>
            <CheckCircle class="h-6 w-6 text-muted-foreground/40" />
          </div>
        </CardContent>
      </Card>

      <!-- Alerts -->
      <Card class="border border-red-500/20 shadow-md hover:shadow-lg transition-shadow">
        <CardContent class="p-6">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{{ t('performanceDashboard.atRisk') }}</p>
              <p class="text-3xl font-bold tracking-tight text-red-600">{{ warningAthletes }}</p>
              <p class="text-[10px] text-red-600 mt-2">{{ t('performanceDashboard.requireAttention') }}</p>
            </div>
            <AlertTriangle class="h-6 w-6 text-muted-foreground/40" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- MAIN CHARTS GRID -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Readiness Area Chart -->
      <Card class="lg:col-span-8 border border-foreground/10 shadow-md">
        <CardHeader class="pb-3 border-b">
          <CardTitle class="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <TrendingUp class="h-4 w-4" /> {{ t('performanceDashboard.readinessTrend') }}
          </CardTitle>
        </CardHeader>
        <CardContent class="pt-6">
          <ClientOnly>
            <VueApexCharts type="area" :options="readinessChartOptions" :series="readinessChartSeries" height="300" />
          </ClientOnly>
          <p class="text-[11px] text-muted-foreground mt-4 leading-relaxed border-t pt-3 italic">
            ℹ️ {{ t('performanceDashboard.chartLegends.readinessTrend') }}
          </p>
        </CardContent>
      </Card>

      <!-- Compliance Radial -->
      <Card class="lg:col-span-4 border border-foreground/10 shadow-md">
        <CardHeader class="pb-3 border-b">
          <CardTitle class="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Percent class="h-4 w-4" /> {{ t('performanceDashboard.complianceRate') }}
          </CardTitle>
        </CardHeader>
        <CardContent class="pt-4">
          <ClientOnly>
            <VueApexCharts type="radialBar" :options="complianceChartOptions" :series="complianceChartSeries" height="280" />
          </ClientOnly>
          <p class="text-[11px] text-muted-foreground mt-4 leading-relaxed border-t pt-3 italic">
            ℹ️ {{ t('performanceDashboard.chartLegends.complianceRate') }}
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- SECONDARY CHARTS -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- ACWR Bar Chart -->
      <Card class="lg:col-span-7 border border-foreground/10 shadow-md">
        <CardHeader class="pb-3 border-b">
          <CardTitle class="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Flame class="h-4 w-4" /> {{ t('performanceDashboard.workloadAcwrDistribution') }}
          </CardTitle>
        </CardHeader>
        <CardContent class="pt-6">
          <ClientOnly>
            <VueApexCharts type="bar" :options="acwrChartOptions" :series="acwrChartSeries" height="280" />
          </ClientOnly>
          <p class="text-[11px] text-muted-foreground mt-4 leading-relaxed border-t pt-3 italic">
            ℹ️ {{ t('performanceDashboard.chartLegends.acwrDistribution') }}
          </p>
        </CardContent>
      </Card>

      <!-- Health Balance Donut -->
      <Card class="lg:col-span-5 border border-foreground/10 shadow-md">
        <CardHeader class="pb-3 border-b">
          <CardTitle class="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Shield class="h-4 w-4" /> {{ t('performanceDashboard.teamHealthDistribution') }}
          </CardTitle>
        </CardHeader>
        <CardContent class="pt-6">
          <ClientOnly>
            <VueApexCharts type="donut" :options="statusChartOptions" :series="statusChartSeries" height="280" />
          </ClientOnly>
          <p class="text-[11px] text-muted-foreground mt-4 leading-relaxed border-t pt-3 italic">
            ℹ️ {{ t('performanceDashboard.chartLegends.teamHealth') }}
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- RADAR COMPARISON -->
    <div class="grid grid-cols-1 gap-6">
      <Card class="border border-foreground/10 shadow-md">
        <CardHeader class="pb-3 border-b">
          <CardTitle class="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Radar class="h-4 w-4" /> {{ t('performanceDashboard.readinessVsAcwrComparison') }}
          </CardTitle>
        </CardHeader>
        <CardContent class="pt-6">
          <ClientOnly>
            <VueApexCharts type="radar" :options="radarChartOptions" :series="radarChartSeries" height="350" />
          </ClientOnly>
          <p class="text-[11px] text-muted-foreground mt-4 leading-relaxed border-t pt-3 italic">
            ℹ️ {{ t('performanceDashboard.chartLegends.radarComparison') }}
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- ALERTS & INSIGHTS SECTION -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Critical Alerts -->
      <Card class="lg:col-span-2 border border-foreground/10 shadow-md">
        <CardHeader class="pb-3 border-b">
          <CardTitle class="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <AlertCircle class="h-4 w-4" /> {{ t('performanceDashboard.missingSessions') }}
          </CardTitle>
        </CardHeader>
        <CardContent class="pt-4">
          <div v-if="dashboardData?.riskAlerts && dashboardData.riskAlerts.length > 0" class="space-y-3">
            <div v-for="alert in dashboardData.riskAlerts" :key="alert.athleteName" class="p-3 border border-foreground/10 rounded-lg hover:border-foreground/20 transition-colors">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <p class="text-sm font-bold text-foreground">{{ alert.athleteName }}</p>
                  <p class="text-xs text-muted-foreground mt-1">{{ alert.riskTrend }}</p>
                </div>
                <Badge variant="outline" class="text-[10px] font-bold">
                  {{ alert.discipline }}
                </Badge>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <CheckCircle class="h-8 w-8 text-green-500 mx-auto mb-2 opacity-50" />
            <p class="text-sm font-semibold text-foreground">{{ t('performanceDashboard.allAthletesCompliant') }}</p>
            <p class="text-xs text-muted-foreground">{{ t('performanceDashboard.noMissingSessions') }}</p>
          </div>
        </CardContent>
      </Card>

      <!-- Performance Insights -->
      <Card class="border border-foreground/10 shadow-md">
        <CardHeader class="pb-3 border-b">
          <CardTitle class="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <BarChart3 class="h-4 w-4" /> {{ t('performanceDashboard.quickInsights') }}
          </CardTitle>
        </CardHeader>
        <CardContent class="pt-4 space-y-3">
          <div class="p-3 border border-green-500/20 rounded-lg bg-green-500/5">
            <p class="text-xs font-bold text-green-800 uppercase mb-1">✓ {{ t('performanceDashboard.teamStatus') }}</p>
            <p class="text-sm text-green-700">{{ safeAthletes }} {{ t('performanceDashboard.athletesInSafeZone') }}</p>
          </div>
          <div class="p-3 border border-blue-500/20 rounded-lg bg-blue-500/5">
            <p class="text-xs font-bold text-blue-800 uppercase mb-1">📊 {{ t('performanceDashboard.averageLoad') }}</p>
            <p class="text-sm text-blue-700">ACWR {{ avgAcwr }} ({{ parseFloat(avgAcwr as string) <= 1.3 ? t('performanceDashboard.optimal') : t('performanceDashboard.monitor') }})</p>
          </div>
          <div class="p-3 border border-purple-500/20 rounded-lg bg-purple-500/5">
            <p class="text-xs font-bold text-purple-800 uppercase mb-1">✈️ {{ t('performanceDashboard.readiness') }}</p>
            <p class="text-sm text-purple-700">Team avg {{ readinessPercentage }}{{ t('performanceDashboard.readyToday') }}</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- ATHLETES PERFORMANCE MATRIX -->
    <div class="space-y-4">
      <h2 class="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
        <UserRound class="h-5 w-5" /> {{ t('performanceDashboard.individualPerformanceMatrix') }}
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card v-for="athlete in dashboardData?.athleteStatusMatrix" :key="athlete.name" 
             class="group border border-foreground/10 shadow-md hover:shadow-lg transition-shadow">
          <div class="p-4 border-b flex justify-between items-center">
            <h3 class="font-bold text-sm text-foreground">{{ athlete.name }}</h3>
            <ArrowUpRight class="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
          </div>
          <div class="p-6 space-y-4">
            <!-- Readiness -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <p class="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{{ t('performanceDashboard.readiness') }}</p>
                <span class="text-lg font-bold text-foreground">{{ athlete.readiness }}%</span>
              </div>
              <div class="h-2 bg-muted rounded-full overflow-hidden">
                <div class="h-full" :class="athlete.readiness >= 80 ? 'bg-green-500' : athlete.readiness >= 60 ? 'bg-yellow-500' : 'bg-red-500'" :style="{ width: athlete.readiness + '%' }"></div>
              </div>
            </div>
            <!-- ACWR -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <p class="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">ACWR</p>
                <span class="text-lg font-bold text-foreground">{{ athlete.acwr.toFixed(2) }}</span>
              </div>
              <Badge :class="[
                athlete.acwr > 1.5 ? 'bg-red-500/10 text-red-700 border-red-200' :
                athlete.acwr > 1.3 ? 'bg-yellow-500/10 text-yellow-700 border-yellow-200' :
                'bg-green-500/10 text-green-700 border-green-200'
              ]" variant="outline" class="text-[10px] font-bold w-full justify-center">
                {{ athlete.acwr > 1.5 ? '🔴 ' + t('performanceDashboard.critical') : athlete.acwr > 1.3 ? '🟡 ' + t('performanceDashboard.warning') : '🟢 ' + t('performanceDashboard.safe') }}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="border-t border-foreground/10 pt-6 pb-8 text-center text-xs text-muted-foreground">
      <p class="flex items-center justify-center gap-2">
        <RefreshCw class="h-3 w-3" /> {{ t('performanceDashboard.dashboardAutoUpdated') }} • {{ t('performanceDashboard.performanceIntelligence') }} © 2026
      </p>
    </div>
  </div>
</div>
</template>

<style scoped>
:deep(.apexcharts-canvas) {
  font-family: 'system-ui', sans-serif !important;
}
</style>

<style scoped>
:deep(.apexcharts-canvas) {
  font-family: 'system-ui', sans-serif !important;
}
</style>