<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ChevronLeft, ChevronRight, Plus, X,
  Calendar as CalendarIcon, Pencil,
  ClipboardList, Save, Loader2, AlertCircle
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
  hasResults: false // Questo flag ora è reattivo e collegato al backend
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
  for (let i = 0; i < paddingDays; i++) days.push({ day: null, date: null, isCurrentMonth: false })
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

function getPlaceholder(type: number) {
  if (type === 1) return '00:00.00'
  if (type === 2) return 'LV.SH'
  return '--'
}

function getMetricHelp(type: number) {
  if (type === 1) return t('calendar.grid.helpTime')
  if (type === 2) return t('calendar.grid.helpLevel')
  return ''
}

watch([currentMonth, currentYear], () => fetchEvents())

// --- UI HANDLERS ---
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
    hasResults: false
  })
  isAddDialogOpen.value = true
}

function closeAddDialog() {
  isAddDialogOpen.value = false
  isEditing.value = false
}

function openEditDialog(id: number) {
  const event = events.value.find(e => e.id === id)
  if (!event) return
  
  isEditing.value = true
  editingEventId.value = event.id
  const [d, t_raw] = (event.date || "").split('T')

  // Mappatura esatta dal backend
  Object.assign(newEvent, {
    athleteIds: (event as any).participantIds?.map(Number) || [],
    title: event.title,
    date: d || todayStr,
    time: t_raw?.substring(0, 5) || '09:00',
    type: event.type,
    testDefinitionId: (event as any).testDefinitionId,
    hasResults: (event as any).hasResults === true // IMPORTANTE: Sincronizziamo il blocco
  })
  
  isAddDialogOpen.value = true
}

function openDeleteDialog(id: number) {
  const event = events.value.find(e => e.id === id)
  if (event && (event as any).hasResults) {
    toast.error("Non puoi eliminare un evento che ha già dei risultati salvati.")
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
    toast.error(err.error?.message || t('calendar.errors.fetchEvents'))
  } finally {
    isLoading.value = false
  }
}

