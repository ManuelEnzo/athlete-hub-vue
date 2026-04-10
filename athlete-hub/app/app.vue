<script setup lang="ts">
import { ConfigProvider } from 'reka-ui'
import { useI18n } from 'vue-i18n'
import { Toaster } from 'vue-sonner'
import config from '@/config'
import 'vue-sonner/style.css'

const { locale } = useI18n()
const colorMode = useColorMode()
const color = computed(() => colorMode.value === 'dark' ? '#09090b' : '#ffffff')
const { theme } = useAppSettings()

const siteUrl = import.meta.env.VITE_ATHLETE_HUB_SITE_URL || 'https://athletehub.sport'

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color },
    { name: 'robots', content: 'index, follow' },
    { name: 'keywords', content: config.siteKeywords },
    { name: 'author', content: 'Athlete Hub' },
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'canonical', href: siteUrl },
  ],
  htmlAttrs: {
    lang: () => locale.value,
  },
  bodyAttrs: {
    class: () => `color-${theme.value?.color || 'default'} theme-${theme.value?.type || 'default'}`,
  },
})

const title = config.siteName
const description = config.siteDescription

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: siteUrl,
  ogImage: config.siteOgImage,
  ogType: 'website',
  ogSiteName: title,
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: config.siteOgImage,
  twitterCard: 'summary_large_image',
  twitterSite: '@athletehub',
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

      <Toaster position="top-right" rich-colors close-button />
    </ConfigProvider>
  </Body>
</template>
