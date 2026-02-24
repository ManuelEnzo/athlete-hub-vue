<script setup lang="ts">
import { ref } from 'vue'
import { Activity, Mail, Calendar, ShieldAlert, ArrowRight, Watch, BrainCircuit, Smartphone } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

definePageMeta({
  layout: 'blank',
  auth: false,
  guestOnly: true
})

// Imposta l'icona anche nel browser per questa pagina
useHead({
  title: 'Athlete Hub - MVP',
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
})

const email = ref('')

const coreFeatures = [
  { title: 'Precisione ACWR', desc: 'Monitoraggio scientifico del carico acuto/cronico.', icon: Activity },
  { title: 'Feedback Loop', desc: 'Raccolta RPE automatizzata via email.', icon: Mail },
  { title: 'Pianificazione', desc: 'Gestione sessioni e target di intensità.', icon: Calendar },
  { title: 'Clinical Data', desc: 'Hub per infortuni e protocolli di rientro.', icon: ShieldAlert }
]
</script>

<template>
  <div class="min-h-screen bg-background text-foreground font-sans antialiased">

    <nav class="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div class="container mx-auto h-16 flex items-center justify-between px-6">
        <div class="flex items-center gap-3">
          <img src="/favicon.ico" alt="Logo" class="size-6 object-contain" />
          <span class="font-bold tracking-tight text-lg uppercase">Athlete<span class="text-muted-foreground font-medium">Hub</span></span>
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink to="/login">
            <Button variant="ghost" size="sm" class="text-muted-foreground hover:text-foreground">Login</Button>
          </NuxtLink>
          <Button size="sm" class="px-5 shadow-sm">Demo</Button>
        </div>
      </div>
    </nav>

    <main>
      <section class="py-24 lg:py-32 px-6">
        <div class="container mx-auto text-center max-w-4xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-10">
            <span class="size-1.5 rounded-full bg-primary"></span>
            MVP Access • Open for Early Adopters
          </div>

          <h1 class="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
            Gestione atletica professionale,<br />
            <span class="text-muted-foreground font-normal italic">senza attrito.</span>
          </h1>

          <p class="max-w-xl mx-auto text-lg text-muted-foreground mb-12">
            Trasforma la complessità della preparazione in una dashboard intuitiva. Monitora il carico di lavoro e previeni infortuni con precisione scientifica.
          </p>

          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" class="h-12 px-8 font-semibold group">
              Richiedi Accesso <ArrowRight class="ml-2 size-4 group-hover:translate-x-1 transition" />
            </Button>
            <Button size="lg" variant="outline" class="h-12 px-8">
              Documentazione
            </Button>
          </div>
        </div>
      </section>

      <section class="py-24 border-y bg-muted/30">
        <div class="container mx-auto px-6 max-w-6xl">
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="f in coreFeatures" :key="f.title" class="p-8 rounded-xl border bg-card text-card-foreground shadow-sm hover:border-primary/40 transition-all duration-300">
              <component :is="f.icon" class="size-6 text-primary mb-6" />
              <h3 class="font-bold text-lg mb-2 tracking-tight">{{ f.title }}</h3>
              <p class="text-sm text-muted-foreground leading-relaxed">{{ f.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="py-32 px-6">
        <div class="container mx-auto max-w-5xl">
          <div class="grid lg:grid-cols-2 gap-20 items-center">
            <div class="space-y-8">
              <h2 class="text-3xl md:text-4xl font-bold tracking-tight italic">Architettura sicura per dati sensibili.</h2>
              <p class="text-muted-foreground leading-relaxed">
                Utilizziamo database crittografati e logica Nuxt 3 per garantire che i dati medici e biometrici dei tuoi atleti siano protetti secondo gli standard GDPR.
              </p>
              <div class="grid grid-cols-2 gap-8 pt-4">
                <div class="space-y-1">
                  <div class="text-[10px] font-bold uppercase tracking-widest text-primary">Data Integrity</div>
                  <div class="text-sm text-muted-foreground">Backup automatici ogni 24h.</div>
                </div>
                <div class="space-y-1">
                  <div class="text-[10px] font-bold uppercase tracking-widest text-primary">Security</div>
                  <div class="text-sm text-muted-foreground">Crittografia 256-bit end-to-end.</div>
                </div>
              </div>
            </div>
            <div class="rounded-2xl border bg-muted/50 aspect-video flex flex-col items-center justify-center p-8 gap-4 shadow-inner">
               <img src="/favicon.ico" alt="Brand Icon" class="size-12 opacity-20 grayscale" />
               <div class="text-muted-foreground/30 font-mono text-xs uppercase tracking-[0.3em]">Dashboard Preview</div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-24 border-t bg-muted/10">
        <div class="container mx-auto px-6 text-center max-w-4xl">
          <h2 class="text-2xl font-bold mb-16 tracking-tight italic opacity-80 uppercase">Roadmap di Sviluppo</h2>
          <div class="grid md:grid-cols-3 gap-12">
            <div class="space-y-4">
              <Watch class="size-6 text-muted-foreground mx-auto" />
              <h4 class="text-sm font-bold uppercase tracking-widest">Wearable Sync</h4>
              <p class="text-[10px] text-muted-foreground uppercase tracking-widest">Q3 2026</p>
            </div>
            <div class="space-y-4 border-x border-muted px-4">
              <BrainCircuit class="size-6 text-muted-foreground mx-auto" />
              <h4 class="text-sm font-bold uppercase tracking-widest">AI Insights</h4>
              <p class="text-[10px] text-muted-foreground uppercase tracking-widest">Q4 2026</p>
            </div>
            <div class="space-y-4">
              <Smartphone class="size-6 text-muted-foreground mx-auto" />
              <h4 class="text-sm font-bold uppercase tracking-widest">Mobile App</h4>
              <p class="text-[10px] text-muted-foreground uppercase tracking-widest">Q1 2027</p>
            </div>
          </div>
        </div>
      </section>

      <section class="py-32 px-6">
        <div class="max-w-sm mx-auto grid gap-6">
          <div class="grid gap-2 text-center">
            <h2 class="text-2xl font-semibold tracking-tight">Partecipa alla Beta</h2>
            <p class="text-sm text-muted-foreground text-balance">
              Sei un coach? Unisciti ai primi tester dell'MVP.
            </p>
          </div>

          <form class="grid gap-4" @submit.prevent="">
            <div class="grid gap-2">
              <Label for="email">Email Professionale</Label>
              <Input id="email" v-model="email" type="email" placeholder="name@team.com" />
            </div>
            <Button type="submit" class="w-full">
              Richiedi Accesso
            </Button>
          </form>

          <p class="text-center text-xs text-muted-foreground underline underline-offset-4">
            <NuxtLink to="/register">Crea un account partner</NuxtLink>
          </p>
        </div>
      </section>
    </main>

    <footer class="py-12 border-t text-center">
      <div class="container mx-auto px-6 flex flex-col items-center gap-4">
        <img src="/favicon.ico" alt="Logo" class="size-4 opacity-50 grayscale hover:grayscale-0 transition-all" />
        <div class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
          © 2026 Athlete Hub // Manuel Enzo // Built with Nuxt 3
        </div>
      </div>
    </footer>
  </div>
</template>