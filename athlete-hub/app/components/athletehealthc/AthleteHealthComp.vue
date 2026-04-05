<script setup lang="ts">
import type { BadgeVariants } from '../ui/badge'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Stat from '../ui/stat/Stat.vue'

import { onMounted } from 'vue'
import { useAthletesService, useDashboardService } from '~/services/dataService'

const { t } = useI18n()

// 🔧 Restituisce variant coerente con Badge
function getStatusColor(acwr: number): { variant: BadgeVariants['variant'], label: string } {
  if (acwr > 1.5)
    return { variant: 'destructive', label: t('risk.high') }
  if (acwr >= 1.2)
    return { variant: 'default', label: t('risk.moderate') }
  return { variant: 'secondary', label: t('risk.optimal') }
}

const sortBy = ref<'acwr' | 'readiness'>('acwr')
const sortDirection = ref<'asc' | 'desc'>('desc')

const athletesSvc = useAthletesService()
const dashboardSvc = useDashboardService()

onMounted(() => {
  // fetch both dashboard summary and athletes list
  Promise.all([
    dashboardSvc.fetch(),
    athletesSvc.fetch(),
  ]).catch(() => {
    // errors are tracked/handled inside services
  })
})

const teamHealth = computed(() => {
  const dashboard = dashboardSvc.data?.value
  const athletes = athletesSvc.items?.value ?? []
  if (!dashboard || !dashboard.athletesHealth) return []

  return Object.values(dashboard.athletesHealth).map((h: any) => {
    const athlete = athletes.find(a => a.id === h.athleteId) || null
    return {
      id: h.athleteId,
      name: athlete?.fullName || athlete?.firstName + ' ' + athlete?.lastName || (`#${h.athleteId}`),
      position: athlete?.sportCategory || '',
      acwr: h.acwr ?? 0,
      readinessScore: h.readiness ?? 0,
    }
  })
})

const sortedTeamHealth = computed(() => {
  const items = teamHealth.value ?? []
  return [...items].sort((a, b) => {
    const valA = sortBy.value === 'acwr' ? a.acwr : a.readinessScore
    const valB = sortBy.value === 'acwr' ? b.acwr : b.readinessScore
    return sortDirection.value === 'asc' ? valA - valB : valB - valA
  })
})

const avgAcwr = computed(() => {
  const items = teamHealth.value ?? []
  if (!items.length) return null
  const sum = items.reduce((s: number, it: any) => s + (it.acwr || 0), 0)
  return +(sum / items.length).toFixed(2)
})

const avgReadiness = computed(() => {
  const items = teamHealth.value ?? []
  if (!items.length) return null
  const sum = items.reduce((s: number, it: any) => s + (it.readinessScore || 0), 0)
  return +(sum / items.length).toFixed(1)
})
</script>

<template>
  <div class="w-full flex flex-col gap-6">
    <!-- Grid -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <!-- Tabella -->
      <Card class="col-span-2">
        <CardHeader class="flex flex-row items-center justify-between">
          <CardTitle>{{ t('team.individualStatus') }}</CardTitle>
          <span class="text-sm text-muted-foreground">{{ t('team.sortByAcwr') }}</span>
        </CardHeader>
        <CardContent class="p-0">
          <div class="overflow-x-auto w-full">
          <table class="w-full">
            <thead class="bg-muted text-xs font-medium text-muted-foreground uppercase">
              <tr>
                <th class="py-3 px-4">
                  {{ t('fields.athlete') }}
                </th>
                <th class="py-3 px-4 text-center">
                  {{ t('alerts.acwr') }}
                </th>
                <th class="py-3 px-4 text-center">
                  {{ t('fields.status') }}
                </th>
                <th class="py-3 px-4 text-right">
                  {{ t('fields.readiness') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr
                v-for="athlete in sortedTeamHealth" :key="athlete.id"
                class="transition-colors hover:bg-muted/50"
              >
                <td class="py-4 px-4">
                  <div class="font-semibold">
                    {{ athlete.name }}
                  </div>
                  <div class="text-xs text-muted-foreground">
                    {{ athlete.position }}
                  </div>
                </td>
                <td class="py-4 px-4 text-center font-mono font-medium">
                  {{ athlete.acwr.toFixed(2) }}
                </td>
                <td class="py-4 px-4 text-center">
                  <Badge :variant="getStatusColor(athlete.acwr).variant">
                    {{ getStatusColor(athlete.acwr).label }}
                  </Badge>
                </td>
                <td class="py-4 px-4 text-right font-bold">
                  {{ athlete.readinessScore.toFixed(1) }}
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </CardContent>
      </Card>

      <!-- Sidebar Cards -->
      <div class="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{{ t('team.averages') }}</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <Stat :label="t('stats.avgAcwr')" :value="avgAcwr ?? '-'" color="primary" />
            <Stat :label="t('stats.readiness')" :value="avgReadiness ? `${avgReadiness} / 10` : '-'" color="success" />
            <Stat :label="t('stats.hooper')" value="-" color="warning" />
            <Stat :label="t('stats.sleep')" value="-" color="secondary" />
            <Stat :label="t('stats.stress')" value="-" color="default" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-sm">
              Distribuzione Rischio
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">{{ t('risk.optimal') }}</span>
              <div class="flex items-center gap-2">
                <div class="h-2 flex-1 min-w-[4rem] max-w-[8rem] bg-muted rounded-full overflow-hidden">
                  <div class="h-2 bg-green-500" style="width: 40%" />
                </div>
                <span class="text-sm font-bold text-green-600">40%</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">{{ t('risk.moderate') }}</span>
              <div class="flex items-center gap-2">
                <div class="h-2 flex-1 min-w-[4rem] max-w-[8rem] bg-muted rounded-full overflow-hidden">
                  <div class="h-2 bg-yellow-500" style="width: 35%" />
                </div>
                <span class="text-sm font-bold text-yellow-600">35%</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">{{ t('risk.high') }}</span>
              <div class="flex items-center gap-2">
                <div class="h-2 flex-1 min-w-[4rem] max-w-[8rem] bg-muted rounded-full overflow-hidden">
                  <div class="h-2 bg-red-600" style="width: 25%" />
                </div>
                <span class="text-sm font-bold text-red-600">25%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-sm">
              {{ t('team.alerts') }}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              v-if="sortedTeamHealth.some(a => a.acwr > 1.5)"
              class="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-semibold"
            >
              {{ t('alerts.highRisk') }}
            </div>
            <div v-else class="bg-green-100 text-green-800 px-3 py-2 rounded-md text-sm font-semibold">
              {{ t('alerts.noRisk') }}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-sm">
              {{ t('team.lastUpdate') }}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-xs text-muted-foreground">
              {{ t('team.updatedAt', { time: '21:30', date: '17 Dicembre 2025' }) }}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
