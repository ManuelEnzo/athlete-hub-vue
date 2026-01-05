<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Trash2, Edit3, User, Plus, Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Separator } from '../ui/separator'

import { athleteApi } from '../../api/business'
import type { AthleteResponse, AthleteCreateRequest } from '../../types/api'

const props = defineProps<{ showForm: boolean }>()
const emit = defineEmits(['update:showForm'])
const { t } = useI18n()

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
    // Se l'interceptor non lancia errore, il successo è garantito
    athletes.value = res.data.value ?? []
  } catch (err: any) {
    const msg = err.error?.message || t('athlete.errors.load')
    toast.error(msg)
  } finally {
    loading.value = false
  }
}

async function saveAthlete() {
  if (!form.firstName || !form.lastName || !form.email) {
    toast.error(t('athlete.errors.required'))
    return
  }

  loading.value = true
  try {
    if (editingId.value !== null) {
      // Update: ci fidiamo dello status 204/200 gestito dall'interceptor
      await athleteApi.update(editingId.value, form)
      toast.success(t('athlete.success.updated'))
    } else {
      // Create
      await athleteApi.create(form as AthleteCreateRequest)
      toast.success(t('athlete.success.created'))
    }

    await fetchAthletes()
    resetForm()
  } catch (err: any) {
    // Cattura il messaggio specifico del Result Pattern (es. "Email già esistente")
    const msg = err.error?.message || t('errors.save')
    toast.error(msg)
  } finally {
    loading.value = false
  }
}

async function confirmDelete() {
  if (!athleteToDelete.value) return
  loading.value = true
  try {
    await athleteApi.delete(athleteToDelete.value.id)

    // Aggiornamento locale della lista
    athletes.value = athletes.value.filter(a => a.id !== athleteToDelete.value!.id)
    toast.success(t('athlete.success.deleted'))
  } catch (err: any) {
    const msg = err.error?.message || t('errors.delete')
    toast.error(msg)
  } finally {
    isDeleteDialogOpen.value = false
    athleteToDelete.value = null
    loading.value = false
  }
}

// ---------------- UI ----------------

function editAthlete(a: AthleteResponse) {
  editingId.value = a.id
  // Formattazione data per input type="date" (YYYY-MM-DD)
  const formattedDate = a.dateOfBirth ? a.dateOfBirth.split('T')[0] : ''

  Object.assign(form, {
    firstName: a.firstName,
    lastName: a.lastName,
    email: a.email,
    sportCategory: a.sportCategory,
    birthDate: formattedDate,
    weight: a.weight,
    height: a.height,
    gender: a.gender || 'F',
    dateOfBirth: a.dateOfBirth
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
    height: 0,
    gender: 'F'
  })
  emit('update:showForm', false)
}

onMounted(fetchAthletes)
</script>

