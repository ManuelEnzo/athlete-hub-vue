<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import type { SleepResponseDto } from '@/types/api'
import { ClientOnly } from '#components'
import { computed, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const VueApexCharts = defineAsyncComponent(() => import('vue3-apexcharts'))

const props = defineProps<{
  history: SleepResponseDto[]
  selectedDate: string | null
  loading: boolean
}>()

const emit = defineEmits<{ (e: 'select-date', date: string): void }>()

const { t } = useI18n()

const sorted = computed(() =>
  [...props.history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
)

const categories = computed(() => sorted.value.map(e => {
  const d = new Date(e.date)
  return `${d.getDate()}/${d.getMonth() + 1}`
}))

const series = computed(() => [
  {
    name: t('sleep.chart.hoursSlept'),
    type: 'area',
    data: sorted.value.map(e => e.hoursSlept ?? null),
  },
  {
    name: t('sleep.chart.quality'),
    type: 'line',
    data: sorted.value.map(e => e.sleepQuality != null ? e.sleepQuality / 10 : null),
  },
])

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
    zoom: { enabled: false },
    events: {
      dataPointSelection: (_e: Event, _ctx: unknown, config: { dataPointIndex: number }) => {
        const entry = sorted.value[config.dataPointIndex]
        if (entry) emit('select-date', entry.date)
      },
    },
  },
  colors: ['#6366f1', '#f59e0b'],
  stroke: {
    curve: 'smooth',
    width: [2, 3],
  },
  fill: {
    type: ['gradient', 'solid'],
    gradient: {
      shadeIntensity: 0.1,
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 90, 100],
    },
  },
  markers: {
    size: [4, 5],
    strokeWidth: 0,
    hover: { size: 7 },
  },
  xaxis: {
    categories: categories.value,
    labels: { style: { fontSize: '11px', fontWeight: 600 } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: [
    {
      title: { text: t('sleep.chart.hours'), style: { fontSize: '11px' } },
      min: 0,
      max: 12,
      labels: { formatter: (v: number) => `${v}h` },
    },
    {
      opposite: true,
      title: { text: t('sleep.chart.qualityScale'), style: { fontSize: '11px' } },
      min: 0,
      max: 10,
      labels: { formatter: (v: number) => v.toFixed(0) },
    },
  ],
  tooltip: {
    shared: true,
    intersect: false,
    y: [
      { formatter: (v: number) => `${v?.toFixed(1)}h` },
      { formatter: (v: number) => v != null ? `${(v * 10).toFixed(0)}%` : '—' },
    ],
  },
  annotations: {
    yaxis: [
      {
        y: 7,
        y2: 9,
        borderColor: '#22c55e',
        fillColor: '#22c55e',
        opacity: 0.05,
        label: {
          text: t('sleep.chart.optimalZone'),
          style: { fontSize: '10px', color: '#22c55e' },
        },
      },
    ],
  },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
  legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px' },
}))
</script>

<template>
  <Card>
    <CardHeader class="pb-2">
      <CardTitle class="text-sm font-black uppercase tracking-widest text-muted-foreground">
        {{ t('sleep.chart.trendTitle') }}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="loading" class="space-y-2">
        <Skeleton class="h-[260px] w-full rounded-lg" />
      </div>
      <div v-else-if="!history.length" class="h-[260px] flex items-center justify-center text-muted-foreground text-sm font-medium">
        {{ t('sleep.noData') }}
      </div>
      <ClientOnly v-else>
        <VueApexCharts
          type="line"
          height="260"
          :options="chartOptions"
          :series="series"
        />
      </ClientOnly>
    </CardContent>
  </Card>
</template>
