import notifications from '@/lib/notificationService'

export default defineNuxtPlugin((_nuxtApp) => {
  // Return `provide` only — avoid calling nuxtApp.provide twice which can
  // trigger "Cannot redefine property" if the plugin runs more than once.

  // Expose globally for legacy code that expects `window.toast` or `globalThis.toast`.
  if (import.meta.client) {
    try {
      if (typeof (window as any).toast === 'undefined')
        (window as any).toast = notifications
      if (typeof (globalThis as any).toast === 'undefined')
        (globalThis as any).toast = notifications
    }
    catch {
      // ignore
    }
  }

  return {
    provide: {
      toast: notifications,
    },
  }
})
