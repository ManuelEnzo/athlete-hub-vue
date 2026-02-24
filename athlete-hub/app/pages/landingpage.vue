<script setup lang="ts">
import { ref } from 'vue'
import {
  Activity, Mail, Calendar, ShieldAlert, ArrowRight,
  Zap, Watch, BrainCircuit, Smartphone, CheckCircle2, Loader2
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

definePageMeta({
  layout: 'blank'
})

const email = ref('')
const isSubmitting = ref(false)
const isSubmitted = ref(false)

// Navigazione fluida verso il modulo contatti
const scrollToWaitlist = () => {
  document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })
}

// Gestione invio mail via AJAX (FormSubmit)
async function handleFormSubmit() {
  if (!email.value) return

  isSubmitting.value = true

  try {
    const response = await fetch("https://formsubmit.co/ajax/manuelenzo2000@gmail.com", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        _subject: "Nuova richiesta accesso Athlete Hub!",
        message: `Un coach ha richiesto l'accesso alla beta con la seguente email: ${email.value}`
      })
    })

    if (response.ok) {
      isSubmitted.value = true
    } else {
      throw new Error('Errore nella risposta del server')
    }
  } catch (error) {
    console.error("Errore nell'invio:", error)
    alert("Si è verificato un errore. Riprova più tardi o scrivici direttamente.")
  } finally {
    isSubmitting.value = false
  }
}

const coreFeatures = [
  { title: 'Precisione ACWR', desc: 'Monitoraggio scientifico del rapporto tra carico acuto e cronico.', icon: Activity },
  { title: 'Feedback Loop', desc: 'Automazione totale della raccolta RPE tramite email.', icon: Mail },
  { title: 'Pianificazione', desc: 'Gestione sessioni multi-atleta con target definiti.', icon: Calendar },
  { title: 'Clinical Data', desc: 'Hub centralizzato per infortuni e protocolli Return To Play.', icon: ShieldAlert }
]
</script>

