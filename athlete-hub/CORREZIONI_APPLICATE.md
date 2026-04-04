# Correzioni Applicate per Risolvere la Crisi Production

Data: 4 Aprile 2026  
Commit Target: Post-31332e6 (mega commit)

---

## 1. ✅ vercel.json — Filesystem Handler

### Prima:
```json
"rewrites": [
  {
    "source": "/(.*)",
    "destination": "/"
  }
]
```

### Dopo:
```json
"rewrites": [
  { "handle": "filesystem" },
  {
    "source": "/(.*)",
    "destination": "/"
  ]
]
```

**Effetto**: Vercel ora serve i file statici (fonts in `_fonts/`, CSS, JS in `_nuxt/`) **PRIMA** di applicare la rewrite SPA. Questo risolve:
- ❌ `Failed to decode downloaded font`
- ❌ `OTS parsing error: invalid sfntVersion`

**Meccanismo**:
- Request: `GET /_fonts/xyz.woff2` → Vercel filesystem ha il file → Serve il binario WOFF2 ✅
- Request: `GET /login` → Nessun file statico → Rewrite a `/index.html` (SPA) ✅

---

## 2. ✅ app/plugins/i18n.ts — SSR-Safe Locale Detection

### Prima:
```typescript
let detected = 'it'
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    // ... accesso a window.localStorage
  } else if (typeof navigator !== 'undefined') {
    // ... accesso a navigator.language
  }
}
```

❌ **Problema**: `typeof window !== 'undefined'` non previene l'accesso in SSR/build-time se la variabile `window` non è completamente undefined.

### Dopo:
```typescript
let detected = 'it'
if (process.client) {  // ← GUARD SPECIFICO FOR CLIENT-ONLY CODE
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('lang')
      if (stored && Object.prototype.hasOwnProperty.call(messages, stored)) {
        detected = stored
      }
    }
    if (detected === 'it' && typeof navigator !== 'undefined') {
      const nav = (navigator.language || (navigator as any).userLanguage || '').split('-')[0]
      if (nav && Object.prototype.hasOwnProperty.call(messages, nav)) {
        detected = nav
      }
    }
  }
  catch {
    // Keep default 'it'
  }
}
```

**Effetto**: La locale detection avviene **SOLO nel browser**, mai durante il build Nitro/static generation. Questo risolve:
- ❌ `SyntaxError: 10 (at message-compiler.mjs:77:19)` (se causato da errata locale durante compile)
- ✅ Il build completa sempre con `locale: 'it'` come fallback

---

## 3. ✅ nuxt.config.ts — Rimozione Static: true

### Prima:
```typescript
routeRules: {
  '/components': { redirect: '/components/accordion' },
  '/settings': { redirect: '/settings/profile' },
  '/**': { ssr: false, static: true },  // ← PROBLEMATICO
}
```

### Dopo:
```typescript
routeRules: {
  '/components': { redirect: '/components/accordion' },
  '/settings': { redirect: '/settings/profile' },
  '/**': { ssr: false },
}
```

**Effetto**: In modalità SPA (`ssr: false` + `nitro: { preset: 'static' }`), aggiungere `static: true` è ridondante e può confondere Nitro. Rimuoverlo semplifica la configurazione.

---

## Validation Checklist

- [x] `vercel.json` ha `"handle": "filesystem"` PRIMA della rewrite catch-all
- [x] `i18n.ts` avvolge locale detection in `if (process.client)`
- [x] `nuxt.config.ts` ha `ssr: false` senza `static: true`
- [x] `verify-i18n.js` non riporta errori di sintassi ICU
- [ ] Build locale completa: `pnpm build` (test pending)
- [ ] SPA fallback funziona: `/login` carica senza 404
- [ ] Font assets caricano correttamente

---

## Prossimi Passi

1. **Test locale**:
   ```bash
   cd athlete-hub
   pnpm build
   # Dovrebbe completare senza errori
   ```

2. **Test preview**:
   ```bash
   pnpm preview
   # Naviga a http://localhost:3000/login
   # Verifica che le risorse carichino (no 404)
   ```

3. **Redeploy su Vercel**:
   - Push delle correzioni
   - Vercel rebuild automaticamente
   - Monitor per errori 404, font, o i18n

4. **Verifica in produzione**:
   - Direct navigation `/login` → ✅ SPA carica
   - Browser console → ✅ No `SyntaxError: 10`
   - Network tab → ✅ Font sono WOFF2 binari, non HTML

---

## Root Cause Summary

| Sintomo | Root Cause | Correzione |
|---------|-----------|-----------|
| 404 in produzione | Vercel routing mancante `handle: filesystem` | Aggiunto filesystem handler |
| Font decode errors | Vercel serving HTML invece di WOFF2 per asset | Filesystem handler ordina asset prima di rewrite |
| SyntaxError:10 (potenziale) | Locale detection in build-time | `if (process.client)` guard |
| i18n detection fails | Nessuna localStorage/navigator in SSR | Fallback a 'it' sempre valido |

Tutte le correzioni sono **SSR-safe**, **Vercel-compatible**, e mantengono backward compatibility.
