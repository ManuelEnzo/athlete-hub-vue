<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { PlusCircle, Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import AthletesMeasurements from '~/components/athletemeasurements/AthletesMeasurements.vue'
import { athleteApi } from '~/api/business'
import type { AthleteMeasurementsResponse, AthleteResponse } from '~/types/api'
import { toast } from 'vue-sonner'

const isFormVisible = ref(false)
const selectedAthleteId = ref<number | null>(null)
const athletes = ref<AthleteResponse[]>([])
const loading = ref(false)
const measurements = ref<AthleteMeasurementsResponse[]>([])
const { t } = useI18n()

// Carica l'elenco atleti e imposta il primo se presente
async function fetchAthletes() {
  try {
    const res = await athleteApi.getAll()
    if (res.data.isSuccess) {
      athletes.value = res.data.value ?? []

      // riga 28
      if (athletes.value.length > 0 && selectedAthleteId.value === null) {
        selectedAthleteId.value = athletes.value[0]?.id ?? null
      }
    }
  } catch {
    toast.error(t('measurements.toast.loadAthletesError'))
  }
}

// Carica TUTTE le misurazioni o quelle specifiche
async function refreshData() {
  loading.value = true
  try {
    const res = await athleteApi.getAllMeasurements()
    if (res.data.isSuccess) {
      measurements.value = res.data.value ?? []
    }
  } catch (err) {
    toast.error(t('measurements.toast.loadMeasurementsError'))
  } finally {
    loading.value = false
  }
}

// Quando cambia l'atleta, resettiamo eventuali stati temporanei se necessario
watch(selectedAthleteId, () => {
  // Se vuoi nascondere il form quando cambi atleta:
  // isFormVisible.value = false
})

onMounted(() => {
  fetchAthletes()
  refreshData()
})
</script>

<template>
  <div class="min-h-screen mx-auto">
    <div class="flex flex-wrap items-center justify-between pb-6 gap-4">
      <h2 class="text-2xl font-bold tracking-tight">{{ t('measurements.pageTitle') }}</h2>

      <div class="flex flex-wrap items-center gap-2">
        <Select v-model="selectedAthleteId">
          <SelectTrigger class="w-64">
            <SelectValue :placeholder="t('measurements.filterAll')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="null">{{ t('measurements.filterAll') }}</SelectItem>
            <SelectItem v-for="a in athletes" :key="a.id" :value="a.id">
              {{ a.firstName }} {{ a.lastName }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Button :variant="isFormVisible ? 'secondary' : 'default'" @click="isFormVisible = !isFormVisible">
          <PlusCircle class="h-4 w-4 mr-2" />
          {{ isFormVisible ? t('common.cancel') : t('measurements.newMeasurement') }}
        </Button>
      </div>
    </div>

    <div v-if="loading && measurements.length === 0" class="flex justify-center items-center py-20">
      <Loader2 class="h-12 w-12 animate-spin text-primary" />
    </div>

    <div v-else>
      <AthletesMeasurements v-model:showForm="isFormVisible" :selectedAthleteId="selectedAthleteId" :athletes="athletes"
        :measurements="measurements" :loading="loading" @refresh="refreshData" />
    </div>
  </div>
</template>