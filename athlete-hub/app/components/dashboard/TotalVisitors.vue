<script setup lang="ts">
import type { WorkloadDataPointDto } from '~/types/api'
import { computed, onMounted, ref } from 'vue'
import { useDashboardService } from '~/services/dataService'

const props = defineProps({
  timeRange: {
    type: String,
    default: '7d',
  },
})

interface ChartPoint { date: string, value: number }

const chartData = ref<ChartPoint[]>([])
const dashboardSvc = useDashboardService()

onMounted(async () => {
  try {
    const data = await dashboardSvc.fetch()
    // workloadComparison is the time-series data available in the dashboard DTO
    chartData.value = (data?.workloadComparison ?? []).map((p: WorkloadDataPointDto) => ({
      date: p.label,
      value: p.value,
    }))
  }
  catch (_) {
    chartData.value = []
  }
})

const filteredData = computed(() => {
  const limit = props.timeRange === '7d' ? 7 : props.timeRange === '30d' ? 30 : 90
  return chartData.value.slice(-limit)
})
</script>

<template>
  <AreaChart :data="filteredData" :categories="['value']" index="date" />
</template>
