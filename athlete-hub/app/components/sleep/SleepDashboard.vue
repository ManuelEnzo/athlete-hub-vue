<script setup lang="ts">
import type { SleepResponseDto } from '@/types/api'
import { SleepDataSource } from '@/types/api'
import { CalendarDays, Loader2 } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import notifications from '@/lib/notificationService'
import { useSleepService } from '~/services/dataService'
import SleepDistributionChart from './SleepDistributionChart.vue'
import SleepHistoryList from './SleepHistoryList.vue'
import SleepKpiCards from './SleepKpiCards.vue'
import SleepQuestionnaireDetail from './SleepQuestionnaireDetail.vue'
import SleepTimeline from './SleepTimeline.vue'
import SleepTrendChart from './SleepTrendChart.vue'

const props = defineProps<{
  athleteId: number | null
}>()

const { t } = useI18n()
const sleepSvc = useSleepService()

// ------------------------------------------------------------------ state
const history = computed(() => sleepSvc.history.value)
const selectedEntry = computed(() => sleepSvc.selected.value)
const loading = computed(() => sleepSvc.loading.value)
const loadingDetail = computed(() => sleepSvc.loadingDetail.value)
const isDeviceSelected = computed(() => selectedEntry.value?.source === SleepDataSource.Device)
const hasDeviceHistory = computed(() => history.value.some(e => e.source === SleepDataSource.Device))

const selectedDate = ref<string | null>(null)

// Default range: last 30 days
function defaultFrom(): string {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().split('T')[0]!
}
function defaultTo(): string {
  return new Date().toISOString().split('T')[0]!
}

const filterFrom = ref(defaultFrom())
const filterTo = ref(defaultTo())

// ------------------------------------------------------------------ fetch
async function loadHistory() {
  if (!props.athleteId) return
  try {
    const items = await sleepSvc.fetchHistory(props.athleteId, filterFrom.value, filterTo.value)
    // Auto-select most recent entry
    if (items && items.length > 0) {
      const latest = [...items].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )[0]
      if (latest) selectDay(latest.date)
    }
  }
  catch {
    notifications.error(t('sleep.errors.loadHistory'))
  }
}

async function selectDay(date: string) {
  if (!props.athleteId) return
  selectedDate.value = date

  // Immediately show cached entry for instant feedback (KPIs, quality)
  const cached = history.value.find(e => e.date === date) ?? null
  sleepSvc.setSelected(cached)

  // Fetch full detail (segments) only if missing — always needed for timeline
  if (!cached?.segments?.length) {
    // Pass only the date portion (YYYY-MM-DD) to avoid URL path encoding issues
    const dateOnly = date.split('T')[0]!
    try {
      await sleepSvc.fetchDay(props.athleteId, dateOnly)
    }
    catch {
      // Keep the cached entry visible; segments simply won't show
      notifications.error(t('sleep.errors.loadDetail'))
    }
  }
}

function applyFilters() {
  loadHistory()
}

watch(() => props.athleteId, (id) => {
  if (id) {
    filterFrom.value = defaultFrom()
    filterTo.value = defaultTo()
    selectedDate.value = null
    loadHistory()
  }
})

onMounted(() => {
  if (props.athleteId) loadHistory()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Filter bar -->
    <div class="flex flex-wrap items-end gap-3 bg-muted/40 border rounded-xl px-4 py-3">
      <div class="flex flex-col gap-1 min-w-[140px]">
        <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {{ t('sleep.filter.from') }}
        </Label>
        <Input v-model="filterFrom" type="date" class="h-9 text-sm font-medium" />
      </div>
      <div class="flex flex-col gap-1 min-w-[140px]">
        <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {{ t('sleep.filter.to') }}
        </Label>
        <Input v-model="filterTo" type="date" class="h-9 text-sm font-medium" />
      </div>
      <Button
        class="h-9 gap-2 font-bold uppercase text-[11px] tracking-wider"
        :disabled="loading || !athleteId"
        @click="applyFilters"
      >
        <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
        <CalendarDays v-else class="h-4 w-4" />
        {{ t('sleep.filter.apply') }}
      </Button>
    </div>

    <!-- KPI row (shows selected day or latest) -->
    <div v-if="loading">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton v-for="n in 4" :key="n" class="h-28 rounded-2xl" />
      </div>
    </div>
    <SleepKpiCards v-else :entry="selectedEntry ?? (history[0] ?? null)" />

    <!-- Charts row -->
    <div class="grid gap-6" :class="hasDeviceHistory ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'">
      <SleepTrendChart
        :history="history"
        :selected-date="selectedDate"
        :loading="loading"
        @select-date="selectDay"
      />
      <SleepDistributionChart
        v-if="hasDeviceHistory"
        :history="history"
        :loading="loading"
      />
    </div>

    <!-- Bottom row: history list + timeline detail -->
    <div class="grid grid-cols-1 xl:grid-cols-5 gap-6">
      <!-- List: 2/5 -->
      <div class="xl:col-span-2">
        <SleepHistoryList
          :history="history"
          :selected-date="selectedDate"
          :loading="loading"
          @select="selectDay"
        />
      </div>

      <!-- Right panel: Device → timeline, Questionnaire/Mixed → quality+notes -->
      <div class="xl:col-span-3">
        <SleepTimeline
          v-if="isDeviceSelected || !selectedEntry"
          :entry="selectedEntry"
          :loading="loadingDetail"
        />
        <SleepQuestionnaireDetail
          v-else
          :entry="selectedEntry"
        />
      </div>
    </div>
  </div>
</template>
