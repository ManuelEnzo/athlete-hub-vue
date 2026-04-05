<script setup lang="ts">
import { Loader2, Moon, User } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SleepDashboard from '@/components/sleep/SleepDashboard.vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAthletesStore } from '~/stores/athletesStore'

const { t } = useI18n()
const athletesStore = useAthletesStore()

const selectedAthleteId = ref<number | null>(null)
const athletes = computed(() => athletesStore.items)
const loadingAthletes = computed(() => athletesStore.loading)

onMounted(async () => {
  await athletesStore.initialize()
  if (athletes.value.length > 0 && selectedAthleteId.value === null) {
    selectedAthleteId.value = athletes.value[0]?.id ?? null
  }
})
</script>

<template>
  <div class="w-full flex flex-col gap-6 mx-auto max-w-[1600px]">
    <!-- Page header -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-primary/10 rounded-xl">
          <Moon class="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 class="text-2xl font-black uppercase tracking-tighter">
            {{ t('sleep.pageTitle') }}
          </h2>
          <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {{ t('sleep.pageSubtitle') }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto">
        <Loader2 v-if="loadingAthletes" class="h-5 w-5 animate-spin text-primary" />

        <div class="relative min-w-[280px] w-full md:w-auto">
          <Select v-model="selectedAthleteId">
            <SelectTrigger class="w-full h-11 font-bold border-2 transition-all hover:border-primary/50">
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

    <!-- Main content -->
    <div v-if="selectedAthleteId" class="animate-in fade-in duration-500">
      <SleepDashboard :athlete-id="selectedAthleteId" />
    </div>

    <div
      v-else-if="!loadingAthletes"
      class="py-32 text-center bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200"
    >
      <div class="bg-white h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border">
        <Moon class="h-10 w-10 text-slate-200" />
      </div>
      <p class="text-slate-500 font-black uppercase text-sm tracking-tighter">
        {{ t('measurements.validation.selectAthlete') }}
      </p>
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
        {{ t('sleep.selectAthleteInstruction') }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
