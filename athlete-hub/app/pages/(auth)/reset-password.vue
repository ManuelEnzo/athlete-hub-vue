<script setup lang="ts">
import { CheckCircle2, Loader2, ShieldAlert } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import notifications from '@/lib/notificationService'
import { authApi } from '~/api/auth'

// --- CONFIG ---
definePageMeta({
  layout: 'blank',
  auth: false,
  guestOnly: true,
})

const { t } = useI18n()
const route = useRoute()
const { $pinia } = useNuxtApp()
const loadingStore = useLoadingStore($pinia)

// --- STATE ---
const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isFinished = ref(false)

// --- LOGIC ---
onMounted(() => {
  // Estrae il token dall'URL: ?token=75E4944FF...
  token.value = route.query.token as string
  if (!token.value) {
    notifications.error(t('auth.errors.invalidToken'))
  }
})

async function onResetSubmit() {
  if (newPassword.value !== confirmPassword.value) {
    return notifications.error(t('auth.signup.validation.passwordMismatch'))
  }

  loadingStore.start()
  try {
    const response = await authApi.resetPasswordExecution({
      token: token.value,
      newPassword: newPassword.value,
    })

    if (response.data.isSuccess) {
      isFinished.value = true
      notifications.success(t('auth.reset.success'))
    }
    else {
      notifications.error(response.data.error?.message || t('auth.signup.errors.general'))
    }
  }
  catch {
    notifications.error(t('auth.errors.expiredLink'))
  }
  finally {
    loadingStore.stop()
  }
}
</script>

<template>
  <LayoutAuth reverse>
    <div class="grid mx-auto max-w-sm gap-6">
      <div v-if="!isFinished" class="grid gap-2 text-center">
        <h1 class="text-2xl font-semibold tracking-tight">
          {{ t('auth.reset.title') }}
        </h1>
        <p class="text-sm text-muted-foreground text-balance">
          {{ t('auth.reset.description') }}
        </p>
      </div>

      <div v-if="!isFinished" class="grid gap-6">
        <form class="grid gap-4" @submit.prevent="onResetSubmit">
          <div class="grid gap-2">
            <Label for="new-password">{{ t('auth.fields.newPassword') }}</Label>
            <PasswordInput
              id="new-password"
              v-model="newPassword"
              placeholder="••••••••"
              :disabled="loadingStore.isLoading"
            />
          </div>

          <div class="grid gap-2">
            <Label for="confirm-password">{{ t('auth.fields.confirmPassword') }}</Label>
            <PasswordInput
              id="confirm-password"
              v-model="confirmPassword"
              placeholder="••••••••"
              :disabled="loadingStore.isLoading"
            />
          </div>

          <Button type="submit" class="w-full" :disabled="loadingStore.isLoading || !token">
            <Loader2 v-if="loadingStore.isLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ t('auth.reset.submit') }}
          </Button>
        </form>

        <div v-if="!token" class="flex items-center gap-2 text-destructive text-xs font-medium justify-center bg-destructive/10 p-3 rounded-md border border-destructive/20 italic">
          <ShieldAlert class="size-4" />
          {{ t('auth.errors.invalidToken') }}
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center space-y-4 py-8 animate-in fade-in zoom-in-95 duration-500">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 class="h-6 w-6 text-primary" />
        </div>
        <div class="text-center space-y-2">
          <h2 class="text-xl font-semibold tracking-tight">
            {{ t('auth.reset.done') }}
          </h2>
          <p class="text-sm text-muted-foreground">
            {{ t('auth.reset.successMessage') }}
          </p>
        </div>
        <Button class="w-full mt-2" variant="outline" @click="navigateTo('/login')">
          {{ t('auth.login.backToLogin') }}
        </Button>
      </div>
    </div>
  </LayoutAuth>
</template>
