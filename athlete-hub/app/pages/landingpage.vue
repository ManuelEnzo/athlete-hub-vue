<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Activity, Mail, Calendar, ShieldAlert, ArrowRight,
  Zap, Watch, BrainCircuit, Smartphone, CheckCircle2, Loader2,
  Sun, Moon
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

definePageMeta({
  layout: 'blank',
  auth: false,
  guestOnly: false
})

const { t } = useI18n({ useScope: 'global' })

// Gestione Tema (Nuxt Color Mode)
const colorMode = useColorMode()
const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Form waitlist
const email = ref('')
const isSubmitting = ref(false)
const isSubmitted = ref(false)

const scrollToWaitlist = () => {
  document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })
}

async function handleFormSubmit() {
  if (!email.value) return
  isSubmitting.value = true
  try {
    const response = await fetch("https://formsubmit.co/ajax/athletehub.sport@gmail.com", {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        _subject: "Nuova richiesta accesso Athlete Hub!",
        message: `Un coach ha richiesto l'accesso alla beta con la seguente email: ${email.value}`
      })
    })
    if (response.ok) { isSubmitted.value = true }
    else { throw new Error(t('landingpage.alerts.serverError')) }
  } catch {
    alert(t('landingpage.alerts.serverError'))
  } finally {
    isSubmitting.value = false
  }
}

// Features dinamiche
const coreFeatures = [
  { titleKey: 'landingpage.features.precisioneACWR', descKey: 'landingpage.features.descPrecisioneACWR', icon: Activity },
  { titleKey: 'landingpage.features.feedbackLoop', descKey: 'landingpage.features.descFeedbackLoop', icon: Mail },
  { titleKey: 'landingpage.features.pianificazione', descKey: 'landingpage.features.descPianificazione', icon: Calendar },
  { titleKey: 'landingpage.features.clinicalData', descKey: 'landingpage.features.descClinicalData', icon: ShieldAlert }
]

// Roadmap dinamica
const roadmapSteps = [
  { icon: Watch, titleKey: 'landingpage.roadmap.steps.0.title', dateKey: 'landingpage.roadmap.steps.0.date' },
  { icon: BrainCircuit, titleKey: 'landingpage.roadmap.steps.1.title', dateKey: 'landingpage.roadmap.steps.1.date' },
  { icon: Smartphone, titleKey: 'landingpage.roadmap.steps.2.title', dateKey: 'landingpage.roadmap.steps.2.date' }
]
</script>