async function handleSaveEvent() {
  if (newEvent.athleteIds.length === 0) {
    toast.error(t('calendar.validation.selectAthlete'))
    return
  }

  // CONTROLLO DI SICUREZZA LATO CLIENT
  if (isEditing.value && newEvent.hasResults) {
    const originalEvent = events.value.find(e => e.id === editingEventId.value)
    if (originalEvent) {
      const typeChanged = originalEvent.type !== newEvent.type
      const protocolChanged = (originalEvent as any).testDefinitionId !== newEvent.testDefinitionId
      
      if (typeChanged || protocolChanged) {
        toast.error("Salvataggio bloccato: non puoi modificare il protocollo se esistono risultati salvati.")
        return
      }
    }
  }

  isLoading.value = true
  try {
    const payload: CalendarEventCreateRequest = {
      ...newEvent,
      date: `${newEvent.date}T${newEvent.time}:00`,
      testDefinitionId: newEvent.type === 'Test' ? newEvent.testDefinitionId : null
    }
    
    if (isEditing.value && editingEventId.value) {
      await athleteApi.updateEvent(editingEventId.value, payload)
      toast.success(t('calendar.toast.updated'))
    } else {
      await athleteApi.createEvent(payload)
      toast.success(t('calendar.toast.created'))
    }
    
    await fetchEvents() // Ricarica subito per aggiornare i flag hasResults
    closeAddDialog()
  } catch (err: any) {
    toast.error(err.error?.message || t('calendar.errors.saveEvent'))
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
    selectedGridData.value = grid
    
    for (const key in resultsMap) { delete resultsMap[Number(key)] }

    grid.athletes.forEach(athlete => {
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
    Object.entries(resultsMap).forEach(([athId, metrics]) => {
      Object.entries(metrics).forEach(([mId, val]) => {
        if (val !== null && val !== '') {
          const sanitizedVal = String(val).replace(',', '.')
          const parsedVal = parseFloat(sanitizedVal)
          if (!isNaN(parsedVal)) {
            resultsToSave.push({ athleteId: Number(athId), testMetricId: Number(mId), value: parsedVal })
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
    
    // AZIONE FONDAMENTALE: Ricarichiamo gli eventi. 
    // Ora il backend restituirà 'hasResults: true' per questo evento nell'agenda.
    await fetchEvents() 
    
    isTestGridOpen.value = false
  } catch (err: any) {
    toast.error(err.response?.data?.message || t('calendar.errors.saveResults'))
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
            <Button variant="outline" size="icon" @click="changeMonth(-1)"><ChevronLeft /></Button>
            <Button variant="outline" size="icon" @click="changeMonth(1)"><ChevronRight /></Button>
            <Button @click="openAddDialog"><Plus class="mr-1 h-4 w-4" /> {{ t('calendar.addEvent') }}</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-7 text-center text-[10px] font-black uppercase text-muted-foreground mb-4 opacity-50">
            <span v-for="d in (tm('calendar.days') as string[])" :key="d">{{ d }}</span>
          </div>
          <div class="grid grid-cols-7 gap-2">
            <div v-for="(day, i) in getMonthDetails.days" :key="i"
              class="h-24 p-2 border rounded-xl cursor-pointer transition-all hover:bg-accent/50 group" 
              :class="{
                'opacity-20 pointer-events-none bg-muted': !day.isCurrentMonth,
                'border-primary ring-2 ring-primary/20 bg-primary/5': day.date === selectedDate,
                'border-primary/50': day.isToday
              }" @click="day.date && (selectedDate = day.date)">
              <span v-if="day.day" class="text-xs font-bold" :class="{ 'text-primary': day.isToday }">{{ day.day }}</span>
              <div class="flex flex-wrap gap-1 mt-1">
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
                <div class="mt-2 text-[11px] font-medium text-muted-foreground">
                  🕒 {{ event.date ? new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--' }}
                  | 👤 {{ event.athleteFullName }}
                </div>
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button v-if="event.type === 'Test'" variant="outline" size="icon"
                  class="h-8 w-8 rounded-full border-purple-500 text-purple-600 shadow-sm" @click="openTestGrid(event.id)">
                  <ClipboardList class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" class="h-8 w-8 rounded-full" @click="openEditDialog(event.id)"><Pencil class="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" class="h-8 w-8 rounded-full text-destructive" @click="openDeleteDialog(event.id)"><X class="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div v-if="isAddDialogOpen" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card class="w-full max-w-md shadow-2xl border-none">
        <CardHeader><CardTitle class="text-xl font-black uppercase">{{ isEditing ? t('calendar.editSession') : t('calendar.newSession') }}</CardTitle></CardHeader>
        <CardContent class="space-y-4">
          
          <div v-if="isEditing && newEvent.hasResults" class="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-3">
            <AlertCircle class="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <p class="text-[11px] text-amber-800 leading-tight">
              <b>PROPRIETÀ BLOCCATE</b><br>
              Sono presenti risultati per questo test. Non è possibile cambiare il tipo o il protocollo.
            </p>
          </div>

          <div>
            <label class="text-[10px] font-black uppercase text-muted-foreground mb-1 block">{{ t('calendar.form.titleLabel') }}</label>
            <Input v-model="newEvent.title" />
          </div>
          
          <div class="flex gap-4">
            <div class="flex-1">
              <label class="text-[10px] font-black uppercase text-muted-foreground mb-1 block">{{ t('calendar.form.dateLabel') }}</label>
              <Input type="date" v-model="newEvent.date" />
            </div>
            <div class="w-28">
              <label class="text-[10px] font-black uppercase text-muted-foreground mb-1 block">{{ t('calendar.form.timeLabel') }}</label>
              <Input type="time" v-model="newEvent.time" />
            </div>
          </div>

          <div>
            <label class="text-[10px] font-black uppercase text-muted-foreground mb-1 block">{{ t('calendar.form.categoryLabel') }}</label>
            <select v-model="newEvent.type" 
                    :disabled="isEditing && newEvent.hasResults"
                    class="w-full border rounded-md p-2 text-sm bg-background h-10 disabled:bg-muted disabled:opacity-70">
              <option v-for="type in ['Strength', 'Endurance', 'Test', 'Recovery', 'Checkup']" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>

          <div v-if="newEvent.type === 'Test'" class="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <label class="text-[10px] font-black uppercase text-purple-600 mb-2 block">{{ t('calendar.form.protocolLabel') }}</label>
            <select v-model="newEvent.testDefinitionId" 
                    :disabled="isEditing && newEvent.hasResults"
                    class="w-full border rounded-md p-2 text-sm bg-background h-10 border-purple-200 disabled:bg-purple-100/50">
              <option :value="null">{{ t('calendar.form.protocolSelect') }}</option>
              <option v-for="td in testDefinitions" :key="td.id" :value="td.id">{{ td.name }}</option>
            </select>
          </div>
        </CardContent>
        <CardFooter class="flex justify-end gap-2 border-t p-6">
          <Button variant="ghost" @click="closeAddDialog">{{ t('common.cancel') }}</Button>
          <Button @click="handleSaveEvent" :disabled="isLoading">
            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ isEditing ? t('common.update') : t('common.create') }}
          </Button>
        </CardFooter>
      </Card>
    </div>

    <div v-if="isTestGridOpen" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <Card class="w-full max-w-5xl shadow-2xl border-none max-h-[90vh] flex flex-col">
        <CardHeader class="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle class="text-xl font-black uppercase flex items-center gap-2">
            <ClipboardList class="text-purple-500" /> {{ selectedGridData?.testName }}
          </CardTitle>
          <Button variant="ghost" size="icon" @click="isTestGridOpen = false"><X class="h-5 w-5" /></Button>
        </CardHeader>
        <CardContent class="p-0 overflow-auto flex-1">
          <table class="w-full border-collapse">
            <thead class="bg-muted/50 sticky top-0 z-10">
              <tr>
                <th class="p-4 text-left text-[10px] font-black uppercase text-muted-foreground border-b w-64">{{ t('calendar.grid.athlete') }}</th>
                <th v-for="metric in selectedGridData?.metrics" :key="metric.id" class="p-4 text-center text-[10px] font-black uppercase text-muted-foreground border-b min-w-[140px]">
                  {{ metric.name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="athlete in selectedGridData?.athletes" :key="athlete.id" class="border-b hover:bg-accent/5">
                <td class="p-4 font-bold text-sm">{{ athlete.fullName }}</td>
                <td v-for="metric in selectedGridData?.metrics" :key="metric.id" class="p-2 text-center">
                  <input 
                    class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-none text-center font-mono focus-visible:ring-1 focus-visible:ring-purple-500"
                    :class="{ 'border-blue-400 bg-blue-50/30': metric.dataType === 1, 'border-purple-400 bg-purple-50/30': metric.dataType === 2 }" 
                    :value="resultsMap[athlete.id]?.[metric.id] || ''"
                    @change="(e: any) => updateValue(athlete.id, metric.id, e.target.value)"
                    :placeholder="getPlaceholder(metric.dataType)" 
                  />
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
        <DialogHeader><DialogTitle>{{ t('calendar.delete.title') }}</DialogTitle></DialogHeader>
        <div class="py-4">
          <p class="text-sm text-muted-foreground">{{ t('calendar.delete.description') }}</p>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" @click="isDeleteDialogOpen = false">{{ t('common.cancel') }}</Button>
          <Button variant="destructive" @click="confirmDelete" :disabled="isDeleting">
            <Loader2 v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin" />
            {{ t('common.delete') }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>