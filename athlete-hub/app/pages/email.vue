<script setup lang="ts">
import { onMounted } from 'vue'
import MailCompLayout from '~/components/mail/MailCompLayout.vue'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { useAuthStore } from '~/stores/auth'

const handler = useErrorHandler({ component: 'EmailPage' })
const auth = useAuthStore()

onMounted(async () => {
  try {
    await auth.fetchProfile()
  }
  catch (err) {
    handler.handleError(err instanceof Error ? err : new Error(String(err)))
  }
})
</script>

<template>
  <div class="-m-4 lg:-m-6">
    <MailCompLayout />
  </div>
</template>
