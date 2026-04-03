// plugins/i18n.ts
import { createI18n } from 'vue-i18n'
import en from '../../i18n/en.json'
import it from '../../i18n/it.json'

export default defineNuxtPlugin(({ vueApp }) => {
  const messages = { en, it }

  // Detect preferred locale: localStorage 'lang' -> navigator.lang -> default 'it'
  let detected = 'it'
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('lang')
      if (stored && Object.prototype.hasOwnProperty.call(messages, stored)) {
        detected = stored
      }
      else if (typeof navigator !== 'undefined') {
        const nav = (navigator.language || (navigator as any).userLanguage || '').split('-')[0]
        if (nav && Object.prototype.hasOwnProperty.call(messages, nav))
          detected = nav
      }
    }
    else if (typeof navigator !== 'undefined') {
      const nav = (navigator.language || (navigator as any).userLanguage || '').split('-')[0]
      if (nav && Object.prototype.hasOwnProperty.call(messages, nav))
        detected = nav
    }
  }
  catch {
    // fallback stays 'it'
  }

  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: detected,
    fallbackLocale: 'en',
    messages,
  })

  vueApp.use(i18n)

  return {
    provide: {
      i18n: i18n.global,
    },
  }
})
