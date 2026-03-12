<script setup lang="ts">
import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { Activity, TrendingUp, Scale, Zap } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientOnly } from '#components'
import { athleteApi } from '@/api/business'
import type { AthleteAnalyticsDto } from '@/types/api'
import type { ApexOptions } from 'apexcharts'
import type { InjuriesAnalytics } from '@/types/api'

const VueApexCharts = defineAsyncComponent(() => import('vue3-apexcharts'))
const props = defineProps<{ athleteId: number; from?: string; to?: string }>()
const { t } = useI18n()

const data = ref<AthleteAnalyticsDto | null>(null)
const loading = ref(true)
const selectedMetric = ref<string | null>(null)

enum RiskManagementAction {
    InsufficientData = 0,
    BaselinePhase = 1,
    LoadRising = 2,
    DangerSpike = 3,
    ModerateRisk = 4,
    HighFatigue = 5,
    Optimal = 6
}

async function fetchAnalytics() {
    if (!props.athleteId) return
    loading.value = true
    data.value = null
    const dateTo = props.to ?? new Date().toISOString()
    const dateFrom = props.from ?? (() => { const d = new Date(); d.setDate(d.getDate() - 42); return d.toISOString() })()
    try {
        const response = await athleteApi.getDatasForAnalytics(props.athleteId, dateFrom, dateTo)
        if (response.data.isSuccess) data.value = response.data.value ?? null
    } finally { loading.value = false }
}

watch(() => props.athleteId, fetchAnalytics)
onMounted(fetchAnalytics)

/* ACWR */

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
        case RiskManagementAction.BaselinePhase: return 'Baseline'
        case RiskManagementAction.LoadRising: return 'Load Rising'
        case RiskManagementAction.DangerSpike: return 'Danger Spike'
        case RiskManagementAction.ModerateRisk: return 'Moderate Risk'
        case RiskManagementAction.HighFatigue: return 'High Fatigue'
        case RiskManagementAction.Optimal: return 'Optimal'
        default: return '-'
    }
}

const acwrChartSeries = computed(() => [{ name: 'ACWR', data: data.value?.acwr.map(a => a.acwr) ?? [] }])

const acwrChartOptions = computed<ApexOptions>(() => ({
    chart: { type: 'area', toolbar: { show: false } },
    stroke: { width: 3, curve: 'smooth' },
    colors: ['#6366f1'],
    fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
    xaxis: { categories: data.value?.acwr.map(a => a.week) ?? [] },
    yaxis: { min: 0, max: 2, title: { text: 'ACWR' } },
    annotations: {
        yaxis: [
            { y: 0.8, y2: 1.3, fillColor: '#22c55e22' },
            { y: 1.3, y2: 1.5, fillColor: '#eab30822' },
            { y: 1.5, y2: 2, fillColor: '#ef444422' }
        ]
    }
}))

/* PERFORMANCE */

const availableMetrics = computed(() => {
    if (!data.value?.performance.history) return []
    const set = new Set<string>()
    data.value.performance.history.forEach(h => h.metrics.forEach(m => set.add(m.metricName)))
    return Array.from(set)
})

watch(availableMetrics, m => {
    if (!selectedMetric.value && m.length > 0) selectedMetric.value = m[0] ?? null
})