<template>
  <div class="min-h-screen bg-black text-white font-sans antialiased selection:bg-white/20">

    <nav class="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-lg">
      <div class="container mx-auto h-20 flex items-center justify-between px-6">
        <div class="flex items-center gap-3">
          <img src="/favicon.ico" alt="Logo" class="size-6 object-contain" />
          <span class="font-black tracking-tighter text-2xl uppercase italic">Athlete<span class="text-white/40 font-light">Hub</span></span>
        </div>
        <div class="flex items-center gap-6">
          <NuxtLink to="/login" class="text-sm font-medium text-white/60 hover:text-white transition">Client Log in</NuxtLink>
          <Button variant="outline" @click="scrollToWaitlist" class="border-white/20 rounded-full hover:bg-white hover:text-black transition-all px-6">
            Prenota Demo
          </Button>
        </div>
      </div>
    </nav>

    <main>
      <section class="relative pt-32 pb-40 px-6">
        <div class="container mx-auto text-center">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium mb-10">
            <span class="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
            MVP 1.0.2 Open for Early Adopters
          </div>

          <h1 class="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] mb-12 uppercase">
            DATI D'ÉLITE PER<br />
            <span class="text-white/20 italic font-light">ATLETI D'ÉLITE.</span>
          </h1>

          <p class="max-w-2xl mx-auto text-lg md:text-xl text-white/40 leading-relaxed mb-16">
            Athlete Hub trasforma la complessità della preparazione atletica in una dashboard intuitiva, sicura e scientificamente rigorosa.
          </p>

          <div class="flex flex-col sm:flex-row justify-center gap-6">
            <Button size="lg" @click="scrollToWaitlist" class="h-16 px-12 rounded-2xl bg-white text-black hover:bg-white/90 text-xl font-bold group transition-transform active:scale-95">
              Inizia come Coach <ArrowRight class="ml-2 size-6 group-hover:translate-x-1 transition" />
            </Button>
            <Button size="lg" @click="scrollToWaitlist" variant="ghost" class="h-16 px-10 text-lg text-white/60 hover:text-white">
              Esplora le Funzioni
            </Button>
          </div>
        </div>
      </section>

      <section class="py-32 border-y border-white/10 bg-gradient-to-b from-black via-white/[0.02] to-black">
        <div class="container mx-auto px-6">
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div v-for="f in coreFeatures" :key="f.title" class="group p-10 rounded-[2.5rem] border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-500">
              <div class="size-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-white group-hover:text-black transition-colors duration-500">
                <component :is="f.icon" class="size-7" />
              </div>
              <h3 class="text-2xl font-bold mb-4 tracking-tight uppercase">{{ f.title }}</h3>
              <p class="text-white/40 leading-relaxed text-sm">{{ f.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="py-40 px-6">
        <div class="container mx-auto max-w-6xl">
          <div class="grid lg:grid-cols-2 gap-24 items-center">
            <div class="space-y-10">
              <h2 class="text-5xl md:text-6xl font-black tracking-tight leading-none italic uppercase">COSTRUITO PER LA<br />SCALABILITÀ ESTREMA.</h2>
              <p class="text-xl text-white/40 leading-relaxed">
                Sfruttiamo Nuxt 3 e database crittografati per garantire che i dati dei tuoi atleti siano sempre accessibili, veloci e protetti.
              </p>
              <div class="grid grid-cols-2 gap-10 pt-6">
                <div class="space-y-2">
                  <div class="text-sm font-black uppercase tracking-widest text-white/80">Data Integrity</div>
                  <div class="text-xs text-white/30 font-mono italic">Backup orari automatizzati e sincronizzazione cloud.</div>
                </div>
                <div class="space-y-2">
                  <div class="text-sm font-black uppercase tracking-widest text-white/80">Security</div>
                  <div class="text-xs text-white/30 font-mono italic">Crittografia 256-bit per la massima privacy.</div>
                </div>
              </div>
            </div>
            <div class="relative group">
              <div class="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[3rem] blur opacity-10 group-hover:opacity-25 transition"></div>
              <div class="relative aspect-video bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center italic text-white/20 text-sm overflow-hidden">
                <div class="absolute inset-0 bg-[url('/dashboard_preview.png')] opacity-10 pointer-events-none"></div>
                <img src="/favicon.ico" class="size-10 absolute opacity-5 grayscale" />
                <span class="z-10">Dashboard Preview Mode</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-40 border-t border-white/10 bg-white/[0.01]">
        <div class="container mx-auto px-6 text-center">
          <h2 class="text-4xl font-black mb-24 tracking-tighter italic opacity-80 uppercase">Roadmap di Sviluppo</h2>
          <div class="grid md:grid-cols-3 gap-20 max-w-5xl mx-auto">
            <div class="space-y-6">
              <Watch class="size-10 text-white/20 mx-auto" />
              <h4 class="text-xl font-bold uppercase tracking-widest">Wearable Sync</h4>
              <p class="text-xs font-mono text-white/30 italic">Garmin & Apple • Q3 2026</p>
            </div>
            <div class="space-y-6 border-x border-white/5 px-4">
              <BrainCircuit class="size-10 text-white/20 mx-auto" />
              <h4 class="text-xl font-bold uppercase tracking-widest">AI Insights</h4>
              <p class="text-xs font-mono text-white/30 italic">Analisi Predittiva • Q4 2026</p>
            </div>
            <div class="space-y-6">
              <Smartphone class="size-10 text-white/20 mx-auto" />
              <h4 class="text-xl font-bold uppercase tracking-widest">Mobile App</h4>
              <p class="text-xs font-mono text-white/30 italic">Native Experience • Q1 2027</p>
            </div>
          </div>
        </div>
      </section>

      <section id="waitlist" class="py-48 px-6 bg-gradient-to-b from-black to-[#050505] border-t border-white/5">
        <div class="max-w-md mx-auto">

          <div v-if="isSubmitted" class="text-center space-y-6 py-10 animate-in fade-in zoom-in duration-500">
            <div class="size-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              <CheckCircle2 class="size-10 text-black" />
            </div>
            <div class="space-y-2">
              <h2 class="text-3xl font-black uppercase italic tracking-tight">Richiesta Ricevuta</h2>
              <p class="text-white/40 text-sm leading-relaxed">
                Grazie Coach. Il nostro team verificherà il tuo profilo e verrai ricontattato via email entro 48 ore per l'accesso prioritario.
              </p>
            </div>
            <Button @click="isSubmitted = false; email = ''" variant="ghost" class="text-white/20 hover:text-white text-[10px] uppercase tracking-widest">
              Invia un'altra mail
            </Button>
          </div>

          <div v-else>
            <div class="text-center mb-12">
              <h2 class="text-4xl font-black tracking-tight mb-4 uppercase italic">Partecipa alla Beta</h2>
              <p class="text-white/40 text-sm italic">Posti limitati per i primi 20 coach partner. Inserisci la tua mail professionale.</p>
            </div>

            <form @submit.prevent="handleFormSubmit" class="space-y-6">
              <div class="space-y-2">
                <Label class="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Email Professionale</Label>
                <Input
                  v-model="email"
                  type="email"
                  required
                  :disabled="isSubmitting"
                  placeholder="coach@team.com"
                  class="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-1 focus:ring-white/40 text-lg transition-all text-white disabled:opacity-50"
                />
              </div>

              <Button
                type="submit"
                :disabled="isSubmitting"
                class="w-full h-14 rounded-2xl bg-white text-black hover:bg-white/90 active:scale-[0.98] transition-all font-bold text-lg uppercase shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
              >
                <Loader2 v-if="isSubmitting" class="size-5 animate-spin" />
                <span>{{ isSubmitting ? 'Invio in corso...' : 'Richiedi Accesso' }}</span>
              </Button>
            </form>
          </div>
        </div>
      </section>
    </main>

    <footer class="py-20 border-t border-white/5 opacity-40">
      <div class="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-mono uppercase tracking-[0.2em]">
        <div class="flex items-center gap-3">
          <img src="/favicon.ico" class="size-4 grayscale" /> Athlete Hub
        </div>
        <div class="flex gap-10">
          <a href="#" class="hover:text-white transition">Privacy</a>
          <a href="#" class="hover:text-white transition">Stack</a>
          <a href="https://github.com/manuelenzo" target="_blank" class="hover:text-white transition">Github</a>
        </div>
        <div class="italic">v1.0.2 // Developed by Manuel Enzo</div>
      </div>
    </footer>
  </div>
</template>

<style>
/* Smooth scroll globale per la navigazione interna */
html {
  scroll-behavior: smooth;
}
</style>

<style scoped>
@media (max-width: 768px) {
  h1 { font-size: 3.5rem; line-height: 0.9; }
}
</style>