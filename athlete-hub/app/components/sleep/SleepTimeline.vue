<script setup lang="ts">
import type { SleepResponseDto, SleepSegmentDto } from '@/types/api'
import { SleepStatus } from '@/types/api'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const props = defineProps<{
  entry: SleepResponseDto | null
  loading: boolean
}>()

const { t } = useI18n()

const STAGE_CONFIG: Record<SleepStatus, { label: string, color: string, bg: string }> = {
  [SleepStatus.Awake]: { label: 'sleep.stages.awake', color: 'bg-red-400', bg: 'bg-red-50 text-red-700' },
  [SleepStatus.Core]: { label: 'sleep.stages.core', color: 'bg-slate-400', bg: 'bg-slate-100 text-slate-700' },
  [SleepStatus.REM]: { label: 'sleep.stages.rem', color: 'bg-violet-400', bg: 'bg-violet-50 text-violet-700' },
  [SleepStatus.Deep]: { label: 'sleep.stages.deep', color: 'bg-indigo-600', bg: 'bg-indigo-50 text-indigo-700' },
}

const segments = computed(() => props.entry?.segments ?? [])

const timelineRange = computed(() => {
  if (!segments.value.length) return null
  const starts = segments.value.map(s => new Date(s.startTime).getTime())
  const ends = segments.value.map(s => new Date(s.endTime).getTime())
  return { min: Math.min(...starts), max: Math.max(...ends) }
})

function toPercent(time: string): number {
  if (!timelineRange.value) return 0
  const { min, max } = timelineRange.value
  const t = new Date(time).getTime()
  return ((t - min) / (max - min)) * 100
}

function toWidth(start: string, end: string): number {
  if (!timelineRange.value) return 0
  const { min, max } = timelineRange.value
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  return ((e - s) / (max - min)) * 100
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function durationMin(seg: SleepSegmentDto): number {
  return Math.round((new Date(seg.endTime).getTime() - new Date(seg.startTime).getTime()) / 60000)
}

const stageSummary = computed(() => {
  const totals: Record<SleepStatus, number> = {
    [SleepStatus.Awake]: 0,
    [SleepStatus.Core]: 0,
    [SleepStatus.REM]: 0,
    [SleepStatus.Deep]: 0,
  }
  for (const seg of segments.value) {
    totals[seg.stage] += durationMin(seg)
  }
  return totals
})

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

const timeLabels = computed(() => {
  if (!timelineRange.value) return []
  const { min, max } = timelineRange.value
  const total = max - min
  const step = total / 4
  return [0, 1, 2, 3, 4].map(i => ({
    label: formatTime(new Date(min + step * i).toISOString()),
    left: (i / 4) * 100,
  }))
})
</script>

<template>
  <Card>
    <CardHeader class="pb-2">
      <CardTitle class="text-sm font-black uppercase tracking-widest text-muted-foreground">
        {{ t('sleep.timeline.title') }}
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-5">
      <div v-if="loading">
        <Skeleton class="h-12 w-full rounded-lg" />
      </div>

      <div v-else-if="!entry" class="py-8 text-center text-sm text-muted-foreground font-medium">
        {{ t('sleep.timeline.selectDay') }}
      </div>

      <div v-else-if="!segments.length" class="py-8 text-center text-sm text-muted-foreground font-medium">
        {{ t('sleep.timeline.noSegments') }}
      </div>

      <template v-else>
        <!-- Stage legend -->
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(cfg, stage) in STAGE_CONFIG"
            :key="stage"
            class="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"
          >
            <span class="h-2.5 w-2.5 rounded-sm" :class="cfg.color" />
            {{ t(cfg.label) }}
            <span class="text-muted-foreground font-normal">
              {{ formatDuration(stageSummary[stage as unknown as SleepStatus]) }}
            </span>
          </span>
        </div>

        <!-- Timeline bar -->
        <div class="relative w-full">
          <!-- Segments -->
          <div class="relative h-10 w-full rounded-lg overflow-hidden bg-slate-100">
            <div
              v-for="(seg, idx) in segments"
              :key="idx"
              class="absolute h-full transition-opacity hover:opacity-90 cursor-default"
              :class="STAGE_CONFIG[seg.stage]?.color ?? 'bg-gray-300'"
              :style="{
                left: `${toPercent(seg.startTime)}%`,
                width: `${toWidth(seg.startTime, seg.endTime)}%`,
              }"
              :title="`${t(STAGE_CONFIG[seg.stage]?.label ?? '')} · ${formatTime(seg.startTime)} – ${formatTime(seg.endTime)} (${durationMin(seg)}m)`"
            />
          </div>

          <!-- Time labels -->
          <div class="relative mt-1 h-4 w-full">
            <span
              v-for="(label, i) in timeLabels"
              :key="i"
              class="absolute text-[10px] text-muted-foreground transform -translate-x-1/2"
              :style="{ left: `${label.left}%` }"
            >
              {{ label.label }}
            </span>
          </div>
        </div>

        <!-- Stage summary badges -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div
            v-for="(cfg, stage) in STAGE_CONFIG"
            :key="stage"
            class="rounded-lg px-3 py-2 text-center"
            :class="cfg.bg"
          >
            <p class="text-[10px] font-bold uppercase tracking-widest opacity-70">{{ t(cfg.label) }}</p>
            <p class="text-lg font-black mt-0.5">
              {{ formatDuration(stageSummary[stage as unknown as SleepStatus]) }}
            </p>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="entry.notes" class="rounded-lg bg-muted/50 border px-4 py-3 text-sm text-muted-foreground italic">
          <span class="font-semibold not-italic text-foreground">{{ t('sleep.notes') }}:</span> {{ entry.notes }}
        </div>
      </template>
    </CardContent>
  </Card>
</template>
