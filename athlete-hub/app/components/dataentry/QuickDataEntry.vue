<script setup lang="ts">
import { ref, computed } from 'vue'
import { AlertTriangle, CheckCircle, Clock, BarChart3, Users, Sun, Info } from 'lucide-vue-next'
// Assumiamo l'esistenza dei componenti Card, CardHeader, CardContent, Badge (o un elemento per i semafori), Input, Select ecc.

// ------------------------------------------
// 1. Dati Mock e Tipi
// ------------------------------------------

interface AthleteHealth {
    id: number
    name: string
    position: string
    // Wellness Status
    readinessScore: number // Punteggio 0-10, più alto è meglio
    avgWellness: number // Media dei punteggi Hooper (1=Ottimo, 5=Scarso), più basso è meglio
    // ACWR Status
    acuteLoad: number // Carico Settimanale Corrente (TL 7 giorni)
    chronicLoad: number // Carico Settimanale Cronico (TL 28 giorni)
    acwr: number // Acute:Chronic Workload Ratio
}

// Dati fittizi di salute per la squadra, che verrebbero aggiornati dal tuo input
const mockTeamHealth: AthleteHealth[] = [
    { id: 1, name: 'Marco Rossi', position: 'Centrocampista', readinessScore: 8.5, avgWellness: 2.1, acuteLoad: 3500, chronicLoad: 3000, acwr: 1.17 },
    { id: 2, name: 'Laura Bianchi', position: 'Attaccante', readinessScore: 9.2, avgWellness: 1.5, acuteLoad: 3200, chronicLoad: 3250, acwr: 0.98 },
    { id: 3, name: 'Andrea Verdi', position: 'Difensore', readinessScore: 6.0, avgWellness: 3.5, acuteLoad: 4200, chronicLoad: 3300, acwr: 1.27 }, // Rischio Giallo
    { id: 4, name: 'Sofia Neri', position: 'Centrocampista', readinessScore: 7.8, avgWellness: 2.5, acuteLoad: 3000, chronicLoad: 2500, acwr: 1.20 },
    { id: 5, name: 'Luca Gialli', position: 'Portiere', readinessScore: 5.1, avgWellness: 4.0, acuteLoad: 4800, chronicLoad: 2800, acwr: 1.71 }, // Rischio Rosso
    { id: 6, name: 'Elisa Bruno', position: 'Difensore', readinessScore: 8.9, avgWellness: 1.8, acuteLoad: 2800, chronicLoad: 3000, acwr: 0.93 },
]

// ------------------------------------------
// 2. Logica di Calcolo e Semafori
// ------------------------------------------

// Calcola la media di squadra del ACWR e del Wellness
const teamAverages = computed(() => {
    const totalAcwr = mockTeamHealth.reduce((sum, a) => sum + a.acwr, 0)
    const totalWellness = mockTeamHealth.reduce((sum, a) => sum + a.avgWellness, 0)
    const totalReadiness = mockTeamHealth.reduce((sum, a) => sum + a.readinessScore, 0)
    
    return {
        avgAcwr: (totalAcwr / mockTeamHealth.length).toFixed(2),
        avgWellness: (totalWellness / mockTeamHealth.length).toFixed(1),
        avgReadiness: (totalReadiness / mockTeamHealth.length).toFixed(1),
    }
})

/**
 * Determina lo stato di rischio ACWR basato sulle soglie standard:
 * Verde: < 1.2
 * Giallo: 1.2 - 1.5
 * Rosso: > 1.5
 */
const getAcwrStatus = (acwr: number) => {
    if (acwr > 1.5) {
        return { color: 'bg-red-500', text: 'Alto Rischio' }
    } else if (acwr >= 1.2) {
        return { color: 'bg-yellow-500', text: 'Rischio Moderato' }
    } else {
        return { color: 'bg-green-500', text: 'Basso Rischio' }
    }
}

/**
 * Determina lo stato di prontezza (Readiness)
 * Alto (Green): > 8.0
 * Medio (Yellow): 6.0 - 8.0
 * Basso (Red): < 6.0
 */
const getReadinessStatus = (score: number) => {
    if (score < 6.0) {
        return { color: 'bg-red-500', text: 'Bassa' }
    } else if (score < 8.0) {
        return { color: 'bg-yellow-500', text: 'Moderata' }
    } else {
        return { color: 'bg-green-500', text: 'Alta' }
    }
}

// ------------------------------------------
// 3. Funzioni di Visualizzazione Tabella
// ------------------------------------------

const sortBy = ref<'acwr' | 'readiness'>('acwr') // Criterio di ordinamento
const sortDirection = ref<'asc' | 'desc'>('desc') // Direzione di ordinamento

const sortedTeamHealth = computed(() => {
    return [...mockTeamHealth].sort((a, b) => {
        let valA, valB;

        if (sortBy.value === 'acwr') {
            valA = a.acwr;
            valB = b.acwr;
        } else { // 'readiness'
            // Per il readiness, vogliamo che il punteggio più alto sia in cima in default (desc)
            valA = a.readinessScore;
            valB = b.readinessScore;
        }

        if (sortDirection.value === 'asc') {
            return valA - valB;
        } else {
            return valB - valA;
        }
    })
})

const handleSort = (key: 'acwr' | 'readiness') => {
    if (sortBy.value === key) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
        sortBy.value = key
        // Per ACWR, il più alto (rischio) è di default il più importante (desc)
        // Per Readiness, il più alto (prontezza) è di default il più importante (desc)
        sortDirection.value = 'desc'
    }
}
</script>

