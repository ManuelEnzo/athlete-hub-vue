<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { User, Loader2, Stethoscope } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// UI Components
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import InjuryManagement from '@/components/injury/InjuryManagement.vue'

// API & Types
import { athleteApi } from '@/api/business'
import type { AthleteResponse } from '@/types/api'

const { t } = useI18n()

// ---------------- State ----------------
const selectedAthleteId = ref<number | null>(null)
const athletes = ref<AthleteResponse[]>([])
const loadingAthletes = ref(false)

// ---------------- Actions ----------------
async function fetchAthletes() {
  loadingAthletes.value = true
  try {
    const res = await athleteApi.getAll()
    if (res.data.isSuccess) {
      athletes.value = res.data.value ?? []

      // Imposta il primo atleta se la lista non è vuota e non ne è già stato selezionato uno
      if (athletes.value.length > 0 && selectedAthleteId.value === null) {
        selectedAthleteId.value = athletes.value[0]?.id ?? null
      }
    }
  } catch (err) {
    toast.error(t('measurements.toast.loadAthletesError'))
  } finally {
    loadingAthletes.value = false
  }
}

onMounted(() => {
  fetchAthletes()
})
</script>

<template>
  <div class="w-full flex flex-col gap-8 mx-auto p-4 max-w-[1600px]">
    
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-primary/10 rounded-xl">
          <Stethoscope class="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 class="text-2xl font-black uppercase tracking-tighter">
            {{ t('injuries.management_title') || 'Medical Center' }}
          </h2>
          <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {{ t('athlete.visualizer') }}
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-3 w-full md:w-auto">
        <Loader2 v-if="loadingAthletes" class="h-5 w-5 animate-spin text-primary" />
        
        <div class="relative min-w-[300px] w-full">
          <Select v-model="selectedAthleteId">
            <SelectTrigger class="w-full h-12 font-bold border-2 transition-all hover:border-primary/50">
              <div class="flex items-center gap-2">
                <User class="h-4 w-4 text-slate-400" />
                <SelectValue :placeholder="t('measurements.validation.selectAthlete')" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                v-for="athlete in athletes" 
                :key="athlete.id" 
                :value="athlete.id"
                class="font-bold uppercase text-[11px]"
              >
                {{ athlete.firstName }} {{ athlete.lastName }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <div v-if="selectedAthleteId" class="animate-in fade-in duration-500">
      <InjuryManagement :athleteId="selectedAthleteId" />
    </div>

    <div v-else-if="!loadingAthletes" class="py-32 text-center bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200">
      <div class="bg-white h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border">
        <User class="h-10 w-10 text-slate-200" />
      </div>
      <p class="text-slate-500 font-black uppercase text-sm tracking-tighter">
        {{ t('measurements.validation.selectAthlete') }}
      </p>
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
        Seleziona un atleta per visualizzare o registrare infortuni
      </p>
    </div>

  </div>
</template>

<style scoped>
.animate-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>