<script setup lang="ts">
</script>

<template>
  <div class="w-full bg-red-50 border-l-4 border-red-500 p-3 rounded">
    <div class="flex items-start gap-3">
      <div class="text-red-600">
        ⚠️
      </div>
      <div>
        <p class="font-semibold text-red-800">
          <slot name="title">
            Error
          </slot>
        </p>
        <p class="text-sm text-red-700">
          <slot name="message">
            Something went wrong.
          </slot>
        </p>
      </div>
      <div class="ml-auto">
        <slot name="action" />
      </div>
    </div>
  </div>
</template>
