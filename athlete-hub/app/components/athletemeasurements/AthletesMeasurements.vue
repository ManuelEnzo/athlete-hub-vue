<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Trash2, Edit3, User, Plus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select'

import { athleteApi } from '../../api/business'
import type { AthleteResponse, AthleteMeasurementsResponse, AthleteMeasurementsCreateRequest, AthleteMeasurementsUpdateRequest } from '../../types/api'

const measurements = ref<AthleteMeasurementsResponse[]>([])
const athletes = ref<AthleteResponse[]>([])
const loading = ref(false)

const editingId = ref<number | null>(null)
const measurementToDelete = ref<AthleteMeasurementsResponse | null>(null)
const isDeleteDialogOpen = ref(false)
const showForm = ref(false) // 🔹 form nascosta all'apertura

const selectedAthleteId = ref<number | null>(null) // per filtro storico

const form = reactive<AthleteMeasurementsCreateRequest>({
  athleteId: 0,
  weight: 0,
  height: 0,
  chest: 0,
  waist: 0,
  hip: 0,
  thigh: 0,
  arm: 0,
  calf: 0,
  forearm: 0,
  neck: 0,
  notes: ''
})

// ---------------- API ----------------
async function fetchAthletes() {
  try {
    const res = await athleteApi.getAll()
    if (res.data.isSuccess) athletes.value = res.data.value ?? []
  } catch {
    toast.error('Errore caricamento atleti')
  }
}

async function fetchMeasurements() {
  loading.value = true
  try {
    const res = await athleteApi.getAllMeasurements()
    if (res.data.isSuccess) {
      measurements.value = res.data.value ?? []
    } else {
      toast.error('Errore caricamento misurazioni')
    }
  } catch {
    toast.error('Errore di comunicazione')
  } finally {
    loading.value = false
  }
}

// Filtra le misurazioni per atleta selezionato
const filteredMeasurements = computed(() => {
  if (!selectedAthleteId.value) return measurements.value
  return measurements.value.filter(m => m.athleteId === selectedAthleteId.value)
})

// ---------------- UI ----------------
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
  showForm.value = true
}

function resetForm() {
  editingId.value = null
  Object.assign(form, {
    athleteId: 0,
    weight: 0,
    height: 0,
    chest: 0,
    waist: 0,
    hip: 0,
    thigh: 0,
    arm: 0,
    calf: 0,
    forearm: 0,
    neck: 0,
    notes: ''
  })
  showForm.value = false
}

// Validazione + salvataggio
async function saveMeasurement() {
  if (!form.athleteId) { toast.error('Seleziona un atleta'); return }
  if (form.weight < 20) { toast.error('Peso troppo basso'); return }
  if (form.height < 50) { toast.error('Altezza troppo bassa'); return }
  if (form.chest < 30) { toast.error('Torace troppo piccolo'); return }
  if (form.waist < 20) { toast.error('Vita troppo piccola'); return }
  if (form.hip < 30) { toast.error('Fianchi troppo piccoli'); return }

  try {
    if (editingId.value !== null) {
      const res = await athleteApi.updateMeasurement(editingId.value, form as AthleteMeasurementsUpdateRequest)
      if (res.data.isSuccess) { toast.success('Misurazione aggiornata'); await fetchMeasurements(); resetForm() }
    } else {
      const res = await athleteApi.createMeasurement(form)
      if (res.data.isSuccess) { toast.success('Misurazione creata'); await fetchMeasurements(); resetForm() }
    }
  } catch {
    toast.error('Errore durante il salvataggio')
  }
}

async function confirmDelete() {
  if (!measurementToDelete.value) return
  try {
    const res = await athleteApi.deleteMeasurement(measurementToDelete.value.id)
    if (res.data.isSuccess) { toast.success('Misurazione eliminata'); await fetchMeasurements() }
  } catch {
    toast.error('Errore durante eliminazione')
  } finally {
    isDeleteDialogOpen.value = false
    measurementToDelete.value = null
  }
}

onMounted(() => {
  fetchAthletes()
  fetchMeasurements()
})
</script>

