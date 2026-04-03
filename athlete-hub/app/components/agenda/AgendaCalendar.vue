<script setup lang="ts">
import type { EventStyle } from '../../constants/eventConfig'
import type {
  AthleteEntryDto,
  AthleteResponse,
  CalendarEventCreateRequest,
  CalendarEventResponse,
  TestEntryGridDto,
  TestResultSaveDto,
} from '@/types/api'
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Info,
  Loader2,
  Plus,
  Save,
  X,
} from 'lucide-vue-next'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
// UI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useErrorHandler } from '~/composables/useErrorHandler'
import useToast from '~/composables/useToast'
import { athleteApi } from '../../api/business'
// Config & Types
import { EVENT_CONFIG, EVENT_TYPES } from '../../constants/eventConfig'
import EventCard from './EventCard.vue'

const timeUtils = {
  toMinutes: (hms: string | null | undefined): number | null => {
    if (!hms)
      return null
    const parts = hms.split(':')
    if (parts.length < 2)
      return null
    const hours = Number.parseInt(parts[0] || '0', 10)
    const minutes = Number.parseInt(parts[1] || '0', 10)
    return (hours * 60) + minutes
  },
  toHMS: (minutes: number | null | undefined): string | null => {
    if (minutes === null || minutes === undefined)
      return null
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
  },
  getTodayStr: () => new Date().toISOString().split('T')[0] ?? '',
}

interface CalendarDay {
  day: number | null
  date: string
  isCurrentMonth: boolean
  isToday: boolean
}

// --- STATE ---
const { t, tm } = useI18n()
const notifications = useToast()
const handler = useErrorHandler({ component: 'AgendaCalendar' })
const events = ref<CalendarEventResponse[]>([])
const athletes = ref<AthleteResponse[]>([])
const testDefinitions = ref<any[]>([])
const isLoading = ref(false)

// Modals State
const isAddDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isTestGridOpen = ref(false)
const isDeleting = ref(false)
const eventToDeleteId = ref<number | null>(null)
const isEditing = ref(false)
const editingEventId = ref<number | null>(null)
const titleInputRef = ref<HTMLInputElement | null>(null)

// Test Grid
const selectedGridData = ref<TestEntryGridDto | null>(null)
const resultsMap = reactive<Record<number, Record<number, string>>>({})

// Date Management
const dateNow = new Date()
const currentMonth = ref(dateNow.getMonth())
const currentYear = ref(dateNow.getFullYear())
const selectedDate = ref<string>(timeUtils.getTodayStr())

const newEvent = reactive({
  athleteIds: [] as number[],
  title: '',
  date: timeUtils.getTodayStr(),
  time: '09:00',
  type: 'Strength',
  testDefinitionId: null as number | null,
  targetRpe: null as number | null,
  hasResults: false,
  duration: null as number | null,
  isCompleted: false,
})

const isLocked = computed(() => isEditing.value && (newEvent.hasResults || newEvent.isCompleted))

const formattedSelectedDate = computed(() => {
  if (!selectedDate.value)
    return t('common.notSpecified')
  try {
    return new Date(selectedDate.value).toLocaleDateString()
  }
  catch {
    return selectedDate.value
  }
})

// --- LOGICA STILI ---
function getEventStyle(type: string | undefined): EventStyle {
  return EVENT_CONFIG[type || ''] || {
    color: 'gray',
    border: 'border-gray-500',
    bg: 'bg-gray-500/10',
    dot: 'bg-gray-500',
  }
}

// --- FORM STATE ---
const isFormValid = computed(() => {
  // Titolo obbligatorio
  if (!newEvent.title.trim())
    return false

  // Almeno un atleta
  if (!newEvent.athleteIds.length)
    return false

  // Data e ora
  if (!newEvent.date)
    return false
  if (!newEvent.time)
    return false

  // Durata obbligatoria e > 0
  if (!newEvent.duration || newEvent.duration <= 0)
    return false

  // Categoria obbligatoria
  if (!newEvent.type)
    return false

  // Se NON è Recovery/Checkup serve RPE
  if (!['Recovery', 'Checkup'].includes(newEvent.type)) {
    if (newEvent.targetRpe == null)
      return false
  }

  // Se è Test serve protocollo
  if (newEvent.type === 'Test' && !newEvent.testDefinitionId) {
    return false
  }

  return true
})

