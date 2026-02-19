<script setup lang="ts">
import { ref } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useLoadingStore } from '~/stores/loadingStore'
import { useI18n } from 'vue-i18n'
import { authApi } from '~/api/auth'

const { t } = useI18n()
const email = ref('')

const { $pinia } = useNuxtApp()
const loadingStore = useLoadingStore($pinia)

async function onSubmit(event: Event) {
  event.preventDefault()

  if (!email.value) {
    toast.error(t('auth.errors.emailRequired'))
    return
  }

  loadingStore.start()

  try {
    const response = await authApi.forgotPassword(email.value)

    if (response.data.isSuccess) {
      toast.success(t('auth.forgotPassword.successMsg'))
      email.value = ''
    } else {
      const errorMessage = response.data.error?.message || t('auth.errors.generic')
      toast.error(errorMessage)
    }
  } catch (err: any) {
    console.error('[Forgot Password Error]', err)
    toast.error(t('auth.errors.generic'))
  } finally {
    loadingStore.stop()
  }
}
</script>

<template>
  <form class="grid gap-4" @submit="onSubmit">
    <div class="grid gap-2">
      <Label for="email">
        {{ t('auth.fields.email') }}
      </Label>
      <Input
        id="email"
        v-model="email"
        type="email"
        placeholder="name@example.com"
        :disabled="loadingStore.isLoading"
        auto-complete="email"
        required
      />
    </div>

    <Button
      type="submit"
      class="w-full"
      :disabled="loadingStore.isLoading"
    >
      <Loader2 v-if="loadingStore.isLoading" class="mr-2 h-4 w-4 animate-spin" />
      {{ t('auth.forgotPassword.submit') }}
    </Button>
  </form>
</template>