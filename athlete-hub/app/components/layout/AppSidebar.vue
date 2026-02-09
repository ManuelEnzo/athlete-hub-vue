<script setup lang="ts">
import type { NavGroup, NavLink, NavSectionTitle } from '~/types/nav'
import { navMenu, navMenuBottom } from '~/constants/menus'
import { useAuthStore } from '~/stores/auth'

const { sidebar } = useAppSettings()

onMounted(async () => {
  const authStore = useAuthStore()
  if (authStore.token && !authStore.user) {
    try {
      await authStore.fetchProfile()
    } catch (error) {
      console.error("Errore durante il fetch del profilo:", error)
    }
  }
})

/**
 * 2. Mappa i dati dello store per il componente footer.
 * Usiamo un controllo preventivo per evitare crash durante l'SSR.
 */
const userData = computed<{ name: string; email: string; avatar: string }>(() => {
  // Verifichiamo se siamo in un contesto dove Pinia è accessibile
  // In Nuxt, questo risolve spesso il problema del "no active Pinia"
  const nuxtApp = useNuxtApp()
  const authStore = useAuthStore(nuxtApp.$pinia)

  const email = authStore.user?.email || ''
  const name = email.split("@")[0] || 'Ospite'

  return {
    name,
    email,
    avatar: '/avatars/avatartion.png',
  }
})

function resolveNavItemComponent(item: NavLink | NavGroup | NavSectionTitle): any {
  if ('children' in item) return resolveComponent('LayoutSidebarNavGroup')
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