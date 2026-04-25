<script setup lang="ts">
import type { AthleteMeasurementsResponse } from '~/types/api'
import { Loader2, PlusCircle, Ruler } from 'lucide-vue-next'
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
  <div class="min-h-screen bg-background">
    <!-- Page Header -->
    <div class="border-b border-border/60 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
      <div class="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20">
            <Ruler class="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 class="text-base font-semibold tracking-tight text-foreground leading-none">
              {{ t('measurements.pageTitle') }}
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">
              {{ t('measurements.analysis.description') }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <Select v-model="selectedAthleteId">
            <SelectTrigger class="h-9 w-52 text-sm border-border/60 font-medium">
              <div class="flex items-center gap-2">
                <SelectValue :placeholder="t('measurements.filterAll')" />
              </div>
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

          <Button :variant="isFormVisible ? 'secondary' : 'default'" size="sm" @click="isFormVisible = !isFormVisible">
            <PlusCircle class="h-4 w-4 mr-2" />
            {{ isFormVisible ? t('common.cancel') : t('measurements.newMeasurement') }}
          </Button>
        </div>
      </div>
    </div>

    <div class="px-6 py-6">
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
  </div>
</template>
