<script setup lang="ts">
import * as LucideIcons from 'lucide-vue-next'
import { computed } from 'vue'

interface Props {
  title: string
  value: string | number
  icon: string
  trend: string
  trendPositive: boolean
}

const props = defineProps<Props>()

const iconComponent = computed(() => {
  return (LucideIcons as any)[props.icon] ?? LucideIcons.BarChart2
})
</script>

<template>
  <div class="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between mb-2">
      <div>
        <p class="text-sm text-muted-foreground">
          {{ title }}
        </p>
        <p class="text-3xl font-bold text-foreground mt-1">
          {{ value }}
        </p>
      </div>
      <component :is="iconComponent" class="h-8 w-8 text-muted-foreground" />
    </div>
    <div v-if="trend" class="flex items-center gap-1">
      <span
        class="text-sm font-semibold"
        :class="trendPositive ? 'text-green-600' : 'text-red-600'"
      >
        {{ trend }}
      </span>
    </div>
  </div>
</template>

<style scoped></style>
