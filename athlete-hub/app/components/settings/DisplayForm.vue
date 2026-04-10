<script setup lang="ts">
import { Activity, AlertTriangle, BarChart2, CalendarDays, LayoutDashboard, LayoutGrid, Shield, Users } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { Separator } from '@/components/ui/separator'
import { useDashboardStore } from '~/stores/dashboardStore'

const { t } = useI18n()
const dashboardStore = useDashboardStore()

const allWidgets = computed(() => [
  { id: 'kpi', label: t('settings.display.widgets.kpi'), icon: BarChart2, desc: t('settings.display.widgets.kpiDesc') },
  { id: 'workload', label: t('settings.display.widgets.workload'), icon: Activity, desc: t('settings.display.widgets.workloadDesc') },
  { id: 'risk', label: t('settings.display.widgets.risk'), icon: AlertTriangle, desc: t('settings.display.widgets.riskDesc') },
  { id: 'athleteTable', label: t('settings.display.widgets.athleteTable'), icon: Users, desc: t('settings.display.widgets.athleteTableDesc') },
  { id: 'health', label: t('settings.display.widgets.health'), icon: Shield, desc: t('settings.display.widgets.healthDesc') },
  { id: 'agenda', label: t('settings.display.widgets.agenda'), icon: CalendarDays, desc: t('settings.display.widgets.agendaDesc') },
])

function toggleWidget(id: string) {
  const current = dashboardStore.visibleWidgets || []
  const next = current.includes(id)
    ? current.filter((w: string) => w !== id)
    : [...current, id]
  dashboardStore.applySettings({ refreshInterval: dashboardStore.refreshIntervalKey || '5m', defaultTimeRange: dashboardStore.selectedTimeRange || '7d', visibleWidgets: next })
}
</script>

<template>
  <div class="w-full flex flex-col gap-8">
    <!-- Header -->
    <div>
      <h2 class="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
        <LayoutDashboard class="h-7 w-7 text-primary" />
        {{ t('settings.display.title') }}
      </h2>
      <p class="text-muted-foreground text-sm mt-1">{{ t('settings.display.subtitle') }}</p>
    </div>

    <!-- Dashboard widgets -->
    <div class="space-y-3">
      <div>
        <h3 class="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{{ t('settings.display.widgetsTitle') }}</h3>
        <p class="text-xs text-muted-foreground mt-0.5">{{ t('settings.display.widgetsDesc') }}</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          v-for="widget in allWidgets"
          :key="widget.id"
          type="button"
          class="flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all"
          :class="(dashboardStore.visibleWidgets || []).includes(widget.id)
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/30 bg-card opacity-60'"
          @click="toggleWidget(widget.id)"
        >
          <div
            class="mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
            :class="(dashboardStore.visibleWidgets || []).includes(widget.id) ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'"
          >
            <component :is="widget.icon" class="h-4 w-4" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold leading-tight">{{ widget.label }}</p>
            <p class="text-[11px] text-muted-foreground mt-0.5">{{ widget.desc }}</p>
          </div>
          <div
            class="mt-1 h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center"
            :class="(dashboardStore.visibleWidgets || []).includes(widget.id) ? 'border-primary bg-primary' : 'border-muted-foreground'"
          >
            <div v-if="(dashboardStore.visibleWidgets || []).includes(widget.id)" class="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
        </button>
      </div>
    </div>

    <Separator class="opacity-40" />

    <!-- Refresh interval -->
    <div class="space-y-3">
      <div>
        <h3 class="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{{ t('settings.display.refreshTitle') }}</h3>
        <p class="text-xs text-muted-foreground mt-0.5">{{ t('settings.display.refreshDesc') }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="opt in [{ key: '1m', label: '1 min' }, { key: '5m', label: '5 min' }, { key: '15m', label: '15 min' }, { key: '30m', label: '30 min' }]"
          :key="opt.key"
          type="button"
          class="px-4 py-2 rounded-full border text-sm font-semibold transition-all"
          :class="(dashboardStore.refreshIntervalKey || '5m') === opt.key
            ? 'border-primary bg-primary/5 text-foreground'
            : 'border-border hover:border-primary/40 text-muted-foreground'"
          @click="dashboardStore.applySettings({ refreshInterval: opt.key, defaultTimeRange: dashboardStore.selectedTimeRange || '7d' })"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>
  </div>
</template>

