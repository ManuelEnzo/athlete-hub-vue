/**
 * 🎯 ADVANCED FILTER MODAL - CENTRALIZZATO
 *
 * Filtri intelligenti con:
 * - Multi-select athletes
 * - Date range picker
 * - Metric filters
 * - Preset configurations
 * - Save/Load filter states
 *
 * Save as: app/components/dashboard/AdvancedFilterModal.vue
 */

<script setup lang="ts">
import { Filter, RotateCcw, Save, X } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAthletesStore } from '~/stores/athletesStore'
import { useDashboardStore } from '~/stores/dashboardStore'

// Props & Emits
const props = defineProps<{
  isOpen: boolean
}>()
const emit = defineEmits<{
  close: []
  apply: [filters: FilterState]
}>()
const { t } = useI18n()
const _dashStore = useDashboardStore()
const athletesStore = useAthletesStore()

// Load athletes list when modal first opens
onMounted(() => {
  if (!athletesStore.items.length)
    athletesStore.initialize()
})
watch(() => props.isOpen, (open) => {
  if (open && !athletesStore.items.length)
    athletesStore.initialize()
})

// Filter State
interface FilterState {
  athletes: number[]
  athleteNames: string[] // resolved full names at apply-time
  dateRange: {
    from: string
    to: string
  }
  metrics: {
    readiness: [number, number] // min, max
    workload: [number, number]
    fatigue: [number, number]
    soreness: [number, number]
  }
  groups: string[]
  presetName?: string
}

const filters = ref<FilterState>({
  athletes: [],
  athleteNames: [],
  dateRange: {
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!,
    to: new Date().toISOString().split('T')[0]!,
  },
  metrics: {
    readiness: [0, 100],
    workload: [0, 100],
    fatigue: [0, 100],
    soreness: [0, 100],
  },
  groups: [],
  presetName: undefined,
})

const savedPresets = ref<Record<string, FilterState>>({
  'Last 7 Days': filters.value,
  'This Month': {
    ...filters.value,
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!,
      to: new Date().toISOString().split('T')[0]!,
    },
  },
})

const presetName = ref('')
const filterModified = ref(false)

// Computed
const selectedAthletesCount = computed(() => filters.value.athletes.length)
const isFiltersActive = computed(() => {
  return filters.value.athletes.length > 0
    || filters.value.groups.length > 0
    || Object.values(filters.value.metrics).some(([min, max]) => min !== 0 || max !== 100)
})

const daysInRange = computed(() => {
  const from = new Date(filters.value.dateRange.from)
  const to = new Date(filters.value.dateRange.to)
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
})

// Methods
function toggleAthlete(athleteId: number) {
  const idx = filters.value.athletes.indexOf(athleteId)
  if (idx > -1) {
    filters.value.athletes.splice(idx, 1)
  }
  else {
    filters.value.athletes.push(athleteId)
  }
  filterModified.value = true
}

function selectAllAthletes() {
  if (selectedAthletesCount.value === athletesStore.items.length) {
    filters.value.athletes = []
  }
  else {
    filters.value.athletes = athletesStore.items.map(a => a.id || 0)
  }
  filterModified.value = true
}

function _toggleGroup(group: string) {
  const idx = filters.value.groups.indexOf(group)
  if (idx > -1) {
    filters.value.groups.splice(idx, 1)
  }
  else {
    filters.value.groups.push(group)
  }
  filterModified.value = true
}

function updateMetricRange(metric: keyof FilterState['metrics'], min: number, max: number) {
  filters.value.metrics[metric] = [min, max]
  filterModified.value = true
}

function applyFilters() {
  // Resolve names here where we have athletesStore access — the store uses names directly
  const resolvedNames = athletesStore.items
    .filter(a => filters.value.athletes.includes(a.id || 0))
    .map(a => a.fullName)
  emit('apply', { ...filters.value, athleteNames: resolvedNames })
  emit('close')
}

function resetFilters() {
  filters.value = {
    athletes: [],
    athleteNames: [],
    dateRange: {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!,
      to: new Date().toISOString().split('T')[0]!,
    },
    metrics: {
      readiness: [0, 100],
      workload: [0, 100],
      fatigue: [0, 100],
      soreness: [0, 100],
    },
    groups: [],
  }
  filterModified.value = false
}

function savePreset() {
  if (presetName.value.trim()) {
    savedPresets.value[presetName.value] = { ...filters.value, presetName: presetName.value }
    presetName.value = ''
  }
}

function loadPreset(name: string) {
  const preset = savedPresets.value[name]
  if (preset) {
    filters.value = { ...preset }
    filterModified.value = false
  }
}

function _deletePreset(name: string) {
  delete savedPresets.value[name]
}

watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    filterModified.value = false
  }
})
</script>

