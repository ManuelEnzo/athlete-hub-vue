<script setup lang="ts">
import { PlusCircle, Users } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import AthleteManagement from '~/components/athmanagement/AthleteManagement.vue'
import useToggle from '~/composables/useToggle'

const { t } = useI18n()
const { state: isFormVisible, toggle } = useToggle(false)
</script>

<template>
  <div class="min-h-full bg-background">
    <!-- Page Header -->
    <div class="border-b border-border/60 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
      <div class="px-6 py-5 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20">
            <Users class="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 class="text-base font-semibold tracking-tight text-foreground leading-none">
              {{ t('athlete.pageTitle') }}
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">
              {{ t('athlete.pageDescription') || 'Gestisci gli atleti, i profili e le informazioni del team' }}
            </p>
          </div>
        </div>
        <Button
          :variant="isFormVisible ? 'outline' : 'default'"
          size="sm"
          class="gap-1.5 h-8 text-xs font-medium shrink-0"
          @click="toggle()"
        >
          <PlusCircle class="h-3.5 w-3.5" />
          {{ isFormVisible ? t('common.cancel') : t('athlete.new') }}
        </Button>
      </div>
    </div>

    <AthleteManagement v-model:show-form="isFormVisible" />
  </div>
</template>
