<script setup lang="ts">
import { ref, computed } from 'vue'
import { CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Clock, Scale } from 'lucide-vue-next'
// Assumiamo l'esistenza dei componenti Card, Button, Badge, LineChart ecc.

// ------------------------------------------
// 1. Tipi e Dati
// ------------------------------------------

interface Athlete {
    id: number
    name: string
    position: string
    readinessScore: number
    riskLevel: 'Basso' | 'Medio' | 'Alto'
    antropometrics: {
        weight: number
        height: number
        bmi: string
    }
}

interface AcwrItem {
    week: string;
    acute: number;
    chronic: number;
    acwr: number;
    zone: 'Basso' | 'Medio' | 'Alto';
}

interface TestResult {
    date: string;
    cmj: number;
    squat1rm: number;
    sprint30m: number;
}

interface AthleteData {
    athlete: Athlete;
    acwr: AcwrItem[];
    tests: TestResult[];
    teamAvg: { cmj: number; squat1rm: number; sprint30m: number; };
    injuries: { date: string; injury: string; daysOut: number; status: string }[];
}


// **SIMULAZIONE DEL DATABASE DEGLI ATLETI**
// In un'applicazione reale, questi dati verrebbero recuperati da un'API.
const ATHLETES_DATA: Record<number, AthleteData> = {
    1: { // Marco Rossi (Dati di prima)
        athlete: { id: 1, name: 'Marco Rossi', position: 'Centrocampista', readinessScore: 78, riskLevel: 'Medio', antropometrics: { weight: 75.2, height: 1.80, bmi: '23.2 (Normale)' } },
        acwr: [
            { week: 'Wk -4', acute: 1000, chronic: 1100, acwr: 0.91, zone: 'Basso' },
            { week: 'Wk -3', acute: 1250, chronic: 1150, acwr: 1.09, zone: 'Basso' },
            { week: 'Wk -2', acute: 1500, chronic: 1200, acwr: 1.25, zone: 'Medio' },
            { week: 'Wk -1', acute: 1650, chronic: 1300, acwr: 1.27, zone: 'Medio' },
            { week: 'Wk Corrente', acute: 1750, chronic: 1400, acwr: 1.25, zone: 'Medio' },
        ],
        tests: [
            { date: 'Gen 2024', cmj: 45, squat1rm: 120, sprint30m: 4.15 },
            { date: 'Mar 2024', cmj: 48, squat1rm: 125, sprint30m: 4.08 },
            { date: 'Mag 2024', cmj: 47, squat1rm: 122, sprint30m: 4.10 },
            { date: 'Lug 2024', cmj: 49, squat1rm: 128, sprint30m: 4.05 },
        ],
        teamAvg: { cmj: 46, squat1rm: 120, sprint30m: 4.20 },
        injuries: [
            { date: '2024-03-15', injury: 'Distrazione Flessore (Grado 1)', daysOut: 14, status: 'Rientrato' },
        ],
    },
    2: { // Nuovi Dati di Esempio: Laura Bianchi (Prestazione Alta, Carico Basso)
        athlete: { id: 2, name: 'Laura Bianchi', position: 'Attaccante', readinessScore: 92, riskLevel: 'Basso', antropometrics: { weight: 62.1, height: 1.72, bmi: '21.0 (Normale)' } },
        acwr: [
            { week: 'Wk -4', acute: 800, chronic: 900, acwr: 0.89, zone: 'Basso' },
            { week: 'Wk -3', acute: 950, chronic: 920, acwr: 1.03, zone: 'Basso' },
            { week: 'Wk -2', acute: 850, chronic: 900, acwr: 0.94, zone: 'Basso' },
            { week: 'Wk -1', acute: 1050, chronic: 950, acwr: 1.11, zone: 'Basso' },
            { week: 'Wk Corrente', acute: 1000, chronic: 960, acwr: 1.04, zone: 'Basso' },
        ],
        tests: [
            { date: 'Gen 2024', cmj: 55, squat1rm: 95, sprint30m: 3.95 },
            { date: 'Mar 2024', cmj: 57, squat1rm: 100, sprint30m: 3.90 },
            { date: 'Mag 2024', cmj: 58, squat1rm: 102, sprint30m: 3.85 },
            { date: 'Lug 2024', cmj: 58, squat1rm: 105, sprint30m: 3.80 },
        ],
        teamAvg: { cmj: 46, squat1rm: 120, sprint30m: 4.20 },
        injuries: [],
    }
};

// ------------------------------------------
// 2. Props e Caricamento Dinamico
// ------------------------------------------

// **PASSO 1: Accettare l'ID dell'atleta come prop**
const props = defineProps<{
    athleteId: number
}>()

