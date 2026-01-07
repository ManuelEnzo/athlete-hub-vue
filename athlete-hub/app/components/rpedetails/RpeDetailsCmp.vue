<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { User, Loader2, Calendar, MessageSquare, Activity, X } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

// API
import { athleteApi } from '../../api/business'
import type { RpeLastSessionOverviewDto } from '../../types/api'

const { t } = useI18n()

// --- STATE ---
const athletesOverview = ref<RpeLastSessionOverviewDto[]>([])
const historicalData = ref<RpeLastSessionOverviewDto[]>([]) // Stato per lo storico
const loading = ref(false)
const loadingHistory = ref(false)
const focusedAthleteId = ref<number | null>(null)

// --- API CALLS ---

async function fetchOverview() {
  loading.value = true
  try {
    const res = await athleteApi.getLastSessionInfo()
    const data = res.data.value
    athletesOverview.value = Array.isArray(data) ? data : (data ? [data] : [])
  } catch (err: any) {
    toast.error("Errore nel caricamento overview")
  } finally {
    loading.value = false
  }
}

async function fetchHistory(id: number) {
  loadingHistory.value = true
  try {
    // Chiamata all'endpoint dello storico
    const res = await athleteApi.getHistoricalAnalysis(id)
    historicalData.value = res.data.value ?? []
  } catch (err: any) {
    toast.error("Errore nel caricamento dello storico")
  } finally {
    loadingHistory.value = false
  }
}

// --- LOGIC ---

const focusedAthlete = computed(() => {
  return athletesOverview.value.find(a => a.athleteId === focusedAthleteId.value) || null
})

function toggleFocus(id: number) {
  focusedAthleteId.value = id
  fetchHistory(id) // Carica lo storico al click
}

function getRpeColor(val: number) {
  if (val === 0) return 'bg-slate-100 text-slate-600'
  if (val <= 2) return 'bg-green-100 text-green-700 border-green-200'
  if (val <= 4) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  if (val <= 6) return 'bg-orange-100 text-orange-700 border-orange-200'
  if (val <= 8) return 'bg-red-100 text-red-700 border-red-200'
  return 'bg-red-900 text-white'
}

