<script setup lang="ts">
import NumberFlow from '@number-flow/vue'
import { TrendingDown, TrendingUp, AlertTriangle, UserCheck } from 'lucide-vue-next'

// Definizione di un componente fittizio per la selezione dell'Atleta
// In un'applicazione reale, questo permetterebbe di filtrare o navigare verso l'atleta specifico.
const AthleteSelector = { template: '<select><option>Tutti gli Atleti</option><option>Marco Rossi</option><option>Laura Bianchi</option></select>' }

// 1. Dati per le Metriche Principali (Riflettendo la terminologia del Preparatore)
const dataCard = ref({
  totalLoad: 6250, // Carico Totale Settimanale (es. basato su sRPE x Minuti)
  avgRPE: 7.2,
  monitoredAthletes: 23, // Atleti Monitorati
  unavailabilityRate: 8.7, // Tasso di Indisponibilità (Injury Rate)
})

// Date range (lasciato invariato)
const timeRange = ref('30d')
const isDesktop = useMediaQuery('(min-width: 768px)')
watch(isDesktop, () => {
  timeRange.value = isDesktop.value ? '30d' : '7d'
}, { immediate: true })

// 2. Dati per i Grafici e Widget Aggiornati

// Andamento del Carico e RPE, inclusa la metrica ACWR (Acute:Chronic Workload Ratio)
const workloadData = [
  { week: 'Wk 1', load: 1200, rpe: 6.5, acwr: 0.95 },
  { week: 'Wk 2', load: 1450, rpe: 7, acwr: 1.15 },
  { week: 'Wk 3', load: 1300, rpe: 6.8, acwr: 1.05 },
  { week: 'Wk 4', load: 1600, rpe: 7.5, acwr: 1.35 }, // Alto Carico Acuto (Allerta)
]

// Monitoraggio Fisiologico: Frequenza Cardiaca media e RPE
const physiologicalMonitor = [
  { session: '01/06', avgHR: 138, RPE: 7 },
  { session: '02/06', avgHR: 142, RPE: 7.5 },
  { session: '03/06', avgHR: 140, RPE: 6 },
  { session: '04/06', avgHR: 145, RPE: 8 },
]

// Distribuzione per Disciplina/Categoria (sostituisce "Posizione")
const athleteDiscipline = [
  { discipline: 'Corsa', count: 10 },
  { discipline: 'Sport di Squadra', count: 8 },
  { discipline: 'Forza', count: 5 },
]

// Stato di Prontezza (Readiness Status) - Più generale e proattivo
const readinessStatus = [
  { status: 'Ottima Prontezza', value: 14 },
  { status: 'Recupero Lento', value: 5 },
  { status: 'Infortunato/Malato', value: 4 },
]

// Allerte basate sui Dati (Simula atleti con ACWR troppo alto > 1.3)
const highLoadAlerts = workloadData
  .filter(item => item.acwr > 1.3)
  .map(item => ({
    week: item.week,
    athlete: 'Atleta Esempio ' + Math.floor(Math.random() * 5 + 1), // Atleti fittizi per l'esempio
    acwr: item.acwr.toFixed(2),
  }))

const upcomingSessions = [
  { session: '2024-07-01', type: 'Forza', focus: 'Ipertrofia', targetRPE: 7, time: '10:00' },
  { session: '2024-07-02', type: 'Resistenza', focus: 'VO2 Max', targetRPE: 8, time: '16:00' },
  { session: '2024-07-03', type: 'Recupero', focus: 'Mobilità', targetRPE: 4, time: '09:00' },
]
</script>

<template>
  <div class="w-full flex flex-col gap-8">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-2xl font-bold tracking-tight">🏋️ Athlete Hub Dashboard</h2>
      <div class="flex items-center space-x-2">
        <AthleteSelector /> <BaseDateRangePicker />
        <Button>Export Dati</Button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 @xl:grid-cols-2 @5xl:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>Carico Totale Settimanale</CardDescription>
          <CardTitle><NumberFlow :value="dataCard.totalLoad" /></CardTitle>
          <CardAction><TrendingUp /></CardAction>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>RPE Medio (Percezione Sforzo)</CardDescription>
          <CardTitle><NumberFlow :value="dataCard.avgRPE" /></CardTitle>
          <CardAction><TrendingDown /></CardAction>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Atleti Monitorati</CardDescription>
          <CardTitle><NumberFlow :value="dataCard.monitoredAthletes" /></CardTitle>
          <CardAction><UserCheck /></CardAction>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Tasso di Indisponibilità</CardDescription>
          <CardTitle><NumberFlow :value="dataCard.unavailabilityRate" suffix="%" /></CardTitle>
          <CardAction><TrendingDown /></CardAction>
        </CardHeader>
      </Card>
    </div>

    <div class="grid grid-cols-1 gap-6 @xl:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>📈 Andamento Carico Settimanale & ACWR</CardTitle></CardHeader>
        <CardContent>
          <AreaChart :data="workloadData" :categories="['load', 'acwr']" index="week" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>❤️ Monitoraggio Fisiologico (HR & RPE)</CardTitle></CardHeader>
        <CardContent>
          <LineChart :data="physiologicalMonitor" :categories="['avgHR', 'RPE']" index="session" />
        </CardContent>
      </Card>
    </div>

    <div class="grid grid-cols-1 gap-4 @xl:grid-cols-3">
      <Card class="col-span-1 @xl:col-span-2">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-orange-600">
            <AlertTriangle class="h-5 w-5" /> Allerte Carico Alto (ACWR > 1.3)
          </CardTitle>
          <CardDescription>Atleti a rischio infortunio o affaticamento eccessivo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="highLoadAlerts.length > 0" class="space-y-2">
            <div v-for="alert in highLoadAlerts" :key="alert.athlete" class="border-l-4 border-orange-500 pl-3">
              <p class="font-medium">{{ alert.athlete }}</p>
              <p class="text-sm text-gray-500">ACWR: **{{ alert.acwr }}** - Settimana: {{ alert.week }}</p>
            </div>
          </div>
          <p v-else class="text-green-600 font-medium">Nessuna allerta ACWR. Carico ben gestito.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessioni in Programma</CardTitle>
          <CardDescription>Prossimi impegni con focus e intensità target.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <div v-for="session in upcomingSessions" :key="session.session" class="border-l-4 border-blue-500 pl-3">
            <p class="font-medium">{{ session.session }} - {{ session.type }}</p>
            <p class="text-sm text-gray-500">Focus: {{ session.focus }} | Target RPE: **{{ session.targetRPE }}**</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid grid-cols-1 gap-6 @xl:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>🧑‍🤝‍🧑 Distribuzione Atleti per Disciplina</CardTitle></CardHeader>
        <CardContent>
          <BarChart :data="athleteDiscipline" :categories="['count']" index="discipline" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>✅ Stato di Prontezza (Readiness)</CardTitle></CardHeader>
        <CardContent>
          <DonutChart :data="readinessStatus" :categories="['value']" index="status" category="value" />
        </CardContent>
      </Card>
    </div>
  </div>
</template>