<template>
  <div class="w-full p-4 flex flex-col gap-6">

    <!-- FILTRO PER ATLETA -->
    <div class="flex gap-4 items-center">
      <Select v-model="selectedAthleteId">
        <SelectTrigger class="w-64">
          <SelectValue placeholder="Seleziona atleta per filtrare" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="a in athletes" :key="a.id" :value="a.id">
            {{ a.firstName }} {{ a.lastName }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Button @click="showForm = true">
        <Plus class="mr-2 h-4 w-4"/> Nuova Misurazione
      </Button>
    </div>

    <!-- FORM CREAZIONE / MODIFICA -->
    <Transition name="expand">
      <Card v-if="showForm">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Edit3 v-if="editingId" />
            <Plus v-else />
            {{ editingId ? 'Modifica Misurazione' : 'Nuova Misurazione' }}
          </CardTitle>
        </CardHeader>

        <CardContent class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <!-- SELECT ATLETA -->
          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1">Atleta</label>
            <Select v-model="form.athleteId">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Seleziona atleta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="a in athletes" :key="a.id" :value="a.id">
                  {{ a.firstName }} {{ a.lastName }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- INPUT NUMERICI -->
          <div class="space-y-1"><label>Peso (kg)</label><Input v-model.number="form.weight" type="number" /></div>
          <div class="space-y-1"><label>Altezza (cm)</label><Input v-model.number="form.height" type="number" /></div>
          <div class="space-y-1"><label>Torace</label><Input v-model.number="form.chest" type="number" /></div>
          <div class="space-y-1"><label>Vita</label><Input v-model.number="form.waist" type="number" /></div>
          <div class="space-y-1"><label>Fianchi</label><Input v-model.number="form.hip" type="number" /></div>
          <div class="space-y-1"><label>Coscia</label><Input v-model.number="form.thigh" type="number" /></div>
          <div class="space-y-1"><label>Braccio</label><Input v-model.number="form.arm" type="number" /></div>
          <div class="space-y-1"><label>Polpaccio</label><Input v-model.number="form.calf" type="number" /></div>
          <div class="space-y-1"><label>Avambraccio</label><Input v-model.number="form.forearm" type="number" /></div>
          <div class="space-y-1"><label>Collo</label><Input v-model.number="form.neck" type="number" /></div>
          <div class="space-y-1 col-span-1 md:col-span-2 lg:col-span-4">
            <label>Note</label>
            <Input v-model="form.notes" placeholder="Eventuali note" />
          </div>
        </CardContent>

        <CardFooter class="flex justify-end gap-2">
          <Button variant="ghost" @click="resetForm">Annulla</Button>
          <Button @click="saveMeasurement">{{ editingId ? 'Aggiorna' : 'Crea' }}</Button>
        </CardFooter>
      </Card>
    </Transition>

    <!-- LISTA MISURAZIONI -->
    <TransitionGroup tag="div" name="grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="m in filteredMeasurements" :key="m.id" class="group relative overflow-hidden border-muted/40 hover:border-primary/40 transition-all duration-300">
        <CardContent class="p-0">
          <div class="flex items-center gap-4 p-5">
            <div class="h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-inner">
              <User class="h-7 w-7" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-lg truncate uppercase tracking-tight">{{ m.athleteName }}</h3>
              <div class="flex items-center gap-2">
                <Badge variant="secondary" class="text-[10px] font-bold px-2 py-0">Peso: {{ m.weight }} kg</Badge>
                <span class="text-[11px] text-muted-foreground italic truncate">Altezza: {{ m.height }} cm</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 border-t border-muted/30 bg-muted/5 py-2 text-center">
            <div><p class="text-[10px] text-muted-foreground uppercase">Torace</p><p class="text-sm font-semibold">{{ m.chest }}</p></div>
            <div class="border-x border-muted/30"><p class="text-[10px] text-muted-foreground uppercase">Vita</p><p class="text-sm font-semibold">{{ m.waist }}</p></div>
            <div><p class="text-[10px] text-muted-foreground uppercase">Fianchi</p><p class="text-sm font-semibold">{{ m.hip }}</p></div>
          </div>
        </CardContent>

        <div class="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
          <button @click="editMeasurement(m)" class="h-8 w-8 rounded-full flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-white transition shadow-md" title="Modifica misurazione"><Edit3 class="h-4 w-4" /></button>
          <button @click="measurementToDelete = m; isDeleteDialogOpen = true" class="h-8 w-8 rounded-full flex items-center justify-center bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white transition shadow-md" title="Elimina misurazione"><Trash2 class="h-4 w-4" /></button>
        </div>
      </Card>
    </TransitionGroup>

  </div>

  <!-- DIALOG CONFERMA -->
  <Dialog v-model:open="isDeleteDialogOpen">
    <DialogContent class="max-w-md">
      <DialogHeader><DialogTitle>Conferma eliminazione</DialogTitle></DialogHeader>
      <p class="text-sm">Eliminare <strong>{{ measurementToDelete?.athleteName }}</strong>?</p>
      <div class="flex justify-end gap-2 mt-4">
        <Button variant="ghost" @click="isDeleteDialogOpen = false">Annulla</Button>
        <Button variant="destructive" @click="confirmDelete">Elimina</Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
/* Transizioni Fluid */
.grid-move,
.grid-enter-active,
.grid-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.grid-enter-from,
.grid-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.grid-leave-active {
  position: absolute;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.4s ease-in-out;
  max-height: 1200px;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
</style>
