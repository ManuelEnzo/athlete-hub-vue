<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { User, ChevronDown } from 'lucide-vue-next'
import AthleteDetail from '@/components/athelete/AthleteDetail.vue'

const { t } = useI18n()

// Stato che tiene traccia dell'ID dell'atleta selezionato
const selectedAthleteId = ref(1)

// Opzioni per il menu a tendina
const athleteOptions = [
  { id: 1, name: 'Marco Rossi' },
  { id: 2, name: 'Laura Bianchi' },
  { id: 3, name: 'Alessandro Verbi' },
]
</script>

<template>
  <div class="w-full flex flex-col gap-8 mx-auto">
    
    <div class="flex flex-wrap items-center justify-between gap-4 ">
      <h2 class="text-2xl font-bold tracking-tight flex items-center gap-2">
        {{ t('athlete.visualizer') }}
      </h2>

      <div class="flex items-center space-x-3">
        <div class="relative group min-w-[240px]">
          <span class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
            <User class="h-4 w-4" />
          </span>

          <select 
            v-model="selectedAthleteId"
            class="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-lg appearance-none 
                   focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary 
                   transition-all cursor-pointer text-sm font-semibold text-slate-700 shadow-sm 
                   hover:border-slate-300 hover:bg-slate-50/50"
          >
            <option value="" disabled>{{ t('measurements.validation.selectAthlete') }}</option>
            <option v-for="athlete in athleteOptions" :key="athlete.id" :value="athlete.id">
              {{ athlete.name }}
            </option>
          </select>

          <span class="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
            <ChevronDown class="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>

    <div class="rounded-xl">
       <AthleteDetail :athleteId="selectedAthleteId" />
    </div>

  </div>
</template>

<style scoped>
/* Rimuove la freccia di default su Internet Explorer */
select::-ms-expand {
  display: none;
}

/* Effetto per rendere le option un po' più leggibili in alcuni browser */
option {
  padding: 10px;
  font-weight: 500;
}
</style>