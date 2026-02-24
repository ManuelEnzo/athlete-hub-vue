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

// --------------------
// STATE
// --------------------
const athletesOverview = ref<RpeLastSessionOverviewDto[]>([])
const historicalPagination = ref<Pagination<RpeHistoricalEntryDto> | null>(null)
const loading = ref(false)
const loadingHistory = ref(false)

const focusedAthleteId = ref<number | null>(null)
const selectedAthleteFilter = ref<number | null>(null)
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

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return String(dateStr)
  }
}

const hasOverview = computed(() => (athletesOverview.value && athletesOverview.value.length > 0))
const hasHistoryItems = computed(() => !!(historicalPagination.value && historicalPagination.value.items && historicalPagination.value.items.length > 0))
const canLoadMore = computed(() => !!(historicalPagination.value && historicalPagination.value.hasNext))

const filteredOverview = computed(() => {
  if (!selectedAthleteFilter.value) {
    return athletesOverview.value
  }
  return athletesOverview.value.filter(a => a.athleteId === selectedAthleteFilter.value)
})

const athleteFilterOptions = computed(() => [
  { id: null, name: t('common.all') || 'Tutti' },
  ...athletesOverview.value.map(a => ({ id: a.athleteId, name: a.athleteName }))
])

onMounted(fetchOverview)
</script>

