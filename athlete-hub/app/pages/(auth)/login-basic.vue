<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-6 bg-muted p-6 min-h-svh md:p-10">
    <div class="max-w-sm w-full flex flex-col gap-6">
      <NuxtLink to="#" class="flex items-center self-center gap-2 font-medium">
        <div class="h-6 w-6 flex items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Icon name="i-lucide-gallery-vertical-end" class="size-4" />
        </div>
        {{ $t('auth.login.company') }}
      </NuxtLink>
      <div class="flex flex-col gap-6">
        <Card>
          <CardHeader class="text-center">
            <CardTitle class="text-xl">
              {{ $t('auth.login.title') }}
            </CardTitle>
            <CardDescription>
              {{ $t('auth.login.subtitle') }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthSignIn />
          </CardContent>
        </Card>
        <div v-html="$t('auth.login.terms', { terms: '<a>Terms of Service</a>', privacy: '<a>Privacy Policy</a>' })" class="text-center text-balance text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary"></div>
      </div>
    </div>
  </div>
</template>