function getRpeLabel(val: number) {
  if (val === 0) return 'Nessuno 😴'
  if (val <= 2) return 'Leggero 🙂'
  if (val <= 4) return 'Moderato 😐'
  if (val <= 6) return 'Impegnativo 😰'
  if (val <= 8) return 'Duro 🥵'
  return 'Massimale 🔥'
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(fetchOverview)
</script>

<template>
  <div class="p-4 flex flex-col gap-6">
    <h1 class="text-2xl font-bold mb-4">RPE Dashboard</h1>

    <div v-if="loading && athletesOverview.length === 0" class="flex justify-center py-20">
      <Loader2 class="h-10 w-10 animate-spin text-primary" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" v-if="!focusedAthleteId">
      <div v-for="athlete in athletesOverview" :key="athlete.athleteId">
        <Card class="border shadow-sm hover:shadow-md transition cursor-pointer" @click="toggleFocus(athlete.athleteId)">
          <CardHeader>
            <CardTitle class="flex items-center justify-between">
              <span class="flex items-center gap-2">
                <User class="w-5 h-5 text-primary" /> {{ athlete.athleteName }}
              </span>
              <Badge variant="secondary" class="text-[10px]">Ultima sessione</Badge>
            </CardTitle>
          </CardHeader>

          <CardContent class="space-y-2">
            <p class="text-sm text-muted-foreground italic tracking-tight font-medium">{{ athlete.sessionType }}</p>
            <p class="text-sm text-muted-foreground">Data: {{ formatDate(athlete.sessionDate) }}</p>
            <p :class="getRpeColor(athlete.rpe) + ' px-2 py-1 rounded-md font-bold text-xs inline-block border'">
              {{ getRpeLabel(athlete.rpe) }} ({{ athlete.rpe }})
            </p>
            <p class="text-xs text-muted-foreground line-clamp-1 italic">Note: {{ athlete.notes || '-' }}</p>
          </CardContent>
        </Card>
      </div>
    </div>

    <div v-if="focusedAthlete" class="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Card class="border shadow-md transition mb-6">
        <CardHeader class="pb-2">
          <CardTitle class="flex items-center justify-between">
            <span class="flex items-center gap-2 text-xl">
              <User class="w-6 h-6 text-primary" /> {{ focusedAthlete.athleteName }}
            </span>
            <Button variant="ghost" size="sm" @click="focusedAthleteId = null">
              <X class="w-4 h-4 mr-2" /> Torna indietro
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent class="space-y-4">
          <div class="flex flex-wrap gap-4 p-3 bg-muted/20 rounded-lg border border-dashed">
            <div>
              <p class="text-[10px] uppercase font-bold text-muted-foreground">Ultima sessione</p>
              <p class="text-sm font-semibold uppercase tracking-tighter">{{ focusedAthlete.sessionType }}</p>
            </div>
            <div class="border-l pl-4">
              <p class="text-[10px] uppercase font-bold text-muted-foreground">Data</p>
              <p class="text-sm font-semibold">{{ formatDate(focusedAthlete.sessionDate) }}</p>
            </div>
            <div class="border-l pl-4">
              <p class="text-[10px] uppercase font-bold text-muted-foreground">RPE</p>
              <p :class="getRpeColor(focusedAthlete.rpe) + ' px-2 py-0.5 rounded text-xs font-bold'">
                {{ getRpeLabel(focusedAthlete.rpe) }} ({{ focusedAthlete.rpe }})
              </p>
            </div>
          </div>
          <div v-if="focusedAthlete.notes" class="text-sm italic text-muted-foreground border-l-4 pl-3 py-1">
            "{{ focusedAthlete.notes }}"
          </div>
        </CardContent>
      </Card>

      <div class="mt-6 p-4 border rounded-xl bg-muted/5 relative min-h-[200px]">
        <h3 class="font-bold mb-4 flex items-center gap-2">
            <Activity class="w-5 h-5 text-primary" /> Storico Analisi RPE
        </h3>
        
        <div v-if="loadingHistory" class="flex flex-col items-center justify-center py-10 gap-2">
          <Loader2 class="h-8 w-8 animate-spin text-primary" />
          <p class="text-xs text-muted-foreground">Caricamento dati storici...</p>
        </div>

        <div v-else class="grid grid-cols-1 gap-2">
          <div v-for="entry in historicalData" 
               :key="entry.sessionDate + entry.sessionType" 
               class="flex flex-col md:flex-row justify-between items-start md:items-center p-3 bg-card border border-muted/50 rounded-lg hover:border-primary/30 transition-colors shadow-sm">
            
            <div class="flex-1">
              <div class="flex items-center gap-2">
                 <p class="text-sm font-bold text-primary">{{ formatDate(entry.sessionDate) }}</p>
                 <Badge variant="outline" class="text-[9px] uppercase font-bold tracking-widest">{{ entry.sessionType }}</Badge>
              </div>
              <p class="text-xs text-muted-foreground italic mt-1">Note: {{ entry.notes || '-' }}</p>
            </div>

            <div class="mt-2 md:mt-0">
               <span :class="getRpeColor(entry.rpe) + ' px-3 py-1 rounded-full text-xs font-bold border shadow-inner'">
                {{ getRpeLabel(entry.rpe) }} ({{ entry.rpe }})
              </span>
            </div>
          </div>

          <div v-if="historicalData.length === 0" class="text-center py-10">
            <p class="text-sm text-muted-foreground">Nessuno storico disponibile per questo atleta.</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && athletesOverview.length === 0" class="text-center py-20 border-2 border-dashed rounded-xl">
      <Activity class="mx-auto h-12 w-12 text-muted-foreground/20 mb-4" />
      <p class="text-muted-foreground tracking-tight">Nessuna sessione completata rilevata nel sistema.</p>
    </div>
  </div>
</template>