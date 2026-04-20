<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Badge } from '@/components/ui/badge'

const { t } = useI18n()

defineProps<{
  intent: string
  data: Record<string, any>
}>()

// ─── helpers ─────────────────────────────────────────────────────────────────

const readinessColor = (r: number) =>
  r >= 80 ? 'text-green-600' : r >= 50 ? 'text-yellow-600' : 'text-red-600'

const acwrColor = (v: number) =>
  v > 1.5 ? 'text-red-600' : v > 1.3 ? 'text-yellow-600' : v < 0.8 ? 'text-blue-600' : 'text-green-600'

const acwrBadgeVariant = (v: number): 'destructive' | 'outline' | 'secondary' | 'default' =>
  v > 1.5 ? 'destructive' : v > 1.3 ? 'outline' : v < 0.8 ? 'secondary' : 'default'

const trendLabel = (trend: string) =>
  ({ Improving: '↑ ' + t('aiChat.trend.improving'), Declining: '↓ ' + t('aiChat.trend.declining'), Stable: '→ ' + t('aiChat.trend.stable'), NoData: t('aiChat.trend.noData') })[trend] ?? trend

const trendColor = (trend: string) =>
  ({ Improving: 'text-green-600', Declining: 'text-red-600', Stable: 'text-muted-foreground', NoData: 'text-muted-foreground' })[trend] ?? 'text-muted-foreground'

const injuryStatusVariant = (s: string): 'destructive' | 'outline' | 'default' =>
  ({ Active: 'destructive', Rehabilitation: 'outline', Returned: 'default' } as const)[s as 'Active' | 'Rehabilitation' | 'Returned'] ?? 'default'

const bmiColor = (b: number | null) =>
  !b ? 'text-muted-foreground' : b < 18.5 ? 'text-blue-600' : b < 25 ? 'text-green-600' : b < 30 ? 'text-yellow-600' : 'text-red-600'

const formatDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('it-IT') : '—'
</script>

