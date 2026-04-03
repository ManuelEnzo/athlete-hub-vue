/**
 * ⚡ READINESS WIDGET - VISUALIZZAZIONE PRINCIPALE
 *
 * Widget di readiness con:
 * - Gauge circolari per atleti
 * - Team overview
 * - Trend indicators
 * - Risk highlighting
 *
 * Save as: app/components/dashboard/widgets/ReadinessWidget.vue
 */

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useDataFormatting } from '~/composables/useDashboardComposables'
import { useAthletesStore } from '~/stores/athletesStore'
import { useDashboardStore } from '~/stores/dashboardStore'

const dashStore = useDashboardStore()
const _athletesStore = useAthletesStore()
const { formatPercent: _formatPercent } = useDataFormatting()

const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  try {
    await _athletesStore.initialize()
  }
  finally {
    isLoading.value = false
  }
})

// Readiness Distribution
const readinessDistribution = computed(() => {
  if (!dashStore.athletes || dashStore.athletes.length === 0)
    return { excellent: 0, good: 0, moderate: 0, poor: 0 }

  const dist = { excellent: 0, good: 0, moderate: 0, poor: 0 }

  dashStore.athletes.forEach((athlete: any) => {
    const readiness = athlete.readinessScore || 0
    if (readiness >= 80)
      dist.excellent++
    else if (readiness >= 60)
      dist.good++
    else if (readiness >= 40)
      dist.moderate++
    else dist.poor++
  })

  return dist
})

// Team Average
const teamAverage = computed(() => {
  if (!dashStore.athletes || dashStore.athletes.length === 0)
    return 0
  const sum = (dashStore.athletes as any[]).reduce((acc, a) => acc + (a.readinessScore || 0), 0)
  return Math.round(sum / dashStore.athletes.length)
})

// Status color
function getStatusColor(value: number) {
  if (value >= 80)
    return 'bg-green-500'
  if (value >= 60)
    return 'bg-blue-500'
  if (value >= 40)
    return 'bg-yellow-500'
  return 'bg-red-500'
}

function getStatusClass(value: number) {
  if (value >= 80)
    return 'text-green-600'
  if (value >= 60)
    return 'text-blue-600'
  if (value >= 40)
    return 'text-yellow-600'
  return 'text-red-600'
}

function getStatusLabel(value: number) {
  if (value >= 80)
    return 'Excellent'
  if (value >= 60)
    return 'Good'
  if (value >= 40)
    return 'Moderate'
  return 'Poor'
}
</script>

<template>
  <div class="h-full flex flex-col overflow-auto space-y-4">
    <!-- Team Overview -->
    <div class="grid grid-cols-4 gap-4">
      <!-- Team Average -->
      <div class="rounded-lg border bg-card p-4">
        <p class="text-xs text-muted-foreground">
          Team Average
        </p>
        <div class="mt-2 flex items-end gap-3">
          <div class="text-3xl font-bold" :class="getStatusClass(teamAverage)">
            {{ teamAverage }}%
          </div>
          <div class="mb-1 text-xs text-muted-foreground">
            {{ getStatusLabel(teamAverage) }}
          </div>
        </div>
      </div>

      <!-- Excellent -->
      <div class="rounded-lg border bg-card p-4">
        <p class="text-xs text-green-600 font-semibold">
          Excellent
        </p>
        <p class="mt-2 text-2xl font-bold">
          {{ readinessDistribution.excellent }}
        </p>
        <p class="text-xs text-muted-foreground">
          ≥80%
        </p>
      </div>

      <!-- Good -->
      <div class="rounded-lg border bg-card p-4">
        <p class="text-xs text-blue-600 font-semibold">
          Good
        </p>
        <p class="mt-2 text-2xl font-bold">
          {{ readinessDistribution.good }}
        </p>
        <p class="text-xs text-muted-foreground">
          60-79%
        </p>
      </div>

      <!-- At Risk -->
      <div class="rounded-lg border bg-card p-4">
        <p class="text-xs text-red-600 font-semibold">
          At Risk
        </p>
        <p class="mt-2 text-2xl font-bold">
          {{ readinessDistribution.moderate + readinessDistribution.poor }}
        </p>
        <p class="text-xs text-muted-foreground">
          &lt;60%
        </p>
      </div>
    </div>

    <!-- Distribution Bar -->
    <div class="rounded-lg border bg-card p-4">
      <p class="text-sm font-semibold mb-3">
        Readiness Distribution
      </p>
      <div class="flex h-8 gap-1 rounded-full overflow-hidden bg-secondary">
        <div
          v-if="readinessDistribution.excellent > 0"
          :style="{ flex: readinessDistribution.excellent }"
          class="bg-green-500 hover:bg-green-600 transition"
          :title="`Excellent: ${readinessDistribution.excellent}`"
        />
        <div
          v-if="readinessDistribution.good > 0"
          :style="{ flex: readinessDistribution.good }"
          class="bg-blue-500 hover:bg-blue-600 transition"
          :title="`Good: ${readinessDistribution.good}`"
        />
        <div
          v-if="readinessDistribution.moderate > 0"
          :style="{ flex: readinessDistribution.moderate }"
          class="bg-yellow-500 hover:bg-yellow-600 transition"
          :title="`Moderate: ${readinessDistribution.moderate}`"
        />
        <div
          v-if="readinessDistribution.poor > 0"
          :style="{ flex: readinessDistribution.poor }"
          class="bg-red-500 hover:bg-red-600 transition"
          :title="`Poor: ${readinessDistribution.poor}`"
        />
      </div>
    </div>

    <!-- Athletes List -->
    <div class="rounded-lg border bg-card p-4">
      <p class="text-sm font-semibold mb-3">
        Athletes by Readiness
      </p>
      <div v-if="isLoading" class="text-center py-4 text-muted-foreground">
        Loading...
      </div>
      <div v-else class="space-y-2 max-h-64 overflow-y-auto">
        <div
          v-for="athlete in _athletesStore.items.slice(0, 10)"
          :key="athlete.id"
          class="flex items-center justify-between p-3 rounded border hover:bg-secondary transition"
        >
          <div class="flex items-center gap-3 flex-1">
            <div
              class="w-3 h-3 rounded-full" :class="[
                getStatusColor((athlete as any).readinessScore || 0),
              ]"
            />
            <div>
              <p class="text-sm font-medium">
                {{ athlete.fullName || `${athlete.firstName} ${athlete.lastName}` }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ athlete.email }}
              </p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold" :class="getStatusClass((athlete as any).readinessScore || 0)">
              {{ (athlete as any).readinessScore || 0 }}%
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
