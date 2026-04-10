<script setup lang="ts">
import { AlertTriangle, BellRing, ClipboardList, Moon } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { Separator } from '@/components/ui/separator'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'

import notifications from '@/lib/notificationService'

const { t } = useI18n()

// --- Preferences state ---
const acwrAlerts = ref(true)
const rpeReminders = ref(true)
const injuryAlerts = ref(true)
const sleepAlerts = ref(false)

// Sound / vibration
const soundEnabled = ref(false)
const browserPush = ref(false)

// Thresholds
const acwrThreshold = ref<'low' | 'medium' | 'high'>('medium')
const acwrThresholds = [
  { key: 'low' as const, label: t('settings.notifications.thresholdLow') },
  { key: 'medium' as const, label: t('settings.notifications.thresholdMedium') },
  { key: 'high' as const, label: t('settings.notifications.thresholdHigh') },
]

// --- Form schema for additional notification settings ---
const notificationsFormSchema = toTypedSchema(z.object({
  type: z.enum(['all', 'mentions', 'none'] as const),
  mobile: z.boolean().default(false).optional(),
  communication_emails: z.boolean().default(false).optional(),
  social_emails: z.boolean().default(false).optional(),
  marketing_emails: z.boolean().default(false).optional(),
  security_emails: z.boolean(),
}))

const { handleSubmit } = useForm({
  validationSchema: notificationsFormSchema,
  initialValues: {
    communication_emails: false,
    marketing_emails: false,
    social_emails: true,
    security_emails: true,
  },
})

const onSubmit = handleSubmit((values) => {
  notifications.info('You submitted the following values:', JSON.stringify(values, null, 2))
})
</script>