const metricChartSeries = computed(() => {
    if (!selectedMetric.value) return []
    const values: (number | null)[] = []
    data.value?.performance.history.forEach(h => {
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
    xaxis: { categories: data.value?.performance.history.map(h => new Date(h.date).toLocaleDateString()) ?? [] }
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
</script>

<template>
    <div class="w-full flex flex-col gap-6">

        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton v-for="i in 3" :key="i" class="h-[320px] w-full rounded-xl" />
        </div>

        <template v-else-if="data && data.athlete">

            <!-- HERO -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card
                    :title="t('analytics.readiness_title_tooltip')">
                    <CardContent class="p-6">
                        <p class="text-xs font-bold uppercase text-muted-foreground mb-2">
                            {{ t('analytics.readiness_title') }}</p>
                        <div class="flex items-center justify-between">
                            <div>
                                <span class="text-3xl font-bold">{{ data.athlete.readinessScore }}</span>
                                <span class="text-sm text-muted-foreground">/100</span>
                            </div>
                            <Activity class="h-5 w-5 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card
                    :title="t('analytics.current_acwr_tooltip') ">
                    <CardContent class="p-6">
                        <p class="text-xs font-bold uppercase text-muted-foreground mb-2">
                            {{ t('analytics.current_acwr') }}</p>
                        <div class="flex items-center justify-between">
                            <span v-if="latestAcwr" class="text-3xl font-bold">{{ latestAcwr.acwr.toFixed(2) }}</span>
                            <span v-else class="text-sm text-muted-foreground">
                                {{ t('analytics.acwr_insufficient_data') }}
                            </span>
                            <Zap class="h-5 w-5" :class="getRiskColor(latestAcwr?.zone)" />
                        </div>
                        <div v-if="latestAcwr" class="text-xs text-muted-foreground mt-1">
                            {{ getRiskLabel(latestAcwr.zone) }}
                        </div>
                    </CardContent>
                </Card>

                <Card
                    :title="t('analytics.acuteload_title_tooltip')">
                    <CardContent class="p-6">
                        <p class="text-xs font-bold uppercase text-muted-foreground mb-2">{{ t('analytics.acute_load')
                            }}</p>
                        <span class="text-3xl font-bold">{{ latestAcwr?.acute ?? '-' }}</span>
                    </CardContent>
                </Card>

                <Card
                    :title="t('analytics.chronicload_title_tooltip')">
                    <CardContent class="p-6">
                        <p class="text-xs font-bold uppercase text-muted-foreground mb-2">{{ t('analytics.chronic_load')
                            }}</p>
                        <span class="text-3xl font-bold">{{ latestAcwr?.chronic ?? '-' }}</span>
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
                            <VueApexCharts type="area" height="260" :options="acwrChartOptions"
                                :series="acwrChartSeries" />
                        </ClientOnly>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader class="flex justify-between items-center">
                        <CardTitle class="flex items-center gap-2 text-sm font-bold uppercase">
                            <Activity class="h-4 w-4" />
                            {{ t('analytics.performance_history') }}
                        </CardTitle>
                        <select v-model="selectedMetric" class="text-xs border rounded px-2 py-1 bg-background">
                            <option v-for="metric in availableMetrics" :key="metric" :value="metric">{{ metric }}
                            </option>
                        </select>
                    </CardHeader>
                    <CardContent>
                        <ClientOnly>
                            <VueApexCharts v-if="metricChartSeries.length" type="line" height="260"
                                :options="metricChartOptions" :series="metricChartSeries" />
                            <div v-else class="h-[260px] flex items-center justify-center text-muted-foreground">
                                {{ t('analytics.no_history') }}
                            </div>
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
                        <div class="flex justify-between"><span class="text-muted-foreground">{{ t('analytics.weight')
                                }}</span><span class="font-semibold">{{ data.athlete.antropometrics.weight }} kg</span>
                        </div>
                        <div class="flex justify-between"><span class="text-muted-foreground">{{ t('analytics.height')
                                }}</span><span class="font-semibold">{{ data.athlete.antropometrics.height }} cm</span>
                        </div>
                        <div class="flex justify-between"><span class="text-muted-foreground">{{ t('analytics.bmi')
                                }}</span><span class="font-semibold">{{ data.athlete.antropometrics.bmi }}</span></div>
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
                        <div class="flex justify-between"><span class="text-muted-foreground">{{
                            t('analytics.total_injuries') }}</span><span class="font-semibold">{{ totalInjuries
                                }}</span></div>
                        <div class="flex justify-between"><span class="text-muted-foreground">{{
                            t('analytics.active_injuries') }}</span><span class="font-semibold">{{
                                    activeInjuries.length }}</span></div>

                        <ul class="mt-3 space-y-2 text-sm max-h-64 overflow-y-auto">
                            <li v-for="injury in injuries" :key="injury.date + injury.injury"
                                class="flex justify-between items-center p-2 rounded-lg border hover:bg-muted">
                                <span>{{ injury.injury }} ({{ new Date(injury.date).toLocaleDateString() }})</span>
                                <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                                    :class="getInjuryBadgeClass(injury.status)">
                                    {{ injury.status }} - {{ injury.daysOut }}d
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