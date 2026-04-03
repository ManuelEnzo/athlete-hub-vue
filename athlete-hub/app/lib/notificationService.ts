import { toast as sonnerToast } from 'vue-sonner'
import { t as i18nT } from './i18n-client'

interface ToastOpts { id?: string, duration?: number }

class NotificationService {
  private shown = new Set<string>()

  private dedupe(key?: string) {
    if (!key)
      return false
    if (this.shown.has(key))
      return true
    this.shown.add(key)
    // remove after short period so same message can reappear later
    setTimeout(() => this.shown.delete(key), 4000)
    return false
  }

  private toText(keyOrText: string) {
    // Prefer i18n lookup, fall back to raw string
    if (!keyOrText)
      return ''
    const translated = i18nT(keyOrText, '')
    return translated || keyOrText
  }

  success(titleOrKey: string, descriptionOrKey?: string, opts?: ToastOpts) {
    const title = this.toText(titleOrKey)
    const description = descriptionOrKey ? this.toText(descriptionOrKey) : undefined
    if (this.dedupe(title))
      return

    let finalTitle = title
    let finalDescription = description
    if ((!finalTitle || finalTitle.trim() === '') && finalDescription) {
      finalTitle = finalDescription
      finalDescription = undefined
    }

    try {
      // debug log to help trace notification calls
      // eslint-disable-next-line no-console
      console.debug('[NotificationService] success', { title: finalTitle, description: finalDescription })
      if (sonnerToast && typeof sonnerToast.success === 'function') {
        sonnerToast.success(finalTitle, { description: finalDescription, id: opts?.id, duration: opts?.duration })
        return
      }
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.debug('[NotificationService] vue-sonner error', e)
    }
    this.fallback('success', finalTitle, finalDescription, opts)
  }

  error(titleOrKey: string, descriptionOrKey?: string, opts?: ToastOpts) {
    const title = this.toText(titleOrKey)
    const description = descriptionOrKey ? this.toText(descriptionOrKey) : undefined
    if (this.dedupe(title))
      return

    let finalTitle = title
    let finalDescription = description
    if ((!finalTitle || finalTitle.trim() === '') && finalDescription) {
      finalTitle = finalDescription
      finalDescription = undefined
    }

    try {
      // eslint-disable-next-line no-console
      console.debug('[NotificationService] error', { title: finalTitle, description: finalDescription })
      if (sonnerToast && typeof sonnerToast.error === 'function') {
        sonnerToast.error(finalTitle, { description: finalDescription, id: opts?.id, duration: opts?.duration })
        return
      }
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.debug('[NotificationService] vue-sonner error', e)
    }
    this.fallback('error', finalTitle, finalDescription, opts)
  }

  warning(titleOrKey: string, descriptionOrKey?: string, opts?: ToastOpts) {
    const title = this.toText(titleOrKey)
    const description = descriptionOrKey ? this.toText(descriptionOrKey) : undefined
    if (this.dedupe(title))
      return

    let finalTitle = title
    let finalDescription = description
    if ((!finalTitle || finalTitle.trim() === '') && finalDescription) {
      finalTitle = finalDescription
      finalDescription = undefined
    }

    try {
      // eslint-disable-next-line no-console
      console.debug('[NotificationService] warning', { title: finalTitle, description: finalDescription })
      if (sonnerToast && typeof sonnerToast.warning === 'function') {
        sonnerToast.warning(finalTitle, { description: finalDescription, id: opts?.id, duration: opts?.duration })
        return
      }
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.debug('[NotificationService] vue-sonner error', e)
    }
    this.fallback('warning', finalTitle, finalDescription, opts)
  }

  info(titleOrKey: string, descriptionOrKey?: string, opts?: ToastOpts) {
    const title = this.toText(titleOrKey)
    const description = descriptionOrKey ? this.toText(descriptionOrKey) : undefined
    if (this.dedupe(title))
      return

    let finalTitle = title
    let finalDescription = description
    if ((!finalTitle || finalTitle.trim() === '') && finalDescription) {
      finalTitle = finalDescription
      finalDescription = undefined
    }

    try {
      // eslint-disable-next-line no-console
      console.debug('[NotificationService] info', { title: finalTitle, description: finalDescription })
      if (sonnerToast && typeof sonnerToast.info === 'function') {
        sonnerToast.info(finalTitle, { description: finalDescription, id: opts?.id, duration: opts?.duration })
        return
      }
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.debug('[NotificationService] vue-sonner error', e)
    }
    this.fallback('info', finalTitle, finalDescription, opts)
  }

  // Simple DOM fallback if vue-sonner isn't available/runtime error
  private fallback(type: 'success' | 'error' | 'warning' | 'info', title: string, description?: string, opts?: ToastOpts) {
    try {
      const id = 'app-fallback-toasts'
      let container = document.getElementById(id)
      if (!container) {
        container = document.createElement('div')
        container.id = id
        Object.assign(container.style, {
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: '99999',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        })
        document.body.appendChild(container)
      }

      const el = document.createElement('div')
      el.className = `fallback-toast fallback-${type}`
      Object.assign(el.style, {
        minWidth: '220px',
        maxWidth: '360px',
        padding: '10px 12px',
        borderRadius: '8px',
        color: '#fff',
        boxShadow: '0 6px 18px rgba(2,6,23,0.2)',
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
        fontSize: '13px',
        lineHeight: '1.2',
      })

      switch (type) {
        case 'success': el.style.background = '#10b981'; break
        case 'error': el.style.background = '#ef4444'; break
        case 'warning': el.style.background = '#f59e0b'; break
        default: el.style.background = '#111827'; break
      }

      const titleEl = document.createElement('div')
      titleEl.style.fontWeight = '700'
      titleEl.style.marginBottom = description ? '4px' : '0'
      titleEl.textContent = title
      el.appendChild(titleEl)

      if (description) {
        const descEl = document.createElement('div')
        descEl.style.opacity = '0.95'
        descEl.textContent = description
        el.appendChild(descEl)
      }

      container.appendChild(el)
      const duration = opts?.duration ?? 4000
      setTimeout(() => {
        el.style.transition = 'opacity 0.3s, transform 0.3s'
        el.style.opacity = '0'
        el.style.transform = 'translateX(12px)'
        setTimeout(() => el.remove(), 300)
      }, duration)
    }
    catch (e) {
      // last resort
      try { console.log(type.toUpperCase(), title, description) } catch {}
    }
  }
}

const notifications = new NotificationService()

export default notifications