<template>
  <div class="w-full flex flex-col gap-8">
    <!-- Header -->
    <div>
      <h2 class="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
        <BellRing class="h-7 w-7 text-primary" />
        {{ t('settings.notifications.title') }}
      </h2>
      <p class="text-muted-foreground text-sm mt-1">{{ t('settings.notifications.subtitle') }}</p>
    </div>

    <!-- Alert types -->
    <div class="space-y-3">
      <div>
        <h3 class="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{{ t('settings.notifications.alertsTitle') }}</h3>
        <p class="text-xs text-muted-foreground mt-0.5">{{ t('settings.notifications.alertsDesc') }}</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <!-- ACWR -->
        <button
          type="button"
          class="flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all"
          :class="acwrAlerts ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 bg-card opacity-60'"
          @click="acwrAlerts = !acwrAlerts"
        >
          <div class="mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0" :class="acwrAlerts ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'">
            <AlertTriangle class="h-4 w-4" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold leading-tight">{{ t('settings.notifications.acwr') }}</p>
            <p class="text-[11px] text-muted-foreground mt-0.5">{{ t('settings.notifications.acwrDesc') }}</p>
          </div>
          <div class="mt-1 h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center" :class="acwrAlerts ? 'border-primary bg-primary' : 'border-muted-foreground'">
            <div v-if="acwrAlerts" class="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
        </button>

        <!-- RPE reminders -->
        <button
          type="button"
          class="flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all"
          :class="rpeReminders ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 bg-card opacity-60'"
          @click="rpeReminders = !rpeReminders"
        >
          <div class="mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0" :class="rpeReminders ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'">
            <ClipboardList class="h-4 w-4" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold leading-tight">{{ t('settings.notifications.rpe') }}</p>
            <p class="text-[11px] text-muted-foreground mt-0.5">{{ t('settings.notifications.rpeDesc') }}</p>
          </div>
          <div class="mt-1 h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center" :class="rpeReminders ? 'border-primary bg-primary' : 'border-muted-foreground'">
            <div v-if="rpeReminders" class="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
        </button>

        <!-- Injury alerts -->
        <button
          type="button"
          class="flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all"
          :class="injuryAlerts ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 bg-card opacity-60'"
          @click="injuryAlerts = !injuryAlerts"
        >
          <div class="mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0" :class="injuryAlerts ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground'">
            <AlertTriangle class="h-4 w-4" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold leading-tight">{{ t('settings.notifications.injury') }}</p>
            <p class="text-[11px] text-muted-foreground mt-0.5">{{ t('settings.notifications.injuryDesc') }}</p>
          </div>
          <div class="mt-1 h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center" :class="injuryAlerts ? 'border-primary bg-primary' : 'border-muted-foreground'">
            <div v-if="injuryAlerts" class="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
        </button>

        <!-- Sleep alerts -->
        <button
          type="button"
          class="flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all"
          :class="sleepAlerts ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 bg-card opacity-60'"
          @click="sleepAlerts = !sleepAlerts"
        >
          <div class="mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0" :class="sleepAlerts ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'">
            <Moon class="h-4 w-4" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold leading-tight">{{ t('settings.notifications.sleep') }}</p>
            <p class="text-[11px] text-muted-foreground mt-0.5">{{ t('settings.notifications.sleepDesc') }}</p>
          </div>
          <div class="mt-1 h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center" :class="sleepAlerts ? 'border-primary bg-primary' : 'border-muted-foreground'">
            <div v-if="sleepAlerts" class="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
        </button>
      </div>
    </div>

    <Separator class="opacity-40" />

    <!-- ACWR threshold sensitivity -->
    <div class="space-y-3">
      <div>
        <h3 class="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{{ t('settings.notifications.thresholdTitle') }}</h3>
        <p class="text-xs text-muted-foreground mt-0.5">{{ t('settings.notifications.thresholdDesc') }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="opt in acwrThresholds"
          :key="opt.key"
          type="button"
          class="px-4 py-2 rounded-full border text-sm font-semibold transition-all"
          :class="acwrThreshold === opt.key
            ? 'border-primary bg-primary/5 text-foreground'
            : 'border-border hover:border-primary/40 text-muted-foreground'"
          @click="acwrThreshold = opt.key"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <Separator class="opacity-40" />

    <!-- Delivery channel -->
    <div class="space-y-3">
      <div>
        <h3 class="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{{ t('settings.notifications.channelTitle') }}</h3>
        <p class="text-xs text-muted-foreground mt-0.5">{{ t('settings.notifications.channelDesc') }}</p>
      </div>
      <div class="flex flex-col gap-3">
        <button
          type="button"
          class="flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all"
          :class="soundEnabled ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 bg-card opacity-60'"
          @click="soundEnabled = !soundEnabled"
        >
          <div>
            <p class="text-sm font-semibold">{{ t('settings.notifications.sound') }}</p>
            <p class="text-[11px] text-muted-foreground mt-0.5">{{ t('settings.notifications.soundDesc') }}</p>
          </div>
          <div class="h-4 w-4 rounded-full border-2 flex items-center justify-center ml-4 shrink-0" :class="soundEnabled ? 'border-primary bg-primary' : 'border-muted-foreground'">
            <div v-if="soundEnabled" class="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
        </button>

        <button
          type="button"
          class="flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all"
          :class="browserPush ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 bg-card opacity-60'"
          @click="browserPush = !browserPush"
        >
          <div>
            <p class="text-sm font-semibold">{{ t('settings.notifications.browser') }}</p>
            <p class="text-[11px] text-muted-foreground mt-0.5">{{ t('settings.notifications.browserDesc') }}</p>
          </div>
          <div class="h-4 w-4 rounded-full border-2 flex items-center justify-center ml-4 shrink-0" :class="browserPush ? 'border-primary bg-primary' : 'border-muted-foreground'">
            <div v-if="browserPush" class="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
        </button>
      </div>
    </div>

    <!-- Additional notification settings (email, radio selection) -->
    <Separator />
    <form class="space-y-8" @submit="onSubmit">
      <div>
        <h3 class="text-lg font-medium">Notifications</h3>
        <p class="text-sm text-muted-foreground">Configure how you receive notifications.</p>
      </div>

      <FormField v-slot="{ componentField }" type="radio" name="type">
        <FormItem class="space-y-3">
          <FormLabel>Notify me about...</FormLabel>
          <FormControl>
            <RadioGroup class="flex flex-col space-y-1" v-bind="componentField">
              <FormItem class="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="all" />
                </FormControl>
                <FormLabel class="font-normal">All new messages</FormLabel>
              </FormItem>
              <FormItem class="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="mentions" />
                </FormControl>
                <FormLabel class="font-normal">Direct messages and mentions</FormLabel>
              </FormItem>
              <FormItem class="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="none" />
                </FormControl>
                <FormLabel class="font-normal">Nothing</FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <div>
        <h3 class="mb-4 text-lg font-medium">Email Notifications</h3>
        <div class="space-y-4">
          <FormField v-slot="{ handleChange, value }" type="checkbox" name="communication_emails">
            <FormItem class="flex flex-row items-center justify-between border rounded-lg p-4">
              <div class="space-y-0.5">
                <FormLabel class="text-base">Communication emails</FormLabel>
                <FormDescription>Receive emails about your account activity.</FormDescription>
              </div>
              <FormControl>
                <Switch :checked="value" @update:checked="handleChange" />
              </FormControl>
            </FormItem>
          </FormField>

          <FormField v-slot="{ handleChange, value }" type="checkbox" name="marketing_emails">
            <FormItem class="flex flex-row items-center justify-between border rounded-lg p-4">
              <div class="space-y-0.5">
                <FormLabel class="text-base">Marketing emails</FormLabel>
                <FormDescription>Receive emails about new products, features, and more.</FormDescription>
              </div>
              <FormControl>
                <Switch :checked="value" @update:checked="handleChange" />
              </FormControl>
            </FormItem>
          </FormField>

          <FormField v-slot="{ handleChange, value }" type="checkbox" name="social_emails">
            <FormItem class="flex flex-row items-center justify-between border rounded-lg p-4">
              <div class="space-y-0.5">
                <FormLabel class="text-base">Social emails</FormLabel>
                <FormDescription>Receive emails for friend requests, follows, and more.</FormDescription>
              </div>
              <FormControl>
                <Switch :checked="value" @update:checked="handleChange" />
              </FormControl>
            </FormItem>
          </FormField>

          <FormField v-slot="{ handleChange, value }" type="checkbox" name="security_emails">
            <FormItem class="flex flex-row items-center justify-between border rounded-lg p-4">
              <div class="space-y-0.5">
                <FormLabel class="text-base">Security emails</FormLabel>
                <FormDescription>Receive emails about your account activity and security.</FormDescription>
              </div>
              <FormControl>
                <Switch :checked="value" @update:checked="handleChange" />
              </FormControl>
            </FormItem>
          </FormField>
        </div>
      </div>

      <FormField v-slot="{ handleChange, value }" type="checkbox" name="mobile">
        <FormItem class="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox :checked="value" @update:checked="handleChange" />
          </FormControl>
          <div class="leading-none space-y-1">
            <FormLabel>Use different settings for my mobile devices</FormLabel>
            <FormDescription>
              You can manage your mobile notifications in the
              <a href="/examples/forms">mobile settings</a> page.
            </FormDescription>
          </div>
        </FormItem>
      </FormField>

      <div class="flex justify-start">
        <Button type="submit">Update notifications</Button>
      </div>
    </form>
  </div>
</template>