// **PASSO 2: Caricare i dati dinamici**
const currentAthleteData = computed<AthleteData>(() => {
    // Cerchiamo i dati nell'oggetto simulato
    const data = ATHLETES_DATA[props.athleteId];
    
    // Se non troviamo i dati (o l'ID non esiste), restituiamo un set di dati "vuoto"
    // Questo è cruciale per evitare errori a catena se l'ID non è valido.
    if (!data) {
        return {
            athlete: { id: 0, name: 'Atleta Sconosciuto', position: '', readinessScore: 0, riskLevel: 'Basso', antropometrics: { weight: 0, height: 0, bmi: 'N/A' } },
            acwr: [],
            tests: [],
            teamAvg: { cmj: 0, squat1rm: 0, sprint30m: 0 },
            injuries: [],
        } as AthleteData
    }
    return data;
})

// ------------------------------------------
// 3. Logica Calcolata (Aggiornata per usare currentAthleteData)
// ------------------------------------------

// Reindirizziamo tutte le ref precedenti alle computed property dinamiche:
const athleteData = computed(() => currentAthleteData.value.athlete)
const acwrData = computed(() => currentAthleteData.value.acwr)
const testPerformance = computed(() => currentAthleteData.value.tests)
const teamAverage = computed(() => currentAthleteData.value.teamAvg)
const injuryHistory = computed(() => currentAthleteData.value.injuries)


// Computed property per l'ultimo elemento ACWR. Aggiungiamo un check per array vuoto.
const latestAcwrItem = computed<AcwrItem>(() => acwrData.value[acwrData.value.length - 1] || { week: 'N/A', acwr: 0, acute: 0, chronic: 0, zone: 'Basso' } as AcwrItem)

const latestAcwr = computed(() => latestAcwrItem.value.acwr.toFixed(2))

// Computed property per l'ultimo risultato del test. Aggiungiamo un check per array vuoto.
const latestTests = computed<TestResult>(() => testPerformance.value[testPerformance.value.length - 1] || { date: 'N/A', cmj: 0, squat1rm: 0, sprint30m: 0 } as TestResult)

// Stato di rischio basato sull'ACWR (logica invariata)
const acwrStatus = computed(() => {
    const acwr = parseFloat(latestAcwr.value)
    if (acwr > 1.5) return { text: 'Alto Rischio (Overload)', class: 'bg-red-100 text-red-800 border-red-500' }
    if (acwr >= 1.2) return { text: 'Rischio Medio (Attenzione)', class: 'bg-yellow-100 text-yellow-800 border-yellow-500' }
    return { text: 'Basso Rischio', class: 'bg-green-100 text-green-800 border-green-500' }
})

// Calcola la differenza percentuale rispetto alla media del team (logica invariata)
const performanceComparison = computed(() => {
    const lT = latestTests.value
    // Evitiamo divisioni per zero se i dati medi non sono presenti
    if (teamAverage.value.cmj === 0 || lT.date === 'N/A') return []

    return [
        { 
            metric: 'CMJ (cm)', 
            marco: lT.cmj, 
            team: teamAverage.value.cmj,
            diff: (((lT.cmj - teamAverage.value.cmj) / teamAverage.value.cmj) * 100).toFixed(1),
            isBetter: lT.cmj >= teamAverage.value.cmj
        },
        // ... (altre metriche come prima)
        { 
            metric: 'Squat 1RM (kg)', 
            marco: lT.squat1rm, 
            team: teamAverage.value.squat1rm,
            diff: (((lT.squat1rm - teamAverage.value.squat1rm) / teamAverage.value.squat1rm) * 100).toFixed(1),
            isBetter: lT.squat1rm >= teamAverage.value.squat1rm 
        },
        { 
            metric: 'Sprint 30m (s)', 
            marco: lT.sprint30m, 
            team: teamAverage.value.sprint30m,
            diff: (((teamAverage.value.sprint30m - lT.sprint30m) / teamAverage.value.sprint30m) * 100).toFixed(1),
            isBetter: lT.sprint30m <= teamAverage.value.sprint30m 
        },
    ]
})
</script>

