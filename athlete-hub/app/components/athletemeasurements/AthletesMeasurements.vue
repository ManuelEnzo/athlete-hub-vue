<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Trash2, Edit3, User, Plus, Loader2, Scale, Ruler, ClipboardList, TrendingUp, Activity } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { LineChart } from '@/components/ui/chart-line'

import { athleteApi } from '@/api/business'
import type {
  AthleteResponse,
  AthleteMeasurementsResponse,
  AthleteMeasurementsCreateRequest,
  AthleteMeasurementsUpdateRequest
} from '@/types/api'

// ---------------- Props & Emits ----------------
const props = defineProps<{
  showForm: boolean
  athletes: AthleteResponse[]
  selectedAthleteId: number | null
  measurements: AthleteMeasurementsResponse[]
  loading: boolean
}>()

const emit = defineEmits(['update:showForm', 'refresh'])

// ---------------- State ----------------
const saving = ref(false)
const deleting = ref(false)
const editingId = ref<number | null>(null)
const isDeleteDialogOpen = ref(false)
const measurementToDelete = ref<AthleteMeasurementsResponse | null>(null)

const form = reactive<AthleteMeasurementsCreateRequest>({
  athleteId: 0,
  weight: 0, height: 0, chest: 0, waist: 0, hip: 0,
  thigh: 0, arm: 0, calf: 0, forearm: 0, neck: 0, notes: ''
})

// ---------------- Helpers & Computed ----------------
function getAthleteFullName(athleteId: number) {
  const athlete = props.athletes.find(a => a.id === athleteId)
  return athlete ? `${athlete.firstName} ${athlete.lastName}` : 'Atleta Sconosciuto'
}

const filteredMeasurements = computed(() => {
  if (!props.selectedAthleteId) return props.measurements
  return props.measurements.filter(m => m.athleteId === props.selectedAthleteId)
})

const chartData = computed(() => {
  if (!props.selectedAthleteId || filteredMeasurements.value.length === 0) return []
  return [...filteredMeasurements.value]
    .sort((a, b) => new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime())
    .map(m => ({
      date: m.createdAt ? new Date(m.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) : 'N/D',
      Peso: m.weight,
      Vita: m.waist,
      Torace: m.chest,
      Fianchi: m.hip
    }))
})

watch(() => props.selectedAthleteId, (newId) => {
  if (newId) form.athleteId = newId
}, { immediate: true })

function resetForm() {
  editingId.value = null
  Object.assign(form, {
    athleteId: props.selectedAthleteId ?? 0,
    weight: 0, height: 0, chest: 0, waist: 0, hip: 0,
    thigh: 0, arm: 0, calf: 0, forearm: 0, neck: 0, notes: ''
  })
  emit('update:showForm', false)
}

function editMeasurement(m: AthleteMeasurementsResponse) {
  editingId.value = m.id
  Object.assign(form, {
    athleteId: m.athleteId,
    weight: m.weight ?? 0,
    height: m.height ?? 0,
    chest: m.chest ?? 0,
    waist: m.waist ?? 0,
    hip: m.hip ?? 0,
    thigh: m.thigh ?? 0,
    arm: m.arm ?? 0,
    calf: m.calf ?? 0,
    forearm: m.forearm ?? 0,
    neck: m.neck ?? 0,
    notes: m.notes ?? ''
  })
  emit('update:showForm', true)
}

