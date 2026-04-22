<script setup lang="ts">
import { ClipboardList } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import TestManagmentComp from '~/components/testmanage/TestManagmentComp.vue'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-full bg-background">
    <!-- Page Header -->
    <div class="border-b border-border/60 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
      <div class="px-6 py-4 flex items-center gap-3">
        <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20">
          <ClipboardList class="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 class="text-base font-semibold tracking-tight text-foreground leading-none">
            {{ t('testManagement.pageTitle') }}
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            {{ t('testManagement.pageDescription') }}
          </p>
        </div>
      </div>
    </div>

    <div class="px-6 py-6">
      <TestManagmentComp />
    </div>
  </div>
</template>
