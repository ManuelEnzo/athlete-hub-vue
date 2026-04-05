<script setup lang="ts">
import { Loader2, User } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AthleteDetail from '@/components/athelete/AthleteDetail.vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAthletesStore } from '~/stores/athletesStore'

const { t } = useI18n()
const athletesStore = useAthletesStore()

// Local UI state only — data lives in the store
const selectedAthleteId = ref<number | null>(null)

const athletes = computed(() => athletesStore.items)
const loadingAthletes = computed(() => athletesStore.loading)

onMounted(async () => {
  await athletesStore.initialize()
  // Auto-select first athlete after load
  if (athletes.value.length > 0 && selectedAthleteId.value === null) {
    selectedAthleteId.value = athletes.value[0]?.id ?? null
  }
})
</script>

<template>
  <div class="w-full flex flex-col gap-4 sm:gap-8 mx-auto">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h2 class="text-2xl font-bold tracking-tight flex items-center gap-2">
        {{ t('athlete.visualizer') }}
      </h2>

      <div class="flex flex-wrap items-center gap-2 sm:gap-3">
        <Loader2 v-if="loadingAthletes" class="h-5 w-5 animate-spin text-primary" />

        <div class="relative min-w-[200px] sm:min-w-[260px] w-full sm:w-auto">
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
      <AthleteDetail :athlete-id="selectedAthleteId" />
    </div>

    <div v-else-if="!loadingAthletes" class="py-20 text-center bg-slate-50 rounded-xl border-2 border-dashed">
      <User class="h-12 w-12 mx-auto text-slate-300 mb-4" />
      <p class="text-slate-500 font-medium">
        {{ t('measurements.validation.selectAthlete') }}
      </p>
    </div>
  </div>
</template>
