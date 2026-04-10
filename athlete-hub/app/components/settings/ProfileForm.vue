```vue
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import {
  Calendar as CalendarIcon,
  Check,
  Clipboard,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  User,
} from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import * as z from 'zod'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

import notifications from '@/lib/notificationService'
import { authApi } from '~/api/auth'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { useAuthStore } from '~/stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()

const isLoading = ref(false)
const emailCopied = ref(false)

// ─── Password visibility ───
const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

// ─── Avatar initials ───
const initials = computed(() => {
  const u = authStore.user
  if (!u) return '?'
  const name = u.userName || u.email?.split('@')[0] || ''
  return name
    .trim()
    .split(/[\s._-]+/)
    .map((s: string) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

// ─── Validation ───
const profileSchema = toTypedSchema(
  z.object({
    email: z.string().email({ message: t('profile.errors.emailInvalid') }),
    currentPassword: z.string().min(1, t('profile.errors.currentPasswordRequired')),
    newPassword: z.string().min(8, t('profile.errors.passwordTooShort')).optional().or(z.literal('')),
    confirmPassword: z.string().optional().or(z.literal('')),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: t('profile.errors.passwordsDontMatch'),
    path: ['confirmPassword'],
  })
)

const { handleSubmit, errors, defineField, setFieldValue } = useForm({
  validationSchema: profileSchema,
  initialValues: {
    email: authStore.user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  },
})

watch(() => authStore.user?.email, (newEmail) => {
  if (newEmail) setFieldValue('email', newEmail)
})

const [email] = defineField('email')
const [currentPassword] = defineField('currentPassword')
const [newPassword] = defineField('newPassword')
const [confirmPassword] = defineField('confirmPassword')

// ─── Password strength ───
const strength = computed(() => {
  const p = newPassword.value || ''
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
})

const strengthLabel = computed(() => {
  if (!newPassword.value) return ''
  return ['Weak', 'Fair', 'Good', 'Strong'][strength.value - 1] || ''
})

const strengthClass = computed(() => {
  return ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'][strength.value - 1] || 'bg-muted'
})

// ─── Utils ───
function formatDate(date?: string) {
  if (!date) return '--'
  return new Date(date).toLocaleDateString()
}

async function copyEmail() {
  if (!authStore.user?.email) return
  await navigator.clipboard.writeText(authStore.user.email)
  emailCopied.value = true
  setTimeout(() => (emailCopied.value = false), 2000)
}

// ─── Submit ───
const onSaveProfile = handleSubmit(async (values) => {
  isLoading.value = true
  try {
    const response = await authApi.updatePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword || '',
      email: values.email,
    })

    const { isSuccess, value, error } = response.data

    if (isSuccess && value) {
      authStore.setTokens(value.accessToken, value.refreshToken)
      notifications.success(t('profile.toast.success'))

      setFieldValue('currentPassword', '')
      setFieldValue('newPassword', '')
      setFieldValue('confirmPassword', '')

      await authStore.fetchProfile()
    } else {
      notifications.error(error?.message || t('profile.toast.error'))
    }
  } catch (err: any) {
    const handler = useErrorHandler({ component: 'ProfileForm' })
    handler.handleError(err instanceof Error ? err : new Error(String(err)))
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="w-full flex flex-col gap-8">

    <!-- HEADER -->
    <div>
      <h2 class="text-2xl font-black flex items-center gap-2">
        <User class="h-6 w-6 text-primary" />
        {{ t('profile.title') }}
      </h2>
      <p class="text-muted-foreground text-sm">
        {{ t('profile.subtitle') }}
      </p>
    </div>

    <div class="grid xl:grid-cols-4 gap-6">

      <!-- SIDEBAR -->
      <div class="space-y-4">
        <Card>
          <CardContent class="flex flex-col items-center gap-3 py-6">
            <div class="h-14 w-14 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              {{ initials }}
            </div>

            <div class="text-center">
              <p class="font-bold">
                {{ authStore.user?.userName || authStore.user?.email }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ authStore.user?.email }}
              </p>
            </div>

            <Badge>
              <ShieldCheck class="h-3 w-3 mr-1" />
              {{ authStore.user?.role === 1 ? 'Admin' : 'User' }}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <!-- FORM -->
      <div class="xl:col-span-3">
        <form @submit="onSaveProfile">
          <Card>
            <CardContent class="space-y-6 p-6">

              <!-- EMAIL -->
              <div>
                <label>Email</label>
                <Input v-model="email" type="email" />
                <p v-if="errors.email" class="text-red-500 text-xs">
                  {{ errors.email }}
                </p>
              </div>

              <!-- PASSWORD -->
              <div>
                <label>New Password</label>
                <Input v-model="newPassword" :type="showNew ? 'text' : 'password'" />
              </div>

              <!-- STRENGTH -->
              <div v-if="newPassword">
                <div class="flex gap-1">
                  <div
                    v-for="i in 4"
                    :key="i"
                    class="h-1 flex-1 rounded"
                    :class="i <= strength ? strengthClass : 'bg-muted'"
                  />
                </div>
                <span class="text-xs">{{ strengthLabel }}</span>
              </div>

              <!-- CONFIRM -->
              <div>
                <label>Confirm Password</label>
                <Input v-model="confirmPassword" type="password" />
                <p v-if="errors.confirmPassword" class="text-red-500 text-xs">
                  {{ errors.confirmPassword }}
                </p>
              </div>

              <!-- CURRENT -->
              <div>
                <label>Current Password</label>
                <Input v-model="currentPassword" type="password" />
                <p v-if="errors.currentPassword" class="text-red-500 text-xs">
                  {{ errors.currentPassword }}
                </p>
              </div>

            </CardContent>

            <CardFooter class="flex justify-end p-4">
              <Button type="submit" :disabled="isLoading">
                <Loader2 v-if="isLoading" class="animate-spin mr-2 h-4 w-4" />
                <Save v-else class="mr-2 h-4 w-4" />
                Save
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>

    </div>
  </div>
</template>
```
