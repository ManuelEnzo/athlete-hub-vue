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

const title = config.siteName
const description = config.siteDescription

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: '',
  ogImage: config.siteOgImage,
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: config.siteOgImage,
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

      <Toaster position="top-right" rich-colors close-button />
    </ConfigProvider>
  </Body>
</template>
