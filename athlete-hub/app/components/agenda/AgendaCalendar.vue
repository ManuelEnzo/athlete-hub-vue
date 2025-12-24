<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronLeft, ChevronRight, Plus, X, Loader2, Calendar as CalendarIcon } from 'lucide-vue-next'
import { athleteApi } from '../../api/business'
import type { CalendarEventResponse, CalendarEventCreateRequest, AthleteResponse } from '@/types/api'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'vue-sonner'

// --- Definizioni Tipi ---
interface CalendarDay {
  day: number | null
  date: string | null
  isCurrentMonth: boolean
  isToday?: boolean
}

// --- Stato ---
const { t } = useI18n()
const events = ref<CalendarEventResponse[]>([])
const athletes = ref<AthleteResponse[]>([])
const isLoading = ref(false)
const isDialogOpen = ref(false)

const dateNow = new Date()
const currentMonth = ref(dateNow.getMonth())
const currentYear = ref(dateNow.getFullYear())

const todayStr = dateNow.toISOString().split('T')[0] ?? '' 
const selectedDate = ref<string>(todayStr)

const newEvent = ref({
  athleteId: null as number | null,
  title: '',
  date: todayStr,
  time: '09:00',
  type: 'Strength',
  focus: '',
  targetRPE: 5
})

const eventTypes = [
  { type: 'Strength', color: 'bg-red-500', labelKey: 'eventTypes.Strength' },
  { type: 'Endurance', color: 'bg-green-500', labelKey: 'eventTypes.Endurance' },
  { type: 'Test', color: 'bg-purple-500', labelKey: 'eventTypes.Test' },
  { type: 'Recovery', color: 'bg-yellow-500', labelKey: 'eventTypes.Recovery' },
  { type: 'Checkup', color: 'bg-blue-500', labelKey: 'eventTypes.Checkup' },
]

// --- Logica API ---
const fetchAthletes = async () => {
  try {
    const res = await athleteApi.getAll()
    if (res.data.isSuccess) athletes.value = res.data.value ?? []
  } catch (error) {
    console.error("Errole caricamento atleti", error)
  }
}

const fetchEvents = async () => {
  isLoading.value = true
  try {
    const response = await athleteApi.getAllEvents(currentMonth.value + 1, currentYear.value)
    if (response.data.isSuccess) {
      events.value = response.data.value || []
    }
  } catch (error) {
    toast.error(t('calendar.loadError'))
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
      toast.success(t('calendar.toast.created'))
      await fetchEvents()
      isDialogOpen.value = false
      resetForm()
    }
  } catch (error) {
    toast.error(t('calendar.saveError'))
  }
}

const handleDeleteEvent = async (id: number) => {
  if (!confirm(t('common.deleteQuestion'))) return
  try {
    const response = await athleteApi.deleteEvent(id)
    if (response.data.isSuccess) {
      events.value = events.value.filter(e => e.id !== id)
      toast.success(t('calendar.toast.deleted'))
    }
  } catch (error) { 
    toast.error(t('common.error'))
  }
}

// --- Helper Calendario ---
const getMonthDetails = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value, 1)
  const firstDay = (date.getDay() + 6) % 7
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  
  const monthKey = `calendar.months.${currentMonth.value}`
  const monthName = `${t(monthKey)} ${currentYear.value}`

  const days: CalendarDay[] = []
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: null, date: null, isCurrentMonth: false })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const fullDate = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    days.push({ day: i, date: fullDate, isCurrentMonth: true, isToday: fullDate === todayStr })
  }
  return { days, monthName }
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
  newEvent.value = { 
    athleteId: null, 
    title: '', 
    date: selectedDate.value, 
    time: '09:00', 
    type: 'Strength', 
    focus: '', 
    targetRPE: 5 
  }
}

onMounted(() => {
  fetchEvents()
  fetchAthletes()
})
</script>

