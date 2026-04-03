<script setup lang="ts">
</script>

<template>
  <div class="text-center p-8 text-gray-600">
    <slot name="icon">
      <svg class="mx-auto h-12 w-12 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-6a2 2 0 00-2-2H5" />
      </svg>
    </slot>
    <h3 class="mt-4 text-lg font-medium text-gray-800">
      <slot name="title">
        No data
      </slot>
    </h3>
    <p class="mt-2 text-sm text-gray-500">
      <slot name="description">
        There is no data to show here.
      </slot>
    </p>
    <div class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>
