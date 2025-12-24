// plugins/i18n.ts
import { createI18n } from 'vue-i18n'
import en from '../../i18n/en.json'
import it from '../../i18n/it.json'

// Creiamo l'istanza fuori per poterla esportare
export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'it',
  fallbackLocale: 'en',
  messages: { en, it } // Usa i file JSON che hai già
})

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.use(i18n)
})