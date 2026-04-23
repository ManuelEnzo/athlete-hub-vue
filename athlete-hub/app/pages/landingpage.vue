<script setup lang="ts">
import {
  Activity,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  Loader2,
  Mail,
  Moon,
  ShieldAlert,
  Smartphone,
  Star,
  Sun,
  Watch,
  Zap,
} from 'lucide-vue-next'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import config from '@/config'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useErrorHandler } from '~/composables/useErrorHandler'

definePageMeta({ layout: 'blank', auth: false })

const { t } = useI18n({ useScope: 'global' })

const handler = useErrorHandler({ component: 'LandingPage' })

const siteUrl = import.meta.env.VITE_ATHLETE_HUB_SITE_URL || 'https://athletehub.sport'

// Page-level SEO
// // useSeoMeta({
// //   title: 'Athlete Hub — Sports Performance Monitoring Platform',
// //   description: 'Athlete Hub helps coaches and sport scientists monitor athlete readiness, ACWR, RPE, sleep and injuries in real time. Start for free.',
// //   ogTitle: 'Athlete Hub — Sports Performance Monitoring Platform',
// //   ogDescription: 'Monitor athlete readiness, ACWR, RPE, sleep and injuries in real time. The professional platform for sports performance management.',
// //   ogUrl: siteUrl,
// //   ogImage: `${siteUrl}/social-card.png`,
// //   ogType: 'website',
// //   twitterCard: 'summary_large_image',
// //   twitterTitle: 'Athlete Hub — Sports Performance Monitoring',
// //   twitterDescription: 'Monitor athlete readiness, ACWR, RPE, sleep and injuries in real time.',
// //   twitterImage: `${siteUrl}/social-card.png`,
// // })

// // // // // // useHead({
// // // // // //   link: [{ rel: 'canonical', href: siteUrl }],
// // // // // //   script: [
// // // // // //     {
// // // // // //       type: 'application/ld+json',
// // // // // //       innerHTML: JSON.stringify({
// // // // // //         '@context': 'https://schema.org',
// // // // // //         '@type': 'SoftwareApplication',
// // // // // //         'name': 'Athlete Hub',
// // // // // //         'description': 'Professional sports performance monitoring platform for coaches and sport scientists.',
// // // // // //         'url': siteUrl,
// // // // // //         'applicationCategory': 'SportsApplication',
// // // // // //         'operatingSystem': 'Web',
// // // // // //         'offers': {
// // // // // //           '@type': 'Offer',
// // // // // //           'price': '0',
// // // // // //           'priceCurrency': 'EUR',
// // // // // //         },
// // // // // //         'author': {
// // // // // //           '@type': 'Person',
// // // // // //           'name': 'Manuel Enzo',
// // // // // //           'email': 'athletehub.sport@gmail.com',
// // // // // //         },
// // // // // //       }),
// // // // // //     },
// // // // // //   ],
// // // // // // })

// Gestione Tema (Nuxt Color Mode)
const colorMode = useColorMode()
function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Form waitlist
const email = ref('')
const isSubmitting = ref(false)
const isSubmitted = ref(false)

function scrollToWaitlist() {
  document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })
}

async function handleFormSubmit() {
  const emailValue = String(email.value || '').trim()
  const emailRegex = /^\S[^\s@]*@\S[^\s.]*\.\S+$/
  if (!emailValue || !emailRegex.test(emailValue)) {
    handler.handleError(new Error(t('landingpage.waitlist.invalidEmail')))
    return
  }

  isSubmitting.value = true
  try {
    const endpoint = config.formEndpoint || 'https://formsubmit.co/ajax/athletehub.sport@gmail.com'
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email: emailValue }),
    })

    if (response.ok) {
      isSubmitted.value = true
    }
    else {
      throw new Error(t('landingpage.alerts.serverError'))
    }
  }
  catch (err: any) {
    handler.handleError(err instanceof Error ? err : new Error(String(err)))
  }
  finally {
    isSubmitting.value = false
  }
}

// Product showcase tabs
const activeTab = ref(0)

