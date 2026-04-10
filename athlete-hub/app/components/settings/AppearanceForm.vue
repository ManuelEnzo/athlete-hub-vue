<script setup lang="ts">
import type { ThemeColor } from '@/constants/themes'
import { Check, Moon, Monitor, Palette, Sun } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { THEME_COLORS } from '@/constants/themes'
import { Separator } from '@/components/ui/separator'

const { t, locale } = useI18n()
const colorMode = useColorMode()
const { theme, updateAppSettings } = useAppSettings()

// ─── Theme mode ───────────────────────────────────────────────────────────────
const modes = computed(() => [
  { value: 'light', label: t('settings.appearance.light'), icon: Sun },
  { value: 'dark', label: t('settings.appearance.dark'), icon: Moon },
  { value: 'system', label: t('settings.appearance.system'), icon: Monitor },
])

// ─── Accent color ─────────────────────────────────────────────────────────────
const allColors = THEME_COLORS.map(c => ({ name: c.name as ThemeColor, value: c.value }))

function backgroundColor(color: ThemeColor) {
  return THEME_COLORS.find(c => c.name === color)?.value
}

// ─── Language ────────────────────────────────────────────────────────────────
const languages = [
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

function setLanguage(code: string) {
  locale.value = code
  if (import.meta.client)
    localStorage.setItem('lang', code)
}
</script>

<template>
  <div class="w-full flex flex-col gap-8">
    <!-- Header -->
    <div>
      <h2 class="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
        <Palette class="h-7 w-7 text-primary" />
        {{ t('settings.nav.appearance') }}
      </h2>
      <p class="text-muted-foreground text-sm mt-1">{{ t('settings.appearance.subtitle') }}</p>
    </div>

    <!-- Mode -->
    <div class="space-y-3">
      <div>
        <h3 class="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{{ t('settings.appearance.modeTitle') }}</h3>
        <p class="text-xs text-muted-foreground mt-0.5">{{ t('settings.appearance.modeDesc') }}</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <button
          v-for="m in modes"
          :key="m.value"
          type="button"
          class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all w-28"
          :class="colorMode.preference === m.value
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/40 bg-card'"
          @click="colorMode.preference = m.value"
        >
          <component :is="m.icon" class="h-5 w-5" :class="colorMode.preference === m.value ? 'text-primary' : 'text-muted-foreground'" />
          <span class="text-xs font-semibold" :class="colorMode.preference === m.value ? 'text-foreground' : 'text-muted-foreground'">{{ m.label }}</span>
        </button>
      </div>
    </div>

    <Separator class="opacity-40" />

    <!-- Accent color -->
    <div class="space-y-3">
      <div>
        <h3 class="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{{ t('settings.appearance.colorTitle') }}</h3>
        <p class="text-xs text-muted-foreground mt-0.5">{{ t('settings.appearance.colorDesc') }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="col in allColors"
          :key="col.name"
          type="button"
          class="h-9 w-9 rounded-full border-2 transition-all flex items-center justify-center"
          :class="theme?.color === col.name ? 'border-foreground scale-110 shadow-md' : 'border-transparent hover:scale-105'"
          :style="{ backgroundColor: backgroundColor(col.name) }"
          :title="col.name"
          @click="updateAppSettings({ theme: { color: col.name } })"
        >
          <Check v-if="theme?.color === col.name" class="h-3.5 w-3.5 text-white drop-shadow" />
        </button>
      </div>
    </div>

    <Separator class="opacity-40" />

    <!-- Language -->
    <div class="space-y-3">
      <div>
        <h3 class="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{{ t('settings.appearance.languageTitle') }}</h3>
        <p class="text-xs text-muted-foreground mt-0.5">{{ t('settings.appearance.languageDesc') }}</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <button
          v-for="lang in languages"
          :key="lang.code"
          type="button"
          class="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all"
          :class="locale === lang.code
            ? 'border-primary bg-primary/5 text-foreground'
            : 'border-border hover:border-primary/40 text-muted-foreground bg-card'"
          @click="setLanguage(lang.code)"
        >
          <span class="text-lg leading-none">{{ lang.flag }}</span>
          {{ lang.label }}
          <Check v-if="locale === lang.code" class="h-3.5 w-3.5 text-primary ml-1" />
        </button>
      </div>
    </div>
  </div>
</template>