<template>
  <div class="w-full flex flex-col gap-8 mx-auto p-4 relative">

    <Transition name="expand">
      <Card v-if="props.showForm" class="border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-primary">
            <Edit3 v-if="editingId" class="h-5 w-5" />
            <Plus v-else class="h-5 w-5" />
            {{ editingId ? t('athlete.edit') : t('athlete.new') }}
          </CardTitle>
        </CardHeader>

        <CardContent class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1 text-muted-foreground">{{ t('fields.firstName') }}</label>
            <Input v-model="form.firstName" :placeholder="t('fields.firstName')" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1 text-muted-foreground">{{ t('fields.lastName') }}</label>
            <Input v-model="form.lastName" :placeholder="t('fields.lastName')" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1 text-muted-foreground">{{ t('fields.email') }}</label>
            <Input v-model="form.email" type="email" :placeholder="t('fields.email')" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1 text-muted-foreground">{{ t('fields.sportCategory') }}</label>
            <Input v-model="form.sportCategory" :placeholder="t('fields.sportCategoryPlaceholder')" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1 text-muted-foreground">{{ t('fields.birthDate') }}</label>
            <Input v-model="form.birthDate" type="date" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1 text-muted-foreground">{{ t('fields.weight') }} (kg)</label>
            <Input v-model.number="form.weight" type="number" step="0.1" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1 text-muted-foreground">{{ t('fields.height') }} (cm)</label>
            <Input v-model.number="form.height" type="number" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold ml-1 text-muted-foreground">{{ t('fields.gender') }}</label>
            <Select v-model="form.gender">
              <SelectTrigger>
                <SelectValue :placeholder="t('fields.genderPlaceholder')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">{{ t('genders.male') }}</SelectItem>
                <SelectItem value="F">{{ t('genders.female') }}</SelectItem>
                <SelectItem value="O">{{ t('genders.other') }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        <CardFooter class="flex justify-end gap-2 bg-muted/50 p-4">
          <Button variant="ghost" @click="resetForm">{{ t('common.cancel') }}</Button>
          <Button @click="saveAthlete" :disabled="loading">
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            {{ editingId ? t('common.update') : t('common.create') }}
          </Button>
        </CardFooter>
      </Card>
    </Transition>

    <div v-if="loading && athletes.length === 0" class="flex justify-center items-center py-20">
      <Loader2 class="h-12 w-12 animate-spin text-primary" />
    </div>

    <TransitionGroup tag="div" name="grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="athlete in athletes" :key="athlete.id"
        class="group relative overflow-hidden border-muted/40 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md">
        <CardContent class="p-0">
          <div class="flex items-center gap-4 p-5">
            <div
              class="h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-inner">
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

          <div class="grid grid-cols-3 border-t border-muted/30 bg-muted/5 py-3 text-center">
            <div>
              <p class="text-[10px] text-muted-foreground uppercase">{{ t('fields.age') }}</p>
              <p class="text-sm font-semibold">{{ athlete.age || '-' }}</p>
            </div>
            <div class="border-x border-muted/30">
              <p class="text-[10px] text-muted-foreground uppercase">{{ t('fields.weightShort') }}</p>
              <p class="text-sm font-semibold">{{ athlete.weight }} kg</p>
            </div>
            <div>
              <p class="text-[10px] text-muted-foreground uppercase">{{ t('fields.heightShort') }}</p>
              <p class="text-sm font-semibold">{{ athlete.height }} cm</p>
            </div>
          </div>
        </CardContent>

        <div class="absolute top-3 right-3 actions-overlay">
          <Button variant="ghost" size="icon"
            class="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            @click="editAthlete(athlete)">
            <Edit3 class="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" class="h-9 w-9 rounded-full text-destructive"
            @click="athleteToDelete = athlete; isDeleteDialogOpen = true">
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </TransitionGroup>

    <div v-if="!loading && athletes.length === 0"
      class="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
      <User class="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
      <p class="text-muted-foreground">{{ t('athlete.noData') }}</p>
    </div>

  </div>

  <Dialog v-model:open="isDeleteDialogOpen">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ t('athlete.deleteConfirm') }}</DialogTitle>
      </DialogHeader>
      <div class="py-4">
        <p class="text-sm">
          {{ t('athlete.deleteQuestion') }}
          <span class="font-bold text-foreground">{{ athleteToDelete?.firstName }} {{ athleteToDelete?.lastName
          }}</span>?
        </p>
        <p class="text-[12px] text-destructive mt-2">{{ t('athlete.deleteWarning') }}</p>
      </div>
      <div class="flex justify-end gap-2">
        <Button variant="ghost" @click="isDeleteDialogOpen = false">{{ t('common.cancel') }}</Button>
        <Button variant="destructive" @click="confirmDelete" :disabled="loading">
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          {{ t('common.delete') }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 500px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.grid-enter-active,
.grid-leave-active {
  transition: all 0.4s ease;
}

.grid-enter-from,
.grid-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>