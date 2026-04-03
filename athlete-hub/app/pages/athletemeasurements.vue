<script setup lang="ts">
import type { AthleteMeasurementsResponse, AthleteResponse } from '~/types/api'
import { Loader2, PlusCircle } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { athleteApi } from '~/api/business'
import AthletesMeasurements from '~/components/athletemeasurements/AthletesMeasurements.vue'
import { useErrorHandler } from '~/composables/useErrorHandler'
import useToggle from '~/composables/useToggle'
import { useAuthStore } from '~/stores/auth'

const { state: isFormVisible, toggle: _toggle } = useToggle(false)
const selectedAthleteId = ref<number | null>(null)
const athletes = ref<AthleteResponse[]>([])
const loading = ref(false)
const measurements = ref<AthleteMeasurementsResponse[]>([])
const { t } = useI18n()
const handler = useErrorHandler({ component: 'AthleteMeasurementsPage' })
const auth = useAuthStore()

// Carica l'elenco atleti e imposta il primo se presente
async function fetchAthletes() {
  try {
    const res = await athleteApi.getAll()
    if (res.data.isSuccess) {
      athletes.value = res.data.value ?? []
      if (athletes.value.length > 0 && selectedAthleteId.value === null) {
        selectedAthleteId.value = athletes.value[0]?.id ?? null
      }
    }
  }
  catch (err) {
    handler.handleError(err instanceof Error ? err : new Error(t('measurements.toast.loadAthletesError')))
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
  }
  catch (err) {
    handler.handleError(err instanceof Error ? err : new Error(t('measurements.toast.loadMeasurementsError')))
  }
  finally {
    loading.value = false
  }
}

// Quando cambia l'atleta, resettiamo eventuali stati temporanei se necessario
watch(selectedAthleteId, () => {
  // Se vuoi nascondere il form quando cambi atleta:
  // isFormVisible.value = false
})

onMounted(() => {
  // ensure auth/profile then load
  auth.fetchProfile().catch(e => handler.handleError(e instanceof Error ? e : new Error(String(e))))
  fetchAthletes()
  refreshData()
})
</script>

<template>
  <div class="min-h-screen mx-auto">
    <div class="flex flex-wrap items-center justify-between pb-6 gap-4">
      <h2 class="text-2xl font-bold tracking-tight">
        {{ t('measurements.pageTitle') }}
      </h2>

      <div class="flex flex-wrap items-center gap-2">
        <Select v-model="selectedAthleteId">
          <SelectTrigger class="w-64">
            <SelectValue :placeholder="t('measurements.filterAll')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="null">
              {{ t('measurements.filterAll') }}
            </SelectItem>
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
      <AthletesMeasurements
        v-model:show-form="isFormVisible" :selected-athlete-id="selectedAthleteId" :athletes="athletes"
        :measurements="measurements" :loading="loading" @refresh="refreshData"
      />
    </div>
  </div>
</template>
