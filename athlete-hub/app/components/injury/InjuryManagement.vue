<script setup lang="ts">
import type { InjuryCreateDTO, InjuryResponseDTO, InjuryUpdateDTO } from '@/types/api'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Info,
  Loader2,
  Plus,
  Save,
  Stethoscope,
  Trash2,
  X,
} from 'lucide-vue-next'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import notifications from '@/lib/notificationService'
import { useInjuryService } from '~/services/dataService'

// --------------------
// PROPS
// --------------------
const props = defineProps<{
  athleteId: number | null
}>()

const { t } = useI18n()
const injurySvc = useInjuryService()

const injuries = computed(() => injurySvc.items.value)
const loading = computed(() => injurySvc.loading.value)
const isSubmitting = computed(() => injurySvc.submitting.value)
const isDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const injuryToDelete = ref<InjuryResponseDTO | null>(null)

interface InjuryForm {
  id: number | null
  date: string
  injury: string
  category: number
  severity: number
  status: number
  bodyLocation: string
  expectedReturnDate: string
}

const injuryForm = reactive<InjuryForm>({
  id: null,
  date: new Date().toISOString().split('T')[0] ?? '',
  injury: '',
  category: 0,
  severity: 0,
  status: 0,
  bodyLocation: '',
  expectedReturnDate: '',
})

// --------------------
// API ACTIONS
// --------------------
async function fetchInjuries() {
  if (!props.athleteId) {
    return
  }
  try {
    await injurySvc.fetch(props.athleteId)
  }
  catch {
    notifications.error(t('injuries.errors.loadInjuries'))
  }
}

async function handleSave() {
  if (!injuryForm.injury || !props.athleteId) {
    notifications.error(t('common.validation.requiredFields'))
    return
  }

  const validDate: string = (injuryForm.date || new Date().toISOString().split('T')[0]) ?? ''

  try {
    if (injuryForm.id) {
      const updatePayload: InjuryUpdateDTO = {
        injury: injuryForm.injury,
        category: injuryForm.category,
        severity: injuryForm.severity,
        status: injuryForm.status,
        bodyLocation: injuryForm.bodyLocation,
        expectedReturnDate: injuryForm.expectedReturnDate || undefined,
        date: validDate,
      }
      await injurySvc.update(injuryForm.id, props.athleteId, updatePayload)
      notifications.success(t('injuries.toast.updated'))
    }
    else {
      const createPayload: InjuryCreateDTO = {
        athleteId: props.athleteId,
        date: validDate,
        injury: injuryForm.injury,
        category: injuryForm.category,
        severity: injuryForm.severity,
        status: injuryForm.status,
        bodyLocation: injuryForm.bodyLocation,
        expectedReturnDate: injuryForm.expectedReturnDate || undefined,
      }
      await injurySvc.create(createPayload)
      notifications.success(t('injuries.toast.created'))
    }
    isDialogOpen.value = false
    fetchInjuries()
  }
  catch {
    notifications.error(t('injuries.errors.save'))
  }
}

async function deleteInjury(injury: InjuryResponseDTO) {
  injuryToDelete.value = injury
  isDeleteDialogOpen.value = true
}

async function confirmDelete() {
  if (!injuryToDelete.value)
    return

  try {
    await injurySvc.remove(injuryToDelete.value.id)
    notifications.success(t('injuries.toast.deleted'))
    isDeleteDialogOpen.value = false
    injuryToDelete.value = null
  }
  catch {
    notifications.error(t('injuries.errors.delete'))
  }
}

// --------------------
// UI LOGIC
// --------------------
function openDialog(injury: InjuryResponseDTO | null = null) {
  if (injury) {
    Object.assign(injuryForm, {
      id: injury.id,
      date: injury.date ? injury.date.split('T')[0] : new Date().toISOString().split('T')[0],
      injury: injury.injury,
      category: injury.category,
      severity: injury.severity,
      status: injury.status,
      bodyLocation: injury.bodyLocation || '',
      expectedReturnDate: injury.expectedReturnDate ? injury.expectedReturnDate.split('T')[0] : '',
    })
  }
  else {
    resetForm()
  }
  isDialogOpen.value = true
}

