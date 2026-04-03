<script setup lang="ts">
import { Separator } from '@/components/ui/separator'
</script>

<template>
  <div class="w-full pb-16 px-4 md:px-8 space-y-6">
    <Separator class="my-6 opacity-50" />

    <div class="w-full">
      <div class="space-y-6">
        <slot />
      </div>
    </div>
  </div>
</template>
