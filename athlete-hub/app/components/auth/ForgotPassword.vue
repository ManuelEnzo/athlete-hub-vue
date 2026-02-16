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

  // Utilizzo corretto delle azioni dello store (start/stop)
  loadingStore.start()

  try {
    const response = await authApi.forgotPassword(email.value)

    // Assumendo che il backend restituisca un oggetto Result con isSuccess
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
    // Spegne il caricamento
    loadingStore.stop()
  }
}
</script>

<template>
  <form class="grid gap-6" @submit="onSubmit">
    <div class="grid gap-2">
      <Label
        for="email"
        class="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 ml-1"
      >
        {{ t('auth.fields.email') }}
      </Label>
      <Input
        id="email"
        v-model="email"
        type="email"
        placeholder="CHAMPION@ATHLETE.HUB"
        class="bg-black/40 border-zinc-800 h-12 text-white placeholder:text-zinc-700 font-bold focus-visible:ring-primary transition-all"
        :disabled="loadingStore.isLoading"
        auto-complete="email"
      />
    </div>

    <Button
      type="submit"
      class="w-full h-14 bg-primary text-black font-[1000] uppercase tracking-widest text-lg hover:bg-white transition-all active:scale-[0.98]"
      :disabled="loadingStore.isLoading"
    >
      <Loader2 v-if="loadingStore.isLoading" class="mr-2 h-5 w-5 animate-spin" />
      {{ t('auth.forgotPassword.submit') }}
    </Button>
  </form>
</template>