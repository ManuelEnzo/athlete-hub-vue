<script setup lang="ts">
import { ref } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../stores/auth'
import { useLoadingStore } from '../../stores/loadingStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const email = ref('')
const password = ref('')

/** * RECUPERO SICURO DEGLI STORE
 * Passando $pinia da useNuxtApp evitiamo l'errore getActivePinia durante l'SSR
 */
const { $pinia } = useNuxtApp()
const authStore = useAuthStore($pinia)
const loadingStore = useLoadingStore($pinia)

async function onSubmit(event: Event) {
  event.preventDefault()

  if (!email.value || !password.value) {
    toast.error(t('auth.errors.requiredFields'))
    return
  }

  try {
    const response = await authApi.signIn({
      email: email.value,
      password: password.value
    })

    const result = response.data

    if (result.isSuccess && result.value) {
      authStore.setTokens(result.value.accessToken, result.value.refreshToken)
      toast.success(t('auth.login.success'))
      await navigateTo('/')
    }
  } catch (err: any) {
    const errorMessage = err.error?.message || t('auth.errors.genericLogin')
    console.error('[Login Error]', err)
    toast.error(errorMessage)
  }
}
</script>

<template>
  <form class="grid gap-6" @submit="onSubmit">
    <div class="flex flex-col gap-4">
      <Button variant="outline" class="w-full gap-2" type="button" :disabled="loadingStore?.isLoading">
        <Icon name="i-lucide-apple" class="size-4" />
        {{ t('auth.login.withApple') }}
      </Button>
      <Button variant="outline" class="w-full gap-2" type="button" :disabled="loadingStore?.isLoading">
        <Icon name="i-lucide-mail" class="size-4" />
        {{ t('auth.login.withGoogle') }}
      </Button>
    </div>

    <div class="grid gap-2">
      <Label for="email">{{ t('auth.fields.email') }}</Label>
      <Input id="email" v-model="email" type="email" placeholder="name@example.com" :disabled="loadingStore?.isLoading"
        auto-complete="email" />
    </div>

    <div class="grid gap-2">
      <div class="flex items-center">
        <Label for="password">{{ t('auth.fields.password') }}</Label>
        <NuxtLink to="/forgot-password" class="ml-auto inline-block text-sm underline">
          {{ t('auth.login.forgotPassword') }}
        </NuxtLink>
      </div>
      <PasswordInput id="password" v-model="password" :disabled="loadingStore?.isLoading" />
    </div>

    <Button type="submit" class="w-full" :disabled="loadingStore?.isLoading">
      <Loader2 v-if="loadingStore?.isLoading" class="mr-2 h-4 w-4 animate-spin" />
      {{ t('auth.login.submit') }}
    </Button>
  </form>

  <div class="mt-4 text-center text-sm">
    {{ t('auth.login.noAccount') }}
    <NuxtLink to="/register" class="underline underline-offset-4">
      {{ t('auth.login.signUpLink') }}
    </NuxtLink>
  </div>
</template>