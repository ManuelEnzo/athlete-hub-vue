<script setup lang="ts">
import { ConfigProvider } from 'reka-ui'
import 'vue-sonner/style.css'
import { Toaster } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
const colorMode = useColorMode()
const color = computed(() => colorMode.value === 'dark' ? '#09090b' : '#ffffff')
const { theme } = useAppSettings()

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color },
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
  ],
  htmlAttrs: {
    lang: () => locale.value,
  },
  bodyAttrs: {
    class: () => `color-${theme.value?.color || 'default'} theme-${theme.value?.type || 'default'}`,
  },
})

const title = 'Athlete Hub'
const description = 'A comprehensive performance monitoring system designed to track training loads, readiness scores, and athletic progress through data-driven analytics.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: 'https://dashboard.dianprata.com',
  ogImage: 'https://nuxt-shadcn-dashboard.vercel.app/social-card.png',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: 'https://nuxt-shadcn-dashboard.vercel.app/social-card.png',
  twitterCard: 'summary_large_image',
})

const router = useRouter()

defineShortcuts({
  'G-H': () => router.push('/'),
  'G-E': () => router.push('/email'),
})

const textDirection = useTextDirection({ initialValue: 'ltr' })
const dir = computed(() => textDirection.value === 'rtl' ? 'rtl' : 'ltr')
</script>

<template>
  <Body class="overscroll-none antialiased bg-background text-foreground">
    <ConfigProvider :dir="dir">
      <div id="app" vaul-drawer-wrapper class="relative">
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>

        <AppSettings />
      </div>

     <Toaster position="top-right" richColors closeButton  />
    </ConfigProvider>
  </Body>
</template>
