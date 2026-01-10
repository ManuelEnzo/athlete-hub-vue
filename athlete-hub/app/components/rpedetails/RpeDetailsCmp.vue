<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { User, Loader2, Activity, X } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// UI
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

// API
import { athleteApi } from '../../api/business'
import type { RpeLastSessionOverviewDto, RpeHistoricalEntryDto } from '../../types/api'
import type { Pagination } from '../../types/api'

const { t } = useI18n()

// --- STATE ---
const athletesOverview = ref<RpeLastSessionOverviewDto[]>([])
const historicalPagination = ref<Pagination<RpeHistoricalEntryDto> | null>(null)

const loading = ref(false)
const loadingHistory = ref(false)

const focusedAthleteId = ref<number | null>(null)

const pageSize = 10

// --- API CALLS ---

async function fetchOverview() {
  loading.value = true
  try {
    const res = await athleteApi.getLastSessionInfo()
    const data = res.data.value
    athletesOverview.value = Array.isArray(data) ? data : data ? [data] : []
  } catch {
    toast.error('Errore nel caricamento overview')
  } finally {
    loading.value = false
  }
}

async function fetchHistory(athleteId: number, page = 1) {
  loadingHistory.value = true
  try {
    const res = await athleteApi.getHistoricalAnalysis(
      athleteId,
      page,
      pageSize
    )

    if (res.data.isSuccess) {
      historicalPagination.value = res.data.value
    }
  } catch {
    toast.error('Errore nel caricamento dello storico')
  } finally {
    loadingHistory.value = false
  }
}

// --- LOGIC ---

const focusedAthlete = computed(() =>
  athletesOverview.value.find(a => a.athleteId === focusedAthleteId.value) ?? null
)

function toggleFocus(id: number) {
  focusedAthleteId.value = id
  fetchHistory(id, 1)
}

function goBack() {
  focusedAthleteId.value = null
  historicalPagination.value = null
}

// --- UI HELPERS ---

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

    <!-- OVERVIEW -->
    <div v-if="!focusedAthleteId" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        v-for="athlete in athletesOverview"
        :key="athlete.athleteId"
        class="cursor-pointer hover:shadow-md"
        @click="toggleFocus(athlete.athleteId)"
      >
        <CardHeader>
          <CardTitle class="flex justify-between items-center">
            <span class="flex items-center gap-2">
              <User class="w-5 h-5 text-primary" /> {{ athlete.athleteName }}
            </span>
            <Badge variant="secondary">Ultima sessione</Badge>
          </CardTitle>
        </CardHeader>

        <CardContent class="space-y-2">
          <p class="text-sm italic">{{ athlete.sessionType }}</p>
          <p class="text-sm">Data: {{ formatDate(athlete.sessionDate) }}</p>
          <span :class="getRpeColor(athlete.rpe) + ' px-2 py-1 rounded text-xs font-bold border'">
            {{ getRpeLabel(athlete.rpe) }} ({{ athlete.rpe }})
          </span>
        </CardContent>
      </Card>
    </div>

    <!-- DETAIL -->
    <div v-if="focusedAthlete">
      <Card class="mb-6">
        <CardHeader>
          <CardTitle class="flex justify-between">
            <span class="flex gap-2 items-center">
              <User class="w-5 h-5" /> {{ focusedAthlete.athleteName }}
            </span>
            <Button variant="ghost" size="sm" @click="goBack">
              <X class="w-4 h-4 mr-1" /> Indietro
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      <!-- HISTORY -->
      <div class="border rounded-xl p-4">
        <h3 class="font-bold mb-4 flex gap-2 items-center">
          <Activity class="w-5 h-5" /> Storico RPE
        </h3>

        <div v-if="loadingHistory" class="flex justify-center py-10">
          <Loader2 class="animate-spin w-6 h-6" />
        </div>

        <div v-else>
          <div
            v-for="entry in historicalPagination?.items"
            :key="entry.sessionDate + entry.sessionType"
            class="flex justify-between items-center p-3 border rounded mb-2"
          >
            <div>
              <p class="font-bold text-sm">{{ formatDate(entry.sessionDate) }}</p>
              <p class="text-xs italic">{{ entry.notes || '-' }}</p>
            </div>

            <span :class="getRpeColor(entry.rpe) + ' px-3 py-1 rounded-full text-xs font-bold border'">
              {{ getRpeLabel(entry.rpe) }} ({{ entry.rpe }})
            </span>
          </div>

          <!-- PAGINATION -->
          <div
            v-if="historicalPagination && historicalPagination.totalPages > 1"
            class="flex justify-between items-center mt-4"
          >
            <Button
              size="sm"
              :disabled="!historicalPagination.hasPrevious"
              @click="fetchHistory(focusedAthleteId!, historicalPagination.currentPage - 1)"
            >
              Prev
            </Button>

            <span class="text-xs">
              Pagina {{ historicalPagination.currentPage }} /
              {{ historicalPagination.totalPages }}
            </span>

            <Button
              size="sm"
              :disabled="!historicalPagination.hasNext"
              @click="fetchHistory(focusedAthleteId!, historicalPagination.currentPage + 1)"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
