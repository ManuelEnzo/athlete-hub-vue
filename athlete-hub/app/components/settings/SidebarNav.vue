<script setup lang="ts">
import { Bell, Gauge, LayoutDashboard, Palette, User } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { cn } from '@/lib/utils'

const { t } = useI18n()
const route = useRoute()

const sidebarNavItems = computed(() => [
  { title: t('settings.nav.profile'), href: '/settings/profile', icon: User },
  { title: t('settings.nav.appearance'), href: '/settings/appearance', icon: Palette },
  { title: t('settings.nav.notifications'), href: '/settings/notifications', icon: Bell },
  { title: t('settings.nav.display'), href: '/settings/display', icon: LayoutDashboard },
])
</script>

<template>
  <nav class="flex lg:flex-col space-x-1 lg:space-x-0 lg:space-y-1">
    <NuxtLink
      v-for="item in sidebarNavItems"
      :key="item.href"
      :to="item.href"
      :class="cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-muted hover:text-foreground text-muted-foreground',
        route.path === item.href && 'bg-muted text-foreground',
      )"
    >
      <component :is="item.icon" class="h-4 w-4 shrink-0" />
      {{ item.title }}
    </NuxtLink>
  </nav>
</template>
