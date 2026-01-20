<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
    CheckCircle, AlertTriangle, TrendingUp, TrendingDown,
    Activity, Scale, Info, Calendar, History, Loader2, ClipboardList, Clock,
    DivideCircle
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LineChart } from '@/components/ui/chart-line'
import { Skeleton } from '@/components/ui/skeleton'

import { athleteApi } from '@/api/business'
import type { AthleteAnalyticsDto } from '@/types/api'

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
        
        if (err.response?.status === 404) {
             // Non mostrare necessariamente un toast di errore se è solo un "non trovato"
             console.log("Nessun dato per questo atleta");
        } else {
             toast.error(errorMessage || t('analytics.error_loading'));
        }
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
</script>

<template>
    <div class="w-full flex flex-col gap-6">

        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton class="h-[320px] w-full rounded-xl" v-for="i in 3" :key="i" />
        </div>

        <template v-else-if="data && data.athlete">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card class="border-primary/10 shadow-sm">
                    <CardHeader class="pb-2 bg-muted/5">
                        <CardTitle class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Activity class="h-4 w-4 text-primary" /> {{ t('analytics.readiness_title') }}
                        </CardTitle>
                    </CardHeader>
                    <CardContent class="space-y-6 pt-4">
                        <div class="flex items-center justify-between">
                            <div class="flex flex-col">
                                <span class="text-4xl font-black text-foreground">
                                    {{ data.athlete.readinessScore }}<span class="text-lg font-normal text-muted-foreground">/100</span>
                                </span>
                            </div>
                            <Badge variant="outline" :class="[
                                data.athlete.riskLevel === 'Inizializzazione' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                data.athlete.readinessScore > 70 ? 'bg-green-500/10 text-green-700 border-green-200' : 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
                            ]">
                                <Clock v-if="data.athlete.riskLevel === 'Inizializzazione'" class="h-3 w-3 mr-1" />
                                {{ data.athlete.riskLevel }}
                            </Badge>
                        </div>

                        <div class="p-4 rounded-xl border-2 border-dashed transition-all" :class="acwrStatusClass">
                            <div class="flex items-center gap-2 mb-2">
                                <AlertTriangle v-if="latestAcwr.acwr > 1.3" class="h-4 w-4" />
                                <CheckCircle v-else class="h-4 w-4" />
                                <span class="text-[10px] font-black uppercase">{{ latestAcwr.zone }}</span>
                            </div>
                            <div class="text-3xl font-black">{{ latestAcwr.acwr.toFixed(2) }}</div>
                            <p class="text-[9px] uppercase font-bold opacity-70">{{ t('analytics.current_acwr') }}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card class="md:col-span-2 border-primary/10 shadow-sm overflow-hidden">
                    <CardHeader class="pb-2 bg-muted/5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        {{ t('analytics.workload_trend') }}
                    </CardHeader>
                    <CardContent class="pt-4">
                        <div class="h-[200px] w-full">
                            <LineChart :data="acwrChartData" index="week" :categories="[t('analytics.acwr')]"
                                :colors="['#2563eb']" :show-grid-line="true" :show-tooltip="true" class="w-full h-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div class="space-y-4">
                <h3 class="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
                    <TrendingUp class="h-4 w-4 text-primary" /> {{ t('analytics.latest_results') }}
                </h3>
                
                <div v-if="data.performance.lastTests && data.performance.lastTests.length > 0" 
                     class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <Card v-for="test in data.performance.lastTests" :key="test.metricName" class="shadow-sm border-primary/5">
                        <CardContent class="p-4 flex flex-col items-center justify-center text-center">
                            <span class="text-[9px] font-black uppercase text-muted-foreground/60 mb-2">{{ test.metricName }}</span>
                            <div class="text-2xl font-black tracking-tighter">
                                {{ test.value }}<span class="text-xs font-bold ml-0.5 text-muted-foreground">{{ test.unit }}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div v-else class="bg-muted/10 border-2 border-dashed rounded-xl p-8 text-center">
                    <ClipboardList class="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p class="text-xs font-bold text-muted-foreground/60 uppercase">{{ t('analytics.no_tests_registered') }}</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card class="border-primary/10 shadow-sm">
                    <CardHeader class="bg-muted/5 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        <Scale class="h-4 w-4 inline mr-2" /> {{ t('analytics.body_summary') }}
                    </CardHeader>
                    <CardContent class="pt-6 space-y-4">
                        <div class="flex justify-between border-b pb-2 text-sm">
                            <span class="text-muted-foreground">{{ t('measurements.card.weight') }}</span>
                            <span class="font-black">{{ data.athlete.antropometrics.weight }} kg</span>
                        </div>
                        <div class="flex justify-between border-b pb-2 text-sm">
                            <span class="text-muted-foreground">BMI</span>
                            <span class="font-black">{{ data.athlete.antropometrics.bmi }}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-muted-foreground">{{ t('measurements.card.height') }}</span>
                            <span class="font-black">{{ data.athlete.antropometrics.height }} cm</span>
                        </div>
                    </CardContent>
                </Card>

                <Card class="lg:col-span-2 border-primary/10 shadow-sm">
                    <CardHeader class="bg-muted/5 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        <Info class="h-4 w-4 inline mr-2" /> {{ t('analytics.injuries_status') }}
                    </CardHeader>
                    <CardContent class="pt-6">
                        <div v-if="!data.injuries || data.injuries.length === 0" class="p-4 bg-green-500/5 rounded-xl border border-green-500/10 flex items-center gap-3">
                            <CheckCircle class="h-5 w-5 text-green-500" />
                            <span class="text-xs font-bold text-green-700 uppercase">{{ t('analytics.all_clear') }}</span>
                        </div>
                        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div v-for="injury in data.injuries" :key="injury.date" class="p-3 rounded-lg border bg-card">
                                <div class="flex justify-between mb-1">
                                    <span class="text-[9px] font-mono opacity-50">{{ new Date(injury.date).toLocaleDateString() }}</span>
                                    <Badge variant="secondary" class="text-[8px] font-black uppercase">{{ injury.status }}</Badge>
                                </div>
                                <p class="text-xs font-black">{{ injury.injury }}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </template>

        <div v-else class="py-20 text-center bg-muted/5 rounded-3xl border-2 border-dashed">
            <ClipboardList class="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
            <h3 class="text-lg font-bold text-muted-foreground/60">{{ t('analytics.no_data_available') }}</h3>
        </div>
    </div>
</template>