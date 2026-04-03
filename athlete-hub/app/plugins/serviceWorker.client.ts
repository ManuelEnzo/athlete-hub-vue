/**
 * 🔔 SERVICE WORKER REGISTRATION PLUGIN
 *
 * Registers the service worker and handles updates
 * Save as: app/plugins/serviceWorker.client.ts
 */

import notificationsSvc from '@/lib/notificationService'

export default defineNuxtPlugin(() => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', registerServiceWorker)
  }

  return {
    provide: {
      sw: {
        register: registerServiceWorker,
        unregister: unregisterServiceWorker,
        refresh: refreshServiceWorker,
        getCacheSize,
        clearCache,
      },
    },
  }
})

/**
 * Register service worker with update detection
 */
async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none', // Always check for updates
    })

    console.warn('[SW] Registration successful:', registration.scope)

    // Check for updates every hour
    setInterval(() => {
      registration.update()
        .catch(err => console.error('[SW] Update check failed:', err))
    }, 60 * 60 * 1000)

    // Handle controller change (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.warn('[SW] New service worker activated')
      // Show update notification to user
      notificationsSvc.success('App Updated', 'A new version is available. Refresh to see changes.')
    })

    // Handle messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, ...data } = event.data
      console.warn(`[SW Message] ${type}:`, data)

      if (type === 'CACHE_SIZE') {
        console.warn(`[Cache] ${data.caches} items cached`)
      }
    })

    return registration
  }
  catch (error) {
    console.error('[SW] Registration failed:', error)
  }
}

/**
 * Unregister service worker
 */
async function unregisterServiceWorker() {
  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (const registration of registrations) {
      await registration.unregister()
      console.warn('[SW] Unregistered')
    }
  }
  catch (error) {
    console.error('[SW] Unregistration failed:', error)
  }
}

/**
 * Force refresh SW and clear cache
 */
async function refreshServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.ready

    // Check for updates
    await registration.update()

    // Skip waiting if new SW available
    const newWorker = registration.installing || registration.waiting
    if (newWorker) {
      newWorker.postMessage({ type: 'SKIP_WAITING' })

      // Wait for activation
      await new Promise((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', resolve, {
          once: true,
        })
      })

      // Clear cache
      const controller = navigator.serviceWorker.controller
      if (controller) {
        controller.postMessage({ type: 'CLEAR_CACHE' })
      }

      // Hard refresh page
      window.location.reload()
    }
  }
  catch (error) {
    console.error('[SW] Refresh failed:', error)
  }
}

/**
 * Request cache size from SW
 */
async function getCacheSize(): Promise<number> {
  return new Promise((resolve) => {
    const channel = new MessageChannel()

    channel.port1.onmessage = (event) => {
      if (event.data.type === 'CACHE_SIZE') {
        resolve(event.data.caches)
      }
    }

    const controller = navigator.serviceWorker.controller
    if (controller) {
      controller.postMessage(
        { type: 'GET_CACHE_SIZE' },
        [channel.port2],
      )
    }
    else {
      resolve(0)
    }
  })
}

/**
 * Clear all caches
 */
async function clearCache(): Promise<void> {
  return new Promise((resolve) => {
    const channel = new MessageChannel()

    channel.port1.onmessage = (event) => {
      if (event.data.type === 'CACHE_CLEARED') {
        console.warn('[Cache] Cleared successfully')
        resolve()
      }
    }

    const controller = navigator.serviceWorker.controller
    if (controller) {
      controller.postMessage(
        { type: 'CLEAR_CACHE' },
        [channel.port2],
      )
    }
    else {
      resolve()
    }
  })
}

// Declare types for useToaster
declare global {
  // legacy compatibility removed - use notifications service
}
