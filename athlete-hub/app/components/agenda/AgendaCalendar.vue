<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-vue-next'
// Assumiamo che Card, Button, Input, Select, Dialog siano componenti base disponibili (es. da Shadcn-Vue)

// ------------------------------------------
// 1. Definizioni Tipi e Logica Calendario
// ------------------------------------------

interface CalendarEvent {
  id: number
  athlete: string | 'Gruppo'
  title: string
  date: string // Formato 'YYYY-MM-DD'
  time: string // Formato 'HH:MM'
  type: 'Forza' | 'Resistenza' | 'Test' | 'Recupero' | 'Visita'
  color: string
}

interface CalendarDay {
  day: number | null;
  date: string | null;
  isCurrentMonth: boolean;
  isToday?: boolean;
}

const events = ref<CalendarEvent[]>([
  { id: 1, athlete: 'Marco R.', title: 'Test 30m Sprint', date: '2025-12-15', time: '10:00', type: 'Test', color: 'bg-red-500' },
  { id: 2, athlete: 'Gruppo A', title: 'Allenamento Resistenza', date: '2025-12-17', time: '16:00', type: 'Resistenza', color: 'bg-green-500' },
  { id: 3, athlete: 'Laura B.', title: 'Visita Fisioterapica', date: '2025-12-19', time: '09:30', type: 'Visita', color: 'bg-blue-500' },
  { id: 4, athlete: 'Gruppo B', title: 'Recupero Attivo', date: '2025-12-17', time: '11:00', type: 'Recupero', color: 'bg-yellow-500' },
])

// Stato del calendario: Tipizzazione esplicita
const dateNow: Date = new Date()
const currentMonth = ref<number>(dateNow.getMonth()) 
const currentYear = ref<number>(dateNow.getFullYear()) 

// CORREZIONE ALLA RIGA 38/40: Uso dell'operatore ! per garantire che l'indice [0] non sia undefined
const today: string = dateNow.toISOString().split('T')[0]! 
const selectedDate = ref<string>(today) 

// Helper per ottenere i giorni del mese
const getMonthDetails = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value, 1)
  const firstDay = date.getDay() 
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const startDay = firstDay === 0 ? 6 : firstDay - 1 

  const days: CalendarDay[] = [] 
  
  // Giorni vuoti all'inizio
  for (let i = 0; i < startDay; i++) {
    days.push({ day: null, date: null, isCurrentMonth: false }) 
  }
  // Giorni del mese
  for (let i = 1; i <= daysInMonth; i++) {
    const fullDate = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    days.push({ day: i, date: fullDate, isCurrentMonth: true, isToday: fullDate === today })
  }
  return { days, monthName: date.toLocaleString('it-IT', { month: 'long', year: 'numeric' }) }
})

// Funzioni di navigazione
const changeMonth = (delta: number) => {
  const newDate = new Date(currentYear.value, currentMonth.value + delta, 1)
  currentMonth.value = newDate.getMonth()
  currentYear.value = newDate.getFullYear()
}

const selectDay = (date: string) => {
  selectedDate.value = date
}

const handleDayClick = (day: CalendarDay) => {
  if (day.date) { 
    selectDay(day.date)
    newEvent.value.date = day.date 
  }
}

// Eventi per il giorno selezionato
const eventsForSelectedDay = computed(() => {
  return events.value
    .filter(e => e.date === selectedDate.value)
    .sort((a, b) => a.time.localeCompare(b.time))
})

// ------------------------------------------
// 2. Logica Aggiungi Evento (Dialog Modale)
// ------------------------------------------

const isDialogOpen = ref(false)
const newEvent = ref({
  athlete: '',
  title: '',
  date: selectedDate.value, 
  time: '09:00',
  type: 'Forza',
})

const eventTypes = [
  { type: 'Forza', color: 'bg-red-500' },
  { type: 'Resistenza', color: 'bg-green-500' },
  { type: 'Test', color: 'bg-purple-500' },
  { type: 'Recupero', color: 'bg-yellow-500' },
  { type: 'Visita', color: 'bg-blue-500' },
]

const addEvent = () => {
  if (newEvent.value.title && newEvent.value.date) {
    const typeData = eventTypes.find(t => t.type === newEvent.value.type)
    const color = typeData ? typeData.color : 'bg-gray-500'
    
    events.value.push({
      id: Date.now(),
      athlete: newEvent.value.athlete || 'Gruppo',
      title: newEvent.value.title,
      date: newEvent.value.date,
      time: newEvent.value.time,
      type: newEvent.value.type as 'Forza' | 'Resistenza' | 'Test' | 'Recupero' | 'Visita',
      color: color,
    })

    // Reset e chiusura
    newEvent.value = { athlete: '', title: '', date: selectedDate.value, time: '09:00', type: 'Forza' }
    isDialogOpen.value = false
  }
}

const openDialogForDate = (date: string) => { 
    selectedDate.value = date;
    newEvent.value.date = date; 
    isDialogOpen.value = true;
}
</script>