function resetForm() {
  Object.assign(injuryForm, {
    id: null,
    date: new Date().toISOString().split('T')[0],
    injury: '',
    category: 0,
    severity: 0,
    status: 0,
    bodyLocation: '',
    expectedReturnDate: '',
  })
}

function getSeverityBadge(sev: number) {
  const styles = [
    'bg-green-100 text-green-700 border-green-200',
    'bg-yellow-100 text-yellow-700 border-yellow-200',
    'bg-orange-100 text-orange-700 border-orange-200',
    'bg-red-100 text-red-700 border-red-200',
  ]
  return styles[sev] || 'bg-slate-100'
}

function getStatusIcon(status: number) {
  if (status === 0)
    return AlertCircle
  if (status === 1)
    return Activity
  return CheckCircle2
}

watch(() => props.athleteId, () => {
  fetchInjuries()
}, { immediate: true })
</script>

<template>
  <div class="w-full flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 bg-muted/20 p-4 rounded-2xl border border-dashed border-primary/20">
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Stethoscope class="h-5 w-5" />
        </div>
        <h2 class="text-sm font-black uppercase tracking-widest text-muted-foreground">
          {{ t('injuries.history_title') }}
        </h2>
      </div>
      <Button size="sm" class="font-bold uppercase tracking-wider h-9 flex items-center whitespace-nowrap sm:px-3" @click="openDialog()">
        <Plus class="h-4 w-4 mr-0 sm:mr-2" />
        <span class="hidden sm:inline">{{ t('injuries.add_new') }}</span>
      </Button>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Skeleton v-for="i in 3" :key="i" class="h-[160px] w-full rounded-2xl" />
    </div>

    <div v-else-if="injuries.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card v-for="item in injuries" :key="item.id" class="group border-primary/5 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden">
        <CardHeader class="pb-2 bg-muted/5">
          <div class="flex justify-between items-start">
            <div class="flex flex-col">
              <span class="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">{{ item.categoryName }}</span>
              <CardTitle class="text-sm font-bold leading-tight mt-1">
                {{ item.injury }}
              </CardTitle>
            </div>
            <Badge variant="outline" class="text-[9px]" :class="getSeverityBadge(item.severity)">
              {{ item.severityName }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="pt-4 space-y-3">
          <div class="flex justify-between items-center bg-muted/30 p-2.5 rounded-xl border border-primary/5">
            <div class="flex items-center gap-2">
              <component
                :is="getStatusIcon(item.status)" class="h-3.5 w-3.5"
                :class="item.status === 2 ? 'text-green-500' : 'text-orange-500'"
              />
              <span class="text-[9px] font-black uppercase">{{ t(`injuries.statuses.${item.status === 0 ? 'active' : item.status === 1 ? 'rehab' : 'returned'}`) }}</span>
            </div>
            <span class="text-[10px] font-mono font-bold">{{ new Date(item.date).toLocaleDateString() }}</span>
          </div>

          <div class="flex justify-between items-center px-1">
            <div class="flex flex-col">
              <span class="text-[8px] font-bold text-muted-foreground uppercase">{{ t('injuries.fields.location') }}</span>
              <span class="font-bold text-[10px]">{{ item.bodyLocation || t('injuries.fallback.notAvailable') }}</span>
            </div>
            <div class="flex flex-col text-right">
              <span class="text-[8px] font-bold text-muted-foreground uppercase">{{ t('injuries.fields.daysOut') }}</span>
              <span class="font-black text-[10px] text-primary">{{ item.daysOut }} gg</span>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-1 transition-opacity">
            <Button variant="ghost" size="icon" class="h-7 w-7 rounded-full" @click="openDialog(item)">
              <Edit3 class="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost" size="icon" class="h-7 w-7 rounded-full hover:bg-red-50"
              @click="deleteInjury(item)"
            >
              <Trash2 class="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-16 bg-muted/5 rounded-3xl border-2 border-dashed border-muted">
      <Info class="h-8 w-8 text-muted-foreground/20 mb-3" />
      <h3 class="text-xs font-black uppercase text-muted-foreground/60">
        {{ t('injuries.no_data') }}
      </h3>
    </div>

    <!-- FORM DIALOG -->
    <div v-if="isDialogOpen" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card class="w-full max-w-lg shadow-2xl border-none">
        <CardHeader class="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle class="text-lg font-black uppercase tracking-tight">
            {{ injuryForm.id ? t('injuries.dialog.editTitle') : t('injuries.dialog.newTitle') }}
          </CardTitle>
          <Button variant="ghost" size="icon" @click="isDialogOpen = false">
            <X class="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          <div class="col-span-2">
            <label class="text-[9px] font-black uppercase text-muted-foreground block mb-1">{{ t('injuries.fields.injury') }}</label>
            <Input v-model="injuryForm.injury" :placeholder="t('injuries.placeholders.injury')" class="h-9 text-sm" />
          </div>
          <div class="col-span-1">
            <label class="text-[9px] font-black uppercase text-muted-foreground block mb-1">{{ t('injuries.fields.startDate') }}</label>
            <Input v-model="injuryForm.date" type="date" class="h-9 text-sm pr-10 appearance-none bg-background focus:ring-2" />
          </div>
          <div class="col-span-1">
            <label class="text-[9px] font-black uppercase text-muted-foreground block mb-1">{{ t('injuries.fields.expectedReturn') }}</label>
            <Input v-model="injuryForm.expectedReturnDate" type="date" class="h-9 text-sm pr-10 appearance-none bg-background focus:ring-2" />
          </div>
          <div class="col-span-1">
            <label class="text-[9px] font-black uppercase text-muted-foreground block mb-1">{{ t('injuries.fields.category') }}</label>
            <select v-model.number="injuryForm.category" class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs">
              <option :value="0">
                {{ t('injuries.categories.muscular') }}
              </option>
              <option :value="1">
                {{ t('injuries.categories.joint') }}
              </option>
              <option :value="2">
                {{ t('injuries.categories.tendon') }}
              </option>
              <option :value="3">
                {{ t('injuries.categories.bone') }}
              </option>
            </select>
          </div>
          <div class="col-span-1">
            <label class="text-[9px] font-black uppercase text-muted-foreground block mb-1">{{ t('injuries.fields.severity') }}</label>
            <select v-model.number="injuryForm.severity" class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs">
              <option :value="0">
                {{ t('injuries.severities.mild') }}
              </option>
              <option :value="1">
                {{ t('injuries.severities.moderate') }}
              </option>
              <option :value="2">
                {{ t('injuries.severities.severe') }}
              </option>
            </select>
          </div>
          <div class="col-span-1">
            <label class="text-[9px] font-black uppercase text-muted-foreground block mb-1">{{ t('injuries.fields.location') }}</label>
            <Input v-model="injuryForm.bodyLocation" :placeholder="t('injuries.placeholders.location')" class="h-9 text-sm" />
          </div>
          <div class="col-span-1">
            <label class="text-[9px] font-black uppercase text-muted-foreground block mb-1">{{ t('injuries.fields.status') }}</label>
            <select v-model.number="injuryForm.status" class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-bold">
              <option :value="0">
                {{ t('injuries.statuses.active') }}
              </option>
              <option :value="1">
                {{ t('injuries.statuses.rehab') }}
              </option>
              <option :value="2">
                {{ t('injuries.statuses.returned') }}
              </option>
            </select>
          </div>
          <div class="col-span-2 pt-4 flex justify-end gap-2 border-t mt-2">
            <Button variant="ghost" size="sm" @click="isDialogOpen = false">
              {{ t('common.cancel') }}
            </Button>
            <Button size="sm" :disabled="isSubmitting" class="font-bold" @click="handleSave">
              <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
              <Save class="mr-2 h-4 w-4" /> {{ t('common.save') }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- DELETE DIALOG -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>{{ t('injuries.deleteConfirm') }}</DialogTitle>
        </DialogHeader>
        <div class="py-4">
          <p class="text-sm">
            {{ t('injuries.deleteQuestion') }} <span class="font-bold text-foreground">{{ injuryToDelete?.injury }}</span>?
          </p>
          <p class="text-[12px] text-destructive mt-2">
            {{ t('injuries.deleteWarning') }}
          </p>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" @click="isDeleteDialogOpen = false">
            {{ t('common.cancel') }}
          </Button>
          <Button variant="destructive" :disabled="isSubmitting" @click="confirmDelete">
            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ t('common.delete') }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
