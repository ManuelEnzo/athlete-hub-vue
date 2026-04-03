<script setup lang="ts">
import type {
  AthleteMeasurementsCreateRequest,
  AthleteMeasurementsResponse,
  AthleteMeasurementsUpdateRequest,
  AthleteResponse,
} from '@/types/api'
import { Activity, ClipboardList, Edit3, Loader2, Plus, Trash2, TrendingUp } from 'lucide-vue-next'
import { computed, defineAsyncComponent, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { athleteApi } from '@/api/business'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Separator } from '@/components/ui/separator'
import { useToast } from '@/composables/useToast'

// ---------------- Props & Emits ----------------
const props = defineProps<{
  showForm: boolean
  athletes: AthleteResponse[]
  selectedAthleteId: number | null
  measurements: AthleteMeasurementsResponse[]
  loading: boolean
}>()

const emit = defineEmits(['update:showForm', 'refresh'])

// Import ApexCharts per SSR safety
const VueApexCharts = defineAsyncComponent(() =>
  import('vue3-apexcharts'),
)

const { t } = useI18n()
const notifications = useToast()

// ---------------- State ----------------
const saving = ref(false)
const deleting = ref(false)
const editingId = ref<number | null>(null)
const isDeleteDialogOpen = ref(false)
const measurementToDelete = ref<AthleteMeasurementsResponse | null>(null)

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
  notes: '',
})

// ---------------- Helpers & Computed ----------------
function getAthleteFullName(athleteId: number) {
  const athlete = props.athletes.find(a => a.id === athleteId)
  return athlete ? `${athlete.firstName} ${athlete.lastName}` : '---'
}

const filteredMeasurements = computed(() => {
  if (!props.selectedAthleteId)
    return props.measurements
  return props.measurements.filter(m => m.athleteId === props.selectedAthleteId)
})

const chartData = computed(() => {
  if (!props.selectedAthleteId || filteredMeasurements.value.length === 0)
    return []
  return [...filteredMeasurements.value]
    .sort((a, b) => new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime())
    .map(m => ({
      date: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/D',
      [t('measurements.card.weight')]: m.weight,
      [t('measurements.card.waist')]: m.waist,
      [t('measurements.card.chest')]: m.chest,
      [t('measurements.card.hip')]: m.hip,
    }))
})

// ApexCharts options for line chart
const chartOptions = computed(() => ({
  chart: {
    type: 'line' as const,
    toolbar: { show: false },
    foreColor: '#000',
    sparkline: { enabled: false },
    animations: { enabled: true },
  },
  colors: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'],
  fill: {
    type: 'gradient' as const,
    gradient: {
      shadeIntensity: 0.5,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [20, 100, 100, 100],
    },
  },
  stroke: { curve: 'smooth' as const, width: 3 },
  markers: { size: 6, hover: { size: 8, sizeOffset: 2 }, strokeWidth: 0 },
  xaxis: {
    categories: chartData.value.map(d => d.date),
    labels: { style: { colors: 'inherit', fontSize: '12px', fontWeight: 500 } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: { style: { colors: 'inherit', fontSize: '12px' } },
    title: { text: undefined },
    axisBorder: { show: false },
  },
  grid: { borderColor: 'hsl(var(--muted-foreground) / 0.15)', strokeDashArray: 4, padding: { left: 10, right: 20 } },
  tooltip: { enabled: true, theme: 'dark' as const, style: { fontSize: '13px', fontFamily: 'system-ui' }, x: { format: 'dd MMM' } },
  legend: { position: 'top' as const, horizontalAlign: 'right' as const, fontSize: '13px', fontFamily: 'system-ui', labels: { colors: 'inherit' }, markers: { size: 8 } },
  responsive: [
    {
      breakpoint: 768,
      options: {
        legend: { position: 'bottom', horizontalAlign: 'center' },
        chart: { height: 260 }
      }
    }
  ],
  states: {
    hover: { filter: { type: 'none' } },
    active: { filter: { type: 'none' } },
  },
}))

const chartSeries = computed(() => [
  {
    name: t('measurements.card.weight'),
    data: chartData.value.map(d => d[t('measurements.card.weight')] || 0),
  },
  {
    name: t('measurements.card.waist'),
    data: chartData.value.map(d => d[t('measurements.card.waist')] || 0),
  },
  {
    name: t('measurements.card.chest'),
    data: chartData.value.map(d => d[t('measurements.card.chest')] || 0),
  },
  {
    name: t('measurements.card.hip'),
    data: chartData.value.map(d => d[t('measurements.card.hip')] || 0),
  },
])

watch(() => props.selectedAthleteId, (newId) => {
  if (newId)
    form.athleteId = newId
}, { immediate: true })

function resetForm() {
  editingId.value = null
  Object.assign(form, {
    athleteId: props.selectedAthleteId ?? 0,
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
    notes: '',
  })
  emit('update:showForm', false)
}

function openNewMeasurement() {
  editingId.value = null
  Object.assign(form, {
    athleteId: props.selectedAthleteId ?? 0,
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
    notes: '',
  })
  emit('update:showForm', true)
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
    notes: m.notes ?? '',
  })
  emit('update:showForm', true)
}

