<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  color?: 'primary' | 'success' | 'warning' | 'default' | 'secondary'
}>()
</script>

<template>
  <div class="p-3 rounded-lg shadow-sm border bg-card">
    <h4 class="text-xs font-bold text-muted-foreground uppercase tracking-tight">
      {{ label }}
    </h4>
    <p
      class="text-xl font-extrabold mt-1"
      :class="{
        'text-primary': color === 'primary',
        'text-green-600': color === 'success',
        'text-yellow-600': color === 'warning',
        'text-foreground': !color || color === 'default',
      }"
    >
      {{ value }}
    </p>
  </div>
</template>
