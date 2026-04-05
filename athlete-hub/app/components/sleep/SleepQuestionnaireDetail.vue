<script setup lang="ts">
import type { SleepResponseDto } from '@/types/api'
import { MessageSquare, Star } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const props = defineProps<{
  entry: SleepResponseDto | null
}>()

const { t } = useI18n()

function qualityBarColor(q?: number): string {
  if (q === undefined || q === null) return 'bg-slate-200'
  if (q >= 80) return 'bg-emerald-500'
  if (q >= 60) return 'bg-blue-400'
  if (q >= 40) return 'bg-amber-400'
  return 'bg-red-400'
}

function qualityTextColor(q?: number): string {
  if (q === undefined || q === null) return 'text-muted-foreground'
  if (q >= 80) return 'text-emerald-600'
  if (q >= 60) return 'text-blue-600'
  if (q >= 40) return 'text-amber-600'
  return 'text-red-600'
}

function qualityVariant(q?: number): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (q === undefined || q === null) return 'secondary'
  if (q >= 80) return 'default'
  if (q >= 50) return 'outline'
  return 'destructive'
}

function qualityLabel(q?: number): string {
  if (q === undefined || q === null) return t('sleep.quality.noData')
  if (q >= 80) return t('sleep.quality.excellent')
  if (q >= 60) return t('sleep.quality.good')
  if (q >= 40) return t('sleep.quality.fair')
  return t('sleep.quality.poor')
}

const qualityPercent = computed(() => props.entry?.sleepQuality ?? 0)
</script>

<template>
  <Card class="h-full">
    <CardHeader class="pb-2">
      <CardTitle class="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
        <Star class="h-4 w-4" />
        {{ t('sleep.questionnaire.title') }}
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-6">
      <div v-if="!entry" class="py-8 text-center text-sm text-muted-foreground font-medium">
        {{ t('sleep.timeline.selectDay') }}
      </div>

      <template v-else>
        <!-- Quality score display -->
        <div class="flex flex-col items-center gap-3 py-6">
          <p class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {{ t('sleep.questionnaire.qualityTitle') }}
          </p>
          <div class="relative flex items-baseline gap-1">
            <span class="text-7xl font-black leading-none" :class="qualityTextColor(entry.sleepQuality)">
              {{ entry.sleepQuality != null ? entry.sleepQuality : '—' }}
            </span>
            <span v-if="entry.sleepQuality != null" class="text-2xl font-bold" :class="qualityTextColor(entry.sleepQuality)">
              %
            </span>
          </div>
          <Badge :variant="qualityVariant(entry.sleepQuality)" class="text-xs px-3 py-1">
            {{ qualityLabel(entry.sleepQuality) }}
          </Badge>
        </div>

        <!-- Quality progress bar -->
        <div class="space-y-1.5">
          <div class="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-700"
              :class="qualityBarColor(entry.sleepQuality)"
              :style="{ width: `${qualityPercent}%` }"
            />
          </div>
          <div class="flex justify-between text-[10px] font-bold text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <!-- Hours slept row -->
        <div class="flex items-center justify-between rounded-lg bg-muted/40 border px-4 py-3">
          <span class="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
            {{ t('sleep.kpi.hoursSlept') }}
          </span>
          <span class="text-xl font-black">
            {{ entry.hoursSlept != null ? `${entry.hoursSlept.toFixed(1)}h` : '—' }}
          </span>
        </div>

        <!-- Notes section -->
        <div class="space-y-2">
          <p class="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <MessageSquare class="h-3.5 w-3.5" />
            {{ t('sleep.notes') }}
          </p>
          <div
            v-if="entry.notes"
            class="rounded-lg bg-muted/50 border px-4 py-3 text-sm text-foreground leading-relaxed"
          >
            {{ entry.notes }}
          </div>
          <div
            v-else
            class="rounded-lg bg-muted/30 border border-dashed px-4 py-3 text-sm text-muted-foreground italic"
          >
            {{ t('sleep.questionnaire.noNotes') }}
          </div>
        </div>
      </template>
    </CardContent>
  </Card>
</template>
