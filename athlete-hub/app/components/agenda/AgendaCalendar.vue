<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ChevronLeft, ChevronRight, Plus, Trash2,
  Calendar as CalendarIcon, Pencil,
  ClipboardList, Save, Loader2, AlertCircle, Check, X
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// Config & Types
import { EVENT_CONFIG, EVENT_TYPES, type EventStyle } from '../../constants/eventConfig'
import { athleteApi } from '../../api/business'
import type {
  CalendarEventResponse,
  CalendarEventCreateRequest,
  AthleteResponse,
  TestResultSaveDto,
  TestEntryGridDto
} from '@/types/api'

// UI Components
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const timeUtils = {
  toMinutes: (hms: string | null | undefined): number | null => {
    if (!hms) return null
    const parts = hms.split(':')
    if (parts.length < 2) return null
    const hours = parseInt(parts[0] || '0', 10)
    const minutes = parseInt(parts[1] || '0', 10)
    return (hours * 60) + minutes
  },
  toHMS: (minutes: number | null | undefined): string | null => {
    if (minutes === null || minutes === undefined) return null
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
  },
  getTodayStr: () => new Date().toISOString().split('T')[0] ?? ''
}

interface CalendarDay {
  day: number | null
  date: string
  isCurrentMonth: boolean
  isToday: boolean
}

// --- STATE ---
const { t, tm } = useI18n()
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

// Test Grid
const selectedGridData = ref<TestEntryGridDto | null>(null)
const resultsMap = reactive<Record<number, Record<number, string>>>({})

// Date Management
const dateNow = new Date()
const currentMonth = ref(dateNow.getMonth())
const currentYear = ref(dateNow.getFullYear())
const selectedDate = ref<string>(timeUtils.getTodayStr())

// --- LOGICA STILI ---
const getEventStyle = (type: string | undefined): EventStyle => {
  return EVENT_CONFIG[type || ''] || {
    color: 'gray',
    border: 'border-gray-500',
    bg: 'bg-gray-500/10',
    dot: 'bg-gray-500'
  }
}

// --- FORM STATE ---
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
  isCompleted: false
})

const isFormValid = computed(() => {
  // Titolo obbligatorio
  if (!newEvent.title.trim()) return false

  // Almeno un atleta
  if (!newEvent.athleteIds.length) return false

  // Data e ora
  if (!newEvent.date) return false
  if (!newEvent.time) return false

  // Durata obbligatoria e > 0
  if (!newEvent.duration || newEvent.duration <= 0) return false

  // Categoria obbligatoria
  if (!newEvent.type) return false

  // Se NON è Recovery/Checkup serve RPE
  if (!['Recovery', 'Checkup'].includes(newEvent.type)) {
    if (newEvent.targetRpe == null) return false
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
      isToday: fullDate === timeUtils.getTodayStr()
    })
  }
  return { days, monthName: `${t(`calendar.months.${currentMonth.value}`)} ${currentYear.value}` }
})

// --- API ACTIONS ---
const fetchEvents = async () => {
  isLoading.value = true
  try {
    const res = await athleteApi.getAllEvents(currentMonth.value + 1, currentYear.value)
    events.value = res.data.value ?? []
  } catch {
    toast.error(t('calendar.errors.fetchEvents'))
  } finally {
    isLoading.value = false
  }
}

watch([currentMonth, currentYear], fetchEvents)

// --- DIALOG HANDLERS ---
function openAddDialog() {
  isEditing.value = false
  editingEventId.value = null
  Object.assign(newEvent, {
    athleteIds: [], title: '', date: selectedDate.value,
    time: '09:00', type: 'Strength', testDefinitionId: null,
    targetRpe: null, hasResults: false, duration: null, isCompleted: false
  })
  isAddDialogOpen.value = true
}

function openEditDialog(id: number) {
  const event = events.value.find(e => e.id === id)
  if (!event) return

  isEditing.value = true
  editingEventId.value = event.id

  const [d, t_raw] = (event.date || "").split('T')
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
    isCompleted: event.isCompleted
  })
  isAddDialogOpen.value = true
}

function openDeleteDialog(id: number) {
  const event = events.value.find(e => e.id === id)
  if ((event as any)?.hasResults) {
    return toast.error(t('calendar.deleteLocked'))
  }
  eventToDeleteId.value = id
  isDeleteDialogOpen.value = true
}

