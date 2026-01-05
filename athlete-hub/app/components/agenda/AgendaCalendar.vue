<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ChevronLeft, ChevronRight, Plus, Trash2,
  Calendar as CalendarIcon, Pencil,
  ClipboardList, Save, Loader2, AlertCircle, Check
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import { athleteApi } from '../../api/business'
import type {
  CalendarEventResponse,
  CalendarEventCreateRequest,
  AthleteResponse,
  TestResultSaveDto,
  TestEntryGridDto
} from '@/types/api'

import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// --- STATE ---
const { t, tm } = useI18n()
const events = ref<CalendarEventResponse[]>([])
const athletes = ref<AthleteResponse[]>([])
const testDefinitions = ref<any[]>([])
const isLoading = ref(false)

// Modals
const isAddDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isTestGridOpen = ref(false)
const isDeleting = ref(false)
const eventToDeleteId = ref<number | null>(null)
const isEditing = ref(false)
const editingEventId = ref<number | null>(null)

// Test Grid Data
const selectedGridData = ref<TestEntryGridDto | null>(null)
const resultsMap = reactive<Record<number, Record<number, string>>>({})

// Date Management
const dateNow = new Date()
const currentMonth = ref(dateNow.getMonth())
const currentYear = ref(dateNow.getFullYear())
const todayStr = new Date().toISOString().split('T')[0] ?? ''
const selectedDate = ref<string>(todayStr)

const newEvent = reactive({
  athleteIds: [] as number[],
  title: '',
  date: todayStr,
  time: '09:00',
  type: 'Strength',
  testDefinitionId: null as number | null,
  targetRpe: null as number | null, // Aggiunto Target RPE
  hasResults: false,
  duration: null as number | null,
  isCompleted: false
})

// --- CALENDAR LOGIC ---
function changeMonth(delta: number) {
  currentMonth.value += delta
  if (currentMonth.value > 11) {
    currentMonth.value = 0
    currentYear.value++
  } else if (currentMonth.value < 0) {
    currentMonth.value = 11
    currentYear.value--
  }
}

const getMonthDetails = computed(() => {
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const paddingDays = (firstDayOfMonth + 6) % 7
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const days = []
  for (let i = 0; i < paddingDays; i++) days.push({ day: null, date: '', isCurrentMonth: false })
  for (let i = 1; i <= daysInMonth; i++) {
    const fullDate = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    days.push({
      day: i,
      date: fullDate,
      isCurrentMonth: true,
      isToday: fullDate === todayStr
    })
  }
  return { days, monthName: `${t(`calendar.months.${currentMonth.value}`)} ${currentYear.value}` }
})

// --- HELPERS UI ---
const getBorderColor = (type: string) => {
  const colors: Record<string, string> = {
    Strength: 'border-red-500',
    Endurance: 'border-green-500',
    Test: 'border-purple-500',
    Recovery: 'border-yellow-500',
    Checkup: 'border-blue-500'
  }
  return colors[type] || 'border-gray-500'
}

const getDotColor = (type: string) => {
  const colors: Record<string, string> = {
    Strength: 'bg-red-500',
    Endurance: 'bg-green-500',
    Test: 'bg-purple-500',
    Recovery: 'bg-yellow-500',
    Checkup: 'bg-blue-500'
  }
  return colors[type] || 'bg-gray-400'
}

function toggleAthlete(id: number) {
  const index = newEvent.athleteIds.indexOf(id)
  if (index === -1) newEvent.athleteIds.push(id)
  else newEvent.athleteIds.splice(index, 1)
}

function getPlaceholder(type: number) {
  if (type === 1) return '00:00.00'
  if (type === 2) return 'LV.SH'
  return '--'
}

watch([currentMonth, currentYear], () => fetchEvents())

