<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Users, Activity, AlertTriangle, Clock, CheckCircle, ClipboardList
} from 'lucide-vue-next'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { athleteApi } from '@/api/business'
import type { CoachDashboardSummaryDto } from '@/types/api'

const { t } = useI18n()

// ---------------- State ----------------
const dashboardData = ref<CoachDashboardSummaryDto | null>(null)
const loading = ref(true)

// ---------------- Actions ----------------
async function fetchDashboard() {
  loading.value = true
  try {
    const res = await athleteApi.getSummary()
    if (res.data.isSuccess && res.data.value) {
      dashboardData.value = res.data.value
    }
  } catch (error) {
    console.error('Errore caricamento dashboard:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchDashboard())

// ---------------- Computed ----------------
// Numero di RPE mancanti (da DTO)
const missingRpeCount = computed(() => {
  if (!dashboardData.value) return 0
  return dashboardData.value.missingReportsToday < 0 ? 0 : dashboardData.value.missingReportsToday
})
</script>

<template>
<div class="w-full flex flex-col gap-8 p-4 max-w-[1600px] mx-auto">

  <!-- ---------------- Top KPI ---------------- -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
    <!-- Atleti Monitorati -->
    <Card class="border-2 border-foreground/10 shadow-none">
      <CardHeader class="pb-2 bg-muted/5">
        <CardTitle class="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2 italic">
          <Users class="h-4 w-4" /> {{ t('dashboard.athletes_monitored') }}
        </CardTitle>
      </CardHeader>
      <CardContent class="pt-4">
        <div class="text-4xl font-black italic tracking-tighter">{{ dashboardData?.totalMonitoredAthletes ?? '-' }}</div>
      </CardContent>
    </Card>

    <!-- Readiness Media -->
    <Card class="border-2 border-foreground/10 shadow-none">
      <CardHeader class="pb-2 bg-muted/5">
        <CardTitle class="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2 italic">
          <Activity class="h-4 w-4" /> {{ t('dashboard.average_readiness') }}
        </CardTitle>
      </CardHeader>
      <CardContent class="pt-4">
        <div class="flex items-center justify-between">
          <div class="text-4xl font-black italic tracking-tighter">
            {{ dashboardData?.averageReadinessScore ?? '-' }}%
          </div>
          <Badge variant="outline" class="font-black text-[9px] uppercase border-foreground/20 italic tracking-widest h-6">
            Team
          </Badge>
        </div>
      </CardContent>
    </Card>

    <!-- Alert ACWR -->
    <Card class="border-2 border-foreground/10 shadow-none">
      <CardHeader class="pb-2 bg-muted/5">
        <CardTitle class="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2 italic">
          <AlertTriangle class="h-4 w-4" /> {{ t('dashboard.acwr_alerts') }}
        </CardTitle>
      </CardHeader>
      <CardContent class="pt-4">
        <div class="text-4xl font-black italic tracking-tighter" :class="dashboardData?.criticalAcwrCount! > 0 ? 'text-foreground' : 'text-muted-foreground/30'">
          {{ dashboardData?.criticalAcwrCount ?? 0 }}
        </div>
      </CardContent>
    </Card>

    <!-- RPE Mancanti -->
    <Card class="border-2 border-foreground/10 shadow-none">
      <CardHeader class="pb-2 bg-muted/5">
        <CardTitle class="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2 italic">
          <Clock class="h-4 w-4" /> {{ t('dashboard.rpe_missing') }}
        </CardTitle>
      </CardHeader>
      <CardContent class="pt-4">
        <div class="text-4xl font-black italic tracking-tighter" :class="missingRpeCount > 0 ? 'text-foreground' : 'text-muted-foreground/30'">
          {{ missingRpeCount }}
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- ---------------- Atleti in Evidenza ---------------- -->
  <div class="space-y-6">
    <h3 class="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 italic">
      {{ t('dashboard.athlete_status') }}
    </h3>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <template v-for="athlete in dashboardData?.athleteStatusMatrix" :key="athlete.name">
        <Card class="p-4 border-2 border-foreground/10 shadow-none hover:border-foreground transition-all">
          <div class="flex justify-between items-start mb-2">
            <p class="text-[11px] font-black uppercase italic tracking-wider">{{ athlete.name }}</p>
            <Badge variant="outline" :class="athlete.readiness >= 85 ? 'bg-green-500/10 text-green-700 border-green-200' : athlete.readiness >= 70 ? 'bg-yellow-500/10 text-yellow-700 border-yellow-200' : 'bg-red-500/10 text-red-700 border-red-200'">
              {{ athlete.readiness >= 85 ? 'Ottimo' : athlete.readiness >= 70 ? 'Medio' : 'Critico' }}
            </Badge>
          </div>

          <div class="flex justify-between items-center mt-2">
            <div>
              <p class="text-[10px] font-bold uppercase opacity-50 italic">Readiness</p>
              <p class="text-2xl font-black italic">{{ athlete.readiness }}%</p>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase opacity-50 italic">ACWR</p>
              <p class="text-2xl font-black italic" :class="athlete.acwr > 1.3 ? 'text-red-600' : 'text-foreground'">{{ athlete.acwr.toFixed(2) }}</p>
            </div>
          </div>
        </Card>
      </template>
    </div>
  </div>

  <!-- ---------------- Alert / Anomalie ---------------- -->
  <div class="space-y-4">
    <h3 class="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 italic">
      <AlertTriangle class="h-4 w-4 text-foreground" /> {{ t('dashboard.risk_alerts') }}
    </h3>

    <div v-if="dashboardData?.riskAlerts && dashboardData.riskAlerts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <template v-for="alert in dashboardData.riskAlerts" :key="alert.athleteName">
        <Card class="p-5 border-2 border-foreground/10 transition-all bg-card hover:border-foreground flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <span class="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-foreground/20 italic">
              {{ alert.riskTrend }}
            </span>
            <p class="text-2xl font-black uppercase italic tracking-tighter text-foreground">{{ alert.athleteName }}</p>
            <p class="text-[10px] font-bold uppercase opacity-40 tracking-widest italic">{{ alert.discipline }}</p>
          </div>

          <div class="text-right">
            <p class="text-4xl font-black italic tracking-tighter leading-none text-foreground flex items-start justify-end gap-1">
              {{ alert.acwrValue.toFixed(2) }}
              <AlertTriangle v-if="alert.acwrValue > 1.3" class="h-4 w-4 text-red-500 opacity-50" />
            </p>
            <p class="text-[9px] uppercase font-black opacity-30 mt-1 italic tracking-widest leading-none">ACWR UNIT</p>
          </div>
        </Card>
      </template>
    </div>

    <div v-else class="bg-muted/5 border-2 border-dashed border-foreground/10 rounded-xl p-12 text-center">
      <CheckCircle class="h-8 w-8 text-foreground/20 mx-auto mb-3" />
      <p class="text-[10px] font-black text-muted-foreground uppercase italic tracking-widest">
        SISTEMA SICURO: Nessun Atleta a Rischio
      </p>
    </div>
  </div>

</div>
</template>

<style scoped>
</style>
