<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Trash2, Edit3, User, Plus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

import { athleteApi } from '../../api/business'
import type { AthleteResponse, AthleteCreateRequest } from '../../types/api'
import type { string } from 'zod'

const props = defineProps<{ showForm: boolean }>()
const emit = defineEmits(['update:showForm'])

const athletes = ref<AthleteResponse[]>([])
const loading = ref(false)

const editingId = ref<number | null>(null)
const athleteToDelete = ref<AthleteResponse | null>(null)
const isDeleteDialogOpen = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  sportCategory: '',
  birthDate: '',
  weight: 0,
  height: 0,
  gender: "F"
})

// ---------------- API ----------------

async function fetchAthletes() {
  loading.value = true
  try {
    const res = await athleteApi.getAll()
    if (res.data.isSuccess) {
      athletes.value = res.data.value ?? []
    } else {
      toast.error('Errore nel caricamento atleti')
    }
  } catch {
    toast.error('Errore di comunicazione con il server')
  } finally {
    loading.value = false
  }
}

async function saveAthlete() {
  if (!form.firstName || !form.lastName || !form.email) {
    toast.error('Compila tutti i campi obbligatori')
    return
  }

  try {
    if (editingId.value !== null) {
      const res = await athleteApi.update(editingId.value, form)

      if (res.status === 204) {
        toast.success('Atleta aggiornato con successo')
        await fetchAthletes()
        resetForm()
      }
    } else {
      const res = await athleteApi.create(form as AthleteCreateRequest)

      if (res.data.isSuccess) {
        toast.success('Atleta creato con successo')
        await fetchAthletes()
        resetForm()
      } else {
        toast.error(res.data.error ?? 'Errore durante la creazione')
      }
    }
  } catch {
    toast.error('Errore durante il salvataggio')
  }
}

async function confirmDelete() {
  if (!athleteToDelete.value) return

  try {
    const res = await athleteApi.delete(athleteToDelete.value.id)

    if (res.status === 204) {
      athletes.value = athletes.value.filter(
        a => a.id !== athleteToDelete.value!.id
      )
      toast.success('Atleta eliminato')
      await fetchAthletes()
    } else {
      toast.error(res.data.error ?? 'Errore eliminazione')
    }
  } catch {
    toast.error('Errore durante eliminazione')
  } finally {
    isDeleteDialogOpen.value = false
    athleteToDelete.value = null
  }
}

// ---------------- UI ----------------

function editAthlete(a: AthleteResponse) {
  editingId.value = a.id
  Object.assign(form, {
    firstName: a.firstName,
    lastName: a.lastName,
    email: a.email,
    sportCategory: a.sportCategory,
    birthDate: a.createdAt?.split('T')[0] ?? '',
    weight: a.weight,
    height: a.height
  })

  emit('update:showForm', true)
}

function resetForm() {
  editingId.value = null
  Object.assign(form, {
    firstName: '',
    lastName: '',
    email: '',
    sportCategory: '',
    birthDate: '',
    weight: 0,
    height: 0
  })

  emit('update:showForm', false)
}

onMounted(fetchAthletes)
</script>

<template>
  <div class="w-full flex flex-col gap-8 mx-auto p-4">

    <!-- FORM -->
    <Transition name="expand">
      <Card v-if="props.showForm">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Edit3 v-if="editingId" />
            <Plus v-else />
            {{ editingId ? 'Modifica Atleta' : 'Nuovo Atleta' }}
          </CardTitle>
        </CardHeader>

        <CardContent class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1">Nome</label>
            <Input v-model="form.firstName" placeholder="Nome" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1">Cognome</label>
            <Input v-model="form.lastName" placeholder="Cognome" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1">Email</label>
            <Input v-model="form.email" placeholder="Email" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1">Disciplina</label>
            <Input v-model="form.sportCategory" placeholder="Disciplina" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1">Data di nascita</label>
            <Input v-model="form.birthDate" type="date" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1">Peso (kg)</label>
            <Input v-model.number="form.weight" type="number" placeholder="Peso" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1">Altezza (cm)</label>
            <Input v-model.number="form.height" type="number" placeholder="Altezza" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1">Sesso</label>
            <Select v-model="form.gender">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Seleziona sesso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">M</SelectItem>
                <SelectItem value="F">F</SelectItem>
                <SelectItem value=" ">Non Specifico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>


        <CardFooter class="flex justify-end gap-2">
          <Button variant="ghost" @click="resetForm">Annulla</Button>
          <Button @click="saveAthlete">
            {{ editingId ? 'Aggiorna' : 'Crea' }}
          </Button>
        </CardFooter>
      </Card>
    </Transition>

    <!-- LISTA -->
    <!-- LISTA ATLETI -->
    <TransitionGroup tag="div" name="grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="athlete in athletes" :key="athlete.id" class="group relative overflow-hidden border-muted/40
           hover:border-primary/40 transition-all duration-300">
        <CardContent class="p-0">

          <!-- HEADER -->
          <div class="flex items-center gap-4 p-5">
            <div class="h-14 w-14 rounded-full
                 bg-gradient-to-br from-primary/20 to-primary/5
                 border border-primary/10 flex items-center justify-center
                 text-primary shadow-inner">
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

                <span class="text-[11px] text-muted-foreground italic truncate">
                  {{ athlete.email }}
                </span>
              </div>
            </div>
          </div>

          <!-- STATS -->
          <div class="grid grid-cols-3 border-t border-muted/30
               bg-muted/5 py-2 text-center">
            <div>
              <p class="text-[10px] text-muted-foreground uppercase">Età</p>
              <p class="text-sm font-semibold">{{ athlete.age }}</p>
            </div>

            <div class="border-x border-muted/30">
              <p class="text-[10px] text-muted-foreground uppercase">Peso</p>
              <p class="text-sm font-semibold">{{ athlete.weight }} kg</p>
            </div>

            <div>
              <p class="text-[10px] text-muted-foreground uppercase">Altezza</p>
              <p class="text-sm font-semibold">{{ athlete.height }} cm</p>
            </div>
          </div>
        </CardContent>

        <!-- AZIONI -->
        <div class="absolute top-3 right-3 flex gap-2 opacity-0
             group-hover:opacity-100 transition-all duration-200
             translate-y-1 group-hover:translate-y-0">
          <!-- MODIFICA -->
          <button @click="editAthlete(athlete)" class="h-8 w-8 rounded-full flex items-center justify-center
               bg-primary/10 text-primary
               hover:bg-primary hover:text-white
               transition shadow-md" title="Modifica atleta">
            <Edit3 class="h-4 w-4" />
          </button>

          <!-- ELIMINA -->
          <button @click="athleteToDelete = athlete; isDeleteDialogOpen = true" class="h-8 w-8 rounded-full flex items-center justify-center
               bg-red-500/10 text-red-600
               hover:bg-red-600 hover:text-white
               transition shadow-md" title="Elimina atleta">
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
      </Card>
    </TransitionGroup>

  </div>

  <!-- DIALOG CONFERMA -->
  <Dialog v-model:open="isDeleteDialogOpen">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Conferma eliminazione</DialogTitle>
      </DialogHeader>

      <p class="text-sm">
        Eliminare
        <strong>{{ athleteToDelete?.firstName }} {{ athleteToDelete?.lastName }}</strong>?
      </p>

      <div class="flex justify-end gap-2 mt-4">
        <Button variant="ghost" @click="isDeleteDialogOpen = false">
          Annulla
        </Button>
        <Button variant="destructive" @click="confirmDelete">
          Elimina
        </Button>
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
  max-height: 800px;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
</style>