<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

const settings = ref({
  showMetrics: true,
  compactMode: false,
  darkMode: false,
  refreshInterval: '5m',
  defaultTimeRange: '7d',
  enableAlerts: true,
  enableSounds: false,
})

const visibleWidgets = ref([
  'readiness',
  'risk',
  'workload',
  'trends',
  'comparison',
  'insights',
  'health',
])

const availableWidgets = [
  { id: 'readiness', name: t('dashboard.widget.readiness') },
  { id: 'risk', name: t('dashboard.widget.riskAssessment') },
  { id: 'workload', name: t('dashboard.widget.workloadAnalysis') },
  { id: 'trends', name: t('dashboard.widget.performanceTrends') },
  { id: 'comparison', name: t('dashboard.widget.teamComparison') },
  { id: 'insights', name: t('dashboard.widget.aiInsights') },
  { id: 'health', name: t('dashboard.widget.healthAssessment') },
]

function resetToDefaults() {
  settings.value = {
    showMetrics: true,
    compactMode: false,
    darkMode: false,
    refreshInterval: '5m',
    defaultTimeRange: '7d',
    enableAlerts: true,
    enableSounds: false,
  }
  visibleWidgets.value = availableWidgets.map(w => w.id)
}

function saveSettings() {
  // Save to localStorage
  localStorage.setItem('dashboardSettings', JSON.stringify({
    ...settings.value,
    visibleWidgets: visibleWidgets.value,
  }))
  emit('close')
}

function exportSettings() {
  const data = {
    ...settings.value,
    visibleWidgets: visibleWidgets.value,
    exportedAt: new Date().toISOString(),
  }
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dashboard-settings-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-card rounded-lg border border-border shadow-lg max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 flexitems-center justify-between p-4 border-b border-border bg-card">
          <h2 class="text-lg font-bold text-foreground">
            {{ t('dashboard.settings.title') }}
          </h2>
          <button
            class="text-muted-foreground hover:text-foreground"
            @click="$emit('close')"
          >
            ✕
          </button>
        </div>

        <!-- Content -->
        <div class="p-4 space-y-4">
          <!-- Display Options -->
          <div>
            <h3 class="text-sm font-semibold text-foreground mb-2">
              {{ t('dashboard.settings.display') }}
            </h3>
            <label class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer mb-2">
              <input
                v-model="settings.showMetrics"
                type="checkbox"
                class="rounded border border-border"
              >
              {{ t('dashboard.settings.showMetricCards') }}
            </label>
            <label class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer mb-2">
              <input
                v-model="settings.compactMode"
                type="checkbox"
                class="rounded border border-border"
              >
              {{ t('dashboard.settings.compactLayout') }}
            </label>
            <label class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
              <input
                v-model="settings.darkMode"
                type="checkbox"
                class="rounded border border-border"
              >
              {{ t('dashboard.settings.darkMode') }}
            </label>
          </div>

          <!-- Refresh Settings -->
          <div>
            <h3 class="text-sm font-semibold text-foreground mb-2">
              {{ t('dashboard.settings.autoRefresh') }}
            </h3>
            <select
              v-model="settings.refreshInterval"
              class="w-full px-2 py-1 rounded border border-border bg-background text-foreground text-sm"
            >
              <option value="disabled">
                {{ t('dashboard.settings.interval.disabled') }}
              </option>
              <option value="1m">
                {{ t('dashboard.settings.interval.1m') }}
              </option>
              <option value="5m">
                {{ t('dashboard.settings.interval.5m') }}
              </option>
              <option value="10m">
                {{ t('dashboard.settings.interval.10m') }}
              </option>
              <option value="30m">
                {{ t('dashboard.settings.interval.30m') }}
              </option>
            </select>
          </div>

          <!-- Widget Visibility -->
          <div>
            <h3 class="text-sm font-semibold text-foreground mb-2">
              {{ t('dashboard.settings.visibleWidgets') }}
            </h3>
            <div class="space-y-2">
              <label
                v-for="widget in availableWidgets"
                :key="widget.id"
                class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <input
                  v-model="visibleWidgets"
                  :value="widget.id"
                  type="checkbox"
                  class="rounded border border-border"
                >
                {{ widget.name }}
              </label>
            </div>
          </div>

          <!-- Data Range -->
          <div>
            <h3 class="text-sm font-semibold text-foreground mb-2">
              {{ t('dashboard.settings.defaultTimeRange') }}
            </h3>
            <select
              v-model="settings.defaultTimeRange"
              class="w-full px-2 py-1 rounded border border-border bg-background text-foreground text-sm"
            >
              <option value="1d">
                {{ t('dashboard.timeRange.1d') }}
              </option>
              <option value="7d">
                {{ t('dashboard.timeRange.7d') }}
              </option>
              <option value="30d">
                {{ t('dashboard.timeRange.30d') }}
              </option>
              <option value="90d">
                {{ t('dashboard.timeRange.90d') }}
              </option>
            </select>
          </div>

          <!-- Notifications -->
          <div>
            <h3 class="text-sm font-semibold text-foreground mb-2">
              {{ t('dashboard.settings.alerts') }}
            </h3>
            <label class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer mb-2">
              <input
                v-model="settings.enableAlerts"
                type="checkbox"
                class="rounded border border-border"
              >
              {{ t('dashboard.settings.enableNotifications') }}
            </label>
            <label class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
              <input
                v-model="settings.enableSounds"
                type="checkbox"
                class="rounded border border-border"
              >
              {{ t('dashboard.settings.enableSounds') }}
            </label>
          </div>

          <!-- Advanced -->
          <div class="border-t border-border pt-4">
            <h3 class="text-sm font-semibold text-foreground mb-2">
              {{ t('dashboard.settings.advanced') }}
            </h3>
            <button
              class="w-full px-3 py-2 text-sm rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              @click="resetToDefaults"
            >
              {{ t('dashboard.settings.resetToDefaults') }}
            </button>
            <button
              class="w-full px-3 py-2 text-sm rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mt-2"
              @click="exportSettings"
            >
              {{ t('dashboard.settings.exportSettings') }}
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 p-4 border-t border-border bg-card flex gap-2">
          <button
            class="flex-1 px-4 py-2 rounded-md border border-border text-foreground hover:bg-muted transition-colors"
            @click="$emit('close')"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            class="flex-1 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            @click="saveSettings"
          >
            {{ t('common.save') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.flex {
  display: flex;
}

.flexitems-center {
  display: flex;
  align-items: center;
}
</style>
