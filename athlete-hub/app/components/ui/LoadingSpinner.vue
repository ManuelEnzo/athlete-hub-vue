<script setup lang="ts">
</script>

<template>
  <div class="flex items-center justify-center p-4">
    <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500" />
    <span class="sr-only">Loading</span>
  </div>
</template>

<style scoped>
/* ensure Tailwind utilities handle styles; fallback color */
.border-primary-500 { border-color: #2563eb; }
</style>
