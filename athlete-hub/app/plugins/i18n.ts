// plugins/i18n.ts
import { createI18n } from 'vue-i18n'
import en from '../../i18n/en.json'
import it from '../../i18n/it.json'

export default defineNuxtPlugin(({ vueApp }) => {
  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: 'it',
    fallbackLocale: 'en',
    messages: { en, it }
  })

  vueApp.use(i18n)

  // Opzionale: rendilo disponibile globalmente tramite Nuxt
  return {
    provide: {
      i18n: i18n.global
    }
  }
})