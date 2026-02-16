<script setup lang="ts">
import { useI18n } from 'vue-i18n';

definePageMeta({
  layout: 'blank',
  auth: false,
  guestOnly: true
})
const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col items-center justify-center bg-background p-6 min-h-svh md:p-10">
    <div class="max-w-sm w-full flex flex-col gap-6">

      <NuxtLink to="/" class="flex items-center self-center gap-2 font-medium">
        <div class="h-6 w-6 flex items-center justify-center rounded-md bg-primary text-primary-foreground">
          <div class="i-lucide-dumbbell size-4"></div>
        </div>
        <span class="font-bold tracking-tight text-lg">Athlete Hub</span>
      </NuxtLink>

      <div class="flex flex-col gap-6">
        <div class="text-center">
          <h1 class="text-2xl font-semibold tracking-tight">
            {{ t('auth.forgotPassword.title') }}
          </h1>
          <p class="text-sm text-muted-foreground mt-1">
            {{ t('auth.forgotPassword.description') }}
          </p>
        </div>

        <AuthForgotPassword />

        <div class="text-center text-sm">
          {{ t('auth.login.alreadyHaveAccount') }}
          <NuxtLink to="/login" class="underline underline-offset-4 font-medium">
            {{ t('auth.login.submit') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>