// --- UI HANDLERS ---
function openAddDialog() {
  isEditing.value = false
  editingEventId.value = null
  Object.assign(newEvent, {
    athleteIds: [], title: '', date: selectedDate.value,
    time: '09:00', type: 'Strength', testDefinitionId: null,
    targetRpe: null, // Reset Target RPE
    hasResults: false,
    isCompleted: false
  })
  isAddDialogOpen.value = true
}

function openEditDialog(id: number) {
  const event = events.value.find(e => e.id === id)
  if (!event) return

  isEditing.value = true
  editingEventId.value = event.id

  const [d, t_raw] = (event.date || "").split('T')

  // --- SOLUZIONE ERRORE 2345 ---
  let durationInMinutes: number | null = null

  // Usiamo un alias tipizzato per accedere alle proprietà extra in sicurezza
  const eventData = event as any

  // Verifichiamo che duration esista e sia una stringa prima di lavorarci
  if (typeof eventData.duration === 'string') {
    const parts = eventData.duration.split(':')
    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10)
      const minutes = parseInt(parts[1], 10)
      durationInMinutes = (hours * 60) + minutes
    }
  }

  Object.assign(newEvent, {
    athleteIds: (eventData).participantIds?.map(Number) || [],
    title: eventData.title,
    date: d || todayStr,
    time: t_raw?.substring(0, 5) || '09:00',
    type: eventData.type,
    testDefinitionId: eventData.testDefinitionId,
    targetRpe: eventData.targetRPE || null,
    hasResults: eventData.hasResults === true,
    duration: durationInMinutes, // Assegniamo il valore calcolato (number | null)
    isCompleted: eventData.isCompleted === true
  })

  isAddDialogOpen.value = true
}

// RIPRISTINATA
function openDeleteDialog(id: number) {
  const event = events.value.find(e => e.id === id)
  if (event && (event as any).hasResults) {
    toast.error(t('calendar.deleteLocked'))
    return
  }
  eventToDeleteId.value = id
  isDeleteDialogOpen.value = true
}

// --- API ACTIONS ---
async function fetchEvents() {
  isLoading.value = true
  try {
    const res = await athleteApi.getAllEvents(currentMonth.value + 1, currentYear.value)
    events.value = res.data.value ?? []
  } catch (err: any) {
    toast.error(t('calendar.errors.fetchEvents'))
  } finally {
    isLoading.value = false
  }
}