<template>
  <div class="w-full flex flex-col gap-6">
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">

      <Card class="col-span-1 xl:col-span-2">
        <CardHeader class="flex flex-row items-center justify-between">
          <CardTitle class="capitalize flex items-center gap-2">
            <CalendarIcon class="h-5 w-5 text-primary" />
            {{ getMonthDetails.monthName }}
            <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin text-blue-500" />
          </CardTitle>
          <div class="flex items-center space-x-2">
            <Button variant="outline" size="icon" @click="changeMonth(-1)"><ChevronLeft class="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" @click="changeMonth(1)"><ChevronRight class="h-4 w-4" /></Button>
            <Button @click="isDialogOpen = true"><Plus class="h-4 w-4 mr-2" /> {{ t('calendar.addEvent') }}</Button>
          </div>
        </CardHeader>

        <CardContent>
          <div class="grid grid-cols-7 text-center font-bold text-xs uppercase text-muted-foreground mb-4 tracking-wider">
            <span v-for="d in t('calendar.days')" :key="d">{{ d }}</span>
          </div>
          <div class="grid grid-cols-7 gap-2">
            <div v-for="(day, index) in getMonthDetails.days" :key="index"
              class="h-20 p-2 cursor-pointer transition-all border rounded-xl relative group"
              :class="{
                  'opacity-30 pointer-events-none bg-muted/20 border-dashed': !day.isCurrentMonth,
                  'border-primary ring-2 ring-primary/20 bg-primary/5': day.date === selectedDate,
                  'hover:border-primary/50 hover:bg-accent': day.isCurrentMonth && day.date !== selectedDate,
                  'bg-secondary/30': day.isToday && day.date !== selectedDate,
              }"
              @click="handleDayClick(day)"
            >
              <span v-if="day.day" class="text-sm font-bold">{{ day.day }}</span>
              <div class="flex flex-wrap gap-1 mt-1">
                <template v-if="day.date">
                  <div v-for="event in events.filter(e => e.date.startsWith(day.date!))" :key="event.id"
                      :class="[eventTypes.find(t => t.type === event.type)?.color || 'bg-gray-400']"
                      class="w-2 h-2 rounded-full shadow-sm">
                  </div>
                </template>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="col-span-1 flex flex-col">
        <CardHeader>
          <CardTitle class="text-lg">{{ t('calendar.eventDetails', { date: new Date(selectedDate).toLocaleDateString() }) }}</CardTitle>
          <CardDescription>{{ t('calendar.scheduledCount', { count: eventsForSelectedDay.length }) }}</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4 flex-1 overflow-y-auto max-h-[600px]">
          <div v-if="eventsForSelectedDay.length === 0" class="text-center text-muted-foreground py-20 italic">
            {{ t('calendar.noEvents') }}
          </div> 
          <div v-for="event in eventsForSelectedDay" :key="event.id" 
               class="relative border-l-4 p-4 rounded-r-xl bg-card shadow-sm border"
               :class="{
                 'border-red-500': event.type === 'Strength', 
                 'border-green-500': event.type === 'Endurance',
                 'border-purple-500': event.type === 'Test', 
                 'border-yellow-500': event.type === 'Recovery', 
                 'border-blue-500': event.type === 'Checkup'
               }">
            <div class="flex justify-between items-start mb-1">
              <h4 class="font-bold text-sm uppercase tracking-tight">{{ event.title }}</h4>
              <Button variant="ghost" size="icon" class="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive" @click="handleDeleteEvent(event.id)">
                <X class="h-4 w-4" />
              </Button>
            </div>
            <div class="space-y-1">
               <p class="text-xs font-medium text-muted-foreground flex items-center gap-1">
                 🕒 {{ formatTime(event.date) }}
               </p>
               <p class="text-xs font-medium text-muted-foreground flex items-center gap-1">
                 👤 {{ event.athleteFullName }}
               </p>
            </div>
            <div class="mt-3">
              <span class="inline-block rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm"
                    :class="{
                      'bg-red-100 text-red-700': event.type === 'Strength', 
                      'bg-green-100 text-green-700': event.type === 'Endurance', 
                      'bg-purple-100 text-purple-700': event.type === 'Test', 
                      'bg-yellow-100 text-yellow-700': event.type === 'Recovery', 
                      'bg-blue-100 text-blue-700': event.type === 'Checkup'
                    }">
                {{ t('eventTypes.' + event.type) }}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div v-if="isDialogOpen" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card class="w-full max-w-md shadow-2xl border animate-in zoom-in-95 duration-200">
          <CardHeader>
            <CardTitle>{{ t('calendar.newSession') }}</CardTitle>
            <CardDescription>{{ t('calendar.form.description') }}</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <label class="text-[10px] font-black uppercase text-muted-foreground mb-1 block">{{ t('calendar.form.title') }}</label>
              <Input v-model="newEvent.title" :placeholder="t('calendar.form.titlePlaceholder')" />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-[10px] font-black uppercase text-muted-foreground mb-1 block">{{ t('calendar.form.date') }}</label>
                <Input type="date" v-model="newEvent.date" />
              </div>
              <div>
                <label class="text-[10px] font-black uppercase text-muted-foreground mb-1 block">{{ t('calendar.form.time') }}</label>
                <Input type="time" v-model="newEvent.time" />
              </div>
            </div>

            <div>
              <label class="text-[10px] font-black uppercase text-muted-foreground mb-1 block">{{ t('calendar.form.athlete') }}</label>
              <select v-model="newEvent.athleteId" 
                class="w-full h-10 px-3 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary outline-none">
                <option :value="null">{{ t('calendar.form.selectAthlete') }}</option>
                <option v-for="a in athletes" :key="a.id" :value="a.id">
                  {{ a.firstName }} {{ a.lastName }}
                </option>
              </select>
            </div>

            <div>
              <label class="text-[10px] font-black uppercase text-muted-foreground mb-1 block">{{ t('calendar.form.type') }}</label>
              <select v-model="newEvent.type"
                class="w-full h-10 px-3 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary outline-none">
                <option v-for="type in eventTypes" :key="type.type" :value="type.type">
                  {{ t(type.labelKey) }}
                </option>
              </select>
            </div>
          </CardContent>
          <CardFooter class="flex justify-end gap-3 border-t pt-4">
            <Button variant="ghost" @click="isDialogOpen = false">{{ t('common.cancel') }}</Button>
            <Button @click="handleAddEvent" class="px-8">{{ t('calendar.createEvent') }}</Button>
          </CardFooter>
        </Card>
      </div>

    </div>
  </div>
</template>