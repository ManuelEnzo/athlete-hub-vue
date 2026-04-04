import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  ssr: false, // SPA puro
  devtools: { enabled: true },
  sourcemap: { server: true, client: true },
  css: ['~/assets/css/tailwind.css'],

  vite: {
    build: { sourcemap: true },
    css: { devSourcemap: true },
    plugins: [tailwindcss() as any],
  },

  components: [{ path: '~/components', extensions: ['.vue'] }],

  modules: [
    'shadcn-nuxt',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/fonts',
  ],

  shadcn: { prefix: '', componentDir: '~/components/ui' },
  colorMode: { classSuffix: '' },

  eslint: { config: { standalone: false } },

  fonts: { defaults: { weights: [300, 400, 500, 600, 700, 800] } },

  // Fallback SPA per tutte le route
  routeRules: {
    '/components': { redirect: '/components/accordion' },
    '/settings': { redirect: '/settings/profile' },
  },

  imports: { dirs: ['./lib'] },

  compatibilityDate: '2024-12-14',
  nitro: {
    // Invece di 'static', usa 'vercel-spa' o lascialo vuoto
    // se vuoi che Vercel gestisca il routing tramite vercel.json
    preset: 'vercel'
  },
})