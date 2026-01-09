<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { User, Loader2, Activity, X } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

// API
import { athleteApi } from '../../api/business'
import type { RpeLastSessionOverviewDto } from '../../types/api'

const { t } = useI18n()

// --------------------
// STATE
// --------------------
const athletesOverview = ref<RpeLastSessionOverviewDto[]>([])
const historicalData = ref<RpeLastSessionOverviewDto[]>([])

const loading = ref(false)
const loadingHistory = ref(false)

const focusedAthleteId = ref<number | null>(null)

// Pagination
const pageIndex = ref(0)
const pageSize = 10
const hasMoreHistory = ref(true)

// --------------------
// API CALLS
// --------------------
async function fetchOverview() {
  loading.value = true
  try {
    const res = await athleteApi.getLastSessionInfo()
    const data = res.data.value
    athletesOverview.value = Array.isArray(data) ? data : (data ? [data] : [])
  } catch {
    toast.error('Errore nel caricamento overview')
  } finally {
    loading.value = false
  }
}

async function fetchHistory(athleteId: number, reset = false) {
  if (loadingHistory.value) return
  if (!hasMoreHistory.value && !reset) return

  if (reset) {
    pageIndex.value = 0
    historicalData.value = []
    hasMoreHistory.value = true
  }

  loadingHistory.value = true

  try {
    const res = await athleteApi.getHistoricalAnalysis(
      athleteId,
      pageIndex.value,
      pageSize
    )

    const data = res.data.value ?? []

    if (data.length < pageSize) {
      hasMoreHistory.value = false
    }

    historicalData.value.push(...data)
    pageIndex.value++
  } catch {
    toast.error('Errore nel caricamento dello storico')
  } finally {
    loadingHistory.value = false
  }
}

// --------------------
// LOGIC
// --------------------
const focusedAthlete = computed(() =>
  athletesOverview.value.find(a => a.athleteId === focusedAthleteId.value) || null
)

function toggleFocus(id: number) {
  focusedAthleteId.value = id
  fetchHistory(id, true)
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
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

onMounted(fetchOverview)
</script>

<template>
  <div class="p-4 flex flex-col gap-6">
    <h1 class="text-2xl font-bold">RPE Dashboard</h1>

    <!-- LOADING OVERVIEW -->
    <div v-if="loading && athletesOverview.length === 0" class="flex justify-center py-20">
      <Loader2 class="h-10 w-10 animate-spin text-primary" />
    </div>

    <!-- OVERVIEW GRID -->
    <div v-if="!focusedAthleteId" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="athlete in athletesOverview" :key="athlete.athleteId"
        class="cursor-pointer hover:shadow-md transition" @click="toggleFocus(athlete.athleteId)">
        <CardHeader>
          <CardTitle class="flex justify-between items-center">
            <span class="flex items-center gap-2">
              <User class="w-5 h-5 text-primary" />
              {{ athlete.athleteName }}
            </span>
            <Badge variant="secondary" class="text-[10px]">
              Ultima sessione
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent class="space-y-2">
          <p class="text-sm italic text-muted-foreground">
            {{ athlete.sessionType }}
          </p>
          <p class="text-sm">Data: {{ formatDate(athlete.sessionDate) }}</p>
          <span :class="getRpeColor(athlete.rpe) + ' px-2 py-1 rounded text-xs font-bold border'">
            {{ getRpeLabel(athlete.rpe) }} ({{ athlete.rpe }})
          </span>
          <p class="text-xs italic text-muted-foreground line-clamp-1">
            Note: {{ athlete.notes || '-' }}
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- DETAIL + HISTORY -->
    <div v-if="focusedAthlete" class="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle class="flex justify-between items-center">
            <span class="flex items-center gap-2">
              <User class="w-6 h-6 text-primary" />
              {{ focusedAthlete.athleteName }}
            </span>
            <Button variant="ghost" size="sm" @click="focusedAthleteId = null">
              <X class="w-4 h-4 mr-2" /> Torna indietro
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent class="flex gap-6 flex-wrap">
          <div>
            <p class="text-xs uppercase text-muted-foreground">Sessione</p>
            <p class="font-bold">{{ focusedAthlete.sessionType }}</p>
          </div>
          <div>
            <p class="text-xs uppercase text-muted-foreground">Data</p>
            <p class="font-bold">{{ formatDate(focusedAthlete.sessionDate) }}</p>
          </div>
          <div>
            <p class="text-xs uppercase text-muted-foreground">RPE</p>
            <span :class="getRpeColor(focusedAthlete.rpe) + ' px-2 py-1 rounded text-xs font-bold'">
              {{ focusedAthlete.rpe }}
            </span>
          </div>
        </CardContent>
      </Card>

      <!-- HISTORY -->
      <div class="border rounded-xl p-4 bg-muted/5">
        <h3 class="font-bold mb-4 flex items-center gap-2">
          <Activity class="w-5 h-5 text-primary" />
          Storico Analisi RPE
        </h3>

        <div v-if="loadingHistory && historicalData.length === 0" class="flex justify-center py-10">
          <Loader2 class="h-8 w-8 animate-spin text-primary" />
        </div>

        <div class="space-y-2">
          <div v-for="entry in historicalData" :key="entry.sessionDate + entry.sessionType"
            class="flex justify-between items-center p-3 bg-card border rounded-lg">
            <div>
              <p class="font-bold text-primary">
                {{ formatDate(entry.sessionDate) }}
              </p>
              <p class="text-xs italic text-muted-foreground">
                {{ entry.sessionType }} – {{ entry.notes || '-' }}
              </p>
            </div>

            <span :class="getRpeColor(entry.rpe) + ' px-3 py-1 rounded-full text-xs font-bold border'">
              {{ entry.rpe }}
            </span>
          </div>
        </div>

        <!-- LOAD MORE -->
        <div v-if="hasMoreHistory" class="flex justify-center mt-6">
          <Button variant="outline" :disabled="loadingHistory" @click="fetchHistory(focusedAthleteId!)">
            <Loader2 v-if="loadingHistory" class="w-4 h-4 animate-spin mr-2" />
            Carica altri
          </Button>
        </div>

        <p v-if="!hasMoreHistory && historicalData.length === 0" class="text-center text-sm text-muted-foreground py-6">
          Nessuno storico disponibile
        </p>
      </div>
    </div>
  </div>
</template>
