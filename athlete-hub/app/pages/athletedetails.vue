<script setup lang="ts">
import type { AthleteResponse } from '@/types/api'
import { Loader2, User } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
// API & Types
import { athleteApi } from '@/api/business'

import AthleteDetail from '@/components/athelete/AthleteDetail.vue'
// UI Components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useErrorHandler } from '~/composables/useErrorHandler'
import { useAuthStore } from '~/stores/auth'

const { t } = useI18n()
const handler = useErrorHandler({ component: 'AthleteDetailsPage' })
const auth = useAuthStore()

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

      if (athletes.value.length > 0 && selectedAthleteId.value === null) {
        selectedAthleteId.value = athletes.value[0]?.id ?? null
      }
    }
  }
  catch (err) {
    handler.handleError(err instanceof Error ? err : new Error(t('measurements.toast.loadAthletesError')))
  }
}

onMounted(() => {
  // ensure auth profile (non-blocking)
  auth.fetchProfile().catch(e => handler.handleError(e instanceof Error ? e : new Error(String(e))))
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
