<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{
  close: []
  apply: [settings: { refreshInterval: string, defaultTimeRange: string, visibleWidgets: string[] }]
}>()

const { t } = useI18n()
const colorMode = useColorMode()

// Single unified settings key — same key used by the store's PERSIST_KEY for timeRange/interval
const SETTINGS_KEY = 'dashboardSettings'

function loadStoredSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Record<string, unknown>
  }
  catch { return null }
}

const stored = loadStoredSettings()
// Also read refreshIntervalKey/timeRange from the store's key if not in our own key
const storePrefs = (() => {
  try {
    return (JSON.parse(localStorage.getItem('dashboard:preferences') ?? 'null') ?? {}) as Record<string, unknown>
  }
  catch { return {} as Record<string, unknown> }
})()

const settings = ref({
  showMetrics: (stored?.showMetrics as boolean) ?? true,
  compactMode: (stored?.compactMode as boolean) ?? false,
  darkMode: colorMode.preference === 'dark',
  refreshInterval: (stored?.refreshInterval as string) ?? (storePrefs.refreshIntervalKey as string) ?? '5m',
  defaultTimeRange: (stored?.defaultTimeRange as string) ?? (storePrefs.timeRange as string) ?? '7d',
  enableAlerts: (stored?.enableAlerts as boolean) ?? true,
  enableSounds: (stored?.enableSounds as boolean) ?? false,
})

const visibleWidgets = ref<string[]>(
  (stored?.visibleWidgets as string[]) ?? ['kpi', 'workload', 'risk', 'athleteTable', 'health', 'agenda'],
)

const availableWidgets = [
  { id: 'kpi', name: t('dashboard.widget.kpi') },
  { id: 'workload', name: t('dashboard.widget.workloadAnalysis') },
  { id: 'risk', name: t('dashboard.widget.riskAssessment') },
  { id: 'athleteTable', name: t('dashboard.widget.athleteStatus') },
  { id: 'health', name: t('dashboard.widget.healthAssessment') },
  { id: 'agenda', name: t('dashboard.widget.agenda') },
]

// Apply dark mode immediately when the toggle changes (no save needed)
watch(() => settings.value.darkMode, (dark) => {
  colorMode.preference = dark ? 'dark' : 'light'
})

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
  visibleWidgets.value = ['kpi', 'workload', 'risk', 'athleteTable', 'health', 'agenda']
  colorMode.preference = 'light'
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({
    ...settings.value,
    visibleWidgets: visibleWidgets.value,
  }))
  emit('apply', {
    refreshInterval: settings.value.refreshInterval,
    defaultTimeRange: settings.value.defaultTimeRange,
    visibleWidgets: visibleWidgets.value,
  })
  emit('close')
}

function exportSettings() {
  const blob = new Blob([JSON.stringify({ ...settings.value, visibleWidgets: visibleWidgets.value, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' })
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