// Reset automatico campi basato sul tipo
watch(() => newEvent.type, (newType) => {
  if (['Recovery', 'Checkup'].includes(newType)) {
    newEvent.targetRpe = null
    newEvent.isCompleted = false
    newEvent.testDefinitionId = null
  }
})

// --- CALENDAR LOGIC ---
function changeMonth(delta: number) {
  const newDate = new Date(currentYear.value, currentMonth.value + delta, 1)
  currentMonth.value = newDate.getMonth()
  currentYear.value = newDate.getFullYear()
}

const getMonthDetails = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const paddingDaysCount = (firstDay + 6) % 7
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()

  const days: CalendarDay[] = []

  for (let i = 0; i < paddingDaysCount; i++) {
    days.push({ day: null, date: '', isCurrentMonth: false, isToday: false })
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const fullDate = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    days.push({
      day: i,
      date: fullDate,
      isCurrentMonth: true,
      isToday: fullDate === timeUtils.getTodayStr(),
    })
  }
  return { days, monthName: `${t(`calendar.months.${currentMonth.value}`)} ${currentYear.value}` }
})

// --- PERFORMANCE: indexed events by date to avoid repeated filters in template ---
const eventsByDate = computed(() => {
  const map: Record<string, CalendarEventResponse[]> = {}
  for (const ev of events.value || []) {
    const d = (ev.date || '').slice(0, 10)
    if (!d)
      continue
    if (!map[d])
      map[d] = []
    map[d].push(ev)
  }
  // sort events for predictable rendering
  Object.keys(map).forEach((k) => {
    if (map[k])
      map[k].sort((a, b) => (a.date || '').localeCompare(b.date || ''))
  })
  return map
})

const eventsForSelectedDate = computed(() => eventsByDate.value[selectedDate.value] || [])

