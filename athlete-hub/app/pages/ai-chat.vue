<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AiChat from '~/components/ai/AiChat.vue'

definePageMeta({ layout: 'default' })
const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">

    <!-- Header -->
    <div class="bg-gradient-to-r from-primary/10 to-transparent border-b border-border py-5 shrink-0 w-full">
      <div class="w-full px-4 md:px-6">
        <h1 class="text-2xl md:text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
          <Icon name="lucide:bot" class="w-7 h-7 text-primary" />
          {{ t('aiChat.pageTitle') }}
        </h1>
        <p class="text-muted-foreground text-sm">{{ t('aiChat.pageSubtitle') }}</p>
      </div>
    </div>

    <!-- Chat fills remaining height, no outer scroll -->
    <main class="flex-1 overflow-hidden py-5 w-full">
      <AiChat class="h-full" />
    </main>

  </div>
</template>
