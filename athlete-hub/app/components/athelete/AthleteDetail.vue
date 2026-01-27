<script setup lang="ts">
import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import {
    CheckCircle, AlertTriangle, TrendingUp, TrendingDown,
    Activity, Scale, Info, Calendar, History, Loader2, ClipboardList, Clock,
    DivideCircle, Target, Heart, Zap
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientOnly } from '#components'

import { athleteApi } from '@/api/business'
import type { AthleteAnalyticsDto } from '@/types/api'

const VueApexCharts = defineAsyncComponent(() => import('vue3-apexcharts'))

// ---------------- Props ----------------
// Riceviamo l'id e opzionalmente le date. 
// Se le date non sono passate, le calcoliamo noi.
const props = defineProps<{
    athleteId: number
    from?: string
    to?: string
}>()

const { t } = useI18n()

// ---------------- State ----------------
const data = ref<AthleteAnalyticsDto | null>(null)
const loading = ref(true)

// ---------------- API Actions ----------------
// AthleteDetail.vue

async function fetchAnalytics() {
    if (!props.athleteId) return

    loading.value = true
    // IMPORTANTE: Resetta subito i dati per evitare "fantastmi" del vecchio atleta
    data.value = null 

    const dateTo = props.to || new Date().toISOString()
    const dateFrom = props.from || (() => {
        const d = new Date()
        d.setDate(d.getDate() - 42)
        return d.toISOString()
    })()

    try {
        const response = await athleteApi.getDatasForAnalytics(props.athleteId, dateFrom, dateTo)
        
        // Se il backend risponde 200 ma con isSuccess: false (gestito dall'intercettore)
        if (response.data.isSuccess) {
            data.value = response.data.value ?? null
        } else {
            // Se isSuccess è false, data.value è già null per il reset sopra
            console.warn("Dati non trovati (Business Logic)");
        }
    } catch (err: any) {
        // Se il backend risponde 404/400, Axios finisce qui
        data.value = null // Sicurezza extra
        
        // Estrai il messaggio se presente nella risposta d'errore
        const errorMessage = err.response?.data?.error?.message;
   
    } finally {
        loading.value = false
    }
}

// Ricarica se l'atleta cambia
watch(() => props.athleteId, () => fetchAnalytics())

onMounted(() => {
    fetchAnalytics()
})

// ---------------- Computed ----------------
const latestAcwr = computed(() => {
    const current = data.value?.acwr.find(a => a.week === 'Wk Corrente')
    return current || { acwr: 0, zone: 'N/A', acute: 0, chronic: 0, week: '---' }
})

const acwrStatusClass = computed(() => {
    const val = latestAcwr.value.acwr
    const zone = latestAcwr.value.zone

    // Se siamo in inizializzazione, usiamo il BLU
    if (zone === 'Inizializzazione') return 'bg-blue-500/10 text-blue-700 border-blue-200'

    if (val > 1.5) return 'bg-red-500/10 text-red-700 border-red-200'
    if (val >= 1.3) return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
    return 'bg-green-500/10 text-green-700 border-green-200'
})


const acwrChartData = computed(() => {
    return data.value?.acwr.map(a => ({
        week: a.week,
        [t('analytics.acwr')]: a.acwr
    })) || []
})

const historyChartData = computed(() => {
    if (!data.value?.performance.history) return []
    return data.value.performance.history.map(h => {
        const row: any = { date: h.date }
        h.metrics.forEach(m => {
            row[m.metricName] = m.value
        })
        return row
    })
})

const historyCategories = computed(() => {
    if (!data.value?.performance.history || data.value.performance.history.length === 0) return []
    const categories = new Set<string>()
    data.value.performance.history.forEach(h => {
        h.metrics.forEach(m => categories.add(m.metricName))
    })
    return Array.from(categories)
})

// ApexCharts - ACWR Trend (Area Chart)
const acwrChartOptions = computed(() => ({
    chart: {
        type: 'area' as const,
        toolbar: { show: false },
        foreColor: '#000',
        animations: { enabled: true }
    },
    colors: ['#3b82f6'],
    fill: {
        type: 'gradient' as const,
        gradient: {
            shadeIntensity: 0.5,
            opacityFrom: 0.45,
            opacityTo: 0.05,
            stops: [20, 100, 100, 100]
        }
    },
    stroke: { curve: 'smooth' as const, width: 2 },
    markers: { size: 5, hover: { size: 7 } },
    xaxis: {
        categories: data.value?.acwr.map(a => a.week) || [],
        labels: { style: { colors: 'inherit', fontSize: '11px' } },
        axisBorder: { show: false },
        axisTicks: { show: false }
    },
    yaxis: {
        min: 0,
        max: 2,
        labels: { style: { colors: 'inherit', fontSize: '11px' } },
        axisBorder: { show: false }
    },
    grid: { borderColor: 'hsl(var(--muted-foreground) / 0.1)', strokeDashArray: 4, padding: { left: 5, right: 10 } },
    tooltip: { enabled: true, theme: 'dark' as const, style: { fontSize: '12px' }, custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
        const value = series[seriesIndex][dataPointIndex]
        return `<div class="px-2 py-1"><span class="font-bold">${value.toFixed(2)}</span></div>`
    }},
    legend: { show: false }
}))

