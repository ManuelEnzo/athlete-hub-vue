<script setup lang="ts">
definePageMeta({
  layout: 'blank'
})

import { useRoute } from 'vue-router'
import RpeForm from '@/components/rpeinput/RpeInput.vue'

const route = useRoute()
const token = route.params.token as string
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-md p-6">
      <h1 class="text-2xl font-bold text-center mb-6">
        Submit your RPE
      </h1>

      <RpeForm :token="token" />
    </div>
  </div>
</template>