async function handleSaveEvent() {
  if (newEvent.athleteIds.length === 0) {
    toast.error(t('calendar.validation.selectAthlete'))
    return
  }
  if (newEvent.title.trim() === '' || newEvent.date.trim() === '' || newEvent.time.trim() === '') {
    toast.error(t('calendar.validation.validationError'))
    return
  }

 isLoading.value = true
  try {
    let formattedDuration = null
    if (newEvent.duration) {
      const h = Math.floor(newEvent.duration / 60)
      const m = newEvent.duration % 60
      formattedDuration = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
    }

    // IL PAYLOAD DEVE CORRISPONDERE AL DTO C#
    const payload = {
      title: newEvent.title,
      athleteIds: newEvent.athleteIds, // Inviamo l'array [1, 2, 3]
      date: `${newEvent.date}T${newEvent.time}:00`,
      type: newEvent.type,
      targetRPE: newEvent.targetRpe,
      testDefinitionId: newEvent.type === 'Test' ? newEvent.testDefinitionId : null,
      duration: formattedDuration,
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
  } catch (err) {
    toast.error(t('calendar.errors.saveEvent'))
  } finally {
    isLoading.value = false
  }
}

async function confirmDelete() {
  if (!eventToDeleteId.value) return
  isDeleting.value = true
  try {
    await athleteApi.deleteEvent(eventToDeleteId.value)
    toast.success(t('calendar.toast.deleted'))
    await fetchEvents()
    isDeleteDialogOpen.value = false
  } catch (err) {
    toast.error(t('calendar.errors.deleteEvent'))
  } finally {
    isDeleting.value = false
    eventToDeleteId.value = null
  }
}

async function openTestGrid(eventId: number) {
  try {
    const res = await athleteApi.getTestGrid(eventId)
    const grid = res.data.value
    if (!grid) return

    // RESET TOTALE: Rimuoviamo tutte le proprietà dall'oggetto reactive
    // per evitare residui di sessioni precedenti
    Object.keys(resultsMap).forEach(key => delete resultsMap[Number(key)])

    selectedGridData.value = grid

    // Popolamento dei dati esistenti (tempResults)
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
  } catch (err) {
    toast.error(t('calendar.errors.loadGrid'))
  }
}

async function saveTestResults() {
  if (!selectedGridData.value) return
  isLoading.value = true

  try {
    const resultsToSave: TestResultSaveDto[] = []

    // Creiamo un set degli ID metriche validi per QUESTO test specifico
    const validMetricIds = new Set(selectedGridData.value.metrics.map(m => m.id))

    Object.entries(resultsMap).forEach(([athId, metrics]) => {
      Object.entries(metrics).forEach(([mId, val]) => {
        const metricIdNum = Number(mId)

        // FILTRO DI SICUREZZA: Invia solo se la metrica appartiene al test attuale
        // e se il valore non è vuoto
        if (validMetricIds.has(metricIdNum) && val !== null && val !== '') {
          const parsedVal = parseFloat(String(val).replace(',', '.'))
          if (!isNaN(parsedVal)) {
            resultsToSave.push({
              athleteId: Number(athId),
              testMetricId: metricIdNum,
              value: parsedVal
            })
          }
        }
      })
    })

    if (resultsToSave.length === 0) {
      toast.error(t('calendar.validation.noResults'))
      isLoading.value = false
      return
    }

    await athleteApi.saveTestResults(selectedGridData.value.eventId, resultsToSave)
    toast.success(t('calendar.toast.resultsSaved'))
    await fetchEvents()
    isTestGridOpen.value = false
  } catch (err) {
    toast.error(t('calendar.errors.saveResults'))
  } finally {
    isLoading.value = false
  }
}

function updateValue(athleteId: number, metricId: number, val: string) {
  if (!resultsMap[athleteId]) resultsMap[athleteId] = {}
  resultsMap[athleteId][metricId] = val
}

onMounted(() => {
  fetchEvents()
  athleteApi.getAll().then(res => athletes.value = res.data.value ?? [])
  athleteApi.getTestDefinitions().then(res => testDefinitions.value = res.data.value ?? [])
})
</script>

<template>
  <div class="w-full flex flex-col gap-6 p-2">
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <Card class="col-span-1 xl:col-span-2 shadow-sm border-none bg-card/50 backdrop-blur">
        <CardHeader class="flex flex-row items-center justify-between px-6 py-4">
          <CardTitle class="flex items-center gap-2 font-bold text-xl">
            <CalendarIcon class="h-5 w-5 text-primary" /> {{ getMonthDetails.monthName }}
          </CardTitle>
          <div class="flex gap-2">
            <Button variant="outline" size="icon" @click="changeMonth(-1)">
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="icon" @click="changeMonth(1)">
              <ChevronRight />
            </Button>
            <Button @click="openAddDialog">
              <Plus class="mr-1 h-4 w-4" /> {{ t('calendar.addEvent') }}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div
            class="grid grid-cols-7 text-center text-[10px] font-black uppercase text-muted-foreground mb-4 opacity-50">
            <span v-for="d in (tm('calendar.days') as string[])" :key="d">{{ d }}</span>
          </div>
          <div class="grid grid-cols-7 gap-2">
            <div v-for="(day, i) in getMonthDetails.days" :key="i"
              class="h-24 p-2 border rounded-xl cursor-pointer transition-all hover:bg-accent/50 group" :class="{
                'opacity-20 pointer-events-none bg-muted': !day.isCurrentMonth,
                'border-primary ring-2 ring-primary/20 bg-primary/5': day.date === selectedDate,
                'border-primary/50': day.isToday
              }" @click="day.date && (selectedDate = day.date)">
              <span v-if="day.day" class="text-xs font-bold" :class="{ 'text-primary': day.isToday }">{{ day.day
              }}</span>
              <div v-if="day.isCurrentMonth" class="flex flex-wrap gap-1 mt-1">
                <div v-for="e in events.filter(ev => (ev.date ?? '').startsWith(day.date || ''))" :key="e.id"
                  class="w-2 h-2 rounded-full shadow-sm" :class="getDotColor(e.type ?? '')"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="col-span-1 flex flex-col shadow-sm border-none bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle class="text-lg font-bold uppercase tracking-tight">{{ t('calendar.agendaTitle') }}</CardTitle>
          <CardDescription>{{ selectedDate }}</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4 overflow-y-auto max-h-[600px] px-4">
          <div v-if="events.filter(e => (e.date ?? '').startsWith(selectedDate)).length === 0"
            class="py-20 text-center text-muted-foreground italic text-sm">{{ t('calendar.noEvents') }}</div>
          <div v-for="event in events.filter(e => (e.date ?? '').startsWith(selectedDate))" :key="event.id"
            class="relative border-l-4 p-4 rounded-r-xl bg-card shadow-sm border group transition-all hover:translate-x-1"
            :class="getBorderColor(event.type ?? '')">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <span class="font-black text-[10px] uppercase text-primary/80 block mb-1">{{ event.type }}</span>
                <span class="font-bold text-sm leading-tight">{{ event.title }}</span>
                <div class="mt-2 text-[11px] font-medium text-muted-foreground">🕒
                  {{ event.date ? new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                    '--:--' }}
                  | 👤 {{ event.athleteFullName }} | {{ event.targetRPE ? `🎯 RPE ${event.targetRPE}` : '' }}
                </div>

              </div>
              <div class="actions-overlay">
                <Button v-if="event.type === 'Test'" variant="outline" size="icon"
                  class="h-9 w-9 rounded-full border-purple-500 text-purple-600 shadow-sm"
                  @click="openTestGrid(event.id)">
                  <ClipboardList class="h-5 w-5" />
                </Button>

                <Button variant="ghost" size="icon" class="h-9 w-9 rounded-full" @click="openEditDialog(event.id)">
                  <Pencil class="h-5 w-5" />
                </Button>

                <Button variant="ghost" size="icon" class="h-9 w-9 rounded-full text-destructive"
                  @click="openDeleteDialog(event.id)">
                  <Trash2 class="h-4 w-4" />
                </Button>

              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div v-if="isAddDialogOpen"
      class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-2">
      <Card class="w-full max-w-md shadow-2xl border-none">
        <CardHeader class="py-3 px-5">
          <CardTitle class="text-xl font-black uppercase">
            {{ isEditing ? t('calendar.editSession') : t('calendar.newSession') }}
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-3 max-h-[75vh] overflow-y-auto pr-2">
          <div v-if="isEditing && newEvent.hasResults"
            class="bg-amber-50 border border-amber-200 p-2 rounded-lg flex items-start gap-3">
            <AlertCircle class="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <p class="text-[11px] text-amber-800 leading-tight">
              <b>{{ t('calendar.blocked') }}</b><br>{{ t('calendar.resultPresent') }}
            </p>
          </div>

          <div>
            <label class="text-[10px] font-black uppercase text-muted-foreground mb-0.5 block">{{
              t('calendar.form.titleLabel') }}</label>
            <Input v-model="newEvent.title" class="h-9" />
          </div>

          <div class="flex gap-3">
            <div class="flex-1">
              <label class="text-[10px] font-black uppercase text-muted-foreground mb-0.5 block">{{
                t('calendar.form.dateLabel') }}</label>
              <Input type="date" v-model="newEvent.date" class="h-9" />
            </div>
            <div class="w-28">
              <label class="text-[10px] font-black uppercase text-muted-foreground mb-0.5 block">{{
                t('calendar.form.timeLabel') }}</label>
              <Input type="time" v-model="newEvent.time" class="h-9" />
            </div>
          </div>

          <div class="col-span-2 md:col-span-1">
            <div class="flex items-center justify-between mb-0.5">
              <label class="text-[10px] font-black uppercase text-muted-foreground block">{{ t('calendar.form.duration')
                }}</label>
              <div class="flex items-center gap-1.5 transition-all duration-300">
                <template v-if="newEvent.duration && newEvent.duration > 0">
                  <span class="relative flex h-1.5 w-1.5">
                    <span
                      class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                  <span class="text-[9px] font-black text-green-600 uppercase tracking-wider">{{ t('common.active') ||
                    'Attiva' }}</span>
                </template>
                <template v-else>
                  <AlertCircle class="h-3 w-3 text-muted-foreground/40" />
                  <span class="text-[9px] font-bold text-muted-foreground/50 uppercase italic">{{
                    t('calendar.form.notSpecified') || 'N/A' }}</span>
                </template>
              </div>
            </div>

            <input type="range" min="0" max="240" step="5" v-model.number="newEvent.duration"
              class="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer" />

            <div class="flex justify-between items-center mt-1">
              <div class="text-sm font-bold transition-colors"
                :class="newEvent.duration ? 'text-primary' : 'text-muted-foreground italic font-medium'">
                <span v-if="newEvent.duration">{{ t('calendar.form.durationValue', { minutes: newEvent.duration })
                  }}</span>
                <span v-else>-- min</span>
              </div>
              <button v-if="newEvent.duration" @click="newEvent.duration = null"
                class="text-[10px] font-black uppercase text-destructive hover:opacity-70 flex items-center gap-1">
                <X class="h-3 w-3" /> {{ t('common.remove') || 'Rimuovi' }}
              </button>
            </div>
          </div>

          <div class="space-y-2"> <label class="text-[10px] font-black uppercase text-muted-foreground block">{{
            t('calendar.form.selectAthlete') }}</label>
            <div class="grid grid-cols-1 gap-1 border rounded-lg p-2 bg-muted/20 max-h-32 overflow-y-auto">
              <div v-for="ath in athletes" :key="ath.id"
                @click="!(isEditing && newEvent.hasResults) && toggleAthlete(ath.id)"
                class="flex items-center space-x-3 p-1.5 rounded-md hover:bg-background cursor-pointer transition-colors">
                <div class="h-4 w-4 border-2 rounded flex items-center justify-center transition-colors"
                  :class="newEvent.athleteIds.includes(ath.id) ? 'bg-primary border-primary' : 'border-muted-foreground/30'">
                  <Check v-if="newEvent.athleteIds.includes(ath.id)" class="h-2.5 w-2.5 text-primary-foreground" />
                </div>
                <span class="text-xs font-medium">{{ ath.fullName }}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black uppercase text-muted-foreground mb-0.5 block">{{
                t('calendar.form.categoryLabel') }}</label>
              <select v-model="newEvent.type" :disabled="isEditing && newEvent.hasResults"
                class="w-full border rounded-md p-1.5 text-sm bg-background h-9 disabled:bg-muted">
                <option v-for="type in ['Strength', 'Endurance', 'Test', 'Recovery', 'Checkup']" :key="type"
                  :value="type">{{ type
                  }}</option>
              </select>
            </div>
            <div>
              <label class="text-[10px] font-black uppercase text-primary mb-0.5 block">{{ t('calendar.form.targetRPE')
                }}</label>
              <Input type="number" v-model.number="newEvent.targetRpe" min="1" max="10" placeholder="Es. 7"
                class="h-9 font-bold text-primary" />
            </div>
          </div>

          <div v-if="newEvent.type === 'Test'" class="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <label class="text-[10px] font-black uppercase text-purple-600 mb-1 block">{{
              t('calendar.form.protocolLabel')
              }}</label>
            <select v-model="newEvent.testDefinitionId" :disabled="isEditing && newEvent.hasResults"
              class="w-full border rounded-md p-1.5 text-sm bg-background h-9 border-purple-200">
              <option :value="null">{{ t('calendar.form.protocolSelect') }}</option>
              <option v-for="td in testDefinitions" :key="td.id" :value="td.id">{{ td.name }}</option>
            </select>
          </div>

          <div v-if="newEvent.type !== 'Test' && newEvent.type !== 'Recovery'"
            class="p-3 rounded-xl border transition-all"
            :class="newEvent.isCompleted ? 'bg-green-500/10 border-green-500/30' : 'bg-muted/30 border-transparent'">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-full flex items-center justify-center"
                  :class="newEvent.isCompleted ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'">
                  <Check class="h-5 w-5" />
                </div>
                <div>
                  <p class="text-xs font-bold uppercase tracking-tight">{{ t('calendar.form.completedTitle') }}</p>
                  <p class="text-[9px] text-muted-foreground leading-tight">{{ t('calendar.form.completedInfo')}}</p>
                </div>
              </div>
              <button @click="newEvent.isCompleted = !newEvent.isCompleted" type="button"
                class="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-muted"
                :class="{ 'bg-green-600': newEvent.isCompleted }">
                <span
                  class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  :class="{ 'translate-x-5': newEvent.isCompleted, 'translate-x-0': !newEvent.isCompleted }" />
              </button>
            </div>
          </div>

        </CardContent>
        <CardFooter class="flex justify-end gap-2 border-t p-4"> <Button variant="ghost" size="sm"
            @click="isAddDialogOpen = false">{{ t('common.cancel') }}</Button>
          <Button size="sm" @click="handleSaveEvent" :disabled="isLoading">
            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ isEditing ? t('common.update') : t('common.create') }}
          </Button>
        </CardFooter>
      </Card>
    </div>

    <div v-if="isTestGridOpen"
      class="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <Card class="w-full max-w-5xl shadow-2xl border-none max-h-[90vh] flex flex-col">
        <CardHeader class="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle class="text-xl font-black uppercase flex items-center gap-2">
            <ClipboardList class="text-purple-500" /> {{ selectedGridData?.testName }}
          </CardTitle>
          <Button variant="ghost" size="icon" @click="isTestGridOpen = false">
            <X class="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent class="p-0 overflow-auto flex-1">
          <table class="w-full border-collapse">
            <thead class="bg-muted/50 sticky top-0 z-10">
              <tr>
                <th class="p-4 text-left text-[10px] font-black uppercase text-muted-foreground border-b w-64">
                  {{ t('calendar.grid.athlete') }}
                </th>
                <th v-for="metric in selectedGridData?.metrics" :key="metric.id"
                  class="p-4 text-center text-[10px] font-black uppercase text-muted-foreground border-b min-w-[140px]">
                  {{ metric.name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="athlete in selectedGridData?.athletes" :key="athlete.id" class="border-b hover:bg-accent/5">
                <td class="p-4 font-bold text-sm">{{ athlete.fullName }}</td>
                <td v-for="metric in selectedGridData?.metrics" :key="metric.id" class="p-2 text-center">
                  <input
                    class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm text-center font-mono focus-visible:ring-1 focus-visible:ring-purple-500"
                    :class="{ 'border-blue-400 bg-blue-50/30': metric.dataType === 1, 'border-purple-400 bg-purple-50/30': metric.dataType === 2 }"
                    :value="resultsMap[athlete.id]?.[metric.id] || ''"
                    @change="(e: any) => updateValue(athlete.id, metric.id, e.target.value)"
                    :placeholder="getPlaceholder(metric.dataType)" />
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
        <CardFooter class="flex justify-end gap-2 border-t p-6 bg-muted/20">
          <Button variant="ghost" @click="isTestGridOpen = false">{{ t('common.cancel') }}</Button>
          <Button class="bg-purple-600 hover:bg-purple-700" @click="saveTestResults" :disabled="isLoading">
            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            <Save class="mr-2 h-4 w-4" /> {{ t('common.save') }}
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