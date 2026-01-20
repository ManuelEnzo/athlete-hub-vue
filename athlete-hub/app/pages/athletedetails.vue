<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { User, Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// UI Components
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import AthleteDetail from '@/components/athelete/AthleteDetail.vue'

// API & Types
import { athleteApi } from '@/api/business'
import type { AthleteResponse } from '@/types/api'

const { t } = useI18n()

// ---------------- State ----------------
const selectedAthleteId = ref<number | null>(null)
const athletes = ref<AthleteResponse[]>([])
const loadingAthletes = ref(false)

// ---------------- Actions ----------------
// Carica l'elenco atleti e imposta il primo se presente
async function fetchAthletes() {
  try {
    const res = await athleteApi.getAll()
    if (res.data.isSuccess) {
      athletes.value = res.data.value ?? []

      // SOLUZIONE: Aggiungi il controllo di lunghezza e l'optional chaining
      if (athletes.value.length > 0 && selectedAthleteId.value === null) {
        // Usiamo ?. per essere sicuri che l'elemento 0 esista
        selectedAthleteId.value = athletes.value[0]?.id ?? null
      }
    }
  } catch (err) {
    toast.error(t('measurements.toast.loadAthletesError'))
  }
}

onMounted(() => {
  fetchAthletes()
})
</script>

<template>
  <div class="w-full flex flex-col gap-8 mx-auto">
    
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h2 class="text-2xl font-bold tracking-tight flex items-center gap-2">
        {{ t('athlete.visualizer') }}
      </h2>

      <div class="flex items-center space-x-3">
        <Loader2 v-if="loadingAthletes" class="h-5 w-5 animate-spin text-primary" />
        
        <div class="relative min-w-[260px]">
          <Select v-model="selectedAthleteId">
            <SelectTrigger class="w-full pl-9 font-semibold">
              <div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <User class="h-4 w-4" />
              </div>
              <SelectValue :placeholder="t('measurements.validation.selectAthlete')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                v-for="athlete in athletes" 
                :key="athlete.id" 
                :value="athlete.id"
              >
                {{ athlete.firstName }} {{ athlete.lastName }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <div v-if="selectedAthleteId" class="rounded-xl">
      <AthleteDetail :athleteId="selectedAthleteId" />
    </div>

    <div v-else-if="!loadingAthletes" class="py-20 text-center bg-slate-50 rounded-xl border-2 border-dashed">
      <User class="h-12 w-12 mx-auto text-slate-300 mb-4" />
      <p class="text-slate-500 font-medium">{{ t('measurements.validation.selectAthlete') }}</p>
    </div>

  </div>
</template>