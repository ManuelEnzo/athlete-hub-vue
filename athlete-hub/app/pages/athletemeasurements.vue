<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
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

// Carica l'elenco atleti una sola volta
async function fetchAthletes() {
  try {
    const res = await athleteApi.getAll()
    if (res.data.isSuccess) athletes.value = res.data.value ?? []
  } catch {
    toast.error('Errore caricamento atleti')
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
    toast.error('Errore durante l\'aggiornamento dei dati')
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
  <div class="min-h-screen mx-auto p-4">
    <div class="flex flex-wrap items-center justify-between pb-6 gap-4">
      <h2 class="text-2xl font-bold tracking-tight">Athletes' Health Status</h2>

      <div class="flex flex-wrap items-center gap-2">
        <Select v-model="selectedAthleteId">
          <SelectTrigger class="w-64">
            <SelectValue placeholder="Tutti gli atleti" />
          </SelectTrigger>
          <SelectContent>
             <SelectItem :value="null">Tutti gli atleti</SelectItem>
            <SelectItem v-for="a in athletes" :key="a.id" :value="a.id">
              {{ a.firstName }} {{ a.lastName }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Button :variant="isFormVisible ? 'secondary' : 'default'" @click="isFormVisible = !isFormVisible">
          <PlusCircle class="h-4 w-4 mr-2" />
          {{ isFormVisible ? 'Annulla' : 'Nuova Misurazione' }}
        </Button>
      </div>
    </div>

    <div class="relative">
      <AthletesMeasurements 
        v-model:showForm="isFormVisible" 
        :selectedAthleteId="selectedAthleteId"
        :athletes="athletes" 
        :measurements="measurements" 
        :loading="loading"
        @refresh="refreshData" 
      />

      <div v-if="loading" class="absolute inset-0 flex items-center justify-center z-50 bg-white/50 backdrop-blur-sm">
        <Loader2 class="h-10 w-10 animate-spin text-primary" />
      </div>
    </div>
  </div>
</template>