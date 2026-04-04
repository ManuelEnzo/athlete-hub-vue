<script setup lang="ts">
import { Info } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import AthleteHealthComp from '~/components/athletehealthc/AthleteHealthComp.vue'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between  pb-6">
      <h2 class="text-2xl font-bold tracking-tight flex items-center ">
        {{ t('measurements.pageTitle') }}
      </h2>

      <div class="flex items-center space-x-2">
        <Button variant="outline">
          {{ t('dashboard.export') }}
        </Button>
        <Button>
          <Info class="h-4 w-4 mr-2" /> {{ t('common.details') }}
        </Button>
      </div>
    </div>

    <AthleteHealthComp />
  </div>
</template>

<style scoped>
/* Stili specifici per la pagina, se necessari */
</style>
