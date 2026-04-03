<script setup lang="ts">
import { PlusCircle } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import AthleteManagement from '~/components/athmanagement/AthleteManagement.vue'
import { useErrorHandler } from '~/composables/useErrorHandler'
import useToggle from '~/composables/useToggle'
import { useAuthStore } from '~/stores/auth'

const { t } = useI18n()
const { state: isFormVisible, toggle } = useToggle(false)

// Auth guard + profile fetch
const _auth = useAuthStore()
const _handler = useErrorHandler({ component: 'AthleteManagementPage' })
</script>

<template>
  <div class="min-h-screen mx-auto">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between pb-6">
      <h2 class="text-2xl font-bold tracking-tight flex items-center">
        {{ t('athlete.pageTitle') }}
      </h2>

      <div class="flex items-center space-x-2">
        <Button :variant="isFormVisible ? 'secondary' : 'default'" @click="toggle()">
          <PlusCircle class="h-4 w-4 mr-2" />
          {{ isFormVisible ? t('common.cancel') : t('athlete.new') }}
        </Button>
      </div>
    </div>

    <AthleteManagement v-model:show-form="isFormVisible" />
  </div>
</template>
