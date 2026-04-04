<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useErrorHandler } from '~/composables/useErrorHandler'

// ⚠️ NON inizializzare store fuori da lifecycle in SSR
onMounted(() => {
  const auth = useAuthStore()
  const handler = useErrorHandler({ component: 'Layout' })

  // Fetch user profile once for the entire authenticated session.
  if (auth.token && !auth.user) {
    auth.fetchProfile().catch(err =>
      handler.handleError(err instanceof Error ? err : new Error(String(err))),
    )
  }
})
</script>

<template>
  <SidebarProvider>
    <LayoutAppSidebar />
    <SidebarInset>
      <LayoutHeader />
      <div class="flex flex-col flex-1">
        <div class="@container/main p-4 lg:p-6 grow">
          <slot />
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<style scoped>
</style>