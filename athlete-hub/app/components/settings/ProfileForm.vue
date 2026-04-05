<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import {
  Calendar as CalendarIcon,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  User,
} from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import * as z from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// UI Components & Icons
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import notifications from '@/lib/notificationService'
import { authApi } from '~/api/auth'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { useAuthStore } from '~/stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()
const isLoading = ref(false)

// --- VALIDAZIONE ---
const profileSchema = toTypedSchema(z.object({
  email: z.string().email({ message: t('profile.errors.emailInvalid') }),
  currentPassword: z.string().min(1, t('profile.errors.currentPasswordRequired')),
  newPassword: z.string().min(8, t('profile.errors.passwordTooShort')).optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: t('profile.errors.passwordsDontMatch'),
  path: ['confirmPassword'],
}))

const { handleSubmit, errors, defineField, setFieldValue } = useForm({
  validationSchema: profileSchema,
  initialValues: {
    email: authStore.user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  },
})

// Sincronizza il form se i dati arrivano dopo (es. refresh pagina)
watch(() => authStore.user?.email, (newEmail) => {
  if (newEmail)
    setFieldValue('email', newEmail)
})

const [email] = defineField('email')
const [currentPassword] = defineField('currentPassword')
const [newPassword] = defineField('newPassword')
const [confirmPassword] = defineField('confirmPassword')

function formatDate(date?: string) {
  if (!date)
    return '--'
  return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

const onSaveProfile = handleSubmit(async (values) => {
  isLoading.value = true
  try {
    // 1. Chiamata al backend (Endpoint: /Auth/update-password)
    const response = await authApi.updatePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword || '', // Se vuoto, il server non dovrebbe cambiare pw
      email: values.email,
    })

    const { isSuccess, value, error } = response.data

    if (isSuccess && value) {
      // 2. Aggiorniamo i token nello store.
      // Grazie ai computed/cookies, l'utente resta loggato istantaneamente.
      authStore.setTokens(value.accessToken, value.refreshToken)

      // 3. Feedback all'utente
      notifications.success(t('profile.toast.success'))

      // 4. Reset dei campi password del form per pulizia
      setFieldValue('currentPassword', '')
      setFieldValue('newPassword', '')
      setFieldValue('confirmPassword', '')

      // 5. Rinfreschiamo i dati dell'utente nello store (es. se l'email è cambiata)
      await authStore.fetchProfile()
    }
    else {
      // Gestione errore applicativo (es. password attuale errata)
      notifications.error(error?.message || t('profile.toast.error'))
    }
  }
  catch (err: any) {
    const handler = useErrorHandler({ component: 'ProfileForm' })
    handler.handleError(err instanceof Error ? err : new Error(String(err)))
  }
  finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="w-full flex flex-col gap-6">
    <div class="mb-6">
      <h2 class="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
        <User class="h-8 w-8 text-primary" /> {{ t('profile.title') }}
      </h2>
      <p class="text-muted-foreground italic text-sm">
        {{ t('profile.subtitle') }}
      </p>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <div class="xl:col-span-1">
        <Card class="border-none shadow-sm bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle class="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em]">
              {{ t('profile.accountInfo') }}
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-6 flex-1">
            <div>
              <label class="text-[10px] font-black uppercase text-primary/70 block mb-1 tracking-widest">{{ t('profile.username') }}</label>
              <p class="font-bold text-xl">
                {{ authStore.user?.userName || authStore.user?.email?.split('@')[0] || '---' }}
              </p>
            </div>
            <Separator class="opacity-30" />
            <div>
              <label class="text-[10px] font-black uppercase text-primary/70 block mb-1 tracking-widest">{{ t('profile.role') }}</label>
              <Badge v-if="authStore.user" :variant="authStore.user.role === 1 ? 'default' : 'secondary'" class="font-black uppercase text-[10px] px-3">
                <ShieldCheck class="h-3 w-3 mr-1" />
                {{ authStore.user.role === 1 ? 'Administrator' : 'User' }}
              </Badge>
            </div>
            <Separator class="opacity-30" />
            <div>
              <label class="text-[10px] font-black uppercase text-primary/70 block mb-1 tracking-widest">{{ t('profile.memberSince') }}</label>
              <div class="flex items-center gap-2 text-sm font-bold">
                <CalendarIcon class="h-4 w-4 text-muted-foreground" />
                {{ formatDate(authStore.user?.createdAt) }}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="xl:col-span-3">
        <form class="flex flex-col" @submit="onSaveProfile">
          <Card class="border-none shadow-md bg-card/50 backdrop-blur flex flex-col">
            <CardHeader>
              <CardTitle class="text-xl font-black uppercase tracking-tight">
                {{ t('profile.settingsTitle') }}
              </CardTitle>
              <CardDescription>{{ t('profile.settingsDesc') }}</CardDescription>
            </CardHeader>

            <CardContent class="space-y-6 pr-4 custom-scrollbar">
              <div class="grid grid-cols-1 gap-8">
                <div class="space-y-3">
                  <label class="text-[11px] font-black uppercase flex items-center gap-2 tracking-wider">
                    <Mail class="h-4 w-4 text-primary" /> {{ t('profile.emailLabel') }}
                  </label>
                  <Input v-model="email" type="email" class="bg-background/40 h-11 font-medium" />
                  <p v-if="errors.email" class="text-[10px] text-destructive font-black uppercase">
                    {{ errors.email }}
                  </p>
                </div>

                <Separator />

                <div class="space-y-6">
                  <div class="flex items-center gap-2">
                    <Lock class="h-4 w-4 text-primary" />
                    <h4 class="text-[11px] font-black uppercase tracking-widest">
                      {{ t('profile.passwordSection') }}
                    </h4>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <label class="text-[10px] font-black uppercase text-muted-foreground">{{ t('profile.newPassword') }}</label>
                      <div class="relative">
                        <KeyRound class="absolute left-3 top-3 h-4 w-4 text-muted-foreground/40" />
                        <Input v-model="newPassword" type="password" class="pl-10 h-10 bg-background/40" placeholder="••••••••" />
                      </div>
                    </div>
                    <div class="space-y-2">
                      <label class="text-[10px] font-black uppercase text-muted-foreground">{{ t('profile.confirmPassword') }}</label>
                      <Input v-model="confirmPassword" type="password" class="h-10 bg-background/40" placeholder="••••••••" />
                    </div>
                  </div>
                  <p v-if="errors.confirmPassword" class="text-[10px] text-destructive font-black uppercase">
                    {{ errors.confirmPassword }}
                  </p>
                </div>

                <div class="mt-4 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 max-w-xl mx-auto w-full">
                  <div class="text-center space-y-3">
                    <label class="text-[10px] font-black uppercase text-amber-600 tracking-[0.2em] block">
                      {{ t('profile.confirmMod') }}
                    </label>
                    <Input
                      v-model="currentPassword"
                      type="password"
                      class="bg-background border-amber-200 text-center h-11 focus-visible:ring-amber-500"
                      :placeholder="t('profile.currentPassPlaceholder')"
                    />
                    <p v-if="errors.currentPassword" class="text-[10px] text-destructive font-black uppercase font-bold">
                      {{ errors.currentPassword }}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter class="bg-muted/20 p-6 border-t flex justify-end">
              <Button type="submit" class="h-11 px-10 font-black uppercase tracking-widest shadow-lg" :disabled="isLoading">
                <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
                <Save v-else class="mr-2 h-4 w-4" />
                {{ t('profile.saveBtn') }}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--primary) / 0.2); border-radius: 10px; }
</style>