async function confirmDelete() {
  if (!eventToDeleteId.value) return
  isDeleting.value = true
  try {
    await athleteApi.deleteEvent(eventToDeleteId.value)
    toast.success(t('calendar.toast.deleted'))
    await fetchEvents()
    isDeleteDialogOpen.value = false
  } catch {
    toast.error(t('calendar.errors.deleteEvent'))
  } finally {
    isDeleting.value = false
    eventToDeleteId.value = null
  }
}

// --- HELPERS TEMPLATE ---
function toggleAthlete(id: number) {
  const index = newEvent.athleteIds.indexOf(id)
  if (index === -1) newEvent.athleteIds.push(id)
  else newEvent.athleteIds.splice(index, 1)
}

function updateValue(athleteId: number, metricId: number, val: string) {
  if (!resultsMap[athleteId]) resultsMap[athleteId] = {}
  resultsMap[athleteId][metricId] = val
}

function getPlaceholder(type: number | undefined) {
  if (type === 1) return '00:00.00'
  if (type === 2) return 'LV.SH'
  return '--'
}

// --- SAVE ACTIONS ---
async function handleSaveEvent() {
  if (!newEvent.athleteIds.length || !newEvent.title.trim()) {
    return toast.error(t('calendar.validation.validationError'))
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
      isCompleted: newEvent.isCompleted
    }

    if (isEditing.value && editingEventId.value) {
      await athleteApi.updateEvent(editingEventId.value, payload)
      toast.success(t('calendar.toast.updated'))
    } else {
      await athleteApi.createEvent(payload)
      toast.success(t('calendar.toast.created'))
    }

    await fetchEvents()
    isAddDialogOpen.value = false
  } catch {
    toast.error(t('calendar.errors.saveEvent'))
  } finally {
    isLoading.value = false
  }
}

// --- TEST GRID LOGIC ---
async function openTestGrid(eventId: number) {
  try {
    const res = await athleteApi.getTestGrid(eventId)
    const grid = res.data.value
    if (!grid) return

    Object.keys(resultsMap).forEach(key => delete resultsMap[Number(key)])

    selectedGridData.value = grid
    grid.athletes.forEach(athlete => {
      // Inizializziamo l'oggetto per l'atleta specifico
      resultsMap[athlete.id] = {}

      if (athlete.tempResults) {
        Object.entries(athlete.tempResults).forEach(([mId, val]) => {
          const athleteMap = resultsMap[athlete.id]
          if (athleteMap) athleteMap[Number(mId)] = String(val).replace('.', ',')
        })
      }
    })
    isTestGridOpen.value = true
  } catch {
    toast.error(t('calendar.errors.loadGrid'))
  }
}

async function saveTestResults() {
  if (!selectedGridData.value) return

  const currentGrid = selectedGridData.value
  const validMetricIds = new Set(currentGrid.metrics.map(m => m.id))
  const resultsToSave: TestResultSaveDto[] = []

  Object.entries(resultsMap).forEach(([athId, metrics]) => {
    Object.entries(metrics).forEach(([mId, val]) => {
      const metricId = Number(mId)
      const parsedVal = parseFloat(String(val).replace(',', '.'))
      if (validMetricIds.has(metricId) && !isNaN(parsedVal)) {
        resultsToSave.push({ athleteId: Number(athId), testMetricId: metricId, value: parsedVal })
      }
    })
  })

  if (!resultsToSave.length) return toast.error(t('calendar.validation.noResults'))

  isLoading.value = true
  try {
    await athleteApi.saveTestResults(currentGrid.eventId, resultsToSave)
    toast.success(t('calendar.toast.resultsSaved'))
    await fetchEvents()
    isTestGridOpen.value = false
  } catch {
    toast.error(t('calendar.errors.saveResults'))
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  fetchEvents()
  const [athRes, testRes] = await Promise.all([
    athleteApi.getAll(),
    athleteApi.getTestDefinitions()
  ])
  athletes.value = athRes.data.value ?? []
  testDefinitions.value = testRes.data.value ?? []
})
</script>

