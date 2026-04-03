<script setup lang="ts">
</script>

<template>
  <div class="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-4">
    <div class="flex items-center justify-between mb-2">
      <div class="text-lg font-medium text-slate-900 dark:text-slate-100">
        <slot name="title" />
      </div>
      <div><slot name="actions" /></div>
    </div>
    <div class="text-sm text-slate-700 dark:text-slate-300">
      <slot />
    </div>
  </div>
</template>
