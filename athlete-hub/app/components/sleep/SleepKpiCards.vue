<script setup lang="ts">
import type { SleepResponseDto } from '@/types/api'
import { SleepDataSource } from '@/types/api'
import { Activity, BedDouble, Brain, Moon } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const props = defineProps<{
  entry: SleepResponseDto | null
}>()

const { t } = useI18n()

const isDevice = computed(() => props.entry?.source === SleepDataSource.Device)

function qualityColor(q?: number): string {
  if (q === undefined || q === null) return 'secondary'
  if (q >= 80) return 'default'
  if (q >= 60) return 'outline'
  return 'destructive'
}

function qualityLabel(q?: number): string {
  if (q === undefined || q === null) return t('sleep.quality.noData')
  if (q >= 80) return t('sleep.quality.excellent')
  if (q >= 60) return t('sleep.quality.good')
  if (q >= 40) return t('sleep.quality.fair')
  return t('sleep.quality.poor')
}

const kpis = computed(() => {
  const e = props.entry
  if (!e) return []

  if (isDevice.value) {
    return [
      {
        icon: BedDouble,
        label: t('sleep.kpi.hoursSlept'),
        value: e.hoursSlept != null ? `${e.hoursSlept.toFixed(1)}h` : '—',
        sub: t('sleep.kpi.totalSleep'),
        highlight: e.hoursSlept != null && e.hoursSlept < 6,
      },
      {
        icon: Moon,
        label: t('sleep.kpi.deepSleep'),
        value: e.deepSleepHours != null ? `${e.deepSleepHours.toFixed(1)}h` : '—',
        sub: t('sleep.kpi.deepSleepSub'),
        highlight: e.deepSleepHours != null && e.deepSleepHours < 1,
      },
      {
        icon: Brain,
        label: t('sleep.kpi.remSleep'),
        value: e.remSleepHours != null ? `${e.remSleepHours.toFixed(1)}h` : '—',
        sub: t('sleep.kpi.remSleepSub'),
        highlight: e.remSleepHours != null && e.remSleepHours < 0.5,
      },
      {
        icon: Activity,
        label: t('sleep.kpi.awakeTime'),
        value: e.awakeTime != null ? `${e.awakeTime.toFixed(1)}h` : '—',
        sub: t('sleep.kpi.awakeTimeSub'),
        highlight: e.awakeTime != null && e.awakeTime > 1,
      },
    ]
  }

  // Questionnaire / Mixed: hours + quality only
  return [
    {
      icon: BedDouble,
      label: t('sleep.kpi.hoursSlept'),
      value: e.hoursSlept != null ? `${e.hoursSlept.toFixed(1)}h` : '—',
      sub: t('sleep.kpi.totalSleep'),
      highlight: e.hoursSlept != null && e.hoursSlept < 6,
    },
    {
      icon: Brain,
      label: t('sleep.kpi.quality'),
      value: e.sleepQuality != null ? `${e.sleepQuality}%` : '—',
      badge: qualityLabel(e.sleepQuality),
      badgeVariant: qualityColor(e.sleepQuality),
      highlight: e.sleepQuality != null && e.sleepQuality < 50,
    },
  ]
})
</script>

<template>
  <div :class="['grid gap-4', kpis.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4']">
    <Card
      v-for="(kpi, i) in kpis"
      :key="i"
      :class="['transition-all border', kpi.highlight ? 'border-destructive/50 bg-destructive/5' : '']"
    >
      <CardContent class="pt-5 pb-4 px-5">
        <div class="flex items-start justify-between">
          <div class="flex flex-col gap-1">
            <span class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{{ kpi.label }}</span>
            <span class="text-3xl font-black tracking-tight" :class="kpi.highlight ? 'text-destructive' : ''">
              {{ kpi.value }}
            </span>
            <Badge v-if="kpi.badge" :variant="(kpi.badgeVariant as any)" class="w-fit text-[10px] mt-1">
              {{ kpi.badge }}
            </Badge>
            <span v-else-if="kpi.sub" class="text-[11px] text-muted-foreground">{{ kpi.sub }}</span>
          </div>
          <div
            class="p-2 rounded-xl"
            :class="kpi.highlight ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'"
          >
            <component :is="kpi.icon" class="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
