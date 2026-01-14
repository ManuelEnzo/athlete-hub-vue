<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { User2, Loader2, History, ChevronLeft } from 'lucide-vue-next'
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
    toast.error(t('rpe.errors.loadOverview'))
  } finally {
    loading.value = false
  }
}

async function fetchHistory(athleteId: number, page = 1) {
  loadingHistory.value = true
  try {
    const res = await athleteApi.getHistoricalAnalysis(athleteId, page, pageSize)
    if (res.data.isSuccess) {
      historicalPagination.value = res.data.value
    }
  } catch {
    toast.error(t('rpe.errors.loadHistory'))
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
  if (val === 0) return t('rpe.labels.none')
  if (val <= 2) return t('rpe.labels.light')
  if (val <= 4) return t('rpe.labels.moderate')
  if (val <= 6) return t('rpe.labels.challenging')
  if (val <= 8) return t('rpe.labels.hard')
  return t('rpe.labels.maximal')
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
    <h1 class="text-2xl font-bold">{{ t('rpe.dashboardTitle') }}</h1>

    <div v-if="!focusedAthleteId"
      class="flex flex-wrap gap-4 p-3 border rounded-lg text-[10px] uppercase tracking-wider">
      <div class="flex items-center gap-2">
        <span class="font-bold text-slate-300">{{ t('rpe.legendTitle') }}</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-2 h-2 rounded-full bg-green-500"></div> 0-2 {{ t('rpe.labels.light') }}
      </div>
      <div class="flex items-center gap-1">
        <div class="w-2 h-2 rounded-full bg-yellow-500"></div> 3-4 {{ t('rpe.labels.moderate') }}
      </div>
      <div class="flex items-center gap-1">
        <div class="w-2 h-2 rounded-full bg-orange-500"></div> 5-6 {{ t('rpe.labels.challenging') }}
      </div>
      <div class="flex items-center gap-1">
        <div class="w-2 h-2 rounded-full bg-red-500"></div> 7-8 {{ t('rpe.labels.hard') }}
      </div>
      <div class="flex items-center gap-1">
        <div class="w-2 h-2 rounded-full bg-red-900"></div> 9-10 {{ t('rpe.labels.maximal') }}
      </div>
    </div>

    <div v-if="!focusedAthleteId" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="athlete in athletesOverview" :key="athlete.athleteId" class="cursor-pointer hover:shadow-md"
        @click="toggleFocus(athlete.athleteId)">
        <CardHeader>
          <CardTitle class="flex justify-between items-center">
            <span class="flex items-center gap-2 text-primary">
              <User2 class="w-5 h-5" /> {{ athlete.athleteName }}
            </span>
            <Badge variant="secondary">{{ t('rpe.lastSession') }}</Badge>
          </CardTitle>
        </CardHeader>

        <CardContent class="space-y-4">
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{{ t('rpe.activityType') }}</p>
            <p class="text-sm italic">{{ athlete.sessionType }}</p>
          </div>

          <div class="flex justify-between items-end">
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{{ t('rpe.date') }}</p>
              <p class="text-sm">{{ formatDate(athlete.sessionDate) }}</p>
            </div>

            <div class="flex flex-col items-end gap-1">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{{ t('rpe.effort') }}</p>
              <div class="flex items-center gap-2 border px-2 py-1 rounded">
                <div :class="['w-2.5 h-2.5 rounded-full',
                  athlete.rpe <= 2 ? 'bg-green-500' :
                  athlete.rpe <= 4 ? 'bg-yellow-500' :
                  athlete.rpe <= 6 ? 'bg-orange-500' :
                  athlete.rpe <= 8 ? 'bg-red-500' : 'bg-red-900']">
                </div>
                <span class="text-xs font-bold">{{ athlete.rpe }}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div v-if="focusedAthlete">
      <Card class="mb-6">
        <CardHeader>
          <CardTitle class="flex justify-between">
            <span class="flex gap-2 items-center">
              <User2 class="w-5 h-5 text-primary" /> {{ focusedAthlete.athleteName }}
            </span>
            <Button variant="ghost" size="sm" @click="goBack">
              <ChevronLeft class="w-4 h-4 mr-1" /> {{ t('rpe.back') }}
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      <div class="border rounded-xl p-4">
        <h3 class="font-bold mb-4 flex gap-2 items-center">
          <History class="w-5 h-5" /> {{ t('rpe.historyTitle') }}
        </h3>

        <div v-if="loadingHistory" class="flex justify-center py-10">
          <Loader2 class="animate-spin w-6 h-6" />
        </div>

        <div v-else>
          <div v-for="entry in historicalPagination?.items" :key="entry.sessionDate + entry.sessionType"
            class="flex justify-between items-center p-3 border rounded mb-2">
            <div>
              <p class="font-bold text-sm">{{ formatDate(entry.sessionDate) }}</p>

              <p v-if="entry.nomeSessione" class="text-xs font-semibold text-slate-700">
                {{ entry.nomeSessione }}
              </p>

              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                {{ entry.sessionType }} 
                <span v-if="entry.targetRpe">| {{ t('rpe.target') }}: {{ entry.targetRpe }}</span>
                <span v-if="entry.rpeStatus"> | {{ entry.rpeStatus }}</span>
              </p>
              <p class="text-xs italic text-slate-500">{{ entry.notes || '-' }}</p>
            </div>

            <div class="flex items-center gap-2 border px-3 py-1.5 rounded">
              <div :class="['w-2.5 h-2.5 rounded-full',
                entry.rpe <= 2 ? 'bg-green-500' :
                entry.rpe <= 4 ? 'bg-yellow-500' :
                entry.rpe <= 6 ? 'bg-orange-500' :
                entry.rpe <= 8 ? 'bg-red-500' : 'bg-red-900']">
              </div>
              <span class="text-xs font-bold">{{ entry.rpe }}</span>
            </div>
          </div>

          <div v-if="historicalPagination && historicalPagination.totalPages > 1"
            class="flex justify-between items-center mt-4">
            <Button size="sm" variant="outline" :disabled="!historicalPagination.hasPrevious"
              @click="fetchHistory(focusedAthleteId!, historicalPagination.currentPage - 1)">
              {{ t('rpe.pagination.prev') }}
            </Button>
            <span class="text-xs font-medium">
              {{ t('rpe.pagination.pageInfo', { current: historicalPagination.currentPage, total: historicalPagination.totalPages }) }}
            </span>
            <Button size="sm" variant="outline" :disabled="!historicalPagination.hasNext"
              @click="fetchHistory(focusedAthleteId!, historicalPagination.currentPage + 1)">
              {{ t('rpe.pagination.next') }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>