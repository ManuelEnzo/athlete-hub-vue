<script setup lang="ts">
import type { NavGroup, NavLink, NavSectionTitle } from '~/types/nav'
import { navMenu, navMenuBottom } from '~/constants/menus'
import { useAuthStore } from '~/stores/auth' // 1. Importa lo store

// Inizializza gli store e le impostazioni
const authStore = useAuthStore()
const { sidebar } = useAppSettings()

// 2. Carica il profilo quando il componente viene montato
onMounted(async () => {
  if (authStore.token && !authStore.user) {
    await authStore.fetchProfile()
  }
})

// 3. Mappa i dati dello store per il componente footer
const userData = computed(() => ({
  name: authStore.user?.email.split("@")[0] || 'Ospite',
  email: authStore.user?.email || '',
  avatar: '/avatars/avatartion.png', // In futuro potrai caricarlo dal BE
}))

function resolveNavItemComponent(item: NavLink | NavGroup | NavSectionTitle): any {
  if ('children' in item)
    return resolveComponent('LayoutSidebarNavGroup')

  return resolveComponent('LayoutSidebarNavLink')
}
</script>

<template>
  <Sidebar :collapsible="sidebar?.collapsible" :side="sidebar?.side" :variant="sidebar?.variant">
    <SidebarHeader>
      <div class="flex items-center gap-3 px-3 py-4">
        <div class="i-lucide-dumbbell text-primary w-6 h-6"></div>
        <span class="font-semibold text-lg">Athlete Hub</span>
      </div>
      <Search />
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup v-for="(nav, indexGroup) in navMenu" :key="indexGroup">
        <SidebarGroupLabel v-if="nav.heading">
          {{ nav.heading }}
        </SidebarGroupLabel>
        <component
          :is="resolveNavItemComponent(item)"
          v-for="(item, index) in nav.items"
          :key="index"
          :item="item"
        />
      </SidebarGroup>

      <SidebarGroup class="mt-auto">
        <component
          :is="resolveNavItemComponent(item)"
          v-for="(item, index) in navMenuBottom"
          :key="index"
          :item="item"
          size="sm"
        />
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <LayoutSidebarNavFooter :user="userData" />
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>

<style scoped></style>