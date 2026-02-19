<script setup lang="ts">
import { ref } from 'vue'
import { Loader2, MailCheck } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { authApi } from '~/api/auth'
import { useI18n } from 'vue-i18n'

definePageMeta({ layout: 'blank', auth: false, guestOnly: true })

const { t } = useI18n()
const loadingStore = useLoadingStore()

const email = ref('')
const isSubmitted = ref(false)

async function onForgotSubmit() {
  if (!email.value) return toast.error(t('auth.errors.emailRequired'))

  loadingStore.start()
  try {
    // Usato il metodo esatto dal tuo file api/auth.ts
    const response = await authApi.forgotPassword(email.value)

    if (response.data.isSuccess) {
      isSubmitted.value = true
    } else {
      toast.error(response.data.error?.message || t('auth.signup.errors.general'))
    }
  } catch (err: any) {
    toast.error(t('auth.signup.errors.general'))
  } finally {
    loadingStore.stop()
  }
}
</script>

<template>
  <LayoutAuth reverse>
    <div class="grid mx-auto max-w-sm gap-6">
      <div class="grid gap-2 text-center">
        <h1 class="text-2xl font-semibold tracking-tight">
          {{ isSubmitted ? t('auth.reset.done') : t('auth.forgotPassword.title') }}
        </h1>
        <p class="text-balance text-sm text-muted-foreground">
          {{ isSubmitted ? t('auth.forgotPassword.successMsg') : t('auth.forgotPassword.description') }}
        </p>
      </div>

      <div v-if="!isSubmitted" class="grid gap-6">
        <form @submit.prevent="onForgotSubmit" class="grid gap-4">
          <div class="grid gap-2">
            <Label for="email">{{ t('auth.fields.email') }}</Label>
            <Input id="email" v-model="email" type="email" placeholder="name@example.com" :disabled="loadingStore.isLoading" required />
          </div>
          <Button type="submit" class="w-full" :disabled="loadingStore.isLoading">
            <Loader2 v-if="loadingStore.isLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ t('auth.forgotPassword.submit') }}
          </Button>
        </form>
        <div class="text-center text-sm">
          <NuxtLink to="/login" class="underline underline-offset-4 hover:text-primary transition-colors">
            {{ t('auth.forgotPassword.backToLogin') }}
          </NuxtLink>
        </div>
      </div>

      <div v-else class="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-500">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <MailCheck class="h-6 w-6 text-primary" />
        </div>
        <Button variant="outline" class="w-full" @click="navigateTo('/login')">
          {{ t('auth.login.backToLogin') }}
        </Button>
      </div>
    </div>
  </LayoutAuth>
</template>