const showcaseTabs = [
  {
    label: 'Dashboard',
    desc: 'Panoramica real-time del team: ACWR, Readiness Media, carico settimanale e valutazione rischio atleti.',
    img: '/dashboard_preview.png',
  },
  {
    label: 'Agenda',
    desc: 'Pianifica sessioni, eventi e appuntamenti in un calendario interattivo con gestione RPE integrata.',
    img: '/calendar.png',
  },
  {
    label: 'Analytics',
    desc: 'Visualizzatore atleta con ACWR, stato di prontezza, carico acuto/cronico e storico performance.',
    img: '/dettagli.png',
  },
  {
    label: 'Sleep Tracking',
    desc: 'Analisi completa del sonno: ore dormite, fasi REM, sonno profondo e andamento del recupero nel tempo.',
    img: '/sleep.png',
  },
  {
    label: 'AI Assistant',
    desc: 'Assistente AI in linguaggio naturale per gestire eventi, consultare statistiche e ricevere suggerimenti.',
    img: '/ai-chat.png',
  },
]

// Core features
const coreFeatures = [
  {
    titleKey: 'landingpage.features.precisioneACWR',
    descKey: 'landingpage.features.descPrecisioneACWR',
    icon: Activity,
    color: 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400',
  },
  {
    titleKey: 'landingpage.features.feedbackLoop',
    descKey: 'landingpage.features.descFeedbackLoop',
    icon: Mail,
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    titleKey: 'landingpage.features.pianificazione',
    descKey: 'landingpage.features.descPianificazione',
    icon: Calendar,
    color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
  {
    titleKey: 'landingpage.features.clinicalData',
    descKey: 'landingpage.features.descClinicalData',
    icon: ShieldAlert,
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  },
]

// Roadmap dinamica
const roadmapSteps = [
  { icon: Watch, titleKey: 'landingpage.roadmap.steps.0.title', dateKey: 'landingpage.roadmap.steps.0.date' },
  { icon: BrainCircuit, titleKey: 'landingpage.roadmap.steps.1.title', dateKey: 'landingpage.roadmap.steps.1.date' },
  { icon: Smartphone, titleKey: 'landingpage.roadmap.steps.2.title', dateKey: 'landingpage.roadmap.steps.2.date' },
]
</script>

<template>
  <div class="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20 transition-colors duration-300">

    <!-- ─── NAVBAR ──────────────────────────────────────────────────────── -->
    <nav class="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-background/75 backdrop-blur-xl">
      <div class="container mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img :src="'/favicon.ico'" alt="Logo" class="h-7 w-7 object-contain">
          <span class="font-black tracking-tighter text-xl uppercase italic select-none">
            Athlete<span class="text-muted-foreground font-light">Hub</span>
          </span>
        </div>

        <div class="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" class="hover:text-foreground transition-colors">{{ t('landingpage.navbar.features') }}</a>
          <a href="#showcase" class="hover:text-foreground transition-colors">{{ t('landingpage.navbar.product') }}</a>
          <a href="#pricing" class="hover:text-foreground transition-colors">{{ t('landingpage.navbar.pricing') }}</a>
          <a href="#roadmap" class="hover:text-foreground transition-colors">{{ t('landingpage.navbar.roadmap') }}</a>
        </div>

        <div class="flex items-center gap-2">
          <Button variant="ghost" size="icon" class="rounded-full h-9 w-9" @click="toggleTheme">
            <Sun v-if="colorMode.value === 'dark'" class="h-4 w-4" />
            <Moon v-else class="h-4 w-4" />
          </Button>
          <NuxtLink
            to="/login"
            class="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
          >
            {{ t('landingpage.navbar.clientLogin') }}
          </NuxtLink>
          <Button
            class="h-9 px-5 rounded-full text-sm font-semibold bg-foreground text-background hover:opacity-85 transition-opacity"
            @click="scrollToWaitlist"
          >
            {{ t('landingpage.navbar.demo') }}
          </Button>
        </div>
      </div>
    </nav>

  </div>
</template>

<style>
html {
  scroll-behavior: smooth;
}

.fade-tab-enter-active,
.fade-tab-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.fade-tab-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-tab-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
