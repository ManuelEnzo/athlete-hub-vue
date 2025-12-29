<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ChevronLeft, ChevronRight, Plus, X,
  Calendar as CalendarIcon, AlertTriangle, Pencil,
  ClipboardList, Save, Loader2
} from 'lucide-vue-next'
import { athleteApi } from '../../api/business'
import type {
  CalendarEventResponse,
  CalendarEventCreateRequest,
  AthleteResponse,
  TestResultSaveDto
} from '@/types/api'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'vue-sonner'

// --- INTERFACCE OGGETTI DTO ---
interface MetricDto {
  id: number
  name: string
  unit: string
}

interface AthleteEntryDto {
  id: number
  fullName: string
  tempResults?: Record<number, string> // Corrisponde al Dictionary<long, string> C#
}

interface TestEntryGridDto {
  eventId: number
  testName: string
  metrics: MetricDto[]
  athletes: AthleteEntryDto[]
}

interface SimplifiedEvent {
  id: number
  title: string
  time: string
  athleteFullName: string
  type: string
  testDefinitionId?: number | null
  borderClass: string
}

interface CalendarDay {
  day: number | null
  date: string | null
  isCurrentMonth: boolean
  isToday?: boolean
}

// --- STATO ---
const { t, tm } = useI18n()
const events = ref<CalendarEventResponse[]>([])
const athletes = ref<AthleteResponse[]>([])
const testDefinitions = ref<any[]>([])
const isLoading = ref(false)

// Stati Modali
const isAddDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isTestGridOpen = ref(false)
const isDeleting = ref(false)
const eventToDeleteId = ref<number | null>(null)

const isEditing = ref(false)
const editingEventId = ref<number | null>(null)

// Tipizzazione forte dell'oggetto griglia
const selectedGridData = ref<TestEntryGridDto | null>(null)

const dateNow = new Date()
const currentMonth = ref(dateNow.getMonth())
const currentYear = ref(dateNow.getFullYear())
const todayStr = new Date().toISOString().split('T')[0] ?? ''
const selectedDate = ref<string>(todayStr)

// Mappa reattiva per gli input della griglia [AthleteId][MetricId] = Valore
const resultsMap = ref<Record<number, Record<number, string>>>({})

const newEvent = ref({
  athleteIds: [] as number[],
  title: '',
  date: todayStr,
  time: '09:00',
  type: 'Strength',
  focus: '',
  targetRPE: 5,
  testDefinitionId: null as number | null
})

// --- LOGICA DATI ---
const eventsForSelectedDay = computed<SimplifiedEvent[]>(() => {
  return events.value
    .filter(e => (e.date ?? '').startsWith(selectedDate.value))
    .map(e => ({
      id: e.id,
      title: e.title ?? 'Senza Titolo',
      time: e.date ? new Date(e.date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '--:--',
      athleteFullName: e.athleteFullName ?? 'N/A',
      type: e.type ?? 'Strength',
      testDefinitionId: (e as any).testDefinitionId,
      borderClass: `relative border-l-4 p-4 rounded-r-xl bg-card shadow-sm border ${getBorderColor(e.type ?? '')}`
    }))
})

const getMonthDetails = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value, 1)
  const firstDay = (date.getDay() + 6) % 7
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const days: CalendarDay[] = []
  for (let i = 0; i < firstDay; i++) days.push({ day: null, date: null, isCurrentMonth: false })
  for (let i = 1; i <= daysInMonth; i++) {
    const fullDate = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    days.push({ day: i, date: fullDate, isCurrentMonth: true, isToday: fullDate === todayStr })
  }
  return { days, monthName: `${t(`calendar.months.${currentMonth.value}`)} ${currentYear.value}` }
})

// --- HELPER UI ---
const getBorderColor = (type: string): string => {
  const map: Record<string, string> = {
    'Strength': 'border-red-500', 'Endurance': 'border-green-500',
    'Test': 'border-purple-500', 'Recovery': 'border-yellow-500', 'Checkup': 'border-blue-500'
  }
  return map[type] || 'border-gray-500'
}

const getDotColor = (type: string): string => {
  const map: Record<string, string> = {
    'Strength': 'bg-red-500', 'Endurance': 'bg-green-500',
    'Test': 'bg-purple-500', 'Recovery': 'bg-yellow-500', 'Checkup': 'bg-blue-500'
  }
  return map[type] || 'bg-gray-400'
}

// --- AZIONI ---
const updateValue = (athleteId: number, metricId: number, val: string | number) => {
  if (!resultsMap.value[athleteId]) resultsMap.value[athleteId] = {}
  resultsMap.value[athleteId][metricId] = String(val)
}