<template>
  <!-- Modal Backdrop -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      @click="emit('close')"
    />
  </Transition>

  <!-- Modal -->
  <Transition name="slide">
    <div
      v-if="isOpen"
      class="fixed right-0 top-0 z-50 h-full w-full max-w-2xl bg-background shadow-2xl overflow-y-auto"
    >
      <!-- Header -->
      <div class="sticky top-0 z-10 border-b bg-background px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Filter class="w-5 h-5 text-primary" />
          <h2 class="text-lg font-bold">
            {{ t('dashboard.filters.title') }}
          </h2>
          <span v-if="isFiltersActive" class="ml-2 inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">
            {{ selectedAthletesCount }} {{ t('dashboard.filters.athletes') }}
          </span>
        </div>
        <button class="p-1 hover:bg-secondary rounded" @click="emit('close')">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Presets -->
        <div>
          <h3 class="text-sm font-semibold mb-3">
            {{ t('dashboard.filters.presets') }}
          </h3>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="(preset, name) in savedPresets"
              :key="name"
              class="px-3 py-2 rounded border text-sm hover:bg-secondary transition"
              @click="loadPreset(name)"
            >
              {{ name }}
            </button>
          </div>

          <!-- Save New Preset -->
          <div v-if="filterModified" class="mt-3 flex gap-2">
            <input
              v-model="presetName"
              type="text"
              :placeholder="t('dashboard.filters.presetNamePlaceholder')"
              class="flex-1 px-3 py-2 rounded border bg-background text-foreground"
            >
            <button
              class="px-3 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 flex items-center gap-1"
              @click="savePreset"
            >
              <Save class="w-4 h-4" />
              {{ t('dashboard.filters.save') }}
            </button>
          </div>
        </div>

        <!-- Athletes Selection -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold">
              {{ t('dashboard.filters.athletes') }}
            </h3>
            <button
              class="text-xs text-primary hover:underline"
              @click="selectAllAthletes"
            >
              {{ selectedAthletesCount === athletesStore.items.length ? t('dashboard.filters.deselectAll') : t('dashboard.filters.selectAll') }}
            </button>
          </div>

          <div class="max-h-40 overflow-y-auto space-y-2 border rounded-lg p-3">
            <label
              v-for="athlete in athletesStore.items"
              :key="athlete.id"
              class="flex items-center gap-2 cursor-pointer hover:bg-secondary p-2 rounded"
            >
              <input
                type="checkbox"
                :checked="filters.athletes.includes(athlete.id || 0)"
                class="rounded"
                @change="toggleAthlete(athlete.id || 0)"
              >
              <span class="text-sm">{{ athlete.fullName }}</span>
            </label>
          </div>
        </div>

        <!-- Date Range -->
        <div>
          <h3 class="text-sm font-semibold mb-3">
            {{ t('dashboard.filters.dateRange') }}
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs text-muted-foreground">{{ t('dashboard.filters.from') }}</label>
              <input
                v-model="filters.dateRange.from"
                type="date"
                class="w-full px-3 py-2 rounded border bg-background text-foreground"
              >
            </div>
            <div>
              <label class="text-xs text-muted-foreground">{{ t('dashboard.filters.to') }}</label>
              <input
                v-model="filters.dateRange.to"
                type="date"
                class="w-full px-3 py-2 rounded border bg-background text-foreground"
              >
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-2">
            {{ daysInRange }} {{ t('dashboard.filters.days') }}
          </p>
        </div>

        <!-- Metric Ranges -->
        <div>
          <h3 class="text-sm font-semibold mb-3">
            {{ t('dashboard.filters.metrics') }}
          </h3>
          <div class="space-y-3">
            <!-- Readiness -->
            <div>
              <label class="text-xs font-medium">{{ t('dashboard.filters.readiness') }}: {{ filters.metrics.readiness[0] }} - {{ filters.metrics.readiness[1] }}%</label>
              <input
                type="range"
                min="0"
                max="100"
                :value="filters.metrics.readiness[0]"
                class="w-full mt-1"
                @input="updateMetricRange('readiness', Number(($event.target as HTMLInputElement).value), filters.metrics.readiness[1])"
              >
              <input
                type="range"
                min="0"
                max="100"
                :value="filters.metrics.readiness[1]"
                class="w-full"
                @input="updateMetricRange('readiness', filters.metrics.readiness[0], Number(($event.target as HTMLInputElement).value))"
              >
            </div>

            <!-- Workload -->
            <div>
              <label class="text-xs font-medium">{{ t('dashboard.filters.workload') }}: {{ filters.metrics.workload[0] }} - {{ filters.metrics.workload[1] }}%</label>
              <input
                type="range"
                min="0"
                max="100"
                :value="filters.metrics.workload[0]"
                class="w-full mt-1"
                @input="updateMetricRange('workload', Number(($event.target as HTMLInputElement).value), filters.metrics.workload[1])"
              >
            </div>

            <!-- Fatigue -->
            <div>
              <label class="text-xs font-medium">{{ t('dashboard.filters.fatigue') }}: {{ filters.metrics.fatigue[0] }} - {{ filters.metrics.fatigue[1] }}%</label>
              <input
                type="range"
                min="0"
                max="100"
                :value="filters.metrics.fatigue[0]"
                class="w-full mt-1"
                @input="updateMetricRange('fatigue', Number(($event.target as HTMLInputElement).value), filters.metrics.fatigue[1])"
              >
            </div>

            <!-- Soreness -->
            <div>
              <label class="text-xs font-medium">{{ t('dashboard.filters.soreness') }}: {{ filters.metrics.soreness[0] }} - {{ filters.metrics.soreness[1] }}%</label>
              <input
                type="range"
                min="0"
                max="100"
                :value="filters.metrics.soreness[0]"
                class="w-full mt-1"
                @input="updateMetricRange('soreness', Number(($event.target as HTMLInputElement).value), filters.metrics.soreness[1])"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="sticky bottom-0 border-t bg-background px-6 py-4 flex gap-3">
        <button
          class="flex-1 px-4 py-2 rounded border text-sm font-medium hover:bg-secondary transition flex items-center justify-center gap-2"
          @click="resetFilters"
        >
          <RotateCcw class="w-4 h-4" />
          {{ t('dashboard.filters.reset') }}
        </button>
        <button
          class="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition"
          @click="applyFilters"
        >
          {{ t('dashboard.filters.apply') }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
