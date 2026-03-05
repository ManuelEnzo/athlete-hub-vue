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

const props = defineProps<{
    athleteId: number
    from?: string
    to?: string
}>()

const { t } = useI18n()

const data = ref<AthleteAnalyticsDto | null>(null)
const loading = ref(true)

const selectedMetric = ref<string | null>(null)

async function fetchAnalytics() {
    if (!props.athleteId) return

    loading.value = true
    data.value = null

    const dateTo = props.to ?? new Date().toISOString()

    const dateFrom =
        props.from ??
        (() => {
            const d = new Date()
            d.setDate(d.getDate() - 42)
            return d.toISOString()
        })()

    try {
        const response = await athleteApi.getDatasForAnalytics(
            props.athleteId,
            dateFrom,
            dateTo
        )

        if (response.data.isSuccess) {
            data.value = response.data.value ?? null
        }
    } finally {
        loading.value = false
    }
}

watch(() => props.athleteId, fetchAnalytics)
onMounted(fetchAnalytics)

const latestAcwr = computed(() => {
    const current = data.value?.acwr.find(a => a.week === 'Wk Corrente')

    return (
        current ?? {
            acwr: 0,
            zone: '',
            acute: 0,
            chronic: 0
        }
    )
})

/* ---------------- ACWR CHART ---------------- */
const acwrChartSeries = computed(() => [
    {
        name: 'ACWR',
        data: data.value?.acwr.map(a => a.acwr) ?? []
    }
])

const acwrChartOptions = computed<ApexOptions>(() => ({
    chart: {
        type: 'area',
        toolbar: { show: false }
    },
    stroke: { width: 3, curve: 'smooth' },
    colors: ['#6366f1'],
    fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
    xaxis: {
        categories: data.value?.performance.history.map(h =>
            new Date(h.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
        ) ?? []
    },
    yaxis: { min: 0, max: 2, title: { text: 'ACWR' } },
    annotations: {
        yaxis: [
            { y: 0.8, y2: 1.3, fillColor: '#22c55e22' },
            { y: 1.3, y2: 1.5, fillColor: '#eab30822' },
            { y: 1.5, y2: 2, fillColor: '#ef444422' }
        ]
    }
}))

/* ---------------- METRICS ---------------- */
const availableMetrics = computed(() => {
    if (!data.value?.performance.history) return []

    const set = new Set<string>()
    data.value.performance.history.forEach(h =>
        h.metrics.forEach(m => set.add(m.metricName))
    )

    return Array.from(set)
})

watch(availableMetrics, metrics => {
    if (!selectedMetric.value && metrics.length > 0) {
        selectedMetric.value = metrics[0] ?? null
    }
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
    xaxis: {
        categories:
            data.value?.performance.history.map(h =>
                new Date(h.date).toLocaleDateString()
            ) ?? []
    }
}))

/* ---------------- INJURIES ---------------- */
const injuries = computed<InjuriesAnalytics[]>(() => data.value?.injuries ?? [])
const totalInjuries = computed(() => injuries.value.length)
const activeInjuries = computed(() =>
    injuries.value.filter(i => i.status.toLowerCase() === 'active')
)
const recoveredInjuries = computed(() =>
    injuries.value.filter(i => i.status.toLowerCase() === 'returned')
)

// Funzione per mappare lo stato sui colori
const getInjuryBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
        case "active":
            return 'bg-red-200 text-red-800'
        case "rehabilitation":
            return 'bg-yellow-200 text-yellow-800'
        case "returned":
            return 'bg-green-200 text-green-800'
        default:
            return 'bg-gray-200 text-gray-800'
    }
}
</script>