const fetchEvents = async () => {
  isLoading.value = true
  try {
    const res = await athleteApi.getAllEvents(currentMonth.value + 1, currentYear.value)
    if (res.data.isSuccess) events.value = res.data.value || []
  } finally { isLoading.value = false }
}

const closeAddDialog = () => {
  isAddDialogOpen.value = false
  isEditing.value = false
  editingEventId.value = null
  newEvent.value = { athleteIds: [], title: '', date: selectedDate.value, time: '09:00', type: 'Strength', focus: '', targetRPE: 5, testDefinitionId: null }
}

const openEditDialog = (id: number) => {
  const event = events.value.find(e => e.id === id)
  if (!event) return

  isEditing.value = true
  editingEventId.value = event.id
  const [d, t_raw] = (event.date || "").split('T')

  newEvent.value = {
    athleteIds: (event as any).participantIds ? (event as any).participantIds.map((v: any) => Number(v)) : [],
    title: event.title ?? "",
    date: d || todayStr,
    time: t_raw ? t_raw.substring(0, 5) : '09:00',
    type: event.type ?? 'Strength',
    focus: (event as any).focus || '',
    targetRPE: (event as any).targetRPE || 5,
    testDefinitionId: (event as any).testDefinitionId || null
  }
  isAddDialogOpen.value = true
}

const handleSaveEvent = async () => {
  if (newEvent.value.athleteIds.length === 0) return toast.error(t('calendar.form.selectAthlete'))

  const payload: CalendarEventCreateRequest = {
    ...newEvent.value,
    date: `${newEvent.value.date}T${newEvent.value.time}:00`,
    testDefinitionId: newEvent.value.type === 'Test' ? newEvent.value.testDefinitionId : null
  }

  const res = isEditing.value && editingEventId.value
    ? await athleteApi.updateEvent(editingEventId.value, payload)
    : await athleteApi.createEvent(payload)

  if (res.data.isSuccess) {
    toast.success(t(`calendar.toast.${isEditing.value ? 'updated' : 'created'}`))
    await fetchEvents()
    closeAddDialog()
  }
}

const confirmDelete = async () => {
  if (!eventToDeleteId.value) return
  isDeleting.value = true
  try {
    const res = await athleteApi.deleteEvent(eventToDeleteId.value)
    if (res.data.isSuccess) {
      toast.success(t('calendar.toast.deleted'))
      await fetchEvents()
      isDeleteDialogOpen.value = false
    }
  } finally { isDeleting.value = false }
}

const openTestGrid = async (eventId: number) => {
  try {
    const res = await athleteApi.getTestGrid(eventId);
    
    // Verifichiamo che la risposta e il valore esistano
    if (res.data.isSuccess && res.data.value) {
      const grid: TestEntryGridDto = res.data.value;
      selectedGridData.value = grid;
      
      const tempMap: Record<number, Record<number, string>> = {};

      // USIAMO IL FOR...OF: Questo garantisce che 'athlete' sia definito
      for (const athlete of grid.athletes) {
        // Se per qualche motivo assurdo l'atleta fosse nullo, saltiamo
        if (!athlete) continue;

        const athleteId = athlete.id;
        const athleteResults: Record<number, string> = {};
        
        // Estraiamo tempResults in una costante per sicurezza
        const results = athlete.tempResults;
        
        if (results) {
          // Object.keys ci permette di iterare sulle chiavi del Dictionary C#
          for (const mId of Object.keys(results)) {
            const metricId = Number(mId);
            const rawValue = results[metricId];
            
            // TypeScript ora sa che rawValue viene da un oggetto esistente
            if (rawValue !== undefined && rawValue !== null) {
              athleteResults[metricId] = String(rawValue).replace('.', ',');
            }
          }
        }
        
        // Inseriamo i risultati nella mappa principale
        tempMap[athleteId] = athleteResults;
      }
      
      resultsMap.value = tempMap;
      isTestGridOpen.value = true;
    }
  } catch (err) { 
    toast.error("Errore nel caricamento della griglia");
    console.error(err);
  }
};

