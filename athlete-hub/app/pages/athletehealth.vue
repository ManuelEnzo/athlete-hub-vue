<script setup lang="ts">

// Importa il componente di input che abbiamo creato e corretto.
// Assicurati che il percorso sia corretto nella tua struttura (es. app/components/dataentry/QuickDataEntry.vue)
import AthleteHealthComp from '~/components/athletehealthc/AthleteHealthComp.vue'
import { useI18n } from 'vue-i18n'
import { Users, Info } from 'lucide-vue-next'

const { t } = useI18n()

// (Opzionale) Puoi impostare il layout della pagina, se usi un layout specifico di Nuxt
// definePageMeta({
//   layout: 'dashboard'
// })
</script>

<template>
    <div class="min-h-screen">
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between  pb-6">
            <h2 class="text-2xl font-bold tracking-tight flex items-center ">
                <span></span> {{ t('measurements.pageTitle') }}
            </h2>

            <div class="flex items-center space-x-2">
                <Button variant="outline">{{ t('dashboard.export') }}</Button>
                <Button>
                    <Info class="h-4 w-4 mr-2"/> {{ t('common.details') }}
                </Button>
            </div>
        </div>

        <AthleteHealthComp />

    </div>
</template>

<style scoped>
/* Stili specifici per la pagina, se necessari */
</style>