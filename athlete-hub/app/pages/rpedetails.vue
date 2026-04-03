<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import RpeDetails from '~/components/rpedetails/RpeDetailsCmp.vue'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { useAuthStore } from '~/stores/auth'

const { t: _t } = useI18n()
const handler = useErrorHandler({ component: 'RpeDetailsPage' })
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
  <div class="w-full flex flex-col items-stretch gap-4">
    <RpeDetails />
  </div>
</template>

<style scoped></style>