<template>
    <div class="w-full flex flex-col gap-6">

        <!-- LOADING -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton v-for="i in 3" :key="i" class="h-[320px] w-full rounded-xl" />
        </div>

        <template v-else-if="data && data.athlete">

            <!-- HERO -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">

                <Card>
                    <CardContent class="p-6">
                        <p class="text-xs font-bold uppercase text-muted-foreground mb-2">
                            {{ t('analytics.readiness_title') }}
                        </p>
                        <div class="flex items-center justify-between">
                            <div>
                                <span class="text-3xl font-bold">{{ data.athlete.readinessScore }}</span>
                                <span class="text-sm text-muted-foreground">/100</span>
                            </div>
                            <Activity class="h-5 w-5 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent class="p-6">
                        <p class="text-xs font-bold uppercase text-muted-foreground mb-2">
                            {{ t('analytics.current_acwr') }}
                        </p>
                        <div class="flex items-center justify-between">
                            <span class="text-3xl font-bold">{{ latestAcwr.acwr.toFixed(2) }}</span>
                            <Zap class="h-5 w-5" :class="latestAcwr.acwr > 1.3 ? 'text-red-500' : 'text-green-500'" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent class="p-6">
                        <p class="text-xs font-bold uppercase text-muted-foreground mb-2">
                            {{ t('analytics.acute_load') }}
                        </p>
                        <span class="text-3xl font-bold">{{ latestAcwr.acute.toFixed(0) }}</span>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent class="p-6">
                        <p class="text-xs font-bold uppercase text-muted-foreground mb-2">
                            {{ t('analytics.chronic_load') }}
                        </p>
                        <span class="text-3xl font-bold">{{ latestAcwr.chronic.toFixed(0) }}</span>
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

            <!-- BODY METRICS + INJURIES STATUS AFFIANCATI -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <!-- BODY METRICS -->
                <Card class="bg-white shadow-lg rounded-2xl border border-gray-100">
                    <CardHeader class="bg-gray-50 px-6 py-4 rounded-t-2xl">
                        <CardTitle class="flex items-center gap-2 text-sm font-bold uppercase text-gray-700">
                            <Scale class="h-5 w-5 text-purple-500" />
                            {{ t('analytics.metrics_summary') }}
                        </CardTitle>
                    </CardHeader>
                    <CardContent class="space-y-3 px-6 py-4">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-500">{{ t('analytics.weight') }}</span>
                            <span class="font-semibold text-gray-900">{{ data.athlete.antropometrics.weight }} kg</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-500">{{ t('analytics.height') }}</span>
                            <span class="font-semibold text-gray-900">{{ data.athlete.antropometrics.height }} cm</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-500">{{ t('analytics.bmi') }}</span>
                            <span class="font-semibold text-gray-900">{{ data.athlete.antropometrics.bmi }}</span>
                        </div>
                    </CardContent>
                </Card>

                <!-- INJURIES STATUS -->
                <Card v-if="totalInjuries > 0" class="bg-white shadow-lg rounded-2xl border border-gray-100">
                    <CardHeader class="bg-gray-50 px-6 py-4 rounded-t-2xl">
                        <CardTitle class="flex items-center gap-2 text-sm font-bold uppercase text-gray-700">
                            <Zap class="h-5 w-5 text-red-500" />
                            {{ t('analytics.injuries_status') }}
                        </CardTitle>
                    </CardHeader>
                    <CardContent class="space-y-3 px-6 py-4">

                        <div class="flex justify-between items-center">
                            <span class="text-gray-500">{{ t('analytics.total_injuries') }}</span>
                            <span class="font-semibold text-gray-900">{{ totalInjuries }}</span>
                        </div>

                        <div class="flex justify-between items-center">
                            <span class="text-gray-500">{{ t('analytics.active_injuries') }}</span>
                            <span class="font-semibold text-gray-900">{{ activeInjuries.length }}</span>
                        </div>

                        <ul class="mt-3 space-y-2 text-sm max-h-64 overflow-y-auto">
                            <li v-for="injury in injuries" :key="injury.date + injury.injury"
                                class="flex justify-between items-center p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition">
                                <span class="text-gray-700">{{ injury.injury }} ({{ new
                                    Date(injury.date).toLocaleDateString() }})</span>
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