<template>
  <div class="mt-3 rounded-lg border border-border bg-card p-4 space-y-3 text-sm">

    <!-- ── query_state ── -->
    <template v-if="intent === 'query_state'">
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div class="rounded-md border bg-background p-2 text-center">
          <p class="text-xs text-muted-foreground uppercase font-semibold">Readiness</p>
          <p class="text-lg font-bold" :class="readinessColor(data.readiness)">
            {{ data.readiness?.toFixed(0) }}/100
          </p>
        </div>
        <div class="rounded-md border bg-background p-2 text-center">
          <p class="text-xs text-muted-foreground uppercase font-semibold">ACWR</p>
          <p class="text-lg font-bold" :class="acwrColor(data.acwr)">{{ data.acwr?.toFixed(2) }}</p>
        </div>
        <div class="rounded-md border bg-background p-2 text-center">
          <p class="text-xs text-muted-foreground uppercase font-semibold">Sleep</p>
          <p class="text-lg font-bold text-blue-600">{{ ((data.sleepFactor ?? 0) * 100).toFixed(0) }}%</p>
        </div>
        <div class="rounded-md border bg-background p-2 text-center">
          <p class="text-xs text-muted-foreground uppercase font-semibold">{{ t('aiChat.fatigue') }}</p>
          <p class="text-lg font-bold text-muted-foreground">{{ data.fatigueScore?.toFixed(0) }}/100</p>
        </div>
      </div>
      <Badge :variant="data.hasActiveInjury ? 'destructive' : 'default'">
        {{ data.hasActiveInjury ? t('aiChat.activeInjury') : t('aiChat.noInjury') }}
      </Badge>
    </template>

    <!-- ── query_sleep ── -->
    <template v-else-if="intent === 'query_sleep'">
      <div class="grid grid-cols-3 gap-2">
        <div class="rounded-md border bg-background p-2 text-center">
          <p class="text-xs text-muted-foreground uppercase font-semibold">{{ t('aiChat.avgHours') }}</p>
          <p class="text-lg font-bold text-blue-600">{{ data.avgHours?.toFixed(1) }}h</p>
        </div>
        <div class="rounded-md border bg-background p-2 text-center">
          <p class="text-xs text-muted-foreground uppercase font-semibold">{{ t('aiChat.quality') }}</p>
          <p class="text-lg font-bold text-purple-600">{{ data.avgQuality?.toFixed(1) }}/5</p>
        </div>
        <div class="rounded-md border bg-background p-2 text-center">
          <p class="text-xs text-muted-foreground uppercase font-semibold">Trend</p>
          <p class="text-lg font-bold" :class="trendColor(data.trend)">{{ trendLabel(data.trend) }}</p>
        </div>
      </div>
      <ul v-if="data.anomalies?.length" class="list-disc pl-5 text-muted-foreground space-y-0.5">
        <li v-for="a in data.anomalies" :key="a">{{ a }}</li>
      </ul>
    </template>

    <!-- ── query_workload ── -->
    <template v-else-if="intent === 'query_workload'">
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div class="rounded-md border bg-background p-2 text-center">
          <p class="text-xs text-muted-foreground uppercase font-semibold">{{ t('aiChat.acuteLoad') }}</p>
          <p class="text-lg font-bold text-blue-600">{{ data.acuteLoad?.toFixed(0) }}</p>
        </div>
        <div class="rounded-md border bg-background p-2 text-center">
          <p class="text-xs text-muted-foreground uppercase font-semibold">{{ t('aiChat.chronicLoad') }}</p>
          <p class="text-lg font-bold text-muted-foreground">{{ data.chronicLoad?.toFixed(0) }}</p>
        </div>
        <div class="rounded-md border bg-background p-2 text-center">
          <p class="text-xs text-muted-foreground uppercase font-semibold">ACWR</p>
          <p class="text-lg font-bold" :class="acwrColor(data.acwr)">{{ data.acwr?.toFixed(2) }}</p>
        </div>
        <div class="rounded-md border bg-background p-2 text-center">
          <p class="text-xs text-muted-foreground uppercase font-semibold">Zona</p>
          <Badge :variant="acwrBadgeVariant(data.acwr)" class="mt-1">{{ data.acwrZone }}</Badge>
        </div>
      </div>
    </template>

    <!-- ── query_performance ── -->
    <template v-else-if="intent === 'query_performance'">
      <p class="text-muted-foreground">
        {{ t('aiChat.lastTest') }}: <strong>{{ data.lastTestDate }}</strong>
      </p>
      <div class="overflow-x-auto">
        <table class="w-full text-xs border-collapse">
          <thead>
            <tr class="border-b text-muted-foreground">
              <th class="py-1 text-left font-semibold">{{ t('aiChat.metric') }}</th>
              <th class="py-1 text-right font-semibold">{{ t('aiChat.value') }}</th>
              <th class="py-1 text-right font-semibold">{{ t('aiChat.unit') }}</th>
              <th class="py-1 text-right font-semibold">{{ t('aiChat.result') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in data.metrics" :key="m.metric" class="border-b border-border/50">
              <td class="py-1">{{ m.metric }}</td>
              <td class="py-1 text-right">{{ m.value }}</td>
              <td class="py-1 text-right text-muted-foreground">{{ m.unit }}</td>
              <td class="py-1 text-right">
                <Badge
                  v-if="m.comparison"
                  :variant="m.comparison === 'Better' ? 'default' : 'destructive'"
                  class="text-xs"
                >
                  {{ m.comparison }}
                </Badge>
                <span v-else class="text-muted-foreground">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ── query_injuries ── -->
    <template v-else-if="intent === 'query_injuries'">
      <p v-if="!data.injuries?.length" class="text-muted-foreground">
        {{ t('aiChat.noInjuryRegistered') }}
      </p>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-xs border-collapse">
          <thead>
            <tr class="border-b text-muted-foreground">
              <th class="py-1 text-left font-semibold">{{ t('aiChat.injury') }}</th>
              <th class="py-1 text-left font-semibold">{{ t('aiChat.status') }}</th>
              <th class="py-1 text-right font-semibold">{{ t('aiChat.daysOut') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inj in data.injuries" :key="inj.injury" class="border-b border-border/50">
              <td class="py-1">{{ inj.injury }}</td>
              <td class="py-1">
                <Badge :variant="injuryStatusVariant(inj.status)" class="text-xs">{{ inj.status }}</Badge>
              </td>
              <td class="py-1 text-right">{{ inj.daysOut }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ── query_calendar ── -->
    <template v-else-if="intent === 'query_calendar'">
      <p class="font-semibold">
        {{ data.totalEvents }} {{ t('aiChat.eventsFound') }}
      </p>
      <ul class="space-y-1">
        <li v-for="ev in data.events" :key="ev.date + ev.title" class="flex items-center gap-2">
          <Badge variant="secondary" class="text-xs shrink-0">{{ ev.type }}</Badge>
          <span class="text-muted-foreground text-xs">{{ formatDate(ev.date) }}</span>
          <span class="truncate">{{ ev.title }}</span>
        </li>
      </ul>
    </template>

    <!-- ── query_measurements ── -->
    <template v-else-if="intent === 'query_measurements'">
      <div class="grid grid-cols-3 gap-2">
        <div class="rounded-md border bg-background p-2 text-center">
          <p class="text-xs text-muted-foreground uppercase font-semibold">{{ t('aiChat.weight') }}</p>
          <p class="text-lg font-bold text-blue-600">{{ data.weight != null ? `${data.weight} kg` : 'N/A' }}</p>
        </div>
        <div class="rounded-md border bg-background p-2 text-center">
          <p class="text-xs text-muted-foreground uppercase font-semibold">{{ t('aiChat.height') }}</p>
          <p class="text-lg font-bold text-blue-600">{{ data.height != null ? `${data.height} cm` : 'N/A' }}</p>
        </div>
        <div class="rounded-md border bg-background p-2 text-center">
          <p class="text-xs text-muted-foreground uppercase font-semibold">BMI</p>
          <p class="text-lg font-bold" :class="bmiColor(data.bmi)">{{ data.bmi != null ? data.bmi.toFixed(1) : 'N/A' }}</p>
        </div>
      </div>
    </template>

    <!-- ── create_athlete ── -->
    <template v-else-if="intent === 'create_athlete'">
      <p class="text-green-600 font-semibold">
        ✅ {{ t('aiChat.athleteCreated') }}: <span class="font-bold">{{ data.fullName }}</span>
        <Badge variant="secondary" class="ml-2">ID {{ data.id }}</Badge>
      </p>
    </template>

    <!-- ── schedule_event ── -->
    <template v-else-if="intent === 'schedule_event'">
      <p class="text-green-600 font-semibold">
        ✅ {{ t('aiChat.eventScheduled') }}:
        <span class="font-bold">{{ data.title }}</span>
        — {{ formatDate(data.date) }}
      </p>
    </template>

  </div>
</template>
