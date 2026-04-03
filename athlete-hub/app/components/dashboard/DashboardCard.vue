/**
 * 🎨 DASHBOARD CARD COMPONENTS - REUSABLE
 *
 * Componenti card riusabili per dashboard con:
 * - Skeleton loading
 * - Error states
 * - Refresh button
 * - Customizable content
 *
 * Save as: app/components/dashboard/DashboardCard.vue
 */

<script setup lang="ts">
import { AlertCircle, RefreshCw } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
</script>

<script lang="ts">
import { ref } from 'vue'

interface Props {
  title: string
  subtitle?: string
  loading?: boolean
  error?: string | null
  icon?: any
  onRefresh?: () => Promise<void>
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  subtitle: '',
})

const isRefreshing = ref(false)

async function handleRefresh() {
  if (props.onRefresh && !isRefreshing.value) {
    isRefreshing.value = true
    try {
      await props.onRefresh()
    }
    finally {
      isRefreshing.value = false
    }
  }
}
</script>

<template>
  <Card class="border border-foreground/10 shadow-md" :class="[props.class]">
    <CardHeader class="pb-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <component :is="props.icon" v-if="props.icon" class="h-5 w-5 text-primary" />
          <CardTitle>{{ props.title }}</CardTitle>
        </div>
        <button
          v-if="props.onRefresh"
          :disabled="isRefreshing"
          class="p-1 hover:bg-muted rounded transition-colors"
          :aria-label="`Refresh ${props.title}`"
          @click="handleRefresh"
        >
          <RefreshCw
            class="h-4 w-4 text-muted-foreground transition-transform"
            :class="{ 'animate-spin': isRefreshing }"
          />
        </button>
      </div>
      <p v-if="props.subtitle" class="text-xs text-muted-foreground">
        {{ props.subtitle }}
      </p>
    </CardHeader>

    <CardContent class="space-y-4">
      <!-- Error state -->
      <div v-if="props.error" class="flex items-center gap-2 p-3 bg-destructive/10 rounded border border-destructive/20">
        <AlertCircle class="h-4 w-4 text-destructive flex-shrink-0" />
        <p class="text-xs text-destructive">
          {{ props.error }}
        </p>
      </div>

      <!-- Skeleton loader -->
      <div v-if="props.loading && !props.error" class="space-y-3">
        <div class="h-6 bg-muted rounded animate-pulse" />
        <div class="h-4 bg-muted rounded w-3/4 animate-pulse" />
        <div class="h-4 bg-muted rounded w-1/2 animate-pulse" />
      </div>

      <!-- Content -->
      <slot v-if="!props.loading && !props.error" />
    </CardContent>
  </Card>
</template>
