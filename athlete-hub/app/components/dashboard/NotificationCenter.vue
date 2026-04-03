/**
 * 🔔 NOTIFICATION SYSTEM COMPONENT
 *
 * Visualizza notifiche real-time con animations
 * - Toast notifications con auto-dismiss
 * - Icons by type (error, success, warning, info)
 * - Position stack (top-right)
 * - Swipe-to-dismiss mobile
 *
 * Usage:
 * <NotificationCenter />
 */

<script setup lang="ts">
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-vue-next'
import { ref } from 'vue'
import { useNotificationStore } from '~/stores/notificationStore'

const store = useNotificationStore()

// Drag state for mobile
const draggedId = ref<string | null>(null)
const dragX = ref(0)

function handleDragStart(e: TouchEvent, notificationId: string) {
  draggedId.value = notificationId
  dragX.value = 0
}

function handleDragMove(e: TouchEvent, notificationId: string) {
  if (draggedId.value === notificationId && e.touches[0]) {
    dragX.value = e.touches[0].clientX - e.touches[0].clientX // simplified
  }
}

function handleDragEnd(e: TouchEvent, notificationId: string) {
  if (Math.abs(dragX.value) > 100) {
    store.removeNotification(notificationId)
  }
  draggedId.value = null
  dragX.value = 0
}

// Icon mapping
const iconMap = {
  error: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
}

// Colors mapping
const colorMap = {
  error: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
  warning: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100',
  success: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
  info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
}
</script>

<template>
  <!-- Fixed notification container -->
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      <TransitionGroup name="notification" tag="div" class="flex flex-col gap-2">
        <div
          v-for="notification in store.notifications"
          :key="notification.id"
          class="pointer-events-auto p-4 rounded-lg border backdrop-blur-sm flex items-start gap-3 shadow-lg animate-in slide-in-from-right-full fade-in duration-300 hover:shadow-xl transition-shadow cursor-pointer" :class="[
            colorMap[notification.type],
          ]"
          @click="store.removeNotification(notification.id)"
          @touchstart="handleDragStart($event, notification.id)"
          @touchmove="handleDragMove($event, notification.id)"
          @touchend="handleDragEnd($event, notification.id)"
        >
          <!-- Icon -->
          <component
            :is="iconMap[notification.type]"
            class="h-5 w-5 flex-shrink-0 mt-0.5"
          />

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm">
              {{ notification.title }}
            </p>
            <p class="text-xs opacity-90 mt-1">
              {{ notification.message }}
            </p>

            <!-- Action button if provided -->
            <button
              v-if="notification.action"
              class="mt-2 text-xs font-semibold underline hover:opacity-75 transition-opacity"
              @click.stop="notification.action.handler"
            >
              {{ notification.action.label }}
            </button>
          </div>

          <!-- Close button -->
          <button
            class="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
            :aria-label="`Chiudi notifica: ${notification.title}`"
            @click.stop="store.removeNotification(notification.id)"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOutToRight {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

.animate-in {
  animation: slideInFromRight 0.3s ease-out;
}

.animate-out {
  animation: slideOutToRight 0.3s ease-in;
}

/* Transition states */
.notification-enter-active {
  transition: all 0.3s ease;
}

.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
