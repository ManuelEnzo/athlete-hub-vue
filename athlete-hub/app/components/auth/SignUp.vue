<script setup lang="ts">
import { ref } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../stores/auth'
import { useI18n } from 'vue-i18n'
import { cn } from '@/lib/utils' // Assicurati che l'import di cn sia corretto

const { t } = useI18n()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const authStore = useAuthStore()

async function onSubmit(event: Event) {
  event.preventDefault()

  // Validazione client-side con i18n
  if (!email.value || !password.value) {
    toast.error(t('auth.errors.requiredFields'))
    return
  }

  if (password.value !== confirmPassword.value) {
    toast.error(t('auth.errors.passwordMismatch'))
    return
  }

  isLoading.value = true

  try {
    // Se l'API restituisce 400/500, l'interceptor lancia un reject e salta al catch
    const response = await authApi.signUp({
      email: email.value,
      password: password.value
    })

    // Qui entriamo SOLO se isSuccess è true (HTTP 2xx)
    const result = response.data

    if (result.value) { // Controllo di guardia
      authStore.setTokens(
        result.value?.accessToken,
        result.value?.refreshToken
      )
    }

    toast.success(t('auth.signup.success'))
    await navigateTo('/')

  } catch (error: any) {
    // 'error' qui è l'oggetto Result (apiResult) rigettato dall'interceptor
    // Cerchiamo il messaggio nel tuo Result Pattern C#
    const serverMessage = error.error?.message

    if (serverMessage) {
      // Mostra il messaggio specifico inviato dal backend (es: "Email già registrata")
      toast.error(serverMessage)
    } else {
      // Fallback su una risorsa i18n locale se l'errore è generico o di rete
      toast.error(t('auth.signup.networkError'))
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div :class="cn('grid gap-6', $attrs.class ?? '')">
    <form @submit="onSubmit">
      <div class="grid gap-4">

        <div class="grid gap-2">
          <Label for="email">{{ t('auth.fields.email') }}</Label>
          <Input id="email" v-model="email" placeholder="name@example.com" type="email" :disabled="isLoading"
            required />
        </div>

        <div class="grid gap-2">
          <Label for="password">{{ t('auth.fields.password') }}</Label>
          <PasswordInput id="password" v-model="password" :disabled="isLoading" required />
        </div>

        <div class="grid gap-2">
          <Label for="confirm-password">{{ t('auth.fields.confirmPassword') }}</Label>
          <PasswordInput id="confirm-password" v-model="confirmPassword" :disabled="isLoading" required />
        </div>

        <Button type="submit" :disabled="isLoading">
          <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          {{ t('auth.signup.submit') }}
        </Button>
      </div>
    </form>

    <Separator :label="t('auth.orContinueWith')" />
  </div>
</template>