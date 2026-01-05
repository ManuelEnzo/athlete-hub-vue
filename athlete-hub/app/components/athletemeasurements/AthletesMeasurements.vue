<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Trash2, Edit3, Plus, Loader2, ClipboardList, TrendingUp, Activity } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { LineChart } from '@/components/ui/chart-line'
import { Separator } from '@/components/ui/separator'

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
const { t } = useI18n()

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
  return athlete ? `${athlete.firstName} ${athlete.lastName}` : '---'
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
      date: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/D',
      [t('measurements.card.weight')]: m.weight,
      [t('measurements.card.waist')]: m.waist,
      [t('measurements.card.chest')]: m.chest,
      [t('measurements.card.hip')]: m.hip
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

// ---------------- API ACTIONS ----------------
async function saveMeasurement() {
  if (!form.athleteId) {
    toast.error(t('measurements.validation.selectAthlete'))
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await athleteApi.updateMeasurement(editingId.value, form as AthleteMeasurementsUpdateRequest)
      toast.success(t('measurements.toast.updated'))
    } else {
      await athleteApi.createMeasurement(form)
      toast.success(t('measurements.toast.created'))
    }
    emit('refresh')
    resetForm()
  } catch (err: any) {
    toast.error(err.error?.message || t('measurements.toast.saveError'))
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  if (!measurementToDelete.value) return
  deleting.value = true
  try {
    await athleteApi.deleteMeasurement(measurementToDelete.value.id)
    toast.success(t('measurements.toast.deleted'))
    emit('refresh')
    isDeleteDialogOpen.value = false
  } catch (err: any) {
    toast.error(err.error?.message || t('measurements.toast.deleteError'))
  } finally {
    deleting.value = false
    measurementToDelete.value = null
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
            {{ editingId ? t('measurements.editMeasurement') : t('measurements.newMeasurement') }}
          </CardTitle>
        </CardHeader>
        <CardContent class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="md:col-span-2">
            <label class="text-[11px] font-bold uppercase mb-1 block">{{ t('measurements.form.athlete') }}</label>
            <Select v-model="form.athleteId">
              <SelectTrigger><SelectValue :placeholder="t('measurements.form.selectAthlete')" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="a in props.athletes" :key="a.id" :value="a.id">
                  {{ a.firstName }} {{ a.lastName }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label class="text-[11px] font-bold uppercase mb-1 block">{{ t('measurements.form.weight') }}</label>
            <Input v-model.number="form.weight" type="number" step="0.1" />
          </div>
          <div>
            <label class="text-[11px] font-bold uppercase mb-1 block">{{ t('measurements.form.height') }}</label>
            <Input v-model.number="form.height" type="number" />
          </div>
          <div class="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t mt-2">
            <div v-for="field in ['chest', 'waist', 'hip', 'thigh', 'arm', 'neck', 'calf', 'forearm']" :key="field">
              <label class="text-[10px] font-bold uppercase">{{ t(`measurements.form.${field}`) }}</label>
              <Input v-model.number="form[field as keyof typeof form]" type="number" step="0.1" />
            </div>
          </div>
          <div class="md:col-span-4">
            <label class="text-[11px] font-bold uppercase mb-1 block">{{ t('measurements.form.notes') }}</label>
            <Input v-model="form.notes" :placeholder="t('measurements.form.notesPlaceholder')" />
          </div>
        </CardContent>
        <CardFooter class="flex justify-end gap-3 bg-muted/5 py-4 border-t">
          <Button variant="ghost" @click="resetForm">{{ t('common.cancel') }}</Button>
          <Button @click="saveMeasurement" :disabled="saving">
            <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
            {{ editingId ? t('measurements.form.update') : t('measurements.form.create') }}
          </Button>
        </CardFooter>
      </Card>
    </Transition>

    <div class="space-y-4">
      <h2 class="text-lg font-bold flex items-center gap-2 px-1 text-foreground">
        <Activity class="h-5 w-5 text-primary" /> {{ t('measurements.listTitle') }}
      </h2>

      <div v-if="filteredMeasurements.length === 0" class="text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed">
        <ClipboardList class="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
        <p class="text-sm text-muted-foreground">{{ t('measurements.noData') }}</p>
      </div>

      <TransitionGroup tag="div" name="grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card v-for="m in filteredMeasurements" :key="m.id" class="group relative overflow-hidden transition-all hover:border-primary/50 shadow-sm">
          <CardContent class="p-0">
            <div class="p-4 bg-primary/5 border-b flex justify-between items-center gap-2">
              <div class="flex-1 min-w-0">
                <h3 class="font-extrabold text-primary uppercase text-[10px] truncate">
                  {{ getAthleteFullName(m.athleteId) }}
                </h3>
                <p class="text-[9px] text-muted-foreground font-mono">
                  {{ m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '' }}
                </p>
              </div>

              <div class="actions-overlay flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" class="h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" @click="editMeasurement(m)">
                  <Edit3 class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" class="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" @click="measurementToDelete = m; isDeleteDialogOpen = true">
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div class="p-5 flex justify-around items-center border-b">
              <div class="text-center">
                <p class="text-[10px] uppercase text-muted-foreground">{{ t('measurements.card.weight') }}</p>
                <p class="font-black text-xl text-foreground">{{ m.weight }}<span class="text-xs font-normal ml-0.5">kg</span></p>
              </div>
              <Separator orientation="vertical" class="h-8" />
              <div class="text-center">
                <p class="text-[10px] uppercase text-muted-foreground">{{ t('measurements.card.height') }}</p>
                <p class="font-black text-xl text-foreground">{{ m.height }}<span class="text-xs font-normal ml-0.5">cm</span></p>
              </div>
            </div>

            <div class="grid grid-cols-3 divide-x bg-muted/10">
              <div class="p-2 text-center text-xs">
                <p class="text-[9px] uppercase text-muted-foreground">{{ t('measurements.card.chest') }}</p>
                <span class="font-bold">{{ m.chest || '-' }}</span>
              </div>
              <div class="p-2 text-center text-xs">
                <p class="text-[9px] uppercase text-muted-foreground">{{ t('measurements.card.waist') }}</p>
                <span class="font-bold">{{ m.waist || '-' }}</span>
              </div>
              <div class="p-2 text-center text-xs">
                <p class="text-[9px] uppercase text-muted-foreground">{{ t('measurements.card.hip') }}</p>
                <span class="font-bold">{{ m.hip || '-' }}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TransitionGroup>
    </div>

    <Transition name="expand">
      <Card v-if="props.selectedAthleteId && chartData.length > 1" class="border-primary/20 shadow-lg overflow-hidden w-full">
        <CardHeader class="pb-2 bg-muted/5">
          <div class="flex items-center gap-2">
            <TrendingUp class="h-5 w-5 text-primary" />
            <div>
              <CardTitle class="text-sm font-bold">{{ t('measurements.analysisTitle') }}</CardTitle>
              <CardDescription class="text-[11px]">{{ getAthleteFullName(props.selectedAthleteId) }}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="p-2 sm:p-4">
          <div class="h-[300px] w-full min-w-0">
            <LineChart
              :data="chartData"
              index="date"
              :categories="[t('measurements.card.weight'), t('measurements.card.waist'), t('measurements.card.chest'), t('measurements.card.hip')]"
              :colors="['#2563eb', '#10b981', '#f59e0b', '#8b5cf6']"
              :y-formatter="(tick) => `${tick}`"
              :show-legend="true" :show-grid-line="true" :show-tooltip="true" class="w-full h-full"
            />
          </div>
        </CardContent>
      </Card>
    </Transition>

    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent class="max-w-xs">
        <DialogHeader><DialogTitle>{{ t('common.delete') }}</DialogTitle></DialogHeader>
        <p class="text-sm py-2 text-muted-foreground">{{ t('measurements.toast.deleted') }}?</p>
        <div class="flex flex-col gap-2">
          <Button variant="destructive" @click="confirmDelete" :disabled="deleting">
            <Loader2 v-if="deleting" class="mr-2 h-4 w-4 animate-spin" />
            {{ t('common.delete') }}
          </Button>
          <Button variant="ghost" @click="isDeleteDialogOpen = false">{{ t('common.cancel') }}</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
.expand-enter-active, .expand-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 1200px;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0; opacity: 0;
}
.grid-enter-active, .grid-leave-active {
  transition: all 0.3s ease;
}
.grid-enter-from, .grid-leave-to {
  opacity: 0; transform: translateY(10px);
}
</style>