<template>
    <div class="p-6 bg-white min-h-screen">
        
        <header class="mb-8 border-b pb-4">
            <div class="flex items-center justify-between">
                <h1 class="text-3xl font-bold flex items-center gap-3 text-gray-800">
                    <Users class="h-7 w-7 text-indigo-600"/> Dashboard Salute Squadra
                </h1>
                <p class="text-gray-500 flex items-center gap-1">
                    <Clock class="h-4 w-4"/> Ultimo Aggiornamento: Oggi
                </p>
            </div>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card class="border shadow-sm p-4">
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium text-gray-500">ACWR Medio</CardTitle>
                    <BarChart3 class="h-5 w-5 text-indigo-500" />
                </CardHeader>
                <CardContent>
                    <div class="text-3xl font-bold text-gray-800">{{ teamAverages.avgAcwr }}</div>
                    <p class="text-xs text-gray-500 mt-1">
                        Rischio di infortunio collettivo.
                    </p>
                </CardContent>
            </Card>

            <Card class="border shadow-sm p-4">
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium text-gray-500">Prontezza Media</CardTitle>
                    <CheckCircle class="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div class="text-3xl font-bold text-gray-800">{{ teamAverages.avgReadiness }} / 10</div>
                    <p class="text-xs text-gray-500 mt-1">
                        Capacità di prestazione percepita.
                    </p>
                </CardContent>
            </Card>

            <Card class="border shadow-sm p-4">
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium text-gray-500">Affaticamento Medio</CardTitle>
                    <Sun class="h-5 w-5 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div class="text-3xl font-bold text-gray-800">{{ teamAverages.avgWellness }} / 5</div>
                    <p class="text-xs text-gray-500 mt-1">
                        (1=Ottimo, 5=Scarso).
                    </p>
                </CardContent>
            </Card>
        </div>
        

        <Card class="shadow-lg border">
            <CardHeader class="flex flex-row items-center justify-between p-4 border-b">
                <CardTitle class="text-lg font-semibold text-gray-700">Stato Individuale e Rischio</CardTitle>
                <div class="flex items-center gap-2 text-sm text-gray-500">
                    <Info class="h-4 w-4"/> Ordina cliccando sulle intestazioni.
                </div>
            </CardHeader>
            <CardContent class="p-0 overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <th class="py-3 px-4">Atleta</th>
                            <th class="py-3 px-4">Posizione</th>
                            
                            <th class="py-3 px-4 cursor-pointer hover:bg-gray-100 transition-colors" @click="handleSort('acwr')">
                                <div class="flex items-center gap-1">
                                    ACWR Ratio
                                    <span v-if="sortBy === 'acwr'">
                                        {{ sortDirection === 'asc' ? '▲' : '▼' }}
                                    </span>
                                </div>
                            </th>
                            <th class="py-3 px-4">Rischio</th>
                            
                            <th class="py-3 px-4 cursor-pointer hover:bg-gray-100 transition-colors" @click="handleSort('readiness')">
                                <div class="flex items-center gap-1">
                                    Prontezza (10)
                                    <span v-if="sortBy === 'readiness'">
                                        {{ sortDirection === 'asc' ? '▲' : '▼' }}
                                    </span>
                                </div>
                            </th>
                            <th class="py-3 px-4">Fatica Media (5)</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        <tr v-for="athlete in sortedTeamHealth" :key="athlete.id" class="text-sm hover:bg-gray-50 transition-colors">
                            <td class="py-3 px-4 font-medium text-gray-800">{{ athlete.name }}</td>
                            <td class="py-3 px-4 text-gray-600">{{ athlete.position }}</td>
                            
                            <td class="py-3 px-4 font-semibold text-gray-700">{{ athlete.acwr.toFixed(2) }}</td>
                            
                            <td class="py-3 px-4">
                                <div :class="['inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white', getAcwrStatus(athlete.acwr).color]">
                                    <AlertTriangle v-if="athlete.acwr > 1.2" class="h-3 w-3 mr-1"/>
                                    {{ getAcwrStatus(athlete.acwr).text }}
                                </div>
                            </td>
                            
                            <td class="py-3 px-4 font-semibold">{{ athlete.readinessScore.toFixed(1) }}</td>
                            
                            <td class="py-3 px-4">
                                <div :class="['inline-block w-3 h-3 rounded-full mr-2', getReadinessStatus(athlete.readinessScore).color]"></div>
                                {{ athlete.avgWellness.toFixed(1) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
                 
            </CardContent>
        </Card>
        
        <div class="mt-8 pt-4 border-t border-gray-200">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Legenda ACWR (Acute:Chronic Workload Ratio)</h3>
            <ul class="text-sm text-gray-600 space-y-2">
                <li class="flex items-center">
                    <div class="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                    **ACWR < 1.2:** Zona Bassa Rischio (Carico sotto il 20% della media cronica).
                </li>
                <li class="flex items-center">
                    <div class="w-3 h-3 rounded-full bg-yellow-500 mr-3"></div>
                    **ACWR 1.2 - 1.5:** Zona di Rischio Moderato (Aumenti progressivi, attenzione al recupero).
                </li>
                <li class="flex items-center">
                    <div class="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                    **ACWR > 1.5:** Zona Alto Rischio (Rischio elevato di infortunio, valutare la riduzione del carico).
                </li>
            </ul>
        </div>

    </div>
</template>