<template>
  <div class="w-full flex flex-col gap-8">
    
    <div class="grid grid-cols-1 gap-6 @xl:grid-cols-3">
        
      <Card class="col-span-1">
          <CardHeader>
              <CardTitle>Stato di Prontezza (Readiness)</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
              <div class="flex items-center justify-between border-b pb-3">
                  <span class="text-lg font-medium">Punteggio di Recupero:</span>
                  <Badge class="text-xl font-bold" :class="{'bg-green-500/10 text-green-700': athleteData.readinessScore > 75, 'bg-yellow-500/10 text-yellow-700': athleteData.readinessScore <= 75}">
                    {{ athleteData.readinessScore }}
                  </Badge>
              </div>

              <div class="border-l-4 p-3 rounded-r-md" :class="acwrStatus.class">
                  <div class="flex items-center gap-2">
                      <AlertTriangle v-if="acwrStatus.text !== 'Basso Rischio'" class="h-5 w-5" />
                      <CheckCircle v-else class="h-5 w-5 text-green-700" />
                      <p class="font-semibold">{{ acwrStatus.text }}</p>
                  </div>
                  <p class="text-2xl font-extrabold mt-1">{{ latestAcwr }}</p>
                  <p class="text-sm text-gray-600">ACWR Corrente (Settimana: **{{ latestAcwrItem.week }}**)</p>
              </div>

              <div class="space-y-2 pt-4">
                  <h4 class="font-semibold flex items-center gap-2"><Scale class="h-4 w-4" /> Dati Antropometrici</h4>
                  <div class="text-sm text-gray-700">
                      Peso: **{{ athleteData.antropometrics.weight }} kg**
                  </div>
                  <div class="text-sm text-gray-700">
                      Altezza: **{{ athleteData.antropometrics.height }} m**
                  </div>
                  <div class="text-sm text-gray-700">
                      BMI: **{{ athleteData.antropometrics.bmi }}**
                  </div>
              </div>

          </CardContent>
      </Card>
        
      <Card class="col-span-1 @xl:col-span-2">
          <CardHeader>
              <CardTitle>📈 Acute:Chronic Workload Ratio (ACWR)</CardTitle>
              <CardDescription>Andamento del rapporto Carico Acuto (7 giorni) vs Carico Cronico (28 giorni). Obiettivo: 0.8 - 1.3</CardDescription>
          </CardHeader>
          <CardContent>
             
            <LineChart 
                :data="acwrData" 
                :categories="['acwr']" 
                index="week"
                :y-axis-config="{ domain: [0.7, 1.6], label: 'ACWR' }"
                :x-axis-config="{ label: 'Settimana' }"
            />
          </CardContent>
      </Card>
      
    </div>

    <div class="grid grid-cols-1 gap-6 @xl:grid-cols-2">
        
        <Card>
            <CardHeader>
                <CardTitle>Benchmark Prestazioni (vs Team)</CardTitle>
                <CardDescription>Risultati ultimi test (**{{ latestTests.date }}**) a confronto con la media del Team.</CardDescription>
            </CardHeader>
            <CardContent>
              <template v-if="performanceComparison.length > 0">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <th class="py-3">Metrica</th>
                            <th class="py-3">{{ athleteData.name }}</th>
                            <th class="py-3">Media Team</th>
                            <th class="py-3">Diff (%)</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        <tr v-for="item in performanceComparison" :key="item.metric" class="text-sm">
                            <td class="py-4 font-medium">{{ item.metric }}</td>
                            <td class="py-4">{{ item.marco }}</td>
                            <td class="py-4 text-gray-500">{{ item.team }}</td>
                            <td class="py-4" :class="item.isBetter ? 'text-green-600' : 'text-red-600'">
                                <span class="flex items-center gap-1">
                                    <TrendingUp v-if="item.isBetter" class="h-4 w-4" />
                                    <TrendingDown v-else class="h-4 w-4" />
                                    {{ item.diff }}%
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
              </template>
              <p v-else class="text-center text-gray-500 py-4">Nessun dato di test di prestazione disponibile.</p>

            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Storico Infortuni e Assenze</CardTitle>
                <CardDescription>Riepilogo delle indisponibilità passate.</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div v-if="injuryHistory.length > 0">
                <div v-for="injury in injuryHistory" :key="injury.date" class="border-l-4 border-red-500 pl-3">
                    <p class="font-medium flex items-center gap-2">
                        <Clock class="h-4 w-4 text-gray-500"/> {{ injury.date }}
                    </p>
                    <p class="text-sm font-semibold mt-1">{{ injury.injury }}</p>
                    <p class="text-sm text-gray-500">
                        Assenza: **{{ injury.daysOut }} giorni** | Stato: 
                        <span class="font-medium" :class="injury.status === 'Rientrato' ? 'text-green-600' : 'text-red-600'">
                            {{ injury.status }}
                        </span>
                    </p>
                </div>
              </div>
              <p v-else class="text-center text-green-500 py-4 font-medium">🎉 Nessun infortunio registrato.</p>
            </CardContent>
        </Card>
        
    </div>

    <Card>
        <CardHeader>
            <CardTitle>📉 Trend Storico Prestazioni Chiave</CardTitle>
            <CardDescription>Evoluzione dei risultati di test su Forza (Squat 1RM) e Potenza (CMJ) nel corso della stagione.</CardDescription>
        </CardHeader>
        <CardContent>
          <template v-if="testPerformance.length > 0">
            <LineChart :data="testPerformance" :categories="['cmj', 'squat1rm']" index="date" />
          </template>
          <p v-else class="text-center text-gray-500 py-4">Nessun dato storico di prestazione per il grafico.</p>
        </CardContent>
    </Card>

  </div>
</template>