<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PlusCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import AthleteManagement from '~/components/athmanagement/AthleteManagement.vue'

// Questo stato controlla il form dentro il componente figlio
const isFormVisible = ref(false)
const { t } = useI18n()
</script>

<template>
    <div class="min-h-screen mx-auto">
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between  pb-6">
            <h2 class="text-2xl font-bold tracking-tight flex items-center ">
                <span></span> {{ t('athlete.pageTitle') }}
            </h2>

            <div class="flex items-center space-x-2">
                <Button :variant="isFormVisible ? 'secondary' : 'default'" @click="isFormVisible = !isFormVisible">
                    <PlusCircle class="h-4 w-4 mr-2" />
                    {{ isFormVisible ? t('common.cancel') : t('athlete.new') }}
                </Button>
            </div> 
        </div>
        <AthleteManagement v-model:showForm="isFormVisible" />

    </div>
</template>