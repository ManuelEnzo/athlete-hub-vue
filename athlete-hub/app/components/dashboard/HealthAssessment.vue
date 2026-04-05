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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '~/stores/dashboardStore'

const { t } = useI18n()
const dashboardStore = useDashboardStore()

const healthDistribution = computed(() => dashboardStore.data?.healthDistribution ?? [])
const disciplineDistribution = computed(() => dashboardStore.data?.disciplineDistribution ?? [])

const totalAthletes = computed(() =>
  healthDistribution.value.reduce((s, h) => s + h.count, 0),
)

function barWidth(count: number): string {
  if (!totalAthletes.value)
    return '0%'
  return `${Math.round((count / totalAthletes.value) * 100)}%`
}

const disciplineTotal = computed(() =>
  disciplineDistribution.value.reduce((s, d) => s + d.count, 0),
)

function discBarWidth(count: number): string {
  if (!disciplineTotal.value)
    return '0%'
  return `${Math.round((count / disciplineTotal.value) * 100)}%`
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Health Distribution -->
    <div>
      <h4 class="text-sm font-semibold text-foreground mb-3">
        {{ t('dashboard.health.title') }}
      </h4>
      <div v-if="healthDistribution.length" class="space-y-2.5">
        <div
          v-for="item in healthDistribution"
          :key="item.status"
          class="flex items-center gap-3"
        >
          <span class="text-xs text-muted-foreground w-20 shrink-0 text-right">{{ item.status }}</span>
          <div class="flex-1 h-5 bg-muted rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :style="{ width: barWidth(item.count), backgroundColor: item.color }"
            />
          </div>
          <span class="text-sm font-bold w-6 shrink-0 text-foreground">{{ item.count }}</span>
        </div>
      </div>
      <p v-else class="text-sm text-muted-foreground">
        {{ t('dashboard.health.noData') }}
      </p>
    </div>

    <!-- Discipline Distribution -->
    <div>
      <h4 class="text-sm font-semibold text-foreground mb-3">
        {{ t('dashboard.discipline.title') }}
      </h4>
      <div v-if="disciplineDistribution.length" class="space-y-2.5">
        <div
          v-for="item in disciplineDistribution"
          :key="item.discipline"
          class="flex items-center gap-3"
        >
          <span class="text-xs text-muted-foreground w-20 shrink-0 text-right truncate">{{ item.discipline }}</span>
          <div class="flex-1 h-5 bg-muted rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-primary transition-all duration-500"
              :style="{ width: discBarWidth(item.count) }"
            />
          </div>
          <span class="text-sm font-bold w-6 shrink-0 text-foreground">{{ item.count }}</span>
        </div>
      </div>
      <p v-else class="text-sm text-muted-foreground">
        {{ t('dashboard.noData') }}
      </p>
    </div>
  </div>
</template>

