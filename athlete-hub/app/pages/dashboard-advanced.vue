<script setup lang="ts">
import DashboardLayout from '~/components/dashboard/DashboardLayout.vue'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { useAuthStore } from '~/stores/auth'

const _auth = useAuthStore()
const _handler = useErrorHandler({ component: 'DashboardAdvancedPage' })
</script>

<template>
  <DashboardLayout />
</template>