const eventsThisMonthCount = computed(() => {
  const monthPrefix = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}`
  let count = 0
  for (const k of Object.keys(eventsByDate.value)) {
    if (k.startsWith(monthPrefix))
      count += eventsByDate.value[k]?.length || 0
  }
  return count
})

// --- API ACTIONS ---
async function fetchEvents() {
  isLoading.value = true
  try {
    const res = await athleteApi.getAllEvents(currentMonth.value + 1, currentYear.value)
    events.value = res.data.value ?? []
  }
  catch (err) {
    handler.handleError(err instanceof Error ? err : new Error(t('calendar.errors.fetchEvents')))
  }
  finally {
    isLoading.value = false
  }
}

watch([currentMonth, currentYear], fetchEvents)

// --- DIALOG HANDLERS ---
function openAddDialog() {
  isEditing.value = false
  editingEventId.value = null
  Object.assign(newEvent, {
    athleteIds: [],
    title: '',
    date: selectedDate.value,
    time: '09:00',
    type: 'Strength',
    testDefinitionId: null,
    targetRpe: null,
    hasResults: false,
    duration: null,
    isCompleted: false,
  })
  isAddDialogOpen.value = true
  nextTick(() => titleInputRef.value?.focus())
}

function openEditDialog(id: number) {
  const event = events.value.find(e => e.id === id)
  if (!event)
    return

  isEditing.value = true
  editingEventId.value = event.id

  const [d, t_raw] = (event.date || '').split('T')
  const rawEvent = event as any

  Object.assign(newEvent, {
    athleteIds: rawEvent.participantIds ? rawEvent.participantIds.map(Number) : (event.athleteId ? [event.athleteId] : []),
    title: event.title,
    date: d || timeUtils.getTodayStr(),
    time: t_raw?.substring(0, 5) || '09:00',
    type: event.type,
    testDefinitionId: rawEvent.testDefinitionId || null,
    targetRpe: event.targetRPE || null,
    hasResults: !!rawEvent.hasResults,
    duration: timeUtils.toMinutes(event.duration),
    isCompleted: event.isCompleted,
  })
  isAddDialogOpen.value = true
  nextTick(() => titleInputRef.value?.focus())
}

function openDeleteDialog(id: number) {
  const event = events.value.find(e => e.id === id)
  if ((event as any)?.hasResults) {
    return notifications.error(t('calendar.deleteLocked'), '')
  }
  eventToDeleteId.value = id
  isDeleteDialogOpen.value = true
}

async function confirmDelete() {
  if (!eventToDeleteId.value)
    return
  isDeleting.value = true
  try {
    await athleteApi.deleteEvent(eventToDeleteId.value)
    notifications.success('', t('calendar.toast.deleted'))
    await fetchEvents()
    isDeleteDialogOpen.value = false
  }
  catch {
    handler.handleError(new Error(t('calendar.errors.deleteEvent')))
  }
  finally {
    isDeleting.value = false
    eventToDeleteId.value = null
  }
}

// --- HELPERS TEMPLATE ---
function toggleAthlete(id: number) {
  const index = newEvent.athleteIds.indexOf(id)
  if (index === -1)
    newEvent.athleteIds.push(id)
  else newEvent.athleteIds.splice(index, 1)
}

function updateValue(athleteId: number, metricId: number, val: string) {
  if (!resultsMap[athleteId])
    resultsMap[athleteId] = {}
  resultsMap[athleteId][metricId] = val
}

function getPlaceholder(type: number | undefined) {
  if (type === 1)
    return t('calendar.placeholders.timeFormat')
  if (type === 2)
    return t('calendar.placeholders.level')
  return t('calendar.placeholders.empty')
}

// --- SAVE ACTIONS ---
async function handleSaveEvent() {
  if (!newEvent.athleteIds.length || !newEvent.title.trim()) {
    notifications.error(t('calendar.validation.validationError'), '')
    // focus title to speed up correction
    nextTick(() => titleInputRef.value?.focus())
    return
  }

  isLoading.value = true
  try {
    const payload: CalendarEventCreateRequest = {
      title: newEvent.title,
      athleteIds: newEvent.athleteIds,
      date: `${newEvent.date}T${newEvent.time}:00`,
      type: newEvent.type,
      targetRPE: newEvent.targetRpe ?? undefined,
      testDefinitionId: newEvent.type === 'Test' ? (newEvent.testDefinitionId ?? undefined) : undefined,
      duration: timeUtils.toHMS(newEvent.duration) ?? null,
      isCompleted: newEvent.isCompleted,
    }

    if (isEditing.value && editingEventId.value) {
      await athleteApi.updateEvent(editingEventId.value, payload)
      notifications.success('', t('calendar.toast.updated'))
    }
    else {
      await athleteApi.createEvent(payload)
      notifications.success('', t('calendar.toast.created'))
    }

    await fetchEvents()
    isAddDialogOpen.value = false
  }
  catch {
    handler.handleError(new Error(t('calendar.errors.saveEvent')))
  }
  finally {
    isLoading.value = false
  }
}

// --- TEST GRID LOGIC ---
async function openTestGrid(eventId: number) {
  try {
    const res = await athleteApi.getTestGrid(eventId)
    const grid = res.data.value as TestEntryGridDto | null
    if (!grid)
      return

    Object.keys(resultsMap).forEach(key => delete resultsMap[Number(key)])

    selectedGridData.value = grid
    grid.athletes.forEach((athlete: AthleteEntryDto) => {
      // Inizializziamo l'oggetto per l'atleta specifico
      resultsMap[athlete.id] = {}

      if (athlete.tempResults) {
        Object.entries(athlete.tempResults).forEach(([mId, val]) => {
          const athleteMap = resultsMap[athlete.id]
          if (athleteMap)
            athleteMap[Number(mId)] = String(val).replace('.', ',')
        })
      }
    })
    isTestGridOpen.value = true
  }
  catch {
    notifications.error(t('calendar.errors.loadGrid'))
  }
}

async function saveTestResults() {
  if (!selectedGridData.value)
    return

  const currentGrid = selectedGridData.value
  const validMetricIds = new Set(currentGrid.metrics.map(m => m.id))
  const resultsToSave: TestResultSaveDto[] = []

  Object.entries(resultsMap).forEach(([athId, metrics]) => {
    Object.entries(metrics).forEach(([mId, val]) => {
      const metricId = Number(mId)
      const parsedVal = Number.parseFloat(String(val).replace(',', '.'))
      if (validMetricIds.has(metricId) && !Number.isNaN(parsedVal)) {
        resultsToSave.push({ athleteId: Number(athId), testMetricId: metricId, value: parsedVal })
      }
    })
  })

  if (!resultsToSave.length)
    return notifications.error(t('calendar.validation.noResults'))

  isLoading.value = true
  try {
    await athleteApi.saveTestResults(currentGrid.eventId, resultsToSave)
    notifications.success(t('calendar.toast.resultsSaved'))
    await fetchEvents()
    isTestGridOpen.value = false
  }
  catch {
    notifications.error(t('calendar.errors.saveResults'))
  }
  finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  fetchEvents()
  const [athRes, testRes] = await Promise.all([
    athleteApi.getAll(),
    athleteApi.getTestDefinitions(),
  ])
  athletes.value = athRes.data.value ?? []
  testDefinitions.value = testRes.data.value ?? []
})
</script>

<template>
  <div class="w-full flex flex-col gap-4 md:gap-6 p-2 md:p-4">
    <div class="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
      <Card class="col-span-1 lg:col-span-2 shadow-sm border-none bg-card/50 backdrop-blur">
        <CardHeader
          class="flex flex-col md:flex-row md:items-center md:justify-between px-3 md:px-6 py-3 md:py-4 gap-2 md:gap-0"
        >
          <CardTitle class="flex items-center gap-2 font-bold text-lg md:text-xl">
            <CalendarIcon class="h-4 w-4 md:h-5 md:w-5 text-primary" /> {{ getMonthDetails.monthName }}
          </CardTitle>

          <div class="hidden md:flex items-center gap-3 mr-4">
            <div class="text-sm text-muted-foreground">
              {{ eventsThisMonthCount }} {{ t('calendar.kpi.events') }}
            </div>
          </div>

          <div class="flex gap-1 md:gap-2 flex-wrap items-center">
            <!-- Pulsantino info migliorato -->
            <div class="relative group">
              <button
                type="button" :aria-label="t('calendar.info')"
                class="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md border border-purple-400 hover:bg-purple-700 transition-all"
              >
                <Info class="h-4 w-4" />
              </button>
              <div
                class="absolute left-1/2 -translate-x-1/2 -top-20 w-64 bg-background text-sm text-foreground p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 border border-purple-400 pointer-events-none"
              >
                {{ t('calendar.infoTooltip') }}
              </div>
            </div>

            <Button :aria-label="t('calendar.previousMonth')" variant="outline" size="icon" class="h-8 w-8 md:h-10 md:w-10" @click="changeMonth(-1)">
              <ChevronLeft class="h-4 w-4" />
            </Button>
            <Button :aria-label="t('calendar.nextMonth')" variant="outline" size="icon" class="h-8 w-8 md:h-10 md:w-10" @click="changeMonth(1)">
              <ChevronRight class="h-4 w-4" />
            </Button>
            <Button :aria-label="t('calendar.addEvent')" class="text-xs md:text-sm h-8 md:h-10 px-2 md:px-4 bg-primary text-primary-foreground hover:bg-primary/95" @click="openAddDialog">
              <Plus class="mr-1 h-3 w-3 md:h-4 md:w-4" aria-hidden="true" />
              <span class="hidden sm:inline">{{ t('calendar.addEvent') }}</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent class="px-2 md:px-4">
          <template v-if="isLoading">
            <div class="grid grid-cols-7 gap-1 md:gap-2">
              <div v-for="i in 28" :key="i" class="h-20 md:h-24 p-1.5 md:p-2 bg-muted/30 rounded-lg animate-pulse" />
            </div>
          </template>
          <template v-else>
            <div
              class="grid grid-cols-7 text-center text-[8px] md:text-[10px] font-black uppercase text-muted-foreground mb-3 md:mb-4 opacity-50"
            >
              <span v-for="d in (tm('calendar.days') as string[])" :key="d">{{ d }}</span>
            </div>
            <div class="grid grid-cols-7 gap-1 md:gap-2">
              <div
                v-for="(day, i) in getMonthDetails.days" :key="i"
                class="h-20 md:h-24 p-1.5 md:p-2 border rounded-lg md:rounded-xl cursor-pointer transition-all hover:bg-accent/50 group"
                :class="{
                  'opacity-20 pointer-events-none bg-muted': !day.isCurrentMonth,
                  'border-primary ring-2 ring-primary/20 bg-primary/5': day.date === selectedDate,
                  'border-primary/50': day.isToday,
                }" @click="day.date && (selectedDate = day.date)"
              >
                <span v-if="day.day" class="text-[10px] md:text-xs font-bold" :class="{ 'text-primary': day.isToday }">{{
                  day.day
                }}</span>
                <div v-if="day.isCurrentMonth" class="flex flex-wrap gap-1 mt-1">
                  <div v-for="e in eventsByDate[day.date] || []" :key="e.id" class="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shadow-sm" :class="getEventStyle(e.type).dot" />
                </div>
              </div>
            </div>
          </template>
        </CardContent>
      </Card>

      <Card class="col-span-1 flex flex-col shadow-sm border-none bg-card/50 backdrop-blur">
        <CardHeader class="px-3 md:px-6 py-3 md:py-4">
          <CardTitle class="text-base md:text-lg font-bold uppercase tracking-tight">
            {{ t('calendar.agendaTitle') }}
          </CardTitle>
          <CardDescription>{{ formattedSelectedDate }}</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3 md:space-y-4 overflow-y-auto max-h-[400px] md:max-h-[600px] px-3 md:px-4">
          <div v-if="eventsForSelectedDate.length === 0" class="py-12 md:py-20 text-center text-muted-foreground italic text-xs md:text-sm">
            {{ t('calendar.noEvents') }}
          </div>

          <EventCard
            v-for="event in eventsForSelectedDate"
            :key="event.id"
            :event="event"
            @open-test="(id) => openTestGrid(id)"
            @edit="(id) => openEditDialog(id)"
            @delete="(id) => openDeleteDialog(id)"
          />
        </CardContent>
      </Card>
    </div>

    <div
      v-if="isAddDialogOpen"
      class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4"
    >
      <Card class="w-full max-w-sm md:max-w-md shadow-2xl border-none">
        <CardHeader class="py-3 px-4 md:px-5">
          <CardTitle class="text-base md:text-xl font-black uppercase">
            {{ isEditing ? t('calendar.editSession') : t('calendar.newSession') }}
          </CardTitle>
        </CardHeader>

        <CardContent class="space-y-3 max-h-[85vh] overflow-y-auto pr-2 px-4 md:px-5">
          <!-- ALERT RISULTATI -->
          <div
            v-if="isEditing && newEvent.hasResults"
            class="bg-amber-50 border border-amber-200 p-2 rounded-lg flex items-start gap-2"
          >
            <AlertCircle class="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p class="text-[11px] text-amber-800 leading-tight">
              <b>{{ t('calendar.blocked') }}</b><br>
              {{ t('calendar.resultPresent') }}
            </p>
          </div>

          <!-- ALERT COMPLETATO -->
          <div
            v-if="isEditing && newEvent.isCompleted"
            class="bg-green-50 border border-green-200 p-2 rounded-lg flex items-start gap-2"
          >
            <Check class="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
            <p class="text-[11px] text-green-800 leading-tight">
              <b>{{ t('calendar.form.completedTitle') }}</b><br>
              {{ t('calendar.form.titleOnlyModify') }}
            </p>
          </div>

          <!-- TITLE -->
          <div>
            <label for="calendar-title" class="text-[10px] font-black uppercase text-muted-foreground mb-1 block">
              {{ t('calendar.form.titleLabel') }}
            </label>
            <Input id="calendar-title" ref="titleInputRef" v-model="newEvent.title" class="h-9 text-sm" />
          </div>

          <!-- DATE + TIME -->
          <div class="flex gap-3">
            <div class="flex-1">
              <label class="text-[10px] font-black uppercase text-muted-foreground mb-1 block">
                {{ t('calendar.form.dateLabel') }}
              </label>
              <Input v-model="newEvent.date" type="date" :disabled="isLocked" class="h-9" />
            </div>

            <div class="w-32">
              <label class="text-[10px] font-black uppercase text-muted-foreground mb-1 block">
                {{ t('calendar.form.timeLabel') }}
              </label>
              <Input v-model="newEvent.time" type="time" :disabled="isLocked" class="h-9" />
            </div>
          </div>

          <!-- DURATION -->
          <div>
            <div class="flex justify-between mb-1">
              <label class="text-[10px] font-black uppercase text-muted-foreground">
                {{ t('calendar.form.duration') }}
              </label>
              <span class="text-sm font-bold text-primary">
                {{ newEvent.duration ?? '--' }} min
              </span>
            </div>

            <input
              v-model.number="newEvent.duration" type="range" min="0" max="240" step="5" :disabled="isLocked"
              class="w-full accent-primary"
            >
          </div>

          <!-- ATHLETES -->
          <div>
            <label class="text-[10px] font-black uppercase text-muted-foreground mb-2 block">
              {{ t('calendar.form.selectAthlete') }}
            </label>
            <div class="grid gap-1 border rounded-lg p-2 bg-muted/20 max-h-40 overflow-y-auto">
              <div
                v-for="ath in athletes" :key="ath.id" class="flex items-center gap-3 p-2 rounded-md hover:bg-background cursor-pointer"
                @click="!isLocked && toggleAthlete(ath.id)"
              >
                <div
                  class="h-4 w-4 border-2 rounded flex items-center justify-center" :class="newEvent.athleteIds.includes(ath.id)
                    ? 'bg-primary border-primary'
                    : 'border-muted-foreground/30'"
                >
                  <Check v-if="newEvent.athleteIds.includes(ath.id)" class="h-3 w-3 text-white" />
                </div>

                <span class="text-xs font-medium">
                  {{ ath.fullName }}
                </span>
              </div>
            </div>
          </div>

          <!-- CATEGORY + RPE -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black uppercase text-muted-foreground mb-1 block">
                {{ t('calendar.form.categoryLabel') }}
              </label>

              <select
                v-model="newEvent.type" :disabled="isLocked"
                class="w-full border rounded-md p-2 text-sm bg-background"
              >
                <option v-for="type in EVENT_TYPES" :key="type" :value="type">
                  {{ t(`eventTypes.${type}`) }}
                </option>
              </select>
            </div>

            <div v-if="!['Recovery', 'Checkup'].includes(newEvent.type)">
              <label class="text-[10px] font-black uppercase text-primary mb-1 block">
                {{ t('calendar.form.targetRPE') }}
              </label>
              <Input
                v-model.number="newEvent.targetRpe" type="number" min="1" max="10" :disabled="isLocked"
                class="h-9 font-bold text-primary"
              />
            </div>
          </div>

          <!-- TEST PROTOCOL -->
          <div v-if="newEvent.type === 'Test'" class="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <label class="text-[10px] font-black uppercase text-purple-600 mb-1 block">
              {{ t('calendar.form.protocolLabel') }}
            </label>
            <select
              v-model="newEvent.testDefinitionId" :disabled="isLocked"
              class="w-full border rounded-md p-2 text-sm"
            >
              <option :value="null">
                {{ t('calendar.form.protocolSelect') }}
              </option>
              <option v-for="td in testDefinitions" :key="td.id" :value="td.id">
                {{ td.name }}
              </option>
            </select>
          </div>
          <div
            v-if="isEditing && !['Test', 'Recovery', 'Checkup'].includes(newEvent.type)"
            class="p-3 rounded-xl border transition-all"
            :class="newEvent.isCompleted ? 'bg-green-500/10 border-green-500/30' : 'bg-muted/30 border-transparent'"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="h-8 w-8 rounded-full flex items-center justify-center"
                  :class="newEvent.isCompleted ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'"
                >
                  <Check class="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <p class="text-[10px] md:text-xs font-bold uppercase tracking-tight">
                    {{
                      t('calendar.form.completedTitle') }}
                  </p>
                  <p class="text-[8px] md:text-[9px] text-muted-foreground leading-tight">
                    {{
                      t('calendar.form.completedInfo') }}
                  </p>
                </div>
              </div>
              <button
                type="button" class="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors bg-muted"
                :class="{ 'bg-green-600': newEvent.isCompleted, 'cursor-not-allowed': newEvent.isCompleted }"
                :disabled="newEvent.isCompleted"
                @click="newEvent.isCompleted = !newEvent.isCompleted"
              >
                <span
                  class="pointer-events-none inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white shadow transition"
                  :class="{ 'translate-x-5': newEvent.isCompleted, 'translate-x-0': !newEvent.isCompleted }"
                />
              </button>
            </div>
          </div>
        </CardContent>

        <CardFooter class="flex justify-end gap-2 border-t p-4">
          <Button variant="ghost" @click="isAddDialogOpen = false">
            {{ t('common.cancel') }}
          </Button>

          <Button :disabled="isLoading || !isFormValid" @click="handleSaveEvent">
            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ isEditing ? t('common.update') : t('common.create') }}
          </Button>
        </CardFooter>
      </Card>
    </div>

    <div
      v-if="isTestGridOpen"
      class="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center p-2 md:p-4"
    >
      <Card class="w-full max-w-sm md:max-w-5xl shadow-2xl border-none max-h-[95vh] md:max-h-[90vh] flex flex-col">
        <CardHeader class="flex flex-row items-center justify-between border-b pb-3 md:pb-4 px-3 md:px-6 py-3 md:py-4">
          <CardTitle class="text-base md:text-xl font-black uppercase flex items-center gap-2">
            <ClipboardList class="h-4 w-4 md:h-5 md:w-5 text-purple-500" /> <span class="truncate">{{
              selectedGridData?.testName }}</span>
          </CardTitle>
          <Button aria-label="{{ t('common.close') }}" variant="ghost" size="icon" @click="isTestGridOpen = false">
            <X class="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
          </Button>
        </CardHeader>
        <CardContent class="p-0 overflow-auto flex-1">
          <!-- Desktop Table View -->
          <table class="w-full border-collapse hidden md:table">
            <thead class="bg-muted/50 sticky top-0 z-10">
              <tr>
                <th
                  class="p-3 md:p-4 text-left text-[9px] md:text-[10px] font-black uppercase text-muted-foreground border-b w-48 md:w-64"
                >
                  {{
                    t('calendar.grid.athlete') }}
                </th>
                <th
                  v-for="metric in selectedGridData?.metrics" :key="metric.id"
                  class="p-3 md:p-4 text-center border-b min-w-[120px] md:min-w-[140px]"
                >
                  <div class="flex flex-col items-center">
                    <span class="text-[8px] md:text-[10px] font-black uppercase text-muted-foreground leading-tight">{{
                      metric.name
                    }}</span>
                    <span
                      class="mt-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[8px] md:text-[9px] font-bold uppercase tracking-widest"
                    >{{
                      metric.unit || '--' }}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="athlete in selectedGridData?.athletes" :key="athlete.id" class="border-b hover:bg-accent/5">
                <td class="p-3 md:p-4 font-bold text-xs md:text-sm">
                  {{ athlete.fullName }}
                </td>
                <td
                  v-for="metric in selectedGridData?.metrics" :key="metric.id"
                  class="p-2 md:p-3 text-center align-middle"
                >
                  <div class="relative flex items-center group w-full max-w-[160px] md:max-w-[180px] mx-auto">
                    <input
                      class="flex h-7 md:h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs md:text-sm shadow-sm text-center font-mono focus-visible:ring-1 focus-visible:ring-purple-500 pr-10 transition-all box-border"
                      :class="metric.dataType === 1 ? 'border-blue-400 bg-blue-50/20' : 'border-purple-400 bg-purple-50/20'"
                      :type="metric.dataType === 1 ? 'number' : 'text'"
                      :value="resultsMap[athlete.id]?.[metric.id] || ''"
                      :placeholder="getPlaceholder(metric.dataType)"
                      @input="(e: any) => updateValue(athlete.id, metric.id, e.target.value)"
                    >
                    <span
                      class="absolute right-2 text-[8px] md:text-[9px] font-black text-muted-foreground/40 group-hover:text-primary transition-colors pointer-events-none uppercase"
                    >{{
                      metric.unit }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Mobile Card View -->
          <div class="md:hidden space-y-3 p-3">
            <div
              v-for="athlete in selectedGridData?.athletes" :key="athlete.id"
              class="border rounded-lg p-3 space-y-3"
            >
              <div class="font-bold text-sm">
                {{ athlete.fullName }}
              </div>
              <div class="grid grid-cols-1 gap-3">
                <div v-for="metric in selectedGridData?.metrics" :key="metric.id" class="space-y-1.5">
                  <div class="text-xs font-bold uppercase">
                    {{ metric.name }} <span class="text-primary text-[9px]">({{ metric.unit || '--' }})</span>
                  </div>
                  <input
                    class="flex w-full h-9 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm text-center font-mono focus-visible:ring-1 focus-visible:ring-purple-500 transition-all box-border"
                    :class="metric.dataType === 1 ? 'border-blue-400 bg-blue-50/20' : 'border-purple-400 bg-purple-50/20'"
                    :type="metric.dataType === 1 ? 'number' : 'text'" :value="resultsMap[athlete.id]?.[metric.id] || ''"
                    :placeholder="getPlaceholder(metric.dataType)"
                    @input="(e: any) => updateValue(athlete.id, metric.id, e.target.value)"
                  >
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter class="flex justify-end gap-2 border-t p-4 md:p-6 bg-muted/20">
          <Button variant="ghost" size="sm" class="text-xs md:text-sm h-8 md:h-10" @click="isTestGridOpen = false">
            {{
              t('common.cancel') }}
          </Button>
          <Button
            size="sm" class="bg-purple-600 hover:bg-purple-700 text-xs md:text-sm h-8 md:h-10"
            :disabled="isLoading" @click="saveTestResults"
          >
            <Loader2 v-if="isLoading" class="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
            <Save class="mr-2 h-3 w-3 md:h-4 md:w-4" /> {{ t('common.save') }}
          </Button>
        </CardFooter>
      </Card>
    </div>

    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>{{ t('calendar.delete.title') }}</DialogTitle>
        </DialogHeader>
        <div class="py-4">
          <p class="text-sm text-muted-foreground">
            {{ t('calendar.delete.description') }}
          </p>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" @click="isDeleteDialogOpen = false">
            {{ t('common.cancel') }}
          </Button>
          <Button variant="destructive" :disabled="isDeleting" @click="confirmDelete">
            <Loader2 v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin" />{{ t('common.delete') }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
