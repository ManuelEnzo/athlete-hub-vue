<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  icon: string
  trend: string
  trendPositive: boolean
}

defineProps<Props>()
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
      <span class="text-3xl">{{ icon }}</span>
    </div>
    <div class="flex items-center gap-1">
      <span
        class="text-sm font-semibold"
        :class="trendPositive ? 'text-green-600' : 'text-red-600'"
      >
        {{ trend }}
      </span>
      <span
        :class="trendPositive ? 'text-green-600' : 'text-red-600'"
      >
        {{ trendPositive ? '📈' : '📉' }}
      </span>
    </div>
  </div>
</template>

<style scoped></style>
