import en from '../../i18n/en.json'
// Lightweight i18n helper for non-Vue modules (server/client-safe)
import it from '../../i18n/it.json'

type Messages = Record<string, any>

const MESSAGES: Record<string, Messages> = { it, en }
const DEFAULT_LOCALE = 'it'

let cachedLocale: string | null = null

function getLocale(): string {
  if (cachedLocale)
    return cachedLocale

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('lang')
      if (stored && MESSAGES[stored]) {
        cachedLocale = stored
        return stored
      }
    }

    if (typeof navigator !== 'undefined') {
      const navLang = (navigator.language || (navigator as any).userLanguage || '').split('-')[0]
      if (navLang && MESSAGES[navLang]) {
        cachedLocale = navLang
        return navLang
      }
    }
  }
  catch {
    // ignore
  }

  cachedLocale = DEFAULT_LOCALE
  return DEFAULT_LOCALE
}

/**
 * Risolve chiavi nidificate.
 * Accetta 'messages' anche undefined per evitare errori di tipo nelle chiamate.
 */
function resolve(key: string, messages: Messages | undefined): string | undefined {
  if (!messages)
    return undefined

  const value = key.split('.').reduce((obj, segment) => obj?.[segment], messages)
  return typeof value === 'string' ? value : undefined
}

/**
 * Funzione di traduzione
 */
export function t(key: string, fallback?: string): string {
  const locale = getLocale()

  // 1. Tenta con la lingua corrente (o quella di default)
  const primary = MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE]
  const val = resolve(key, primary)
  if (val !== undefined)
    return val

  // 2. Fallback su Inglese (se la lingua corrente non è già inglese)
  if (locale !== 'en') {
    const enVal = resolve(key, MESSAGES.en)
    if (enVal !== undefined)
      return enVal
  }

  // 3. Ritorna il fallback fornito o la chiave stessa
  return fallback ?? key
}

export function clearLocaleCache() {
  cachedLocale = null
}

export default { t, clearLocaleCache }
