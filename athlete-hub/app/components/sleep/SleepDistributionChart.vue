<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import type { SleepResponseDto } from '@/types/api'
import { SleepDataSource } from '@/types/api'
import { ClientOnly } from '#components'
import { computed, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const VueApexCharts = defineAsyncComponent(() => import('vue3-apexcharts'))

const props = defineProps<{
  history: SleepResponseDto[]
  loading: boolean
}>()

const { t } = useI18n()

const sorted = computed(() =>
  [...props.history]
    .filter(e => e.source === SleepDataSource.Device)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
)

const categories = computed(() => sorted.value.map(e => {
  const d = new Date(e.date)
  return `${d.getDate()}/${d.getMonth() + 1}`
}))

const series = computed(() => [
  {
    name: t('sleep.stages.deep'),
    data: sorted.value.map(e => e.deepSleepHours ?? 0),
  },
  {
    name: t('sleep.stages.rem'),
    data: sorted.value.map(e => e.remSleepHours ?? 0),
  },
  {
    name: t('sleep.stages.core'),
    data: sorted.value.map(e => {
      const total = e.hoursSlept ?? 0
      const deep = e.deepSleepHours ?? 0
      const rem = e.remSleepHours ?? 0
      const awake = e.awakeTime ?? 0
      return Math.max(0, total - deep - rem - awake)
    }),
  },
  {
    name: t('sleep.stages.awake'),
    data: sorted.value.map(e => e.awakeTime ?? 0),
  },
])

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    stacked: true,
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  colors: ['#6366f1', '#a78bfa', '#94a3b8', '#f87171'],
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: false,
      columnWidth: '55%',
      borderRadiusApplication: 'end',
      borderRadiusWhenStacked: 'last',
    },
  },
  xaxis: {
    categories: categories.value,
    labels: { style: { fontSize: '11px', fontWeight: 600 } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: { formatter: (v: number) => `${v.toFixed(1)}h` },
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: { formatter: (v: number) => `${v?.toFixed(1)}h` },
  },
  legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px' },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
  dataLabels: { enabled: false },
}))
</script>

<template>
  <Card>
    <CardHeader class="pb-2">
      <CardTitle class="text-sm font-black uppercase tracking-widest text-muted-foreground">
        {{ t('sleep.chart.distributionTitle') }}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="loading" class="space-y-2">
        <Skeleton class="h-[220px] w-full rounded-lg" />
      </div>
      <div v-else-if="!sorted.length" class="h-[220px] flex items-center justify-center text-muted-foreground text-sm font-medium">
        {{ t('sleep.noData') }}
      </div>
      <ClientOnly v-else>
        <VueApexCharts
          type="bar"
          height="220"
          :options="chartOptions"
          :series="series"
        />
      </ClientOnly>
    </CardContent>
  </Card>
</template>