async function saveMeasurement() {
  if (!form.athleteId) { toast.error('Seleziona un atleta'); return }
  saving.value = true
  try {
    const response = editingId.value
      ? await athleteApi.updateMeasurement(editingId.value, form as AthleteMeasurementsUpdateRequest)
      : await athleteApi.createMeasurement(form)

    if (response.data.isSuccess) {
      toast.success(editingId.value ? 'Aggiornato!' : 'Salvato!')
      emit('refresh')
      resetForm()
    }
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  if (!measurementToDelete.value) return
  deleting.value = true
  try {
    const res = await athleteApi.deleteMeasurement(measurementToDelete.value.id)
    if (res.data.isSuccess) {
      toast.success('Eliminato')
      emit('refresh')
      isDeleteDialogOpen.value = false
    }
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="w-full flex flex-col gap-8">

    <Transition name="expand">
      <Card v-if="props.showForm" class="border-primary/30 shadow-2xl bg-card">
        <CardHeader class="pb-4">
          <CardTitle class="text-xl flex items-center gap-2">
            <Plus class="h-5 w-5 text-primary" />
            {{ editingId ? 'Modifica Rilevazione' : 'Inserisci Nuove Misure' }}
          </CardTitle>
        </CardHeader>
        <CardContent class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="md:col-span-2">
            <label class="text-[11px] font-bold uppercase mb-1 block">Atleta</label>
            <Select v-model="form.athleteId">
              <SelectTrigger>
                <SelectValue placeholder="Seleziona..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="a in props.athletes" :key="a.id" :value="a.id">{{ a.firstName }} {{ a.lastName }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><label class="text-[11px] font-bold uppercase mb-1 block">Peso (kg)</label><Input
              v-model.number="form.weight" type="number" step="0.1" /></div>
          <div><label class="text-[11px] font-bold uppercase mb-1 block">Altezza (cm)</label><Input
              v-model.number="form.height" type="number" /></div>

          <div class="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t mt-2">
            <div><label class="text-[10px] font-bold uppercase">Torace</label><Input v-model.number="form.chest"
                type="number" step="0.1" /></div>
            <div><label class="text-[10px] font-bold uppercase">Vita</label><Input v-model.number="form.waist"
                type="number" step="0.1" /></div>
            <div><label class="text-[10px] font-bold uppercase">Fianchi</label><Input v-model.number="form.hip"
                type="number" step="0.1" /></div>
            <div><label class="text-[10px] font-bold uppercase">Coscia</label><Input v-model.number="form.thigh"
                type="number" step="0.1" /></div>
            <div><label class="text-[10px] font-bold uppercase">Braccio</label><Input v-model.number="form.arm"
                type="number" step="0.1" /></div>
            <div><label class="text-[10px] font-bold uppercase">Collo</label><Input v-model.number="form.neck"
                type="number" step="0.1" /></div>
            <div><label class="text-[10px] font-bold uppercase">Polpaccio</label><Input v-model.number="form.calf"
                type="number" step="0.1" /></div>
            <div><label class="text-[10px] font-bold uppercase">Avambraccio</label><Input v-model.number="form.forearm"
                type="number" step="0.1" /></div>
          </div>
          <div class="md:col-span-4"><label class="text-[11px] font-bold uppercase mb-1 block">Note</label><Input
              v-model="form.notes" placeholder="Annotazioni opzionali..." /></div>
        </CardContent>
        <CardFooter class="flex justify-end gap-3 bg-muted/5 py-4 border-t">
          <Button variant="ghost" @click="resetForm">Annulla</Button>
          <Button @click="saveMeasurement" :disabled="saving">
            <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
            {{ editingId ? 'Aggiorna' : 'Salva' }}
          </Button>
        </CardFooter>
      </Card>
    </Transition>

    <div class="space-y-4">
      <h2 class="text-lg font-bold flex items-center gap-2 px-1">
        <Activity class="h-5 w-5 text-primary" /> Ultime Misurazioni
      </h2>
      <TransitionGroup tag="div" name="grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card v-for="m in filteredMeasurements" :key="m.id"
          class="group relative overflow-hidden transition-all hover:border-primary">
          <CardContent class="p-0">
            <div class="p-4 bg-primary/5 border-b">
              <div class="flex justify-between items-start">
                <h3 class="font-extrabold text-primary uppercase text-sm leading-tight">
                  {{ getAthleteFullName(m.athleteId) }}</h3>
                <span
                  class="text-[10px] font-mono text-muted-foreground">{{ m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '' }}</span>
              </div>
            </div>
            <div class="p-5 flex justify-around items-center border-b">
              <div class="text-center">
                <p class="text-[10px] uppercase text-muted-foreground">Peso</p>
                <p class="font-black text-xl">{{ m.weight }}<span class="text-xs font-normal ml-0.5">kg</span></p>
              </div>
              <div class="w-px h-8 bg-border"></div>
              <div class="text-center">
                <p class="text-[10px] uppercase text-muted-foreground">Altezza</p>
                <p class="font-black text-xl">{{ m.height }}<span class="text-xs font-normal ml-0.5">cm</span></p>
              </div>
            </div>
            <div class="grid grid-cols-3 divide-x bg-muted/10">
              <div class="p-2 text-center text-xs">
                <p class="text-[9px] uppercase text-muted-foreground">Torace</p><b>{{ m.chest }}</b>
              </div>
              <div class="p-2 text-center text-xs">
                <p class="text-[9px] uppercase text-muted-foreground">Vita</p><b>{{ m.waist }}</b>
              </div>
              <div class="p-2 text-center text-xs">
                <p class="text-[9px] uppercase text-muted-foreground">Fianchi</p><b>{{ m.hip }}</b>
              </div>
            </div>
          </CardContent>
          <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="secondary" size="icon" class="h-8 w-8 rounded-full shadow-md bg-white"
              @click="editMeasurement(m)">
              <Edit3 class="h-3.5 w-3.5" />
            </Button>
            <Button variant="destructive" size="icon" class="h-8 w-8 rounded-full shadow-md"
              @click="measurementToDelete = m; isDeleteDialogOpen = true">
              <Trash2 class="h-3.5 w-3.5" />
            </Button>
          </div>
        </Card>
      </TransitionGroup>
    </div>

    <Transition name="expand">
      <Card v-if="props.selectedAthleteId && chartData.length > 1"
        class="border-primary/20 shadow-lg overflow-hidden w-full">
        <CardHeader class="pb-2 bg-muted/5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle class="text-sm font-bold flex items-center gap-2">
                <TrendingUp class="h-4 w-4 text-primary" />
                Analisi Progressi: {{ getAthleteFullName(props.selectedAthleteId) }}
              </CardTitle>
              <CardDescription class="text-[11px]">Variazione dei parametri nel tempo</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent class="p-2 sm:p-4">
          <div class="h-[300px] w-full min-w-0">
            <LineChart :data="chartData" index="date" :categories="['Peso', 'Vita', 'Torace', 'Fianchi']"
              :colors="['#2563eb', '#10b981', '#f59e0b', '#8b5cf6']" :y-formatter="(tick) => `${tick}`"
              :show-legend="true" :show-grid-line="true" :show-tooltip="true" class="w-full h-full" />
          </div>
        </CardContent>
      </Card>
    </Transition>

    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent class="max-w-xs">
        <DialogHeader>
          <DialogTitle>Conferma</DialogTitle>
        </DialogHeader>
        <p class="text-sm py-2">Eliminare la misurazione?</p>
        <div class="flex flex-col gap-2">
          <Button variant="destructive" @click="confirmDelete" :disabled="deleting">
            <Loader2 v-if="deleting" class="mr-2 h-4 w-4 animate-spin" /> Elimina
          </Button>
          <Button variant="ghost" @click="isDeleteDialogOpen = false">Annulla</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.4s ease;
  max-height: 1200px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.grid-enter-active,
.grid-leave-active {
  transition: all 0.3s ease;
}

.grid-enter-from,
.grid-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>