const acwrChartSeries = computed(() => [{
    name: t('analytics.acwr'),
    data: data.value?.acwr.map(a => a.acwr) || []
}])

// ApexCharts - Performance History (Multi-series Line)
const performanceChartOptions = computed(() => ({
    chart: {
        type: 'line' as const,
        toolbar: { show: false },
        foreColor: '#000',
        animations: { enabled: true }
    },
    colors: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
    stroke: { curve: 'smooth' as const, width: 2.5 },
    markers: { size: 4, hover: { size: 6 } },
    xaxis: {
        categories: data.value?.performance.history.map(h => new Date(h.date).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' })) || [],
        labels: { style: { colors: 'inherit', fontSize: '11px' } },
        axisBorder: { show: false },
        axisTicks: { show: false }
    },
    yaxis: {
        labels: { style: { colors: 'inherit', fontSize: '11px' } },
        axisBorder: { show: false }
    },
    grid: { borderColor: 'hsl(var(--muted-foreground) / 0.1)', strokeDashArray: 4 },
    tooltip: { enabled: true, theme: 'dark' as const, style: { fontSize: '12px' } },
    legend: { position: 'top' as const, horizontalAlign: 'right' as const, fontSize: '12px', labels: { colors: 'inherit' } }
}))

const performanceChartSeries = computed(() => {
    const series: any = {}
    data.value?.performance.history.forEach(h => {
        h.metrics.forEach(m => {
            if (!series[m.metricName]) {
                series[m.metricName] = []
            }
            series[m.metricName].push(m.value)
        })
    })
    return Object.entries(series).map(([name, data]) => ({ name, data }))
})
</script>

<template>
    <div class="w-full flex flex-col gap-6">

        <!-- LOADING STATE -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton class="h-[320px] w-full rounded-xl" v-for="i in 3" :key="i" />
        </div>

        <!-- MAIN CONTENT -->
        <template v-else-if="data && data.athlete">

            <!-- HERO SECTION - Top Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <!-- Readiness Card -->
                <Card class="border border-foreground/10 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent class="p-6">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{{ t('analytics.readiness_title') }}</p>
                                <span class="text-3xl font-bold tracking-tight">{{ data.athlete.readinessScore }}</span>
                                <span class="text-sm text-muted-foreground">/100</span>
                            </div>
                            <Activity class="h-5 w-5 text-blue-500" />
                        </div>
                        <Badge variant="outline" :class="[
                            data.athlete.readinessScore > 70 ? 'bg-green-500/10 text-green-700 border-green-200' : 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
                        ]" class="text-xs">
                            {{ data.athlete.riskLevel }}
                        </Badge>
                    </CardContent>
                </Card>

                <!-- ACWR Card -->
                <Card class="border border-foreground/10 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent class="p-6">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{{ t('analytics.current_acwr') }}</p>
                                <span class="text-3xl font-bold tracking-tight">{{ latestAcwr.acwr.toFixed(2) }}</span>
                            </div>
                            <Zap class="h-5 w-5" :class="latestAcwr.acwr > 1.3 ? 'text-red-500' : 'text-green-500'" />
                        </div>
                        <Badge :class="[
                            latestAcwr.acwr > 1.5 ? 'bg-red-500/10 text-red-700 border-red-200' :
                            latestAcwr.acwr >= 1.3 ? 'bg-yellow-500/10 text-yellow-700 border-yellow-200' :
                            'bg-green-500/10 text-green-700 border-green-200'
                        ]" variant="outline" class="text-xs">
                            {{ latestAcwr.zone }}
                        </Badge>
                    </CardContent>
                </Card>

                <!-- Acute Load -->
                <Card class="border border-foreground/10 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent class="p-6">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Carico Acuto</p>
                                <span class="text-3xl font-bold tracking-tight">{{ latestAcwr.acute.toFixed(0) }}</span>
                            </div>
                            <TrendingUp class="h-5 w-5 text-orange-500" />
                        </div>
                        <p class="text-xs text-muted-foreground">Ultimi 7 giorni</p>
                    </CardContent>
                </Card>

                <!-- Chronic Load -->
                <Card class="border border-foreground/10 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent class="p-6">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Carico Cronico</p>
                                <span class="text-3xl font-bold tracking-tight">{{ latestAcwr.chronic.toFixed(0) }}</span>
                            </div>
                            <Target class="h-5 w-5 text-purple-500" />
                        </div>
                        <p class="text-xs text-muted-foreground">Ultimi 28 giorni</p>
                    </CardContent>
                </Card>
            </div>

            <!-- CHARTS SECTION -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- ACWR Trend Chart -->
                <Card class="border border-foreground/10 shadow-md">
                    <CardHeader class="pb-3 bg-muted/30">
                        <CardTitle class="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <TrendingUp class="h-4 w-4" /> Andamento ACWR
                        </CardTitle>
                    </CardHeader>
                    <CardContent class="pt-6">
                        <ClientOnly>
                            <VueApexCharts type="area" :options="acwrChartOptions" :series="acwrChartSeries" height="250" />
                        </ClientOnly>
                    </CardContent>
                </Card>

                <!-- Performance History Chart -->
                <Card class="border border-foreground/10 shadow-md">
                    <CardHeader class="pb-3 bg-muted/30">
                        <CardTitle class="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <Activity class="h-4 w-4" /> Metriche Storiche
                        </CardTitle>
                    </CardHeader>
                    <CardContent class="pt-6">
                        <ClientOnly>
                            <VueApexCharts v-if="performanceChartSeries.length > 0" type="line" :options="performanceChartOptions" :series="performanceChartSeries" height="250" />
                            <div v-else class="h-[250px] flex items-center justify-center text-muted-foreground">
                                <p class="text-sm">Nessun dato storico disponibile</p>
                            </div>
                        </ClientOnly>
                    </CardContent>
                </Card>
            </div>

            <!-- LATEST TESTS SECTION -->
            <div class="space-y-3">
                <h3 class="text-sm font-bold uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
                    <Zap class="h-4 w-4" /> Ultimi Risultati
                </h3>
                
                <div v-if="data.performance.lastTests && data.performance.lastTests.length > 0" 
                     class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    <Card v-for="test in data.performance.lastTests" :key="test.metricName" class="border border-foreground/10 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent class="p-4 flex flex-col items-center justify-center text-center">
                            <span class="text-[9px] font-bold uppercase text-muted-foreground/70 mb-2">{{ test.metricName }}</span>
                            <div class="text-xl font-bold tracking-tighter">
                                {{ test.value }}<span class="text-xs font-semibold ml-1 text-muted-foreground">{{ test.unit }}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div v-else class="bg-muted/5 border border-foreground/10 rounded-lg p-6 text-center">
                    <ClipboardList class="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p class="text-xs font-semibold text-muted-foreground/60">{{ t('analytics.no_tests_registered') }}</p>
                </div>
            </div>

            <!-- BODY & INJURIES SECTION -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Body Summary -->
                <Card class="border border-foreground/10 shadow-md">
                    <CardHeader class="bg-muted/30 pb-3">
                        <CardTitle class="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <Scale class="h-4 w-4" /> Misure Antropometriche
                        </CardTitle>
                    </CardHeader>
                    <CardContent class="pt-6 space-y-4">
                        <div class="flex justify-between items-center pb-3 border-b border-foreground/5">
                            <span class="text-sm text-muted-foreground font-medium">Peso</span>
                            <span class="text-lg font-bold">{{ data.athlete.antropometrics.weight }}<span class="text-xs text-muted-foreground ml-1">kg</span></span>
                        </div>
                        <div class="flex justify-between items-center pb-3 border-b border-foreground/5">
                            <span class="text-sm text-muted-foreground font-medium">Altezza</span>
                            <span class="text-lg font-bold">{{ data.athlete.antropometrics.height }}<span class="text-xs text-muted-foreground ml-1">cm</span></span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-muted-foreground font-medium">BMI</span>
                            <span class="text-lg font-bold">{{ data.athlete.antropometrics.bmi }}</span>
                        </div>
                    </CardContent>
                </Card>

                <!-- Injuries Status -->
                <Card class="lg:col-span-2 border border-foreground/10 shadow-md">
                    <CardHeader class="bg-muted/30 pb-3">
                        <CardTitle class="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <Heart class="h-4 w-4" /> Stato Infortuni
                        </CardTitle>
                    </CardHeader>
                    <CardContent class="pt-6">
                        <div v-if="!data.injuries || data.injuries.length === 0" class="p-4 bg-green-500/5 rounded-lg border border-green-500/20 flex items-center gap-3">
                            <CheckCircle class="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span class="text-sm font-bold text-green-700">{{ t('analytics.all_clear') }}</span>
                        </div>
                        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div v-for="injury in data.injuries" :key="injury.date" class="p-3 rounded-lg border border-foreground/10 bg-muted/5">
                                <div class="flex justify-between mb-2">
                                    <span class="text-[10px] font-mono text-muted-foreground/60">{{ new Date(injury.date).toLocaleDateString('it-IT') }}</span>
                                    <Badge variant="secondary" class="text-[9px] font-bold uppercase">{{ injury.status }}</Badge>
                                </div>
                                <p class="text-xs font-semibold">{{ injury.injury }}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </template>

        <!-- EMPTY STATE -->
        <div v-else class="py-16 text-center bg-muted/5 rounded-2xl border border-foreground/10">
            <ClipboardList class="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
            <h3 class="text-lg font-bold text-muted-foreground/60">{{ t('analytics.no_data_available') }}</h3>
        </div>
    </div>
</template>