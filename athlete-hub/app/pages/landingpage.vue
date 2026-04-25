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
// useSeoMeta({
//   title: 'Athlete Hub — Sports Performance Monitoring Platform',
//   description: 'Athlete Hub helps coaches and sport scientists monitor athlete readiness, ACWR, RPE, sleep and injuries in real time. Start for free.',
//   ogTitle: 'Athlete Hub — Sports Performance Monitoring Platform',
//   ogDescription: 'Monitor athlete readiness, ACWR, RPE, sleep and injuries in real time. The professional platform for sports performance management.',
//   ogUrl: siteUrl,
//   ogImage: `${siteUrl}/social-card.png`,
//   ogType: 'website',
//   twitterCard: 'summary_large_image',
//   twitterTitle: 'Athlete Hub — Sports Performance Monitoring',
//   twitterDescription: 'Monitor athlete readiness, ACWR, RPE, sleep and injuries in real time.',
//   twitterImage: `${siteUrl}/social-card.png`,
// })

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

    <main>
      <!-- ─── HERO ─────────────────────────────────────────────────────── -->
      <section class="relative pt-36 pb-16 px-6 overflow-hidden">
        <!-- Background gradients -->
        <div class="absolute inset-0 -z-10 pointer-events-none">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-indigo-500/15 via-violet-500/5 to-transparent blur-[80px]" />
          <div class="absolute top-32 left-[8%] w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl" />
          <div class="absolute top-52 right-[8%] w-52 h-52 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div class="container mx-auto max-w-5xl text-center">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-8">
            <span class="size-1.5 rounded-full bg-indigo-400 animate-pulse" />
            {{ t('landingpage.hero.subtitle') }}
          </div>

          <!-- Headline -->
          <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-black tracking-tighter leading-[0.88] mb-8 uppercase">
            <span class="block bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
              Performance
            </span>
            <span class="block bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Data-Driven
            </span>
          </h1>

          <!-- Subtext -->
          <p class="max-w-2xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed mb-10">
            {{ t('landingpage.hero.description') }}
          </p>

          <!-- CTAs -->
          <div class="flex flex-col sm:flex-row justify-center gap-3 mb-10">
            <Button
              size="lg"
              class="h-12 px-8 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 border-0"
              @click="scrollToWaitlist"
            >
              {{ t('landingpage.hero.ctaStart') }}
              <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg" variant="outline"
              class="h-12 px-8 rounded-xl border-border/60 hover:bg-accent/50 font-semibold transition-all hover:-translate-y-0.5"
              @click="scrollToWaitlist"
            >
              {{ t('landingpage.hero.ctaExplore') }}
            </Button>
          </div>

          <!-- Trust pills -->
          <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground/60 mb-16">
            <span class="flex items-center gap-1.5">
              <CheckCircle2 class="h-3.5 w-3.5 text-emerald-500" />
              {{ t('landingpage.hero.trustNoCreditCard') }}
            </span>
            <span class="hidden sm:block w-px h-3.5 bg-border" />
            <span class="flex items-center gap-1.5">
              <CheckCircle2 class="h-3.5 w-3.5 text-emerald-500" />
              {{ t('landingpage.hero.trustSetup') }}
            </span>
            <span class="hidden sm:block w-px h-3.5 bg-border" />
            <span class="flex items-center gap-1.5">
              <CheckCircle2 class="h-3.5 w-3.5 text-emerald-500" />
              {{ t('landingpage.hero.trustGdpr') }}
            </span>
          </div>

          <!-- Dashboard preview (browser mockup) -->
          <div class="relative mx-auto max-w-5xl">
            <div class="rounded-t-2xl px-4 py-2.5 bg-[#181818] border border-border/30 border-b-0 flex items-center gap-3">
              <div class="flex gap-1.5 shrink-0">
                <span class="w-3 h-3 rounded-full bg-red-500/60" />
                <span class="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span class="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div class="flex-1 bg-[#262626] rounded-md py-1 px-3 text-center">
                <span class="text-[11px] text-muted-foreground/40 font-mono">{{ t('landingpage.hero.browserUrl') }}</span>
              </div>
            </div>
            <div class="relative overflow-hidden rounded-b-2xl border border-border/30 border-t-0 shadow-2xl shadow-black/60">
              <img :src="'/dashboard_preview.png'" alt="Athlete Hub Dashboard" class="w-full object-cover object-top">
              <div class="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <!-- ─── STATS STRIP ──────────────────────────────────────────────── -->
      <section class="py-14 border-y border-border/40">
        <div class="container mx-auto px-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p class="text-2xl md:text-3xl font-black mb-1">100%</p>
              <p class="text-xs text-muted-foreground uppercase tracking-wider">{{ t('landingpage.stats.webBased') }}</p>
            </div>
            <div>
              <p class="text-2xl md:text-3xl font-black mb-1">{{ t('landingpage.stats.realtimeLabel') }}</p>
              <p class="text-xs text-muted-foreground uppercase tracking-wider">{{ t('landingpage.stats.realtimeDesc') }}</p>
            </div>
            <div>
              <p class="text-2xl md:text-3xl font-black mb-1">{{ t('landingpage.stats.aiLabel') }}</p>
              <p class="text-xs text-muted-foreground uppercase tracking-wider">{{ t('landingpage.stats.aiDesc') }}</p>
            </div>
            <div>
              <p class="text-2xl md:text-3xl font-black mb-1">{{ t('landingpage.stats.gdprLabel') }}</p>
              <p class="text-xs text-muted-foreground uppercase tracking-wider">{{ t('landingpage.stats.gdprDesc') }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── FEATURES ─────────────────────────────────────────────────── -->
      <section id="features" class="py-28 px-6">
        <div class="container mx-auto max-w-6xl">
          <div class="text-center mb-16">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent border border-border/60 text-muted-foreground text-xs font-medium mb-5">
              <Zap class="h-3 w-3" />
              {{ t('landingpage.features.badgeLabel') }}
            </div>
            <h2 class="text-4xl md:text-5xl font-black tracking-tight uppercase leading-tight mb-4">
              {{ t('landingpage.features.title') }}
              <span class="block text-muted-foreground font-light normal-case tracking-normal">{{ t('landingpage.features.titleSub') }}</span>
            </h2>
            <p class="text-muted-foreground max-w-xl mx-auto text-sm">
              {{ t('landingpage.features.subtitle') }}
            </p>
          </div>

          <!-- ── VS EXCEL COMPARISON ── -->
          <div class="mb-12 rounded-3xl border border-border/60 overflow-hidden">
            <!-- Header row -->
            <div class="grid grid-cols-3 bg-accent/40">
              <div class="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground" />
              <div class="p-4 text-center border-x border-border/40">
                <p class="text-xs font-black uppercase tracking-widest text-muted-foreground">{{ t('landingpage.comparison.colExcel') }}</p>
              </div>
              <div class="p-4 text-center bg-indigo-500/10">
                <p class="text-xs font-black uppercase tracking-widest text-indigo-400">{{ t('landingpage.comparison.colUs') }}</p>
              </div>
            </div>

            <!-- Rows -->
            <div
              v-for="(rowKey, i) in ['row1','row2','row3','row4','row5','row6','row7','row8']"
              :key="i"
              class="grid grid-cols-3 border-t border-border/40 hover:bg-accent/10 transition-colors"
            >
              <div class="px-5 py-3.5 text-sm text-foreground/80 flex items-center">{{ t(`landingpage.comparison.${rowKey}`) }}</div>
              <div class="px-5 py-3.5 border-x border-border/40 flex items-center justify-center">
                <span class="text-red-500/70">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              </div>
              <div class="px-5 py-3.5 flex items-center justify-center bg-indigo-500/[0.03]">
                <span class="text-emerald-500">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div
              v-for="f in coreFeatures" :key="f.titleKey"
              class="group p-6 rounded-2xl border border-border/60 bg-card hover:bg-accent/20 transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-sm"
            >
              <div :class="['size-10 rounded-xl flex items-center justify-center mb-5', f.color]">
                <component :is="f.icon" class="size-5" />
              </div>
              <h3 class="text-sm font-bold mb-2 uppercase tracking-tight">{{ t(f.titleKey) }}</h3>
              <p class="text-sm text-muted-foreground leading-relaxed">{{ t(f.descKey) }}</p>
            </div>
          </div>

          <!-- 3 extra features -->
          <div class="grid sm:grid-cols-3 gap-4">
            <div class="p-6 rounded-2xl border border-border/60 bg-card hover:bg-accent/20 transition-all duration-300 hover:-translate-y-1 hover:border-border">
              <div class="size-10 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center justify-center mb-5">
                <Moon class="size-5" />
              </div>
              <h3 class="text-sm font-bold mb-2 uppercase tracking-tight">{{ t('landingpage.features.sleepTitle') }}</h3>
              <p class="text-sm text-muted-foreground">{{ t('landingpage.features.sleepDesc') }}</p>
            </div>
            <div class="p-6 rounded-2xl border border-border/60 bg-card hover:bg-accent/20 transition-all duration-300 hover:-translate-y-1 hover:border-border">
              <div class="size-10 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center mb-5">
                <BrainCircuit class="size-5" />
              </div>
              <h3 class="text-sm font-bold mb-2 uppercase tracking-tight">{{ t('landingpage.features.aiTitle') }}</h3>
              <p class="text-sm text-muted-foreground">{{ t('landingpage.features.aiDesc') }}</p>
            </div>
            <div class="p-6 rounded-2xl border border-border/60 bg-card hover:bg-accent/20 transition-all duration-300 hover:-translate-y-1 hover:border-border">
              <div class="size-10 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center mb-5">
                <ShieldAlert class="size-5" />
              </div>
              <h3 class="text-sm font-bold mb-2 uppercase tracking-tight">{{ t('landingpage.features.injuryTitle') }}</h3>
              <p class="text-sm text-muted-foreground">{{ t('landingpage.features.injuryDesc') }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── PRODUCT SHOWCASE ─────────────────────────────────────────── -->


      <!-- ─── SCALABILITY ──────────────────────────────────────────────── -->
      <section class="py-28 px-6 border-t border-border/40">
        <div class="container mx-auto max-w-6xl">
          <div class="grid lg:grid-cols-2 gap-16 items-center">
            <div class="space-y-8">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent border border-border/60 text-muted-foreground text-xs font-medium">
                <Zap class="h-3 w-3" />
                {{ t('landingpage.scalability.badgeLabel') }}
              </div>
              <h2 class="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">
                {{ t('landingpage.scalability.title') }}
              </h2>
              <p class="text-muted-foreground leading-relaxed">
                {{ t('landingpage.scalability.description') }}
              </p>
              <div class="grid grid-cols-2 gap-6">
                <div class="space-y-1.5 p-4 rounded-xl border border-border/60 bg-card">
                  <p class="text-xs font-black uppercase tracking-widest text-foreground/80">
                    {{ t('landingpage.scalability.dataIntegrity') }}
                  </p>
                  <p class="text-xs text-muted-foreground font-mono italic">
                    {{ t('landingpage.scalability.dataIntegrityDesc') }}
                  </p>
                </div>
                <div class="space-y-1.5 p-4 rounded-xl border border-border/60 bg-card">
                  <p class="text-xs font-black uppercase tracking-widest text-foreground/80">
                    {{ t('landingpage.scalability.security') }}
                  </p>
                  <p class="text-xs text-muted-foreground font-mono italic">
                    {{ t('landingpage.scalability.securityDesc') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Screenshot grid -->
            <div class="grid grid-cols-2 gap-3">
              <div class="relative h-80 rounded-2xl overflow-hidden border border-border/40 shadow-lg">
                <img :src="'/calendar.png'" alt="Agenda" class="absolute inset-0 w-full h-full object-cover object-top">
              </div>
              <div class="flex flex-col gap-3">
                <div class="relative h-[152px] rounded-2xl overflow-hidden border border-border/40 shadow-lg">
                  <img :src="'/dettagli.png'" alt="Analytics" class="absolute inset-0 w-full h-full object-cover object-top">
                </div>
                <div class="relative h-[152px] rounded-2xl overflow-hidden border border-border/40 shadow-lg">
                  <img :src="'/test.png'" alt="Test" class="absolute inset-0 w-full h-full object-cover object-top">
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── PRICING ────────────────────────────────────────────────── -->
      <section id="pricing" class="py-28 px-6 border-t border-border/40">
        <div class="container mx-auto max-w-5xl">
          <div class="text-center mb-14">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent border border-border/60 text-muted-foreground text-xs font-medium mb-5">
              <Star class="h-3 w-3" />
              {{ t('landingpage.pricing.badgeLabel') }}
            </div>
            <h2 class="text-4xl md:text-5xl font-black tracking-tight uppercase leading-tight mb-4">
              {{ t('landingpage.pricing.title') }}
              <span class="block text-muted-foreground font-light normal-case tracking-normal">{{ t('landingpage.pricing.titleSub') }}</span>
            </h2>
            <p class="text-muted-foreground max-w-xl mx-auto text-sm">
              {{ t('landingpage.pricing.subtitle') }}
            </p>
          </div>

          <div class="grid md:grid-cols-3 gap-6 items-start">

            <!-- ── BETA (active, highlighted) ── -->
            <div class="relative rounded-3xl border-2 border-indigo-500/60 bg-gradient-to-b from-indigo-500/5 to-transparent p-8 shadow-xl shadow-indigo-500/10">
              <div class="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span class="px-3 py-1 rounded-full bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                  {{ t('landingpage.pricing.betaBadge') }}
                </span>
              </div>
              <div class="mb-6">
                <p class="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2">{{ t('landingpage.pricing.betaTitle') }}</p>
                <div class="flex items-end gap-1 mb-3">
                  <span class="text-5xl font-black">{{ t('landingpage.pricing.betaPrice') }}</span>
                  <span class="text-sm text-muted-foreground mb-2">{{ t('landingpage.pricing.betaPricePer') }}</span>
                </div>
                <p class="text-sm text-muted-foreground">{{ t('landingpage.pricing.betaDesc') }}</p>
              </div>
              <ul class="space-y-3 mb-8">
                <li v-for="k in ['feature1','feature2','feature3','feature4','feature5','feature6']" :key="k" class="flex items-center gap-3 text-sm">
                  <span class="size-5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  {{ t(`landingpage.pricing.${k}`) }}
                </li>
              </ul>
              <Button
                class="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold border-0 shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
                @click="scrollToWaitlist"
              >
                {{ t('landingpage.pricing.ctaBeta') }}
              </Button>
            </div>

            <!-- ── STARTER (locked) ── -->
            <div class="relative rounded-3xl border border-border/60 bg-card p-8 overflow-hidden">
              <!-- Lock overlay -->
              <div class="absolute inset-0 backdrop-blur-[2px] bg-background/60 rounded-3xl z-10 flex flex-col items-center justify-center gap-3">
                <div class="size-12 rounded-2xl bg-accent border border-border/60 flex items-center justify-center">
                  <svg class="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                </div>
                <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {{ t('landingpage.pricing.lockedBadge') }}
                </span>
              </div>
              <!-- Background content (blurred) -->
              <div class="mb-6">
                <p class="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">{{ t('landingpage.pricing.starterTitle') }}</p>
                <div class="flex items-end gap-1 mb-3">
                  <span class="text-5xl font-black blur-md select-none pointer-events-none">{{ t('landingpage.pricing.starterPrice') }}</span>
                  <span class="text-sm text-muted-foreground mb-2 blur-sm select-none">{{ t('landingpage.pricing.starterPricePer') }}</span>
                </div>
                <p class="text-sm text-muted-foreground">{{ t('landingpage.pricing.starterDesc') }}</p>
              </div>
              <ul class="space-y-3 mb-8">
                <li v-for="k in ['feature1','feature2','feature3','feature4','feature5']" :key="k" class="flex items-center gap-3 text-sm">
                  <span class="size-5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  {{ t(`landingpage.pricing.${k}`) }}
                </li>
              </ul>
              <Button disabled class="w-full h-11 rounded-xl" variant="outline">
                {{ t('landingpage.pricing.ctaLocked') }}
              </Button>
            </div>

            <!-- ── PRO (locked) ── -->
            <div class="relative rounded-3xl border border-border/60 bg-card p-8 overflow-hidden">
              <!-- Lock overlay -->
              <div class="absolute inset-0 backdrop-blur-[2px] bg-background/60 rounded-3xl z-10 flex flex-col items-center justify-center gap-3">
                <div class="size-12 rounded-2xl bg-accent border border-border/60 flex items-center justify-center">
                  <svg class="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                </div>
                <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {{ t('landingpage.pricing.lockedBadge') }}
                </span>
              </div>
              <!-- Background content (blurred) -->
              <div class="mb-6">
                <p class="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">{{ t('landingpage.pricing.proTitle') }}</p>
                <div class="flex items-end gap-1 mb-3">
                  <span class="text-5xl font-black blur-md select-none pointer-events-none">{{ t('landingpage.pricing.proPrice') }}</span>
                  <span class="text-sm text-muted-foreground mb-2 blur-sm select-none">{{ t('landingpage.pricing.proPricePer') }}</span>
                </div>
                <p class="text-sm text-muted-foreground">{{ t('landingpage.pricing.proDesc') }}</p>
              </div>
              <ul class="space-y-3 mb-8">
                <li v-for="k in ['feature1','feature2','feature3','feature4','feature5','feature6','feature7','feature8']" :key="k" class="flex items-center gap-3 text-sm">
                  <span class="size-5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  {{ t(`landingpage.pricing.${k}`) }}
                </li>
              </ul>
              <Button disabled class="w-full h-11 rounded-xl" variant="outline">
                {{ t('landingpage.pricing.ctaLocked') }}
              </Button>
            </div>
          </div>

          <!-- Early adopter note -->
          <p class="text-center text-xs text-muted-foreground/60 mt-8 flex items-center justify-center gap-2">
            <CheckCircle2 class="h-3.5 w-3.5 text-emerald-500" />
            {{ t('landingpage.pricing.earlyAdopterNote') }}
          </p>
        </div>
      </section>

      <!-- ─── ROADMAP ───────────────────────────────────────────────────── -->
      <section id="roadmap" class="py-28 px-6 border-t border-border/40 bg-accent/[0.04]">
        <div class="container mx-auto max-w-3xl">
          <div class="text-center mb-14">
            <h2 class="text-4xl font-black tracking-tight uppercase mb-3">
              {{ t('landingpage.roadmap.title') }}
            </h2>
            <p class="text-muted-foreground text-sm">{{ t('landingpage.roadmap.subtitle') }}</p>
          </div>

          <div class="space-y-4">
            <div
              v-for="(step, i) in roadmapSteps"
              :key="i"
              class="flex items-center gap-5 p-5 rounded-2xl border border-border/60 bg-card hover:bg-accent/20 hover:border-border transition-all duration-200"
            >
              <div class="size-11 rounded-xl border border-border bg-background flex items-center justify-center shrink-0">
                <component :is="step.icon" class="size-5 text-muted-foreground" />
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-bold uppercase tracking-tight mb-0.5">{{ t(step.titleKey) }}</h4>
                <p class="text-xs text-muted-foreground font-mono">{{ t(step.dateKey) }}</p>
              </div>
              <span class="shrink-0 px-2.5 py-1 rounded-full bg-accent text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border border-border/60">
                {{ t('landingpage.roadmap.comingSoon') }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── WAITLIST ──────────────────────────────────────────────────── -->


      <!-- ─── FOOTER ────────────────────────────────────────────────────── -->
      <footer class="py-10 border-t border-border/40">
        <div class="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex items-center gap-2.5">
            <img :src="'/favicon.ico'" class="size-5 dark:invert-0 invert" alt="Logo">
            <span class="font-black text-sm uppercase italic tracking-tighter">
              Athlete<span class="text-muted-foreground font-light">Hub</span>
            </span>
          </div>

          <div class="flex items-center gap-6 text-xs text-muted-foreground">
            <NuxtLink to="/datapolicy" class="hover:text-foreground transition-colors">
              {{ t('landingpage.footer.privacy') }}
            </NuxtLink>
            <a href="mailto:athletehub.sport@gmail.com" class="hover:text-foreground transition-colors">
              {{ t('landingpage.footer.contact') }}
            </a>
            <a
              href="https://github.com/manuelenzo"
              target="_blank"
              class="hover:text-foreground transition-colors font-bold underline underline-offset-2"
            >{{ t('landingpage.footer.github') }}</a>
          </div>

          <div class="text-[11px] text-muted-foreground/50 font-mono italic">
            {{ t('landingpage.footer.version') }}
          </div>
        </div>
      </footer>
    </main>
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
