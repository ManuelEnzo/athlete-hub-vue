<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ChevronLeft, ChevronRight, Plus, X, Loader2 } from 'lucide-vue-next'
import { athleteApi } from '../../api/business'
import type { CalendarEventResponse, CalendarEventCreateRequest } from '@/types/api'

// --- Definizioni Tipi ---
interface CalendarDay {
  day: number | null
  date: string | null
  isCurrentMonth: boolean
  isToday?: boolean
}

// --- Stato ---
const events = ref<CalendarEventResponse[]>([])
const isLoading = ref(false)
const isDialogOpen = ref(false)

const dateNow = new Date()
const currentMonth = ref(dateNow.getMonth())
const currentYear = ref(dateNow.getFullYear())

const todayStr = dateNow.toISOString().split('T')[0]!
const selectedDate = ref<string>(todayStr)

const newEvent = ref({
  athleteId: null as number | null,
  title: '',
  date: selectedDate.value,
  time: '09:00',
  type: 'Forza',
  focus: '',
  targetRPE: 5
})

const eventTypes = [
  { type: 'Forza', color: 'bg-red-500' },
  { type: 'Resistenza', color: 'bg-green-500' },
  { type: 'Test', color: 'bg-purple-500' },
  { type: 'Recupero', color: 'bg-yellow-500' },
  { type: 'Visita', color: 'bg-blue-500' },
]

// --- Logica API ---
const fetchEvents = async () => {
  isLoading.value = true
  try {
    const response = await athleteApi.getAllEvents(currentMonth.value + 1, currentYear.value)
    if (response.data.isSuccess) {
      events.value = response.data.value || []
    }
  } catch (error) {
    console.error("Errore caricamento eventi", error)
  } finally {
    isLoading.value = false
  }
}

const handleAddEvent = async () => {
  if (!newEvent.value.title || !newEvent.value.date) return
  const payload: CalendarEventCreateRequest = {
    title: newEvent.value.title,
    athleteId: newEvent.value.athleteId,
    date: `${newEvent.value.date}T${newEvent.value.time}:00`,
    type: newEvent.value.type,
    focus: newEvent.value.focus,
    targetRPE: newEvent.value.targetRPE
  }
  try {
    const response = await athleteApi.createEvent(payload)
    if (response.data.isSuccess) {
      await fetchEvents()
      isDialogOpen.value = false
      resetForm()
    }
  } catch (error) {
    alert("Errore salvataggio")
  }
}

const handleDeleteEvent = async (id: number) => {
  if (!confirm("Eliminare?")) return
  try {
    const response = await athleteApi.deleteEvent(id)
    if (response.data.isSuccess) events.value = events.value.filter(e => e.id !== id)
  } catch (error) { console.error(error) }
}

// --- Helper Calendario ---
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
  return { days, monthName: date.toLocaleString('it-IT', { month: 'long', year: 'numeric' }) }
})

const changeMonth = (delta: number) => {
  const newDate = new Date(currentYear.value, currentMonth.value + delta, 1)
  currentMonth.value = newDate.getMonth()
  currentYear.value = newDate.getFullYear()
  fetchEvents()
}

const handleDayClick = (day: CalendarDay) => {
  if (day.date) {
    selectedDate.value = day.date
    newEvent.value.date = day.date
  }
}

const eventsForSelectedDay = computed(() => {
  return events.value
    .filter(e => e.date && e.date.startsWith(selectedDate.value))
    .sort((a, b) => a.date.localeCompare(b.date))
})

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}

const resetForm = () => {
  newEvent.value = { athleteId: null, title: '', date: selectedDate.value, time: '09:00', type: 'Forza', focus: '', targetRPE: 5 }
}

onMounted(fetchEvents)
</script>