const saveTestResults = async () => {
  // Riferimento locale per garantire che non sia undefined durante l'esecuzione
  const grid = selectedGridData.value;
  if (!grid) return;

  isLoading.value = true;
  const resultsToSave: TestResultSaveDto[] = [];

  Object.entries(resultsMap.value).forEach(([athId, metrics]) => {
    Object.entries(metrics).forEach(([mId, val]) => {
      if (val !== null && val !== '') {
        resultsToSave.push({
          athleteId: Number(athId),
          testMetricId: Number(mId),
          // Convertiamo la virgola in punto per il backend C#
          value: parseFloat(String(val).replace(',', '.'))
        });
      }
    });
  });

  try {
    const res = await athleteApi.saveTestResults(grid.eventId, resultsToSave);
    
    if (res.data.isSuccess) {
      toast.success("Risultati salvati con successo");
      // Ricarichiamo la griglia per sincronizzare i dati (conferma visiva)
      await openTestGrid(grid.eventId);
    }
  } catch (err) {
    toast.error("Errore durante il salvataggio");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchEvents()
  athleteApi.getAll().then(res => athletes.value = res.data.value || [])
  athleteApi.getTestDefinitions().then(res => testDefinitions.value = res.data.value || [])
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
            <Button variant="outline" size="icon" @click="currentMonth--"><ChevronLeft /></Button>
            <Button variant="outline" size="icon" @click="currentMonth++"><ChevronRight /></Button>
            <Button @click="isAddDialogOpen = true"><Plus class="mr-1 h-4 w-4" /> {{ t('calendar.addEvent') }}</Button>
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
              <span v-if="day.day" class="text-xs font-bold" :class="{'text-primary': day.isToday}">{{ day.day }}</span>
              <div class="flex flex-wrap gap-1 mt-1">
                <div v-for="e in events.filter(ev => (ev.date ?? '').startsWith(day.date || ''))" :key="e.id"
                  :class="getDotColor(e.type ?? '')" class="w-2 h-2 rounded-full shadow-sm"></div>
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
          <div v-if="eventsForSelectedDay.length === 0" class="py-20 text-center text-muted-foreground italic text-sm">
            {{ t('calendar.noEvents') }}
          </div>

          <div v-for="event in eventsForSelectedDay" :key="event.id" :class="event.borderClass" class="group transition-all hover:translate-x-1">
            <div class="flex justify-between items-start">
              <div>
                <span class="font-black text-[10px] uppercase text-primary/80 block mb-1">{{ event.type }}</span>
                <span class="font-bold text-sm leading-tight">{{ event.title }}</span>
                <div class="mt-2 text-[11px] font-medium text-muted-foreground">🕒 {{ event.time }} | 👤 {{ event.athleteFullName }}</div>
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button v-if="event.type === 'Test'" variant="outline" size="icon" class="h-8 w-8 rounded-full border-purple-500 text-purple-600" @click="openTestGrid(event.id)">
                  <ClipboardList class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" class="h-8 w-8 rounded-full" @click="openEditDialog(event.id)">
                  <Pencil class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" class="h-8 w-8 rounded-full text-destructive" @click="eventToDeleteId = event.id; isDeleteDialogOpen = true">
                  <X class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div v-if="isAddDialogOpen" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card class="w-full max-w-md shadow-2xl border-none">
        <CardHeader><CardTitle class="text-xl font-black uppercase">{{ isEditing ? t('calendar.form.update') : t('calendar.newSession') }}</CardTitle></CardHeader>
        <CardContent class="space-y-4">
          <div>
            <label class="text-[10px] font-black uppercase text-muted-foreground mb-1 block">{{ t('calendar.form.titleLabel') }}</label>
            <Input v-model="newEvent.title" :placeholder="t('calendar.form.titlePlaceholder')" />
          </div>
          <div>
            <label class="text-[10px] font-black uppercase text-muted-foreground mb-1 block">{{ t('calendar.form.participants') }} ({{ newEvent.athleteIds.length }})</label>
            <div class="border rounded-xl p-3 max-h-40 overflow-y-auto bg-muted/30">
              <div v-for="a in athletes" :key="a.id" class="flex items-center space-x-3 p-2 hover:bg-accent rounded-lg cursor-pointer">
                <input type="checkbox" :id="'ath-'+a.id" :value="Number(a.id)" v-model="newEvent.athleteIds" class="h-4 w-4 rounded border-primary text-primary" />
                <label :for="'ath-'+a.id" class="text-sm font-medium cursor-pointer w-full">{{ a.firstName }} {{ a.lastName }}</label>
              </div>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex-1"><label class="text-[10px] font-black uppercase text-muted-foreground mb-1 block">{{ t('calendar.form.dateLabel') }}</label><Input type="date" v-model="newEvent.date" /></div>
            <div class="w-28"><label class="text-[10px] font-black uppercase text-muted-foreground mb-1 block">{{ t('calendar.form.timeLabel') }}</label><Input type="time" v-model="newEvent.time" /></div>
          </div>
          <div>
            <label class="text-[10px] font-black uppercase text-muted-foreground mb-1 block">{{ t('calendar.form.categoryLabel') }}</label>
            <select v-model="newEvent.type" class="w-full border rounded-md p-2 text-sm bg-background h-10">
              <option value="Strength">Strength</option><option value="Endurance">Endurance</option>
              <option value="Test">Test</option><option value="Recovery">Recovery</option><option value="Checkup">Checkup</option>
            </select>
          </div>
          <div v-if="newEvent.type === 'Test'" class="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <label class="text-[10px] font-black uppercase text-purple-600 mb-2 block">{{ t('calendar.form.protocolLabel') }}</label>
            <select v-model="newEvent.testDefinitionId" class="w-full border rounded-md p-2 text-sm bg-background h-10 border-purple-200">
              <option :value="null">{{ t('calendar.form.protocolSelect') }}</option>
              <option v-for="td in testDefinitions" :key="td.id" :value="td.id">{{ td.name }}</option>
            </select>
          </div>
        </CardContent>
        <CardFooter class="flex justify-end gap-2 border-t p-6">
          <Button variant="ghost" @click="closeAddDialog">{{ t('common.cancel') }}</Button>
          <Button @click="handleSaveEvent" class="px-8 shadow-lg shadow-primary/20">{{ isEditing ? t('common.update') : t('common.create') }}</Button>
        </CardFooter>
      </Card>
    </div>

    <div v-if="isDeleteDialogOpen" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <Card class="w-full max-w-sm border-none shadow-2xl">
        <CardHeader class="text-center">
          <div class="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4"><AlertTriangle class="h-6 w-6 text-destructive" /></div>
          <CardTitle>{{ t('calendar.delete.title') }}</CardTitle>
          <CardDescription>{{ t('calendar.delete.description') }}</CardDescription>
        </CardHeader>
        <CardFooter class="flex gap-2">
          <Button variant="ghost" class="flex-1" @click="isDeleteDialogOpen = false">{{ t('common.cancel') }}</Button>
          <Button variant="destructive" class="flex-1" @click="confirmDelete" :disabled="isDeleting">
            <Loader2 v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin" />{{ t('common.delete') }}
          </Button>
        </CardFooter>
      </Card>
    </div>

    <div v-if="isTestGridOpen && selectedGridData" class="fixed inset-0 bg-background/95 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
      <Card class="w-full max-w-6xl max-h-[90vh] flex flex-col shadow-3xl border-none">
        <CardHeader class="border-b bg-muted/30 flex flex-row justify-between items-center">
          <div><CardTitle class="text-2xl font-black uppercase">{{ selectedGridData.testName }}</CardTitle></div>
          <Button variant="ghost" size="icon" class="rounded-full" @click="isTestGridOpen = false"><X /></Button>
        </CardHeader>
        <CardContent class="overflow-auto p-0">
          <table class="w-full border-collapse">
            <thead class="bg-muted/50 sticky top-0 z-20 backdrop-blur">
              <tr>
                <th class="p-4 text-left border-b font-black text-[10px] uppercase w-64">Atleta</th>
                <th v-for="m in selectedGridData.metrics" :key="m.id" class="p-4 text-center border-b font-black text-[10px] uppercase text-purple-600">
                  {{ m.name }} ({{ m.unit }})
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="athlete in selectedGridData.athletes" :key="athlete.id" class="hover:bg-primary/5 border-b">
                <td class="p-4 font-bold text-sm">{{ athlete.fullName }}</td>
                <td v-for="m in selectedGridData.metrics" :key="m.id" class="p-2 text-center">
                  <Input 
                    type="text" inputmode="decimal" placeholder="--" 
                    class="text-center font-bold h-10 border-none bg-muted/20"
                    :class="{ 'border-b-2 border-b-blue-400': athlete.tempResults?.[m.id] }"
                    :model-value="resultsMap[athlete.id]?.[m.id] || ''"
                    @update:model-value="(val) => updateValue(athlete.id, m.id, val)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
        <CardFooter class="border-t p-6 flex justify-end gap-3 bg-muted/10">
          <Button variant="outline" @click="isTestGridOpen = false">{{ t('common.cancel') }}</Button>
          <Button @click="saveTestResults" :disabled="isLoading" class="bg-purple-600 hover:bg-purple-700 px-10">
             <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
             <Save v-else class="mr-2 h-4 w-4" /> Salva
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>