// ---------------- API ACTIONS ----------------
async function saveMeasurement() {
  if (!form.athleteId) {
    notifications.error(t('measurements.validation.selectAthlete'))
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await athleteApi.updateMeasurement(editingId.value, form as AthleteMeasurementsUpdateRequest)
      notifications.success(t('measurements.toast.updated'))
    }
    else {
      await athleteApi.createMeasurement(form)
      notifications.success(t('measurements.toast.created'))
    }
    emit('refresh')
    resetForm()
  }
  catch (err: any) {
    notifications.error(err.error?.message || t('measurements.toast.saveError'))
  }
  finally {
    saving.value = false
  }
}

async function confirmDelete() {
  if (!measurementToDelete.value)
    return
  deleting.value = true
  try {
    await athleteApi.deleteMeasurement(measurementToDelete.value.id)
    notifications.success(t('measurements.toast.deleted'))
    emit('refresh')
    isDeleteDialogOpen.value = false
  }
  catch (err: any) {
    notifications.error(err.error?.message || t('measurements.toast.deleteError'))
  }
  finally {
    deleting.value = false
    measurementToDelete.value = null
  }
}
</script>

<template>
  <div class="w-full flex flex-col gap-8">
    <!-- Mobile floating 'New' button -->
    <div class="md:hidden fixed right-4 bottom-4 z-50">
      <Button class="h-12 w-12 rounded-full p-0 flex items-center justify-center shadow-lg" @click="openNewMeasurement" aria-label="{{ t('measurements.newMeasurement') }}" title="{{ t('measurements.newMeasurement') }}">
        <Plus class="h-6 w-6 text-white" />
      </Button>
    </div>
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
            <label :for="'input-athlete'" class="text-[11px] font-bold uppercase mb-1 block">{{ t('measurements.form.athlete') }}</label>
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
            <label :for="'input-weight'" class="text-[11px] font-bold uppercase mb-1 block">{{ t('measurements.form.weight') }}</label>
            <Input id="input-weight" aria-label="{{ t('measurements.form.weight') }}" v-model.number="form.weight" type="number" step="0.1" placeholder="kg" />
          </div>
          <div>
            <label :for="'input-height'" class="text-[11px] font-bold uppercase mb-1 block">{{ t('measurements.form.height') }}</label>
            <Input id="input-height" aria-label="{{ t('measurements.form.height') }}" v-model.number="form.height" type="number" placeholder="cm" />
          </div>
          <div class="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t mt-2">
            <div v-for="field in ['chest', 'waist', 'hip', 'thigh', 'arm', 'neck', 'calf', 'forearm']" :key="field">
              <label :for="`input-${field}`" class="text-[10px] font-bold uppercase">{{ t(`measurements.form.${field}`) }}</label>
              <Input :id="`input-${field}`" :aria-label="t(`measurements.form.${field}`)" v-model.number="form[field as keyof typeof form]" type="number" step="0.1" />
            </div>
          </div>
          <div class="md:col-span-4">
            <label class="text-[11px] font-bold uppercase mb-1 block">{{ t('measurements.form.notes') }}</label>
            <Input v-model="form.notes" :placeholder="t('measurements.form.notesPlaceholder')" />
          </div>
        </CardContent>
        <CardFooter class="flex justify-end gap-3 bg-muted/5 py-4 border-t">
          <Button variant="ghost" @click="resetForm">
            {{ t('common.cancel') }}
          </Button>
          <Button :disabled="saving" @click="saveMeasurement">
            <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
            {{ editingId ? t('measurements.form.update') : t('measurements.form.create') }}
          </Button>
        </CardFooter>
      </Card>
    </Transition>

    <div class="space-y-4">

      <div v-if="filteredMeasurements.length === 0" class="text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed" role="status" aria-live="polite">
        <ClipboardList class="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
        <p class="text-sm text-muted-foreground">{{ t('measurements.noData') }}</p>
        <div class="mt-4">
          <Button @click="openNewMeasurement">{{ t('measurements.newMeasurement') }}</Button>
        </div>
      </div>

      <TransitionGroup tag="div" name="grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-live="polite">
        <Card v-for="m in filteredMeasurements" :key="m.id" role="listitem" class="group relative overflow-hidden transition-all hover:border-primary/50 shadow-sm card-interactive">
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
                <Button variant="ghost" size="icon" class="h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" @click="editMeasurement(m)" :aria-label="t('common.edit')">
                  <Edit3 class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" class="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" @click="measurementToDelete = m; isDeleteDialogOpen = true" :aria-label="t('common.delete')">
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div class="p-5 flex justify-around items-center border-b">
              <div class="text-center">
                <p class="text-[10px] uppercase text-muted-foreground">
                  {{ t('measurements.card.weight') }}
                </p>
                <p class="font-black text-xl text-foreground">
                  {{ m.weight }}<span class="text-xs font-normal ml-0.5">kg</span>
                </p>
              </div>
              <Separator orientation="vertical" class="h-8" />
              <div class="text-center">
                <p class="text-[10px] uppercase text-muted-foreground">
                  {{ t('measurements.card.height') }}
                </p>
                <p class="font-black text-xl text-foreground">
                  {{ m.height }}<span class="text-xs font-normal ml-0.5">cm</span>
                </p>
              </div>
            </div>

            <div class="grid grid-cols-3 divide-x bg-muted/10">
              <div class="p-2 text-center text-xs">
                <p class="text-[9px] uppercase text-muted-foreground">
                  {{ t('measurements.card.chest') }}
                </p>
                <span class="font-bold">{{ m.chest || '-' }}</span>
              </div>
              <div class="p-2 text-center text-xs">
                <p class="text-[9px] uppercase text-muted-foreground">
                  {{ t('measurements.card.waist') }}
                </p>
                <span class="font-bold">{{ m.waist || '-' }}</span>
              </div>
              <div class="p-2 text-center text-xs">
                <p class="text-[9px] uppercase text-muted-foreground">
                  {{ t('measurements.card.hip') }}
                </p>
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
              <CardTitle class="text-sm font-bold">
                {{ t('measurements.analysisTitle') }}
              </CardTitle>
              <CardDescription class="text-[11px]">
                {{ getAthleteFullName(props.selectedAthleteId) }}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="pt-6">
          <ClientOnly>
            <VueApexCharts type="line" :options="chartOptions" :series="chartSeries" height="300" />
          </ClientOnly>
        </CardContent>
      </Card>
    </Transition>

    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent class="max-w-xs">
        <DialogHeader><DialogTitle>{{ t('common.delete') }}</DialogTitle></DialogHeader>
        <p class="text-sm py-2 text-muted-foreground">
          {{ t('measurements.toast.deleted') }}?
        </p>
        <div class="flex flex-col gap-2">
          <Button variant="destructive" :disabled="deleting" @click="confirmDelete">
            <Loader2 v-if="deleting" class="mr-2 h-4 w-4 animate-spin" />
            {{ t('common.delete') }}
          </Button>
          <Button variant="ghost" @click="isDeleteDialogOpen = false">
            {{ t('common.cancel') }}
          </Button>
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

<style scoped>
.card-interactive:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(2,6,23,0.06); }
.card-interactive:focus-within { outline: 2px solid rgba(99,102,241,0.15); }
</style>