<template>
  <div class="w-full flex flex-col gap-6">
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">

      <Card class="col-span-1 xl:col-span-2">
        <CardHeader class="flex flex-row items-center justify-between">
          <CardTitle class="capitalize flex items-center gap-2">
            {{ getMonthDetails.monthName }}
            <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin text-blue-500" />
          </CardTitle>
          <div class="flex items-center space-x-2">
            <Button variant="outline" size="icon" @click="changeMonth(-1)"><ChevronLeft class="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" @click="changeMonth(1)"><ChevronRight class="h-4 w-4" /></Button>
            <Button @click="isDialogOpen = true"><Plus class="h-4 w-4 mr-2" /> Nuovo</Button>
          </div>
        </CardHeader>

        <CardContent>
          <div class="grid grid-cols-7 text-center font-medium text-gray-500 mb-2">
            <span>Lun</span><span>Mar</span><span>Mer</span><span>Gio</span><span>Ven</span><span>Sab</span><span>Dom</span>
          </div>
          <div class="grid grid-cols-7 gap-1">
            <div v-for="(day, index) in getMonthDetails.days" :key="index"
              class="h-16 p-1 cursor-pointer transition border rounded-lg"
              :class="{
                  'opacity-40 pointer-events-none border-dashed': !day.isCurrentMonth,
                  'border-blue-500 ring-2 ring-blue-500/50': day.date === selectedDate,
                  'bg-gray-50': day.isToday && day.date !== selectedDate,
              }"
              @click="handleDayClick(day)"
            >
              <span v-if="day.day" class="text-sm font-semibold block text-center">{{ day.day }}</span>
              <div class="flex flex-wrap justify-center mt-1">
                <template v-if="day.date">
                  <div v-for="event in events.filter(e => e.date.startsWith(day.date!))" :key="event.id"
                      :class="[eventTypes.find(t => t.type === event.type)?.color || 'bg-gray-400']"
                      class="w-2 h-2 rounded-full mx-0.5 shadow-sm">
                  </div>
                </template>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="col-span-1">
        <CardHeader>
          <CardTitle>Dettagli {{ selectedDate }}</CardTitle>
          <CardDescription>{{ eventsForSelectedDay.length }} attività pianificate</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3 max-h-[500px] overflow-y-auto">
          <div v-if="eventsForSelectedDay.length === 0" class="text-center text-gray-400 py-10 italic">Nessun evento</div>
          <div v-for="event in eventsForSelectedDay" :key="event.id" class="border-l-4 p-3 rounded-r-md "
               :class="{
                 'border-red-500': event.type === 'Forza', 'border-green-500': event.type === 'Resistenza',
                 'border-purple-500': event.type === 'Test', 'border-yellow-500': event.type === 'Recupero', 'border-blue-500': event.type === 'Visita'
               }">
            <div class="flex justify-between items-start">
              <h4 class="font-semibold">{{ event.title }}</h4>
              <Button variant="ghost" size="icon" class="h-6 w-6" @click="handleDeleteEvent(event.id)"><X class="h-4 w-4" /></Button>
            </div>
            <p class="text-xs text-gray-600">🕒 {{ formatTime(event.date) }} | 👤 <b>{{ event.athleteFullName }}</b></p>
            <span class="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold mt-2 uppercase tracking-wide"
                  :class="{'bg-red-100 text-red-800': event.type === 'Forza', 'bg-green-100 text-green-800': event.type === 'Resistenza', 'bg-purple-100 text-purple-800': event.type === 'Test', 'bg-yellow-100 text-yellow-800': event.type === 'Recupero', 'bg-blue-100 text-blue-800': event.type === 'Visita'}">
                {{ event.type }}
            </span>
          </div>
        </CardContent>
      </Card>

      <div v-if="isDialogOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card class="w-full max-w-md shadow-2xl border-none">
          <CardHeader class="rounded-t-xl"><CardTitle>Nuova Sessione</CardTitle></CardHeader>
          <CardContent class="p-6 space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Titolo</label>
              <Input v-model="newEvent.title" placeholder="Inserisci titolo..." />
            </div>
            <div class="flex space-x-4">
              <div class="flex-1">
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
                <Input type="date" v-model="newEvent.date" />
              </div>
              <div class="flex-1">
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Orario</label>
                <Input type="time" v-model="newEvent.time" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo Evento</label>
              <select v-model="newEvent.type"
                class="w-full h-10 px-3 border border-gray-200 rounded-md bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm">
                <option v-for="type in eventTypes" :key="type.type" :value="type.type" class="bg-white text-gray-900">
                  {{ type.type }}
                </option>
              </select>
            </div>
          </CardContent>
          <CardFooter class="flex justify-end gap-2 rounded-b-xl  border-gray-100">
            <Button variant="outline" @click="isDialogOpen = false">Annulla</Button>
            <Button @click="handleAddEvent" class="bg-blue-600">Crea Evento</Button>
          </CardFooter>
        </Card>
      </div>

    </div>
  </div>
</template>