<template>
  <div class="w-full flex flex-col gap-4 md:gap-6 p-2 md:p-4">
    <div class="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
      <Card class="col-span-1 lg:col-span-2 shadow-sm border-none bg-card/50 backdrop-blur">
        <CardHeader class="flex flex-col md:flex-row md:items-center md:justify-between px-3 md:px-6 py-3 md:py-4 gap-2 md:gap-0">
          <CardTitle class="flex items-center gap-2 font-bold text-lg md:text-xl">
            <CalendarIcon class="h-4 w-4 md:h-5 md:w-5 text-primary" /> {{ getMonthDetails.monthName }}
          </CardTitle>
          <div class="flex gap-1 md:gap-2 flex-wrap">
            <Button variant="outline" size="icon" class="h-8 w-8 md:h-10 md:w-10" @click="changeMonth(-1)">
              <ChevronLeft class="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" class="h-8 w-8 md:h-10 md:w-10" @click="changeMonth(1)">
              <ChevronRight class="h-4 w-4" />
            </Button>
            <Button @click="openAddDialog" class="text-xs md:text-sm h-8 md:h-10 px-2 md:px-4">
              <Plus class="mr-1 h-3 w-3 md:h-4 md:w-4" /> <span class="hidden sm:inline">{{ t('calendar.addEvent') }}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent class="px-2 md:px-4">
          <div
            class="grid grid-cols-7 text-center text-[8px] md:text-[10px] font-black uppercase text-muted-foreground mb-3 md:mb-4 opacity-50">
            <span v-for="d in (tm('calendar.days') as string[])" :key="d">{{ d }}</span>
          </div>
          <div class="grid grid-cols-7 gap-1 md:gap-2">
            <div v-for="(day, i) in getMonthDetails.days" :key="i"
              class="h-20 md:h-24 p-1.5 md:p-2 border rounded-lg md:rounded-xl cursor-pointer transition-all hover:bg-accent/50 group" :class="{
                'opacity-20 pointer-events-none bg-muted': !day.isCurrentMonth,
                'border-primary ring-2 ring-primary/20 bg-primary/5': day.date === selectedDate,
                'border-primary/50': day.isToday
              }" @click="day.date && (selectedDate = day.date)">
              <span v-if="day.day" class="text-[10px] md:text-xs font-bold" :class="{ 'text-primary': day.isToday }">{{ day.day
                }}</span>
              <div v-if="day.isCurrentMonth" class="flex flex-wrap gap-1 mt-1">
                <div v-for="e in events.filter(ev => (ev.date ?? '').startsWith(day.date || ''))" :key="e.id"
                  class="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shadow-sm" :class="getEventStyle(e.type).dot"> </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="col-span-1 flex flex-col shadow-sm border-none bg-card/50 backdrop-blur">
        <CardHeader class="px-3 md:px-6 py-3 md:py-4">
          <CardTitle class="text-base md:text-lg font-bold uppercase tracking-tight">{{ t('calendar.agendaTitle') }}</CardTitle>
          <CardDescription>{{ selectedDate }}</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3 md:space-y-4 overflow-y-auto max-h-[400px] md:max-h-[600px] px-3 md:px-4">
          <div v-if="events.filter(e => (e.date ?? '').startsWith(selectedDate)).length === 0"
            class="py-12 md:py-20 text-center text-muted-foreground italic text-xs md:text-sm">{{ t('calendar.noEvents') }}</div>

          <div v-for="event in events.filter(e => (e.date ?? '').startsWith(selectedDate))" :key="event.id"
            class="relative border-l-4 p-3 md:p-4 rounded-r-lg md:rounded-r-xl shadow-sm border group transition-all hover:translate-x-1"
            :class="[getEventStyle(event.type).border, getEventStyle(event.type).bg]">
            <div class="flex justify-between items-start gap-2">
              <div class="flex-1 min-w-0">
                <span class="font-black text-[8px] md:text-[10px] uppercase block mb-1"
                  :class="getEventStyle(event.type).dot.replace('bg-', 'text-')">
                  {{ t(`eventTypes.${event.type}`) }}
                </span>
                <span class="font-bold text-xs md:text-sm leading-tight break-words">{{ event.title }}</span>
                <div class="mt-2 text-[9px] md:text-[11px] font-medium text-muted-foreground space-y-1">
                  🕒 {{ event.date ? new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--' }}
                  | 👤 {{ event.athleteFullName }}
                  <span v-if="event.targetRPE" class="ml-1 text-primary">| 🎯 RPE {{ event.targetRPE }}</span>
                </div>
              </div>
              <div class="flex gap-0.5 shrink-0">
                <Button v-if="event.type === 'Test'" variant="outline" size="icon"
                  class="h-7 w-7 md:h-8 md:w-8 rounded-full border-purple-500 text-purple-600 shadow-sm"
                  @click="openTestGrid(event.id)">
                  <ClipboardList class="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
                <Button variant="ghost" size="icon" class="h-7 w-7 md:h-8 md:w-8 rounded-full" @click="openEditDialog(event.id)">
                  <Pencil class="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
                <Button variant="ghost" size="icon" class="h-7 w-7 md:h-8 md:w-8 rounded-full text-destructive"
                  @click="openDeleteDialog(event.id)">
                  <Trash2 class="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div v-if="isAddDialogOpen"
      class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4">
      <Card class="w-full max-w-sm md:max-w-md shadow-2xl border-none">
        <CardHeader class="py-3 px-4 md:px-5">
          <CardTitle class="text-base md:text-xl font-black uppercase">
            {{ isEditing ? t('calendar.editSession') : t('calendar.newSession') }}
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-2.5 md:space-y-3 max-h-[85vh] overflow-y-auto pr-1 md:pr-2 px-4 md:px-5">
          <div v-if="isEditing && newEvent.hasResults"
            class="bg-amber-50 border border-amber-200 p-2 rounded-lg flex items-start gap-2">
            <AlertCircle class="h-4 w-4 md:h-5 md:w-5 text-amber-600 mt-0.5 shrink-0" />
            <p class="text-[9px] md:text-[11px] text-amber-800 leading-tight">
              <b>{{ t('calendar.blocked') }}</b><br>{{ t('calendar.resultPresent') }}
            </p>
          </div>

          <div>
            <label class="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground mb-1 block">{{
              t('calendar.form.titleLabel') }}</label>
            <Input v-model="newEvent.title" class="h-8 md:h-9 text-sm" />
          </div>

          <div class="flex flex-col md:flex-row gap-3">
            <div class="flex-1">
              <label class="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground mb-1 block">{{
                t('calendar.form.dateLabel') }}</label>
              <Input type="date" v-model="newEvent.date" class="h-8 md:h-9 text-xs md:text-sm" />
            </div>
            <div class="md:w-32">
              <label class="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground mb-1 block">{{
                t('calendar.form.timeLabel') }}</label>
              <Input type="time" v-model="newEvent.time" class="h-8 md:h-9 text-xs md:text-sm" />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-0.5">
              <label class="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground block">{{ t('calendar.form.duration')
                }}</label>
              <div class="text-xs md:text-sm font-bold" :class="newEvent.duration ? 'text-primary' : 'text-muted-foreground'">
                {{ newEvent.duration ? t('calendar.form.durationValue', { minutes: newEvent.duration }) : '-- min' }}
              </div>
            </div>
            <input type="range" min="0" max="240" step="5" v-model.number="newEvent.duration"
              class="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer" />
          </div>

          <div class="space-y-2">
            <label class="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground block">{{
              t('calendar.form.selectAthlete') }}</label>
            <div class="grid grid-cols-1 gap-1 border rounded-lg p-2 bg-muted/20 max-h-40 md:max-h-32 overflow-y-auto">
              <div v-for="ath in athletes" :key="ath.id"
                @click="!(isEditing && newEvent.hasResults) && toggleAthlete(ath.id)"
                class="flex items-center space-x-3 p-1.5 rounded-md hover:bg-background cursor-pointer transition-colors">
                <div class="h-4 w-4 border-2 rounded flex items-center justify-center"
                  :class="newEvent.athleteIds.includes(ath.id) ? 'bg-primary border-primary' : 'border-muted-foreground/30'">
                  <Check v-if="newEvent.athleteIds.includes(ath.id)" class="h-2.5 w-2.5 text-primary-foreground" />
                </div>
                <span class="text-[11px] md:text-xs font-medium">{{ ath.fullName }}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div :class="['Recovery', 'Checkup'].includes(newEvent.type) ? 'col-span-2' : 'col-span-1'">
              <label class="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground mb-1 block">{{
                t('calendar.form.categoryLabel') }}</label>
              <select v-model="newEvent.type" :disabled="isEditing && newEvent.hasResults"
                class="w-full border rounded-md p-1.5 text-xs md:text-sm bg-background h-8 md:h-9 disabled:bg-muted">
                <option v-for="type in EVENT_TYPES" :key="type" :value="type">
                  {{ t(`eventTypes.${type}`) }}
                </option>
              </select>
            </div>

            <div v-if="!['Recovery', 'Checkup'].includes(newEvent.type)" class="col-span-1">
              <label class="text-[9px] md:text-[10px] font-black uppercase text-primary mb-1 block">{{ t('calendar.form.targetRPE')
                }}</label>
              <Input type="number" v-model.number="newEvent.targetRpe" min="1" max="10"
                class="h-8 md:h-9 font-bold text-primary text-sm" />
            </div>
          </div>

          <div v-if="newEvent.type === 'Test'" class="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <label class="text-[9px] md:text-[10px] font-black uppercase text-purple-600 mb-1 block">{{
              t('calendar.form.protocolLabel') }}</label>
            <select v-model="newEvent.testDefinitionId" :disabled="isEditing && newEvent.hasResults"
              class="w-full border rounded-md p-1.5 text-xs md:text-sm bg-background h-8 md:h-9 border-purple-200">
              <option :value="null">{{ t('calendar.form.protocolSelect') }}</option>
              <option v-for="td in testDefinitions" :key="td.id" :value="td.id">{{ td.name }}</option>
            </select>
          </div>

          <div v-if="isEditing && !['Test', 'Recovery', 'Checkup'].includes(newEvent.type)"
            class="p-3 rounded-xl border transition-all"
            :class="newEvent.isCompleted ? 'bg-green-500/10 border-green-500/30' : 'bg-muted/30 border-transparent'">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-full flex items-center justify-center"
                  :class="newEvent.isCompleted ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'">
                  <Check class="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <p class="text-[10px] md:text-xs font-bold uppercase tracking-tight">{{ t('calendar.form.completedTitle') }}</p>
                  <p class="text-[8px] md:text-[9px] text-muted-foreground leading-tight">{{ t('calendar.form.completedInfo') }}</p>
                </div>
              </div>
              <button @click="newEvent.isCompleted = !newEvent.isCompleted" type="button"
                class="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors bg-muted"
                :class="{ 'bg-green-600': newEvent.isCompleted }">
                <span class="pointer-events-none inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white shadow transition"
                  :class="{ 'translate-x-5': newEvent.isCompleted, 'translate-x-0': !newEvent.isCompleted }" />
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter class="flex justify-end gap-2 border-t p-3 md:p-4">
          <Button variant="ghost" size="sm" class="text-xs md:text-sm h-8 md:h-9" @click="isAddDialogOpen = false">{{ t('common.cancel') }}</Button>
          <Button size="sm" class="text-xs md:text-sm h-8 md:h-9" @click="handleSaveEvent" :disabled="isLoading || !isFormValid" :class="{ 'opacity-50 cursor-not-allowed': isLoading || !isFormValid}">
            <Loader2 v-if="isLoading" class="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
            {{ isEditing ? t('common.update') : t('common.create') }}
          </Button>
        </CardFooter>
      </Card>
    </div>

    <div v-if="isTestGridOpen"
      class="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center p-2 md:p-4">
      <Card class="w-full max-w-sm md:max-w-5xl shadow-2xl border-none max-h-[95vh] md:max-h-[90vh] flex flex-col">
        <CardHeader class="flex flex-row items-center justify-between border-b pb-3 md:pb-4 px-3 md:px-6 py-3 md:py-4">
          <CardTitle class="text-base md:text-xl font-black uppercase flex items-center gap-2">
            <ClipboardList class="h-4 w-4 md:h-5 md:w-5 text-purple-500" /> <span class="truncate">{{ selectedGridData?.testName }}</span>
          </CardTitle>
          <Button variant="ghost" size="icon" @click="isTestGridOpen = false">
            <X class="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </CardHeader>
        <CardContent class="p-0 overflow-auto flex-1">
          <!-- Desktop Table View -->
          <table class="w-full border-collapse hidden md:table">
            <thead class="bg-muted/50 sticky top-0 z-10">
              <tr>
                <th class="p-3 md:p-4 text-left text-[9px] md:text-[10px] font-black uppercase text-muted-foreground border-b w-48 md:w-64">{{
                  t('calendar.grid.athlete') }}</th>
                <th v-for="metric in selectedGridData?.metrics" :key="metric.id"
                  class="p-3 md:p-4 text-center border-b min-w-[120px] md:min-w-[140px]">
                  <div class="flex flex-col items-center">
                    <span class="text-[8px] md:text-[10px] font-black uppercase text-muted-foreground leading-tight">{{ metric.name
                      }}</span>
                    <span
                      class="mt-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[8px] md:text-[9px] font-bold uppercase tracking-widest">{{
                      metric.unit || '--' }}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="athlete in selectedGridData?.athletes" :key="athlete.id" class="border-b hover:bg-accent/5">
                <td class="p-3 md:p-4 font-bold text-xs md:text-sm">{{ athlete.fullName }}</td>
                <td v-for="metric in selectedGridData?.metrics" :key="metric.id" class="p-2 md:p-3 text-center align-middle">
                  <div class="relative flex items-center group w-full max-w-[160px] md:max-w-[180px] mx-auto">
                    <input
                      class="flex h-7 md:h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs md:text-sm shadow-sm text-center font-mono focus-visible:ring-1 focus-visible:ring-purple-500 pr-10 transition-all box-border"
                      :class="metric.dataType === 1 ? 'border-blue-400 bg-blue-50/20' : 'border-purple-400 bg-purple-50/20'"
                      :type="metric.dataType === 1 ? 'number' : 'text'"
                      :value="resultsMap[athlete.id]?.[metric.id] || ''"
                      @input="(e: any) => updateValue(athlete.id, metric.id, e.target.value)"
                      :placeholder="getPlaceholder(metric.dataType)" />
                    <span
                      class="absolute right-2 text-[8px] md:text-[9px] font-black text-muted-foreground/40 group-hover:text-primary transition-colors pointer-events-none uppercase">{{
                      metric.unit }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Mobile Card View -->
          <div class="md:hidden space-y-3 p-3">
            <div v-for="athlete in selectedGridData?.athletes" :key="athlete.id" class="border rounded-lg p-3 space-y-3">
              <div class="font-bold text-sm">{{ athlete.fullName }}</div>
              <div class="grid grid-cols-1 gap-3">
                <div v-for="metric in selectedGridData?.metrics" :key="metric.id" class="space-y-1.5">
                  <div class="text-xs font-bold uppercase">
                    {{ metric.name }} <span class="text-primary text-[9px]">({{ metric.unit || '--' }})</span>
                  </div>
                  <input
                    class="flex w-full h-9 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm text-center font-mono focus-visible:ring-1 focus-visible:ring-purple-500 transition-all box-border"
                    :class="metric.dataType === 1 ? 'border-blue-400 bg-blue-50/20' : 'border-purple-400 bg-purple-50/20'"
                    :type="metric.dataType === 1 ? 'number' : 'text'"
                    :value="resultsMap[athlete.id]?.[metric.id] || ''"
                    @input="(e: any) => updateValue(athlete.id, metric.id, e.target.value)"
                    :placeholder="getPlaceholder(metric.dataType)" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter class="flex justify-end gap-2 border-t p-4 md:p-6 bg-muted/20">
          <Button variant="ghost" size="sm" class="text-xs md:text-sm h-8 md:h-10" @click="isTestGridOpen = false">{{ t('common.cancel') }}</Button>
          <Button size="sm" class="bg-purple-600 hover:bg-purple-700 text-xs md:text-sm h-8 md:h-10" @click="saveTestResults" :disabled="isLoading">
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
          <p class="text-sm text-muted-foreground">{{ t('calendar.delete.description') }}</p>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" @click="isDeleteDialogOpen = false">{{ t('common.cancel') }}</Button>
          <Button variant="destructive" @click="confirmDelete" :disabled="isDeleting">
            <Loader2 v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin" />{{ t('common.delete') }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

