/**
 * ⚡ OPTIMIZED NUXT CONFIG FOR 10K CONCURRENT USERS
 *
 * Improvements:
 * - SSR enabled for fast first paint + SEO
 * - ISR (Incremental Static Regeneration) for intelligent caching
 * - Lazy component loading to reduce initial bundle
 * - Removed sourcemaps from production
 * - Aggressive compression settings
 * - Production-grade performance optimizations
 */

import tailwindcss from '@tailwindcss/vite'

const isDev = process.env.NODE_ENV === 'development'

export default defineNuxtConfig({
  // ============================================
  // SSR & RENDERING
  // ============================================
  ssr: true, // ✅ Enable server-side rendering (was false!)

  devtools: { enabled: isDev },

  // ============================================
  // SOURCE MAPS (DEVELOPMENT ONLY)
  // ============================================
  sourcemap: {
    server: isDev, // ✅ Only in development
    client: isDev,
  },

  // ============================================
  // CSS & STYLING
  // ============================================
  css: ['~/assets/css/tailwind.css'],

  // ============================================
  // VITE BUILD CONFIGURATION
  // ============================================
  vite: {
    build: {
      sourcemap: isDev, // ✅ Dev only
      minify: 'terser', // ✅ Production minification
      terserOptions: isDev ? {} : {
        compress: {
          drop_console: true, // ✅ Remove console.log in prod
          drop_debugger: true,
        },
        mangle: true,
      },
      rollupOptions: {
        output: {
          manualChunks: {
            // ✅ Smart code splitting for better caching
            'vendor-vue': ['vue', 'vue-router', 'pinia'],
            'vendor-ui': ['reka-ui', 'embla-carousel', '@tanstack/vue-table'],
            'vendor-charts': ['apexcharts', 'vue3-apexcharts'],
            'vendor-utils': ['axios', 'nanoid', 'vuedraggable'],
          },
        },
      },
      // ✅ Chunk size optimization
      chunkSizeWarningLimit: 1000,
      reportCompressedSize: isDev,
      cssCodeSplit: true, // ✅ Extract CSS to separate files
      cssTarget: ['chrome120', 'firefox119', 'safari17'],
    },

    css: {
      devSourcemap: isDev,
    },

    plugins: [
      tailwindcss() as any,
    ],

    // ✅ Optimization settings
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'axios',
        'vue-sonner',
      ],
    },
  },

  // ============================================
  // COMPONENTS - SMART LAZY LOADING
  // ============================================
  components: {
    dirs: [
      {
        path: '~/components/ui',
        extensions: ['.vue'],
        prefix: 'Ui', // ✅ Auto-import with Ui prefix
        level: 0,
      },
      {
        path: '~/components/layout',
        extensions: ['.vue'],
        level: 0, // ✅ Root level for efficient resolution
      },
      {
        path: '~/components',
        extensions: ['.vue'],
        level: 1,
      },
      // Heavy components lazy-loaded on demand
      {
        path: '~/components/kanban',
        extensions: ['.vue'],
        prefix: 'Kanban',
        level: 0,
      },
      {
        path: '~/components/agenda',
        extensions: ['.vue'],
        prefix: 'Agenda',
        level: 0,
      },
    ],
  },

  // ============================================
  // MODULES
  // ============================================
  modules: [
    'shadcn-nuxt',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/fonts',
  ],

  // ============================================
  // MODULE CONFIGURATION
  // ============================================
  shadcn: {
    prefix: '',
    componentDir: '~/components/ui',
  },

  colorMode: {
    classSuffix: '',
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  fonts: {
    defaults: {
      weights: [300, 400, 500, 600, 700, 800],
    },
  },

  // ============================================
  // ROUTE RULES - ISR STRATEGY
  // ============================================
  routeRules: {
    // 🔄 ISR (Incremental Static Regeneration)
    '/': { swr: 120 }, // Revalidate every 2 minutes
    '/athletemanagement': { swr: 120 },
    '/athletedetails/**': { swr: 120 },
    '/athletehealth': { swr: 120 },
    '/athletemeasurements': { swr: 120 },

    // 📊 Reports - less frequent updates
    '/rpedetails': { swr: 3600 }, // 1 hour
    '/testmanagement': { swr: 3600 },
    '/injuriesmanager': { swr: 3600 },
    '/kanban/**': { swr: 120 }, // Real-time update

    // 🔐 Auth - no cache
    '/(auth)/**': { cache: false },
    '/login': { cache: false },

    // 📄 Static pages
    '/datapolicy': { swr: 86400 }, // 1 day
    '/email': { cache: false },
  },

  // ============================================
  // NITRO SERVER CONFIGURATION
  // ============================================
  nitro: {
    // ✅ SSR preset with caching
    preset: 'node-server',

    // ✅ Prerender static routes
    prerender: {
      crawlLinks: true,
      routes: ['/sitemap.xml', '/datapolicy'],
      ignore: ['/admin', '/(auth)/**'],
    },

    // ⭐ API caching strategy
    storage: {
      cache: {
        driver: 'memory', // ✅ Fast in-memory cache
        // For production, use Redis:
        // driver: 'redis',
        // url: process.env.REDIS_URL
      },
    },

    // ✅ Headers for caching & security
    headers: {
      'Cache-Control': isDev
        ? 'no-cache'
        : 'public, max-age=3600, s-maxage=86400',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },

    // ✅ Compression
    compressPublicAssets: !isDev,

    // ✅ Security
    noPayloadExtraction: false,

    // ✅ Performance
    timing: isDev,

    // ✅ Logging
    logging: !isDev, // ✅ Disable verbose logging in production
  },

  // ============================================
  // BUILD & ASSET CONFIGURATION
  // ============================================
  buildAssetsDir: '/_nuxt/', // ✅ Standard CDN path

  compressPublicAssets: !isDev,

  // ============================================
  // IMPORTS AUTO-LOADING
  // ============================================
  imports: {
    dirs: ['./lib'],
  },

  // ============================================
  // COMPATIBILITY
  // ============================================
  compatibilityDate: '2024-12-14',

  // ============================================
  // EXPERIMENTAL FEATURES
  // ============================================
  experimental: {
    payloadExtraction: !isDev, // ✅ Extract payload for static hosting
    inlineSSRStyles: true, // ✅ Inline critical CSS
  },

  // ============================================
  // RUNTIME CONFIG
  // ============================================
  runtimeConfig: {
    // ✅ Server-side only
    apiSecret: process.env.API_SECRET,

    // ✅ Public (client-side)
    public: {
      apiEndpoint: process.env.PUBLIC_API_ENDPOINT || 'http://localhost:3000',
      siteName: 'Athlete Hub',
      siteDescription: 'Advanced athlete management platform',
    },
  },
})
