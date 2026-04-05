<script setup lang="ts">
import type { SleepResponseDto } from '@/types/api'
import { SleepDataSource } from '@/types/api'
import { AlertTriangle, BedDouble, Cpu, PenLine, Shuffle } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const props = defineProps<{
  history: SleepResponseDto[]
  selectedDate: string | null
  loading: boolean
}>()

const emit = defineEmits<{ (e: 'select', date: string): void }>()

const { t } = useI18n()

const sorted = computed(() =>
  [...props.history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
)

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
}

function qualityVariant(q?: number): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (q === undefined || q === null) return 'secondary'
  if (q >= 80) return 'default'
  if (q >= 50) return 'outline'
  return 'destructive'
}

function qualityLabel(q?: number): string {
  if (q === undefined || q === null) return '—'
  if (q >= 80) return t('sleep.quality.excellent')
  if (q >= 60) return t('sleep.quality.good')
  if (q >= 40) return t('sleep.quality.fair')
  return t('sleep.quality.poor')
}

function isAnomaly(entry: SleepResponseDto): boolean {
  return (entry.hoursSlept !== undefined && entry.hoursSlept < 5)
    || (entry.sleepQuality !== undefined && entry.sleepQuality < 40)
}

function sourceIcon(source: SleepDataSource) {
  switch (source) {
    case SleepDataSource.Device: return Cpu
    case SleepDataSource.Mixed: return Shuffle
    default: return PenLine
  }
}

function sourceLabel(source: SleepDataSource): string {
  switch (source) {
    case SleepDataSource.Device: return t('sleep.source.device')
    case SleepDataSource.Mixed: return t('sleep.source.mixed')
    default: return t('sleep.source.manual')
  }
}
</script>

<template>
  <Card class="h-full">
    <CardHeader class="pb-2">
      <CardTitle class="text-sm font-black uppercase tracking-widest text-muted-foreground">
        {{ t('sleep.history.title') }}
      </CardTitle>
    </CardHeader>
    <CardContent class="p-0">
      <div v-if="loading" class="p-4 space-y-3">
        <Skeleton v-for="n in 6" :key="n" class="h-14 w-full rounded-lg" />
      </div>

      <div v-else-if="!sorted.length" class="py-16 text-center text-sm text-muted-foreground font-medium">
        {{ t('sleep.noData') }}
      </div>

      <div v-else class="divide-y max-h-[480px] overflow-y-auto">
        <button
          v-for="entry in sorted"
          :key="entry.date"
          class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors focus:outline-none"
          :class="entry.date === selectedDate ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'"
          type="button"
          @click="emit('select', entry.date)"
        >
          <!-- Date column -->
          <div class="min-w-[90px]">
            <p class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {{ formatDate(entry.date) }}
            </p>
          </div>

          <!-- Hours bar -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <BedDouble class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span class="text-sm font-bold">
                {{ entry.hoursSlept != null ? `${entry.hoursSlept.toFixed(1)}h` : '—' }}
              </span>
              <!-- Mini bar -->
              <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full bg-indigo-500 transition-all"
                  :style="{ width: `${Math.min(100, ((entry.hoursSlept ?? 0) / 10) * 100)}%` }"
                />
              </div>
            </div>
          </div>

          <!-- Quality badge: survey sources only -->
          <Badge
            v-if="entry.source !== SleepDataSource.Device"
            :variant="qualityVariant(entry.sleepQuality)"
            class="shrink-0 text-[10px]"
          >
            {{ entry.sleepQuality != null ? `${entry.sleepQuality}%` : '—' }} · {{ qualityLabel(entry.sleepQuality) }}
          </Badge>

          <!-- Anomaly + source icons -->
          <div class="flex items-center gap-1.5 shrink-0">
            <AlertTriangle
              v-if="isAnomaly(entry)"
              class="h-4 w-4 text-destructive"
              :title="t('sleep.history.anomaly')"
            />
            <component
              :is="sourceIcon(entry.source)"
              class="h-3.5 w-3.5 text-muted-foreground"
              :title="sourceLabel(entry.source)"
            />
          </div>
        </button>
      </div>
    </CardContent>
  </Card>
</template>
