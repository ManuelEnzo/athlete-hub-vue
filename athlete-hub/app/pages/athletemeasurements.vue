<script setup lang="ts">
import type { AthleteMeasurementsResponse } from '~/types/api'
import { Loader2, PlusCircle } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AthletesMeasurements from '~/components/athletemeasurements/AthletesMeasurements.vue'
import useToggle from '~/composables/useToggle'
import { useMeasurementsService } from '~/services/dataService'
import { useAthletesStore } from '~/stores/athletesStore'

const { state: isFormVisible, toggle: _toggle } = useToggle(false)
const selectedAthleteId = ref<number | null>(null)
const { t } = useI18n()

// Athletes — fetched once via store (cached, deduplicated)
const athletesStore = useAthletesStore()
const athletes = computed(() => athletesStore.items)

// Measurements — fetched via centralised service
const measurementsSvc = useMeasurementsService()
const measurements = computed<AthleteMeasurementsResponse[]>(() => measurementsSvc.items.value)
const loading = computed(() => measurementsSvc.loading.value)

async function refreshData() {
  await measurementsSvc.fetch()
}

// When athlete changes, optional UI-only side effects can go here
watch(selectedAthleteId, () => {
  // isFormVisible.value = false // uncomment if needed
})

onMounted(async () => {
  await Promise.all([
    athletesStore.initialize(),
    refreshData(),
  ])
  // Auto-select first athlete
  if (athletes.value.length > 0 && selectedAthleteId.value === null) {
    selectedAthleteId.value = athletes.value[0]?.id ?? null
  }
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
