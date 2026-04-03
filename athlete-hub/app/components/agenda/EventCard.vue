<script setup lang="ts">
import type { CalendarEventResponse } from '@/types/api'
import { ClipboardList, Clock, Pencil, Target, Trash2, User } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { EVENT_CONFIG } from '../../constants/eventConfig'

const props = defineProps<{ event: CalendarEventResponse }>()
const emits = defineEmits<{
  (e: 'openTest', id: number): void
  (e: 'edit', id: number): void
  (e: 'delete', id: number): void
}>()

const { t } = useI18n()

function getEventStyle(type?: string) {
  return EVENT_CONFIG[type || ''] || { color: 'gray', border: 'border-gray-500', bg: 'bg-gray-500/10', dot: 'bg-gray-500' }
}

function onOpenTest() { emits('openTest', props.event.id) }
function onEdit() { emits('edit', props.event.id) }
function onDelete() { emits('delete', props.event.id) }
</script>

<template>
  <div class="relative border-l-4 p-3 md:p-4 rounded-r-lg md:rounded-r-xl shadow-sm border group transition-all hover:translate-x-1" :class="[getEventStyle(event.type).border, getEventStyle(event.type).bg]">
    <div class="flex justify-between items-start gap-2">
      <div class="flex-1 min-w-0">
        <span class="font-black text-[8px] md:text-[10px] uppercase block mb-1" :class="getEventStyle(event.type).dot.replace('bg-', 'text-')">
          {{ t(`eventTypes.${event.type}`) }}
        </span>
        <span class="font-bold text-xs md:text-sm leading-tight break-words">{{ event.title }}</span>
        <div class="mt-2 text-[9px] md:text-[11px] font-medium text-muted-foreground space-y-1">
          <Clock class="inline-block h-3.5 w-3.5 text-muted-foreground mr-1" aria-hidden="true" />
          <span>{{ event.date ? new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--' }}</span>
          <span class="mx-1">|</span>
          <User class="inline-block h-3.5 w-3.5 text-muted-foreground mr-1" aria-hidden="true" />
          <span class="truncate">{{ event.athleteFullName }}</span>
          <span v-if="event.targetRPE" class="ml-1 text-primary">| <Target class="inline-block h-3 w-3 text-primary align-middle" aria-hidden="true" /> RPE {{ event.targetRPE }}</span>
        </div>
      </div>

      <div class="flex gap-0.5 shrink-0">
        <Button v-if="event.type === 'Test'" :aria-label="t('calendar.openTestGrid')" variant="outline" size="icon" class="h-7 w-7 md:h-8 md:w-8 rounded-full border-purple-500 text-purple-600 shadow-sm" @click="onOpenTest">
          <ClipboardList class="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
        </Button>

        <Button :aria-label="t('calendar.editEvent')" variant="ghost" size="icon" class="h-7 w-7 md:h-8 md:w-8 rounded-full" @click="onEdit">
          <Pencil class="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
        </Button>

        <Button :aria-label="t('calendar.deleteEvent')" variant="ghost" size="icon" class="h-7 w-7 md:h-8 md:w-8 rounded-full text-destructive" @click="onDelete">
          <Trash2 class="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
