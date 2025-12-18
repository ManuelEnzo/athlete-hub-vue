<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { Trash2, Edit3, User, Plus } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
// Importiamo il servizio API e i tipi
import { athleteApi } from '../../api/business'
import type { AthleteResponse, AthleteCreateRequest } from '../../types/api'

const props = defineProps<{
  showForm: boolean
}>()

const emit = defineEmits(['update:showForm'])

// Stato
const athletes = ref<AthleteResponse[]>([])
const loading = ref(false)
const editingId = ref<number | null>(null)

// Form allineato ai DTO C#
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  sportCategory: '',
  birthDate: '',
  weight: 0,
  height: 0
})

// --- LOGICA API ---

async function fetchAthletes() {
  loading.value = true
  try {
    const res = await athleteApi.getAll()
    if (res.data.isSuccess) {
      athletes.value = res.data.value || []
    }
  } catch (error) {
    console.error("Errore caricamento:", error)
  } finally {
    loading.value = false
  }
}

async function saveAthlete() {
  if (!form.firstName || !form.lastName || !form.email) return alert('Campi obbligatori mancanti')
  
  try {
    if (editingId.value) {
      // UPDATE
      const res = await athleteApi.update(editingId.value, form)
      if (res.data.isSuccess) await fetchAthletes()
    } else {
      // CREATE
      const res = await athleteApi.create(form as AthleteCreateRequest)
      if (res.data.isSuccess) await fetchAthletes()
    }
    resetForm()
  } catch (error) {
    console.error("Errore salvataggio:", error)
  }
}

async function deleteAthlete(id: number) {
  if (!confirm("Sei sicuro di voler eliminare questo atleta?")) return
  try {
    const res = await athleteApi.delete(id)
    if (res.data.isSuccess) {
      athletes.value = athletes.value.filter(a => a.id !== id)
    }
  } catch (error) {
    console.error("Errore eliminazione:", error)
  }
}

// --- GESTIONE UI ---

function editAthlete(a: AthleteResponse) {
  editingId.value = a.id
  Object.assign(form, {
    firstName: a.firstName,
    lastName: a.lastName,
    email: a.email,
    sportCategory: a.sportCategory,
    birthDate: a.createdAt?.split('T')[0] || '', // Esempio mapping data
    weight: a.weight,
    height: a.height
  })
  emit('update:showForm', true)
}

function resetForm() {
  editingId.value = null
  Object.assign(form, {
    firstName: '', lastName: '', email: '',
    sportCategory: '', birthDate: '', weight: 0, height: 0
  })
  emit('update:showForm', false)
}

onMounted(fetchAthletes)
</script>

<template>
  <div class="w-full flex flex-col gap-8 mx-auto p-4">
    
    <Transition name="expand">
      <Card v-if="props.showForm" class="border-primary/20 shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader class="pb-2">
          <CardTitle class="text-xl flex items-center gap-2">
            <div class="p-2 bg-primary/10 rounded-lg">
              <Edit3 v-if="editingId" class="h-5 w-5 text-primary" />
              <Plus v-else class="h-5 w-5 text-primary" />
            </div>
            {{ editingId ? 'Modifica Atleta' : 'Registra Nuovo Atleta' }}
          </CardTitle>
        </CardHeader>
        
        <CardContent class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1">Nome</label>
            <Input v-model="form.firstName" placeholder="es. Marco" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1">Cognome</label>
            <Input v-model="form.lastName" placeholder="es. Rossi" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1">Email</label>
            <Input v-model="form.email" type="email" placeholder="mail@esempio.it" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1">Disciplina</label>
            <Input v-model="form.sportCategory" placeholder="es. Calcio, Nuoto" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1">Data di Nascita</label>
            <Input v-model="form.birthDate" type="date" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1">Peso (kg)</label>
            <Input v-model.number="form.weight" type="number" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1">Altezza (cm)</label>
            <Input v-model.number="form.height" type="number" />
          </div>
        </CardContent>

        <CardFooter class="flex justify-end gap-3 border-t bg-muted/20 px-6 py-4">
          <Button variant="ghost" @click="resetForm">Annulla</Button>
          <Button class="px-8 shadow-lg shadow-primary/20" @click="saveAthlete">
            {{ editingId ? 'Aggiorna Profilo' : 'Crea Atleta' }}
          </Button>
        </CardFooter>
      </Card>
    </Transition>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="h-32 w-full bg-muted animate-pulse rounded-xl" />
    </div>

    <TransitionGroup 
      v-else
      tag="div" 
      name="grid"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <Card 
        v-for="athlete in athletes" 
        :key="athlete.id" 
        class="group overflow-hidden border-muted/40 hover:border-primary/40 transition-all duration-300"
      >
        <CardContent class="p-0">
          <div class="flex items-center gap-4 p-5">
            <div class="h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-inner">
              <User class="h-7 w-7" />
            </div>
            
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-lg truncate uppercase tracking-tight">
                {{ athlete.firstName }} {{ athlete.lastName }}
              </h3>
              <div class="flex items-center gap-2">
                <Badge variant="secondary" class="text-[10px] font-bold px-2 py-0">
                  {{ athlete.sportCategory }}
                </Badge>
                <span class="text-[11px] text-muted-foreground italic">{{ athlete.email }}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 border-t border-muted/30 bg-muted/5 py-2 text-center">
            <div>
              <p class="text-[10px] text-muted-foreground uppercase">Età</p>
              <p class="text-sm font-semibold">{{ athlete.age }}</p>
            </div>
            <div class="border-x border-muted/30">
              <p class="text-[10px] text-muted-foreground uppercase">Peso</p>
              <p class="text-sm font-semibold">{{ athlete.weight }}kg</p>
            </div>
            <div>
              <p class="text-[10px] text-muted-foreground uppercase">Altezza</p>
              <p class="text-sm font-semibold">{{ athlete.height }}cm</p>
            </div>
          </div>
        </CardContent>

        <div class="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
          <Button size="icon" variant="secondary" class="h-8 w-8 rounded-full shadow-md" @click="editAthlete(athlete)">
            <Edit3 class="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="destructive" class="h-8 w-8 rounded-full shadow-md" @click="deleteAthlete(athlete.id)">
            <Trash2 class="h-3.5 w-3.5" />
          </Button>
        </div>
      </Card>
    </TransitionGroup>

    <div v-if="!loading && athletes.length === 0" class="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed">
      <User class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 class="text-lg font-medium">Nessun atleta registrato</h3>
      <p class="text-muted-foreground">Clicca sul tasto in alto per aggiungere il primo atleta.</p>
    </div>
  </div>
</template>

<style scoped>
/* Transizioni Fluid */
.grid-move, .grid-enter-active, .grid-leave-active { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.grid-enter-from, .grid-leave-to { opacity: 0; transform: translateY(20px) scale(0.9); }
.grid-leave-active { position: absolute; }

.expand-enter-active, .expand-leave-active { transition: all 0.4s ease-in-out; max-height: 800px; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; transform: translateY(-10px); }
</style>