<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '~/stores/dashboardStore'

const { t } = useI18n()
const dashboardStore = useDashboardStore()

const data = computed(() => dashboardStore.filteredData?.workloadComparison ?? [])

const maxValue = computed(() => {
  const max = Math.max(...data.value.map(d => d.value), 1)
  // Round up to nearest 100 for clean grid lines
  return Math.ceil(max / 100) * 100
})

const totalWeekly = computed(() => data.value.reduce((s, d) => s + d.value, 0))

const avgDaily = computed(() => {
  if (!data.value.length)
    return 0
  return Math.round(totalWeekly.value / data.value.length)
})

const peakDay = computed(() => {
  return data.value.reduce((max, d) => d.value > max.value ? d : max, { label: '—', value: 0 })
})

function barHeight(value: number): string {
  return `${Math.round((value / maxValue.value) * 100)}%`
}

function barColor(value: number): string {
  const ratio = value / maxValue.value
  if (ratio >= 0.85)
    return 'bg-red-500'
  if (ratio >= 0.65)
    return 'bg-yellow-500'
  return 'bg-primary'
}

// Grid lines at 25%, 50%, 75%, 100%
const gridLines = computed(() => {
  return [100, 75, 50, 25].map(pct => ({
    pct,
    label: Math.round(maxValue.value * pct / 100),
  }))
})
</script>

<template>
  <div class="h-full flex flex-col gap-3">
    <!-- Header -->
    <div class="flex items-center justify-between shrink-0">
      <h3 class="text-base font-semibold text-foreground">
        {{ t('dashboard.widget.workloadAnalysis') }}
      </h3>
      <div class="flex items-center gap-4 text-xs text-muted-foreground">
        <span>
          <span class="font-semibold text-foreground">{{ totalWeekly }}</span>
          {{ t('dashboard.workload.totalWeekly') }}
        </span>
        <span>
          <span class="font-semibold text-foreground">{{ avgDaily }}</span>
          {{ t('dashboard.workload.avgLabel') }}
        </span>
      </div>
    </div>

    <!-- Chart -->
    <div v-if="data.length" class="flex-1 min-h-0 flex gap-2">
      <!-- Y-axis labels -->
      <div class="flex flex-col justify-between text-right shrink-0 w-10 pb-5">
        <span v-for="line in gridLines" :key="line.pct" class="text-[10px] text-muted-foreground leading-none">
          {{ line.label }}
        </span>
      </div>

      <!-- Bars area -->
      <div class="flex-1 flex flex-col">
        <!-- Plot area with grid lines -->
        <div class="flex-1 relative">
          <!-- Grid lines -->
          <div
            v-for="line in gridLines"
            :key="line.pct"
            class="absolute w-full border-t border-border/40"
            :style="{ top: `${100 - line.pct}%` }"
          />

          <!-- Bars -->
          <div class="absolute inset-0 flex items-end justify-around gap-1 px-1">
            <div
              v-for="point in data"
              :key="point.label"
              class="flex-1 flex items-end justify-center"
              style="height: 100%"
            >
              <div
                class="w-full rounded-t transition-all duration-300 min-h-[2px] relative group"
                :class="barColor(point.value)"
                :style="{ height: barHeight(point.value) }"
              >
                <!-- Tooltip on hover -->
                <div class="absolute -top-7 left-1/2 -translate-x-1/2 bg-popover border border-border text-foreground text-[10px] px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  {{ point.value }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- X-axis labels -->
        <div class="flex justify-around pt-1 shrink-0">
          <span
            v-for="point in data"
            :key="point.label"
            class="flex-1 text-center text-[10px] text-muted-foreground"
          >{{ point.label }}</span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="flex-1 flex items-center justify-center text-muted-foreground text-sm">
      {{ t('dashboard.noData') }}
    </div>

    <!-- Legend -->
    <div class="shrink-0 flex items-center gap-4 text-[11px] text-muted-foreground border-t border-border pt-2">
      <span class="flex items-center gap-1">
        <span class="inline-block w-2.5 h-2.5 rounded-sm bg-primary" />
        {{ t('dashboard.workload.legendNormal') }}
      </span>
      <span class="flex items-center gap-1">
        <span class="inline-block w-2.5 h-2.5 rounded-sm bg-yellow-500" />
        {{ t('dashboard.workload.legendMedium') }}
      </span>
      <span class="flex items-center gap-1">
        <span class="inline-block w-2.5 h-2.5 rounded-sm bg-red-500" />
        {{ t('dashboard.workload.legendHigh') }}
      </span>
      <span class="ml-auto text-foreground font-medium">
        {{ t('dashboard.workload.peak') }}: {{ peakDay.label }} ({{ peakDay.value }})
      </span>
    </div>
  </div>
</template>
