<script setup lang="ts">
import { HeartPulse, Loader2, User } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import InjuryManagement from '@/components/injury/InjuryManagement.vue'
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
  <div class="min-h-full bg-background">
    <!-- Page Header -->
    <div class="border-b border-border/60 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
      <div class="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20">
            <HeartPulse class="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 class="text-base font-semibold tracking-tight text-foreground leading-none">
              {{ t('injuries.management_title') }}
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">
              {{ t('injuries.pageDescription') || 'Monitora e gestisci gli infortuni degli atleti' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <Loader2 v-if="loadingAthletes" class="h-4 w-4 animate-spin text-muted-foreground" />
          <Select v-model="selectedAthleteId">
            <SelectTrigger class="h-9 w-52 text-sm border-border/60 font-medium">
              <div class="flex items-center gap-2">
                <User class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <SelectValue :placeholder="t('measurements.validation.selectAthlete')" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="athlete in athletes" :key="athlete.id" :value="athlete.id">
                {{ athlete.firstName }} {{ athlete.lastName }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <div class="px-6 py-6">
      <div v-if="selectedAthleteId">
        <InjuryManagement :athlete-id="selectedAthleteId" />
      </div>
      <div v-else-if="!loadingAthletes" class="py-24 flex flex-col items-center gap-3 text-center">
        <div class="w-14 h-14 rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center text-muted-foreground/30">
          <User class="h-6 w-6" />
        </div>
        <div>
          <p class="text-sm font-semibold text-muted-foreground">{{ t('measurements.validation.selectAthlete') }}</p>
          <p class="text-xs text-muted-foreground/60 mt-1">{{ t('injuries.selectAthleteInstruction') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
