/**
 * 🚨 ERROR & NOTIFICATION STORE
 *
 * Gestione centralizzata di:
 * - Notifiche di errore
 * - Messaggi di successo
 * - Warning
 * - Notifiche globali
 *
 * Save as: app/stores/notificationStore.ts
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { t } from '~/lib/i18n-client'

export type NotificationType = 'error' | 'success' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number // ms, null = persistent
  action?: {
    label: string
    handler: () => void
  }
}

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  let notificationId = 0

  const addNotification = (
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      duration?: number
      action?: { label: string, handler: () => void }
    },
  ): string => {
    const id = `notification-${notificationId++}`
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration: options?.duration ?? (type === 'error' ? 8000 : 5000),
      action: options?.action,
    }

    notifications.value.push(notification)

    // Auto-remove after duration
    if (notification.duration) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration)
    }

    return id
  }

  function removeNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    notifications.value = []
  }

  // Convenience methods
  const success = (title: string, message: string, duration?: number) =>
    addNotification('success', title, message, { duration })

  const error = (title: string, message: string, duration?: number) =>
    addNotification('error', title, message, { duration: duration ?? 8000 })

  const warning = (title: string, message: string, duration?: number) =>
    addNotification('warning', title, message, { duration: duration ?? 6000 })

  const info = (title: string, message: string, duration?: number) =>
    addNotification('info', title, message, { duration: duration ?? 5000 })

  // Persistence
  const save = () => {
    const persistent = notifications.value.filter(n => !n.duration)
    localStorage.setItem('notifications', JSON.stringify(persistent))
  }

  const restore = () => {
    try {
      const saved = localStorage.getItem('notifications')
      if (saved) {
        notifications.value = JSON.parse(saved)
      }
    }
    catch (err) {
      // Add a notification about restore failure (localized)
      const title = t('errors.restoreNotificationsTitle', 'Restore Failed')
      const msg = t('errors.restoreNotificationsMessage', 'Unable to restore saved notifications.')
      addNotification('error', title, `${msg} ${String(err)}`)
    }
  }

  return {
    notifications: computed(() => notifications.value),
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
    save,
    restore,
  }
})
