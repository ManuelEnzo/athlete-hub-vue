<script setup lang="ts">
import { ref } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../stores/auth'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const email = ref('')
const password = ref('')
const confirmPassword = ref('') // Aggiunto per il check
const isLoading = ref(false)
const authStore = useAuthStore()

async function onSubmit(event: Event) {
  event.preventDefault()
  
  // Validazione base lato client
  if (!email.value || !password.value) {
    toast.error('Compila tutti i campi')
    return
  }

  if (password.value !== confirmPassword.value) {
    toast.error('Le password non coincidono')
    return
  }

  isLoading.value = true

  try {
    // Chiamata alla tua API C# (HttpPost "sign-up")
    const response = await authApi.signUp({
      email: email.value,
      password: password.value
    })

    const result = response.data

    if (result.isSuccess && result.value) {
      // Dato che il tuo UserSignUpResponse restituisce i token, 
      // eseguiamo il login automatico
      authStore.setTokens(
        result.value.accessToken,
        result.value.refreshToken
      )

      toast.success(t('auth.signup.success'))
      await navigateTo('/')
    } else {
      // Gestione errori del tuo Result Pattern C#
      toast.error(result.error?.message || 'Errore durante la registrazione')
    }
  } catch (error: any) {
    toast.error(t('auth.signup.networkError'))
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
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="email"
            placeholder="name@example.com"
            type="email"
            :disabled="isLoading"
            required
          />
        </div>

        <div class="grid gap-2">
          <Label for="password">Password</Label>
          <PasswordInput 
            id="password" 
            v-model="password" 
            :disabled="isLoading" 
            required
          />
        </div>

        <div class="grid gap-2">
          <Label for="confirm-password">Confirm Password</Label>
          <PasswordInput 
            id="confirm-password" 
            v-model="confirmPassword" 
            :disabled="isLoading" 
            required
          />
        </div>

        <Button type="submit" :disabled="isLoading">
          <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          Create Account
        </Button>
      </div>
    </form>
    
    <Separator label="Or continue with" />
    </div>
</template>