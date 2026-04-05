<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '~/stores/dashboardStore'

const { t } = useI18n()
const dashboardStore = useDashboardStore()

const athletes = computed(() => dashboardStore.data?.athleteStatusMatrix ?? [])

function readinessColor(value: number): string {
  if (value >= 80)
    return 'bg-green-500'
  if (value >= 60)
    return 'bg-blue-500'
  if (value >= 40)
    return 'bg-yellow-500'
  return 'bg-red-500'
}

function readinessTextColor(value: number): string {
  if (value >= 80)
    return 'text-green-700 dark:text-green-400'
  if (value >= 60)
    return 'text-blue-700 dark:text-blue-400'
  if (value >= 40)
    return 'text-yellow-700 dark:text-yellow-400'
  return 'text-red-700 dark:text-red-400'
}

// ACWR safe zone: 0.8 – 1.3
function acwrBadgeClass(acwr: number): string {
  if (acwr === 0)
    return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  if (acwr >= 0.8 && acwr <= 1.3)
    return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
  if (acwr > 1.3 && acwr <= 1.5)
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
  if (acwr > 1.5)
    return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
  // < 0.8 undertraining
  return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
}

function acwrLabel(acwr: number): string {
  if (acwr === 0)
    return t('dashboard.acwrZone.noData')
  if (acwr >= 0.8 && acwr <= 1.3)
    return t('dashboard.acwrZone.optimal')
  if (acwr > 1.3 && acwr <= 1.5)
    return t('dashboard.acwrZone.caution')
  if (acwr > 1.5)
    return t('dashboard.acwrZone.critical')
  return t('dashboard.acwrZone.low')
}

const sortedAthletes = computed(() => {
  return [...athletes.value].sort((a, b) => a.readiness - b.readiness)
})
</script>

<template>
  <div class="h-full flex flex-col gap-3 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between shrink-0">
      <h3 class="text-base font-semibold text-foreground">
        {{ t('dashboard.widget.athleteStatus') }}
      </h3>
      <span class="text-xs text-muted-foreground">
        {{ athletes.length }} {{ t('dashboard.athletes') }}
      </span>
    </div>

    <!-- Table -->
    <div v-if="sortedAthletes.length" class="flex-1 overflow-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border">
            <th class="text-left text-xs font-medium text-muted-foreground pb-2 pr-4">
              {{ t('dashboard.table.athlete') }}
            </th>
            <th class="text-left text-xs font-medium text-muted-foreground pb-2 pr-4 w-40">
              {{ t('dashboard.table.readiness') }}
            </th>
            <th class="text-center text-xs font-medium text-muted-foreground pb-2 pr-4">
              {{ t('dashboard.table.acwr') }}
            </th>
            <th class="text-center text-xs font-medium text-muted-foreground pb-2">
              {{ t('dashboard.table.zone') }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr
            v-for="athlete in sortedAthletes"
            :key="athlete.name"
            class="hover:bg-muted/30 transition-colors"
          >
            <!-- Name -->
            <td class="py-2.5 pr-4">
              <span class="font-medium text-foreground">{{ athlete.name }}</span>
            </td>

            <!-- Readiness bar -->
            <td class="py-2.5 pr-4">
              <div class="flex items-center gap-2">
                <div class="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :class="readinessColor(athlete.readiness)"
                    :style="{ width: `${athlete.readiness}%` }"
                  />
                </div>
                <span class="text-xs font-semibold w-8 text-right shrink-0" :class="readinessTextColor(athlete.readiness)">
                  {{ athlete.readiness }}%
                </span>
              </div>
            </td>

            <!-- ACWR value -->
            <td class="py-2.5 pr-4 text-center">
              <span class="text-sm font-mono font-semibold text-foreground">
                {{ athlete.acwr.toFixed(2) }}
              </span>
            </td>

            <!-- Zone badge -->
            <td class="py-2.5 text-center">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                :class="acwrBadgeClass(athlete.acwr)"
              >
                {{ acwrLabel(athlete.acwr) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty -->
    <div v-else class="flex-1 flex items-center justify-center text-sm text-muted-foreground">
      {{ t('dashboard.noData') }}
    </div>

    <!-- ACWR legend -->
    <div class="shrink-0 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground border-t border-border pt-2">
      <span class="flex items-center gap-1">
        <span class="inline-block w-2 h-2 rounded-full bg-slate-400" />
        {{ t('dashboard.acwrZone.low') }} (&lt;0.8)
      </span>
      <span class="flex items-center gap-1">
        <span class="inline-block w-2 h-2 rounded-full bg-green-500" />
        {{ t('dashboard.acwrZone.optimal') }} (0.8–1.3)
      </span>
      <span class="flex items-center gap-1">
        <span class="inline-block w-2 h-2 rounded-full bg-yellow-500" />
        {{ t('dashboard.acwrZone.caution') }} (1.3–1.5)
      </span>
      <span class="flex items-center gap-1">
        <span class="inline-block w-2 h-2 rounded-full bg-red-500" />
        {{ t('dashboard.acwrZone.critical') }} (&gt;1.5)
      </span>
    </div>
  </div>
</template>
