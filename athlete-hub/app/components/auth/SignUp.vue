<script setup lang="ts">
import { ref } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../stores/auth'
import { useI18n } from 'vue-i18n'
import { cn } from '@/lib/utils'

const { t } = useI18n()

// ENV FLAG (VITE_REQUIRE_INVITATION_CODE=true/false)
const isInvitationCodeRequired =
  import.meta.env.VITE_REQUIRE_INVITATION_CODE === 'true'

// State
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const code = ref('')
const isLoading = ref(false)

const authStore = useAuthStore()

// GUID validation (compatibile con ASP.NET Guid)
function isValidGuid(value: string): boolean {
  const guidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/
  return guidRegex.test(value)
}

async function onSubmit(event: Event) {
  event.preventDefault()

  // Validazione base
  if (!email.value || !password.value || !confirmPassword.value) {
    toast.error(t('auth.errors.requiredFields'))
    return
  }

  if (password.value !== confirmPassword.value) {
    toast.error(t('auth.errors.passwordMismatch'))
    return
  }

  // Validazione codice se richiesto da ENV
  if (isInvitationCodeRequired) {
    if (!code.value) {
      toast.error(t('auth.errors.codeRequired'))
      return
    }

    if (!isValidGuid(code.value)) {
      toast.error(t('auth.errors.invalidCode'))
      return
    }
  }

  isLoading.value = true

  try {
    const response = await authApi.signUp({
      email: email.value,
      password: password.value,
      codeId: isInvitationCodeRequired ? code.value : null
    })

    const result = response.data

    if (result?.value) {
      authStore.setTokens(
        result.value.accessToken,
        result.value.refreshToken
      )
    }

    toast.success(t('auth.signup.success'))
    await navigateTo('/')

  } catch (error: any) {
    const serverMessage = error?.error?.message

    if (serverMessage) {
      toast.error(serverMessage)
    } else {
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

        <!-- EMAIL -->
        <div class="grid gap-2">
          <Label for="email">
            {{ t('auth.fields.email') }}
          </Label>
          <Input
            id="email"
            v-model="email"
            placeholder="name@example.com"
            type="email"
            :disabled="isLoading"
            required
          />
        </div>

        <!-- PASSWORD -->
        <div class="grid gap-2">
          <Label for="password">
            {{ t('auth.fields.password') }}
          </Label>
          <PasswordInput
            id="password"
            v-model="password"
            :disabled="isLoading"
            required
          />
        </div>

        <!-- CONFIRM PASSWORD -->
        <div class="grid gap-2">
          <Label for="confirm-password">
            {{ t('auth.fields.confirmPassword') }}
          </Label>
          <PasswordInput
            id="confirm-password"
            v-model="confirmPassword"
            :disabled="isLoading"
            required
          />
        </div>

        <!-- INVITATION CODE (CONDIZIONALE) -->
        <div
          v-if="isInvitationCodeRequired"
          class="grid gap-2"
        >
          <Label for="code">
            {{ t('auth.fields.invitationCode') }}
          </Label>
          <Input
            id="code"
            v-model="code"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            :disabled="isLoading"
            required
          />
        </div>

        <!-- SUBMIT -->
        <Button type="submit" :disabled="isLoading">
          <Loader2
            v-if="isLoading"
            class="mr-2 h-4 w-4 animate-spin"
          />
          {{ t('auth.signup.submit') }}
        </Button>

      </div>
    </form>
  </div>
</template>