<template>
  <div class="w-full flex flex-col gap-6">
    <div class="grid grid-cols-1 gap-6 @xl:grid-cols-3">
        
      <Card class="col-span-1 @xl:col-span-2">
        <CardHeader class="flex flex-row items-center justify-between">
          <CardTitle class="capitalize">{{ getMonthDetails.monthName }}</CardTitle>
          <div class="flex items-center space-x-2">
            <Button variant="outline" size="icon" @click="changeMonth(-1)">
              <ChevronLeft class="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" @click="changeMonth(1)">
              <ChevronRight class="h-4 w-4" />
            </Button>
            <Button @click="openDialogForDate(selectedDate)">
              <Plus class="h-4 w-4 mr-2" /> Aggiungi Evento
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div class="grid grid-cols-7 text-center font-medium text-gray-500 mb-2">
            <span>Lun</span><span>Mar</span><span>Mer</span><span>Gio</span><span>Ven</span><span>Sab</span><span>Dom</span>
          </div>
          <div class="grid grid-cols-7 gap-1">
            <div v-for="(day, index) in getMonthDetails.days" :key="index"
              class="h-16 p-1 cursor-pointer transition duration-150 ease-in-out border rounded-lg"
              :class="{ 
                  'opacity-50 pointer-events-none border-dashed': !day.isCurrentMonth,
                  'border-blue-500 ring-2 ring-blue-500/50': day.date === selectedDate,
                  'bg-gray-100': day.isToday && day.date !== selectedDate,
              }"
              @click="handleDayClick(day)" 
            >
              <span v-if="day.day" class="text-sm font-semibold block text-center">{{ day.day }}</span>
              <div class="flex flex-wrap justify-center mt-1">
                  <template v-if="day.date">
                    <div v-for="event in events.filter(e => e.date === day.date)" :key="event.id"
                        :class="[event.color]"
                        class="w-2 h-2 rounded-full mx-0.5"
                        :title="event.title">
                    </div>
                  </template>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="col-span-1">
        <CardHeader>
          <CardTitle>Dettagli per il {{ selectedDate }}</CardTitle>
          <CardDescription>{{ eventsForSelectedDay.length }} eventi in programma.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3 max-h-[500px] overflow-y-auto">
          <div v-if="eventsForSelectedDay.length === 0" class="text-center text-gray-500 py-4">
            Nessun evento pianificato.
            <Button variant="link" @click="openDialogForDate(selectedDate)" class="mt-2 block">Aggiungi ora!</Button>
          </div>

          <div v-for="event in eventsForSelectedDay" :key="event.id"
               class="border-l-4 p-3 rounded-r-md shadow-sm"
               :class="{'border-red-500': event.type === 'Forza', 'border-green-500': event.type === 'Resistenza', 'border-purple-500': event.type === 'Test', 'border-yellow-500': event.type === 'Recupero', 'border-blue-500': event.type === 'Visita'}"
          >
            <div class="flex justify-between items-start">
                <h4 class="font-semibold">{{ event.title }}</h4>
                <Button variant="ghost" size="icon" class="h-6 w-6 opacity-50 hover:opacity-100" title="Elimina Evento">
                    <X class="h-4 w-4" />
                </Button>
            </div>
            <p class="text-sm text-gray-600 mt-1">
              🕒 {{ event.time }} | 
              👤 **{{ event.athlete }}**
            </p>
            <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1"
                  :class="{'bg-red-100 text-red-800': event.type === 'Forza', 'bg-green-100 text-green-800': event.type === 'Resistenza', 'bg-purple-100 text-purple-800': event.type === 'Test', 'bg-yellow-100 text-yellow-800': event.type === 'Recupero', 'bg-blue-100 text-blue-800': event.type === 'Visita'}">
                {{ event.type }}
            </span>
          </div>
        </CardContent>
      </Card>

      <div v-if="isDialogOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card class="w-full max-w-md">
          <CardHeader>
            <CardTitle>Aggiungi Nuova Sessione/Appuntamento</CardTitle>
            <CardDescription>Pianifica un evento per il {{ newEvent.date }}.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Titolo</label>
              <Input v-model="newEvent.title" placeholder="Es. Test Yoyo / Sessione Forza" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Atleta/Gruppo</label>
              <Input v-model="newEvent.athlete" placeholder="Es. Marco Rossi o Gruppo A" />
            </div>
            <div class="flex space-x-4">
              <div class="flex-1">
                <label class="block text-sm font-medium mb-1">Data</label>
                <Input type="date" v-model="newEvent.date" />
              </div>
              <div class="flex-1">
                <label class="block text-sm font-medium mb-1">Orario</label>
                <Input type="time" v-model="newEvent.time" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Tipo Evento</label>
              <select v-model="newEvent.type" class="w-full p-2 border rounded-md">
                <option v-for="type in eventTypes" :key="type.type" :value="type.type">{{ type.type }}</option>
              </select>
            </div>
          </CardContent>
          <CardFooter class="flex justify-end space-x-2">
            <Button variant="outline" @click="isDialogOpen = false">Annulla</Button>
            <Button @click="addEvent" :disabled="!newEvent.title || !newEvent.date">Crea Evento</Button>
          </CardFooter>
        </Card>
      </div>

    </div>
  </div>
</template>