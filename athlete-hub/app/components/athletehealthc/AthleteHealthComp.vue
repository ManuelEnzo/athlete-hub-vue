<script setup lang="ts">
import type { BadgeVariants } from '../ui/badge'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Stat from '../ui/stat/Stat.vue'
// ⚠️ Assicurati di avere Badge, Button, Card, CardHeader, CardTitle, CardContent, Stat
// importati dal tuo design system (es. shadcn-vue o componenti custom)

interface AthleteHealth {
  id: number
  name: string
  position: string
  readinessScore: number
  avgWellness: number
  acuteLoad: number
  chronicLoad: number
  acwr: number
}

const mockTeamHealth: AthleteHealth[] = [
  { id: 1, name: 'Marco Rossi', position: 'Centrocampista', readinessScore: 8.5, avgWellness: 2.1, acuteLoad: 3500, chronicLoad: 3000, acwr: 1.17 },
  { id: 2, name: 'Laura Bianchi', position: 'Attaccante', readinessScore: 9.2, avgWellness: 1.5, acuteLoad: 3200, chronicLoad: 3250, acwr: 0.98 },
  { id: 3, name: 'Andrea Verdi', position: 'Difensore', readinessScore: 6.0, avgWellness: 3.5, acuteLoad: 4200, chronicLoad: 3300, acwr: 1.27 },
  { id: 4, name: 'Sofia Neri', position: 'Centrocampista', readinessScore: 7.8, avgWellness: 2.5, acuteLoad: 3000, chronicLoad: 2500, acwr: 1.20 },
  { id: 5, name: 'Luca Gialli', position: 'Portiere', readinessScore: 5.1, avgWellness: 4.0, acuteLoad: 4800, chronicLoad: 2800, acwr: 1.71 },
]

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

const sortedTeamHealth = computed(() => {
  return [...mockTeamHealth].sort((a, b) => {
    const valA = sortBy.value === 'acwr' ? a.acwr : a.readinessScore
    const valB = sortBy.value === 'acwr' ? b.acwr : b.readinessScore
    return sortDirection.value === 'asc' ? valA - valB : valB - valA
  })
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
        </CardContent>
      </Card>

      <!-- Sidebar Cards -->
      <div class="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{{ t('team.averages') }}</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <Stat :label="t('stats.avgAcwr')" value="1.15" color="primary" />
            <Stat :label="t('stats.readiness')" value="7.8 / 10" color="success" />
            <Stat label="Fatica Hooper" value="2.4 / 5" color="warning" />
            <Stat label="Sonno Medio" value="7h" color="secondary" />
            <Stat label="Stress Medio" value="2.1 / 5" color="default" />
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
                <div class="h-2 w-32 bg-muted rounded-full overflow-hidden">
                  <div class="h-2 bg-green-500" style="width: 40%" />
                </div>
                <span class="text-sm font-bold text-green-600">40%</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">{{ t('risk.moderate') }}</span>
              <div class="flex items-center gap-2">
                <div class="h-2 w-32 bg-muted rounded-full overflow-hidden">
                  <div class="h-2 bg-yellow-500" style="width: 35%" />
                </div>
                <span class="text-sm font-bold text-yellow-600">35%</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">{{ t('risk.high') }}</span>
              <div class="flex items-center gap-2">
                <div class="h-2 w-32 bg-muted rounded-full overflow-hidden">
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