<template>
  <div
    class="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20 transition-colors duration-300">

    <!-- NAVBAR -->
    <nav class="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div class="container mx-auto px-6 md:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-4 min-w-0">
          <img src="/favicon.ico" alt="Logo" class="h-10 w-10 object-contain dark:invert-0 invert" />
          <span class="font-black tracking-tighter text-2xl md:text-3xl uppercase italic min-w-0 truncate">
            Athlete<span class="text-muted-foreground font-light">Hub</span>
          </span>
        </div>
        <div class="flex items-center gap-4 sm:gap-6 flex-shrink-0">
          <Button variant="ghost" size="icon" @click="toggleTheme" class="rounded-full">
            <Sun v-if="colorMode.value === 'dark'" class="h-5 w-5" />
            <Moon v-else class="h-5 w-5" />
          </Button>

          <NuxtLink to="/login"
            class="text-sm md:text-base font-medium text-muted-foreground hover:text-foreground transition">
            {{ t('landingpage.navbar.clientLogin') }}
          </NuxtLink>
          <Button variant="outline" @click="scrollToWaitlist"
            class="border-border rounded-full hover:bg-foreground hover:text-background transition-all px-6 sm:px-8 py-2 font-bold">
            {{ t('landingpage.navbar.demo') }}
          </Button>
        </div>
      </div>
    </nav>

    <!-- HERO -->
    <main>
      <section class="relative pt-32 pb-40 px-6 overflow-hidden">
        <div class="container mx-auto text-center relative z-10">
          <div
            class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent border border-border text-muted-foreground text-xs font-medium mb-10">
            <span class="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {{ t('landingpage.hero.subtitle') }}
          </div>

          <h1
            class="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-tight mb-8 md:mb-12 uppercase">
            {{ t('landingpage.hero.title') }}
          </h1>

          <p class="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed mb-16">
            {{ t('landingpage.hero.description') }}
          </p>

          <div class="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-xl mx-auto px-4">
            <Button size="lg" @click="scrollToWaitlist"
              class="w-full sm:w-auto h-14 sm:h-16 px-6 sm:px-12 rounded-2xl bg-foreground text-background hover:opacity-90 text-lg md:text-xl font-bold group transition-transform active:scale-95">
              <span>{{ t('landingpage.hero.ctaStart') }}</span>
              <ArrowRight class="ml-2 size-5 md:size-6 group-hover:translate-x-1 transition inline-block" />
            </Button>
            <Button size="lg" @click="scrollToWaitlist" variant="ghost"
              class="w-full sm:w-auto h-14 sm:h-16 px-6 sm:px-10 text-lg text-muted-foreground hover:text-foreground font-semibold">
              {{ t('landingpage.hero.ctaExplore') }}
            </Button>
          </div>
        </div>
        <div
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10">
        </div>
      </section>

      <!-- PREVIEW IMAGES -->
      <!-- PREVIEW IMAGES -->
      <section class="py-32 px-6 bg-background/50">
        <div class="container mx-auto text-center">
          <h2 class="text-4xl md:text-5xl font-black tracking-tight mb-16 uppercase italic">
            {{ t('landingpage.preview.title') }}
          </h2>

          <div class="grid md:grid-cols-3 gap-10">
            <!-- Calendar -->
            <div
              class="group relative overflow-hidden rounded-3xl shadow-2xl cursor-pointer transform transition-all duration-500 hover:scale-105">
              <img src="/calendar.png" alt="Calendar Preview"
                class="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-110" />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
                <span class="text-white font-bold text-lg uppercase drop-shadow-lg">
                  {{ t('landingpage.preview.calendar') }}
                </span>
              </div>
            </div>

            <!-- Details -->
            <div
              class="group relative overflow-hidden rounded-3xl shadow-2xl cursor-pointer transform transition-all duration-500 hover:scale-105">
               <img src="/dettagli.png" alt="Calendar Preview"
                class="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-110" />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
                <span class="text-white font-bold text-lg uppercase drop-shadow-lg">
                  {{ t('landingpage.preview.details') }}
                </span>
              </div>
            </div>

            <!-- Test -->
            <div
              class="group relative overflow-hidden rounded-3xl shadow-2xl cursor-pointer transform transition-all duration-500 hover:scale-105">
              <img src="/test.png" alt="Test Preview"
                class="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-110" />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
                <span class="text-white font-bold text-lg uppercase drop-shadow-lg">
                  {{ t('landingpage.preview.test') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURES -->
      <section class="py-32 border-y border-border bg-accent/30">
        <div class="container mx-auto px-6">
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div v-for="f in coreFeatures" :key="f.titleKey"
              class="group p-10 rounded-[2.5rem] border border-border bg-card hover:bg-accent transition-all duration-500 shadow-sm">
              <div
                class="size-14 rounded-2xl bg-accent flex items-center justify-center mb-8 group-hover:bg-foreground group-hover:text-background transition-colors duration-500">
                <component :is="f.icon" class="size-7" />
              </div>
              <h3 class="text-2xl font-bold mb-4 tracking-tight uppercase">{{ t(f.titleKey) }}</h3>
              <p class="text-muted-foreground leading-relaxed text-sm">{{ t(f.descKey) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- SCALABILITY -->
      <section class="py-40 px-6">
        <div class="container mx-auto max-w-6xl">
          <div class="grid lg:grid-cols-2 gap-24 items-center">
            <div class="space-y-10">
              <h2 class="text-5xl md:text-6xl font-black tracking-tight leading-none italic uppercase">{{
                t('landingpage.scalability.title') }}</h2>
              <p class="text-xl text-muted-foreground leading-relaxed">{{ t('landingpage.scalability.description') }}
              </p>
              <div class="grid grid-cols-2 gap-10 pt-6">
                <div class="space-y-2">
                  <div class="text-sm font-black uppercase tracking-widest text-foreground/80">{{
                    t('landingpage.scalability.dataIntegrity') }}</div>
                  <div class="text-xs text-muted-foreground font-mono italic">{{
                    t('landingpage.scalability.dataIntegrityDesc') }}</div>
                </div>
                <div class="space-y-2">
                  <div class="text-sm font-black uppercase tracking-widest text-foreground/80">{{
                    t('landingpage.scalability.security') }}</div>
                  <div class="text-xs text-muted-foreground font-mono italic">{{
                    t('landingpage.scalability.securityDesc') }}</div>
                </div>
              </div>
            </div>

            <div class="relative group">
              <div
                class="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition">
              </div>
              <div
                class="relative aspect-video bg-accent border border-border rounded-[2.5rem] flex items-center justify-center italic text-muted-foreground/40 text-sm overflow-hidden">
                <div
                  class="absolute inset-0 bg-[url('/dashboard_preview.png')] opacity-10 dark:opacity-5 pointer-events-none">
                </div>
                <img src="/favicon.ico" class="size-10 absolute opacity-10 grayscale" />
                <span class="z-10 font-bold uppercase tracking-widest">{{ t('landingpage.dashboard.preview') }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ROADMAP -->
      <section class="py-40 border-t border-border bg-accent/10">
        <div class="container mx-auto px-6 text-center">
          <h2 class="text-4xl font-black mb-24 tracking-tighter italic opacity-80 uppercase">{{
            t('landingpage.roadmap.title') }}</h2>
          <div class="grid md:grid-cols-3 gap-20 max-w-5xl mx-auto">
            <div v-for="(step, i) in roadmapSteps" :key="i" class="space-y-6">
              <component :is="step.icon" class="size-10 text-muted-foreground/40 mx-auto" />
              <h4 class="text-xl font-bold uppercase tracking-widest">{{ t(step.titleKey) }}</h4>
              <p class="text-xs font-mono text-muted-foreground italic">{{ t(step.dateKey) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- WAITLIST FORM -->
      <section id="waitlist" class="py-48 px-6 bg-background border-t border-border">
        <div class="max-w-md mx-auto">
          <div v-if="isSubmitted" class="text-center space-y-6 py-10 animate-in fade-in zoom-in duration-500">
            <div
              class="size-20 bg-foreground text-background rounded-3xl flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 class="size-10" />
            </div>
            <div class="space-y-2">
              <h2 class="text-3xl font-black uppercase italic tracking-tight">{{ t('landingpage.waitlist.successTitle')
              }}</h2>
              <p class="text-muted-foreground text-sm leading-relaxed">{{ t('landingpage.waitlist.successMessage') }}
              </p>
            </div>
            <Button @click="isSubmitted = false; email = ''" variant="ghost"
              class="text-muted-foreground hover:text-foreground text-[10px] uppercase tracking-widest">
              {{ t('landingpage.waitlist.sendAgain') }}
            </Button>
          </div>

          <div v-else>
            <div class="text-center mb-12">
              <h2 class="text-4xl font-black tracking-tight mb-4 uppercase italic">{{ t('landingpage.waitlist.title') }}
              </h2>
              <p class="text-muted-foreground text-sm italic">{{ t('landingpage.waitlist.subtitle') }}</p>
            </div>

            <form @submit.prevent="handleFormSubmit" class="space-y-6">
              <div class="space-y-2">
                <Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{{
                  t('landingpage.waitlist.emailLabel') }}</Label>
                <Input v-model="email" type="email" required :disabled="isSubmitting" placeholder="coach@team.com"
                  class="h-14 bg-accent border-border rounded-2xl focus:ring-2 focus:ring-primary/50 text-lg transition-all" />
              </div>
              <Button type="submit" :disabled="isSubmitting"
                class="w-full h-14 rounded-2xl bg-foreground text-background hover:opacity-90 active:scale-[0.98] transition-all font-bold text-lg uppercase shadow-lg flex items-center justify-center gap-3">
                <Loader2 v-if="isSubmitting" class="size-5 animate-spin" />
                <span>{{ isSubmitting ? t('landingpage.waitlist.submitting') : t('landingpage.waitlist.submitButton')
                }}</span>
              </Button>
            </form>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="py-20 border-t border-border bg-accent/20">
        <div
          class="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-mono uppercase tracking-[0.2em] opacity-60">
          <div class="flex items-center gap-3">
            <img src="/favicon.ico" class="size-4 dark:invert-0 invert" /> {{ t('landingpage.footer.athleteHub') }}
          </div>
          <div class="flex gap-10">
            <NuxtLink to="/datapolicy" class="hover:text-foreground transition">{{ t('landingpage.footer.privacy') }}
            </NuxtLink>
            <a href="https://github.com/manuelenzo" target="_blank"
              class="hover:text-foreground transition font-bold underline">{{ t('landingpage.footer.github') }}</a>
          </div>
          <div class="italic">{{ t('landingpage.footer.version') }}</div>
        </div>
      </footer>
    </main>
  </div>
</template>

<style>
html {
  scroll-behavior: smooth;
}

/* Transizione fluida per il cambio tema */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>