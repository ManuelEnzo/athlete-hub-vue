import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false, // SPA puro
  devtools: { enabled: true },
  sourcemap: {
    server: true,
    client: true
  },
  css: ['~/assets/css/tailwind.css'],

  vite: {
    build: {
      sourcemap: true
    },
    css: {
      devSourcemap: true
    },
    plugins: [
      tailwindcss() as any,
    ],
  },

  components: [
    {
      path: '~/components',
      extensions: ['.vue'],
    },
  ],

  modules: [
    'shadcn-nuxt',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/fonts',
  ],

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

  routeRules: {
    '/components': { redirect: '/components/accordion' },
    '/settings': { redirect: '/settings/profile' },
    '/landingpage': { redirect: '/landing/landingpage' },
  },

  imports: {
    dirs: ['./lib'],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'robots', content: 'index, follow' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'sitemap', type: 'application/xml', href: '/sitemap.xml' },
      ],
    },
  },

  compatibilityDate: '2024-12-14',
  nitro: {
    preset: 'static',
    prerender: {
      routes: ['/landing/landingpage'],
    },
    routeRules: {
      '/**': {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
      },
    },
  },
})