<template>
  <div class="p-6 flex flex-col gap-6">
    <!-- HEADER -->
    <div>
      <h1 class="text-3xl font-black tracking-tight">{{ t('rpe.dashboardTitle') }}</h1>
      <p class="text-sm text-muted-foreground mt-2">{{ t('rpe.pageDescription') || 'Monitora i livelli di sforzo percepito (RPE) dei tuoi atleti' }}</p>
    </div>

    <!-- FILTER -->
    <div v-if="!focusedAthleteId" class="flex items-center gap-3">
      <label class="text-sm font-semibold text-muted-foreground">{{ t('calendar.form.selectAthlete') || 'Filtra atleta:' }}</label>
      <select v-model.number="selectedAthleteFilter" class="px-3 py-2 border rounded-lg bg-background text-sm font-medium">
        <option v-for="(opt, idx) in athleteFilterOptions" :key="String(opt.id ?? 'all') + idx" :value="opt.id">
          {{ opt.name }}
        </option>
      </select>
    </div>

    <!-- LEGEND -->
    <div v-if="!focusedAthleteId" class="bg-card/50 border rounded-xl p-4">
      <p class="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{{ t('rpe.legendTitle') }}</p>
      <div class="flex flex-wrap gap-4 text-[10px] uppercase tracking-wider">
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

    <!-- ATHLETES GRID -->
    <div v-if="!focusedAthleteId">
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="h-48 bg-muted/50 rounded-xl animate-pulse border"></div>
      </div>

      <div v-else-if="filteredOverview.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card v-for="athlete in filteredOverview" :key="athlete.athleteId" class="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
          @click="toggleFocus(athlete.athleteId)">
          <CardHeader class="pb-2">
            <CardTitle class="flex justify-between items-start gap-2">
              <span class="flex items-center gap-2 text-primary truncate">
                <User2 class="w-5 h-5 shrink-0" /> {{ athlete.athleteName }}
              </span>
              <Badge variant="secondary" class="shrink-0">{{ t('rpe.lastSession') }}</Badge>
            </CardTitle>
          </CardHeader>

          <CardContent class="space-y-4">
            <div>
              <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{{ t('rpe.activityType') }}</p>
              <p class="text-sm font-medium">{{ athlete.sessionType }}</p>
            </div>

            <div class="flex justify-between items-end gap-4">
              <div>
                <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{{ t('rpe.date') }}</p>
                <p class="text-sm">{{ formatDate(athlete.sessionDate) }}</p>
              </div>

              <div class="flex flex-col items-end gap-1">
                <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{{ t('rpe.effort') }}</p>
                <div class="flex items-center gap-2 border px-3 py-2 rounded-lg"
                  :class="getRpeColor(athlete.rpe)">
                  <div :class="['w-3 h-3 rounded-full',
                    athlete.rpe <= 2 ? 'bg-green-500' :
                    athlete.rpe <= 4 ? 'bg-yellow-500' :
                    athlete.rpe <= 6 ? 'bg-orange-500' :
                    athlete.rpe <= 8 ? 'bg-red-500' : 'bg-red-900']">
                  </div>
                  <span class="text-sm font-bold">{{ athlete.rpe }}/10</span>
                  <span class="text-[10px] font-semibold ml-1">{{ getRpeLabel(athlete.rpe) }}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div v-else class="flex flex-col items-center justify-center py-20 text-center">
        <User2 class="w-12 h-12 text-muted-foreground/20 mb-3" />
        <p class="text-lg font-bold text-muted-foreground mb-1">{{ t('common.noRecords') }}</p>
        <p class="text-xs text-muted-foreground/60">{{ t('rpe.noAthletes') || 'Nessun atleta con sessioni RPE recenti' }}</p>
      </div>
    </div>

    <!-- HISTORY VIEW -->
    <div v-if="focusedAthlete">
      <Card class="mb-6 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle class="flex justify-between items-center">
            <span class="flex gap-3 items-center">
              <User2 class="w-6 h-6 text-primary" />
              <span>{{ focusedAthlete.athleteName }}</span>
              <Badge variant="secondary" class="text-[10px]">{{ t('rpe.historyDetail') }}</Badge>
            </span>
            <Button variant="outline" size="sm" @click="goBack" class="gap-1">
              <ChevronLeft class="w-4 h-4" /> {{ t('rpe.back') }}
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card class="border rounded-xl">
        <CardHeader>
          <CardTitle class="flex gap-3 items-center text-lg">
            <History class="w-5 h-5 text-primary" /> {{ t('rpe.historyTitle') }}
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div v-if="loadingHistory" class="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 class="animate-spin w-6 h-6" />
            <p class="text-sm text-muted-foreground">{{ t('common.loading') || 'Caricamento...' }}</p>
          </div>

          <div v-else-if="hasHistoryItems" class="space-y-3">
            <div v-for="entry in historicalPagination?.items" :key="entry.sessionDate + entry.sessionType"
              class="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
              <div class="flex justify-between items-start gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <p class="font-bold text-sm">{{ formatDate(entry.sessionDate) }}</p>
                    <div :class="['w-2.5 h-2.5 rounded-full',
                      entry.rpe <= 2 ? 'bg-green-500' :
                      entry.rpe <= 4 ? 'bg-yellow-500' :
                      entry.rpe <= 6 ? 'bg-orange-500' :
                      entry.rpe <= 8 ? 'bg-red-500' : 'bg-red-900']">
                    </div>
                  </div>

                  <p v-if="entry.nomeSessione" class="text-xs font-semibold text-foreground mb-1">
                    📋 {{ entry.nomeSessione }}
                  </p>

                  <p class="text-[10px] text-muted-foreground font-semibold uppercase tracking-tight mb-1">
                    {{ entry.sessionType }}
                  </p>

                  <div class="text-[10px] space-y-0.5 text-muted-foreground">
                    <p v-if="entry.targetRpe">🎯 {{ t('rpe.target') }}: {{ entry.targetRpe }}/10</p>
                    <p v-if="entry.rpeStatus">📊 {{ entry.rpeStatus }}</p>
                    <p v-if="entry.notes" class="italic">💬 {{ entry.notes }}</p>
                  </div>
                </div>

                <div class="flex flex-col items-center gap-1 border px-3 py-2 rounded-lg"
                  :class="getRpeColor(entry.rpe)">
                  <span class="text-lg font-bold">{{ entry.rpe }}</span>
                  <span class="text-[9px] font-semibold text-center">{{ getRpeLabel(entry.rpe) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="flex flex-col items-center justify-center py-10 text-center">
            <History class="w-10 h-10 text-muted-foreground/20 mb-2" />
            <p class="text-muted-foreground text-sm">{{ t('rpe.noHistory') || 'Nessuna sessione storica disponibile' }}</p>
          </div>
        </CardContent>

        <!-- PAGINATION -->
        <div v-if="historicalPagination && historicalPagination.totalPages > 1" class="border-t p-4 bg-muted/10">
          <div class="flex justify-between items-center gap-4">
            <Button size="sm" variant="outline" :disabled="!historicalPagination.hasPrevious"
              @click="fetchHistory(focusedAthleteId!, historicalPagination.currentPage - 1)">
              ← {{ t('common.prev') }}
            </Button>
            <span class="text-xs font-medium text-muted-foreground">
              {{ t('rpe.pagination.pageInfo', { current: historicalPagination.currentPage, total: historicalPagination.totalPages }) }}
            </span>
            <Button size="sm" variant="outline" :disabled="!historicalPagination.hasNext"
              @click="fetchHistory(focusedAthleteId!, historicalPagination.currentPage + 1)">
              {{ t('common.next') }} →
            </Button>
          </div>
        </div>

        <!-- LOAD MORE -->
        <div v-if="canLoadMore && historicalPagination" class="border-t p-4 text-center">
          <Button variant="outline" :disabled="loadingHistory" @click="fetchHistory(focusedAthleteId!)" class="w-full sm:w-auto">
            <Loader2 v-if="loadingHistory" class="w-4 h-4 animate-spin mr-2" />
            {{ t('common.loadMore') || 'Carica altre sessioni' }}
          </Button>
        </div>
      </Card>
    </div>
  </div>
</template>
