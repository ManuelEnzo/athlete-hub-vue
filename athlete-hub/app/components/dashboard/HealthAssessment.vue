/**
 * 🛡️ HEALTH & RISK ASSESSMENT COMPONENT
 *
 * Visualizza stato di salute e rischio per ogni atleta
 * - Indicatori di salute con colori (green/yellow/red)
 * - Risk score 0-100 con breakpoints
 * - Raccomandazioni intelligenti per coach
 * - Animazioni smooth
 *
 * Usage:
 * <HealthAssessment />
 */

<script setup lang="ts">
import type { AthleteHealthStatusDto } from '~/types/api'
import { CheckCircle } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAthletesStore } from '~/stores/athletesStore'
import { useDashboardStore } from '~/stores/dashboardStore'

const dashboardStore = useDashboardStore()
const athletesStore = useAthletesStore()
const { t } = useI18n()

// Get athletes health data from store
const athletesHealth = computed(() => {
  return dashboardStore.data?.athletesHealth ? Object.values(dashboardStore.data.athletesHealth) as AthleteHealthStatusDto[] : []
})

// Helper function for status color
function getStatusColor(readiness: number) {
  if (readiness >= 80)
    return 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800'
  if (readiness >= 60)
    return 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800'
  if (readiness >= 40)
    return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800'
  return 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
}

// Get athlete name by id
function getAthleteName(athleteId: number) {
  const athlete = athletesStore.items.find(a => a.id === athleteId)
  return athlete ? `${athlete.firstName} ${athlete.lastName}` : `Athlete ${athleteId}`
}
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold text-foreground">
      {{ t('dashboard.health.title') }}
    </h3>
    <div v-if="athletesHealth.length === 0" class="text-center py-8 text-muted-foreground">
      {{ t('dashboard.health.noData') }}
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="health in athletesHealth.slice(0, 6)"
        :key="health.athleteId"
        class="rounded-lg border transition-all p-4"
        :class="getStatusColor(health.readiness)"
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div>
            <h4 class="font-bold text-base">
              {{ getAthleteName(health.athleteId) }}
            </h4>
            <p class="text-sm opacity-75">
              {{ t('dashboard.health.athlete') }}
            </p>
          </div>
          <div class="flex items-center gap-1.5 text-green-600">
            <CheckCircle class="h-5 w-5" />
            <span class="text-sm font-semibold">{{ t('dashboard.health.status.healthy') }}</span>
          </div>
        </div>

        <!-- Readiness -->
        <div class="bg-white dark:bg-slate-800 rounded p-3 text-center mb-3">
          <p class="text-xs text-muted-foreground mb-1">
            {{ t('dashboard.health.readiness') }}
          </p>
          <p class="text-2xl font-bold text-blue-600">
            {{ health.readiness }}%
          </p>
          <div class="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
              :style="{ width: `${health.readiness}%` }"
            />
          </div>
        </div>

        <!-- ACWR -->
        <div class="bg-white dark:bg-slate-800 rounded p-3 text-center">
          <p class="text-xs text-muted-foreground mb-1">
            ACWR
          </p>
          <p class="text-2xl font-bold" :class="health.acwr > 1.5 ? 'text-red-600' : 'text-green-600'">
            {{ health.acwr.toFixed(2) }}
          </p>
          <p class="text-xs mt-2" :class="health.acwr > 1.5 ? 'text-red-600' : 'text-green-600'">
            {{ health.acwr > 1.5 ? t('dashboard.health.acwrHighRisk') : t('dashboard.health.acwrOptimal') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth animations */
@keyframes healthPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.health-pulse {
  animation: healthPulse 2s ease-in-out infinite;
}
</style>
