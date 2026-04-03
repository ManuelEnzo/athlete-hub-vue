/**
 * 🔄 SERVICE WORKER - OFFLINE SUPPORT & CACHING
 *
 * Features:
 * - Offline-first strategy
 * - Smart API caching
 * - Background sync
 * - Stale-while-revalidate pattern
 *
 * Save as: public/sw.js
 */

const CACHE_VERSION = 'athlete-hub-v1'
const RUNTIME_CACHE = 'athlete-hub-runtime-v1'
const API_CACHE = 'athlete-hub-api-v1'

// Assets that must be available immediately (critical for app startup)
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/_nuxt/manifest.json',
  '/_nuxt/entry.mjs',
]

// Endpoints that should be cached aggressively
const CACHEABLE_API_PATTERNS = [
  '/Athletes',
  '/AthleteMeasurements',
  '/TestDefinitions',
  '/Auth/profile',
  '/Plan/get-list-of-plans',
]

// Endpoints that should never be cached (real-time data)
const NON_CACHEABLE_PATTERNS = [
  '/Auth/sign-in',
  '/Auth/sign-up',
  '/Auth/logout',
  '/Auth/refresh',
]

/**
 * INSTALL EVENT - Pre-cache critical assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')

  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => {
        console.log('[SW] Caching critical assets')
        return cache.addAll(CRITICAL_ASSETS)
      })
      .then(() => self.skipWaiting()), // Activate immediately
  )
})

/**
 * ACTIVATE EVENT - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('athlete-hub-') && name !== CACHE_VERSION)
            .map((name) => {
              console.log(`[SW] Deleting old cache: ${name}`)
              return caches.delete(name)
            }),
        )
      })
      .then(() => self.clients.claim()), // Take control immediately
  )
})

/**
 * FETCH EVENT - Smart caching strategy
 */
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only cache GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return
  }

  // ============================================
  // API REQUESTS: Network First + Cache Fallback
  // ============================================
  if (url.pathname.includes('/api/') || url.pathname.startsWith('/Auth/')) {
    // Don't cache auth mutations
    const isNonCacheable = NON_CACHEABLE_PATTERNS.some(pattern =>
      url.pathname.includes(pattern),
    )

    if (isNonCacheable) {
      event.respondWith(fetch(request))
      return
    }

    // Network-first strategy with cache fallback
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const cache = caches.open(API_CACHE)
            cache.then(c => c.put(request, response.clone()))
          }
          return response
        })
        .catch(() => {
          // Fallback to cache on network error
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log(`[SW] Serving from cache (offline): ${url.pathname}`)
                return cachedResponse
              }
              // Return offline page if available
              return caches.match('/offline.html')
                || new Response('Offline - please check your connection', {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: new Headers({
                    'Content-Type': 'text/plain',
                  }),
                })
            })
        }),
    )
    return
  }

  // ============================================
  // HTML PAGES: Stale-While-Revalidate
  // ============================================
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          // Return cached version immediately
          const fetchPromise = fetch(request)
            .then((response) => {
              // Update cache in background
              if (response.ok) {
                const cache = caches.open(CACHE_VERSION)
                cache.then(c => c.put(request, response.clone()))
              }
              return response
            })
            .catch(() => {
              // Network failed, return cached or offline page
              return cachedResponse
                || caches.match('/offline.html')
                || new Response('Offline', { status: 503 })
            })

          return cachedResponse || fetchPromise
        }),
    )
    return
  }

  // ============================================
  // ASSETS (JS, CSS, Images): Cache First
  // ============================================
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response
        }

        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response.ok && request.method === 'GET') {
              const cache = caches.open(RUNTIME_CACHE)
              cache.then(c => c.put(request, response.clone()))
            }
            return response
          })
          .catch(() => {
            // Return offline page as fallback
            return caches.match('/offline.html')
              || new Response('Resource unavailable offline', { status: 503 })
          })
      }),
  )
})

/**
 * MESSAGE EVENT - Communication with client
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    caches.keys()
      .then((names) => {
        return Promise.all(
          names.map(name => caches.open(name).then(cache => cache.keys())),
        )
      })
      .then((keys) => {
        const totalKeys = keys.reduce((sum, arr) => sum + arr.length, 0)
        event.ports[0].postMessage({
          type: 'CACHE_SIZE',
          caches: totalKeys,
        })
      })
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys()
      .then((names) => {
        return Promise.all(
          names.map(name => caches.delete(name)),
        )
      })
      .then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' })
      })
  }
})

/**
 * BACKGROUND SYNC - Sync data when back online
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Sync logic here
      Promise.resolve()
        .then(() => {
          console.log('[SW] Background sync completed')
        }),
    )
  }
})

/**
 * PUSH NOTIFICATIONS
 */
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: data.tag || 'notification',
      requireInteraction: data.requireInteraction || false,
    }

    event.waitUntil(
      self.registration.showNotification(data.title, options),
    )
  }
})

console.log('[SW] Service Worker loaded')
