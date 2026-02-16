<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Loader2, CheckCircle2, ShieldAlert } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { authApi } from '~/api/auth'

definePageMeta({ layout: 'blank', auth: false, guestOnly: true })

const route = useRoute()
const { $pinia } = useNuxtApp()
const loadingStore = useLoadingStore($pinia)

const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isFinished = ref(false)

onMounted(() => {
  token.value = route.query.token as string
  if (!token.value) toast.error("Token non trovato. Richiedi un nuovo link.")
})

async function onResetSubmit() {
  if (newPassword.value !== confirmPassword.value) return toast.error("Le password non coincidono")

  loadingStore.start()
  try {
    const response = await authApi.resetPasswordExecution({
      token: token.value,
      newPassword: newPassword.value
    })

    if (response.data.isSuccess) {
      isFinished.value = true
      toast.success("PASSWORD AGGIORNATA")
    } else {
      toast.error(response.data.error?.message || "Errore")
    }
  } catch (err) {
    toast.error("LINK SCADUTO")
  } finally {
    loadingStore.stop()
  }
}
</script>

<template>
  <div class="min-h-svh bg-black text-white flex flex-col items-center justify-center p-6 selection:bg-primary selection:text-black">

    <div class="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

    <div class="relative w-full max-w-[400px] flex flex-col gap-12">

      <NuxtLink to="/login" class="flex flex-col items-center gap-4 group">
        <div class="h-16 w-16 flex items-center justify-center rounded-2xl bg-primary text-black shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] group-hover:rotate-[10deg] transition-all duration-500">
          <div class="i-lucide-dumbbell w-10 h-10"></div>
        </div>
        <h1 class="text-4xl font-[1000] uppercase tracking-tighter italic leading-none">
          Athlete<span class="text-primary italic">Hub</span>
        </h1>
      </NuxtLink>

      <div v-if="!isFinished" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div class="text-center">
          <h2 class="text-2xl font-black uppercase tracking-tight">Imposta nuova password</h2>
          <p class="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 italic">Il tuo nuovo accesso inizia qui</p>
        </div>

        <form @submit.prevent="onResetSubmit" class="flex flex-col gap-5">
          <div class="space-y-2">
             <label class="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Password</label>
             <Input v-model="newPassword" type="password" placeholder="••••••••" class="bg-zinc-900/50 border-zinc-800 h-14 rounded-xl focus-visible:ring-primary focus-visible:border-primary font-bold text-lg" required />
          </div>

          <div class="space-y-2">
             <label class="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Conferma</label>
             <Input v-model="confirmPassword" type="password" placeholder="••••••••" class="bg-zinc-900/50 border-zinc-800 h-14 rounded-xl focus-visible:ring-primary focus-visible:border-primary font-bold text-lg" required />
          </div>

          <Button type="submit" class="w-full h-16 bg-primary text-black font-[1000] uppercase tracking-widest text-xl hover:bg-white transition-all active:scale-95 shadow-xl shadow-primary/10 mt-4" :disabled="loadingStore.isLoading || !token">
            <Loader2 v-if="loadingStore.isLoading" class="mr-2 h-6 w-6 animate-spin" />
            RESET PASSWORD
          </Button>
        </form>

        <div v-if="!token" class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-tight">
          <ShieldAlert class="size-5 shrink-0" />
          Token mancante. Torna alla mail.
        </div>
      </div>

      <div v-else class="text-center space-y-8 bg-zinc-900/30 p-10 rounded-3xl border border-zinc-800 animate-in zoom-in-95 duration-500">
        <div class="relative inline-block">
          <div class="absolute inset-0 bg-primary blur-3xl opacity-20 animate-pulse"></div>
          <CheckCircle2 class="h-24 w-24 text-primary relative z-10 mx-auto" />
        </div>
        <div class="space-y-2">
          <h2 class="text-3xl font-[1000] uppercase tracking-tighter">Fatto!</h2>
          <p class="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Credenziali aggiornate con successo</p>
        </div>
        <Button class="w-full h-14 bg-white text-black font-black uppercase tracking-widest hover:bg-primary" @click="navigateTo('/login')">
          Accedi Ora
        </Button>
      </div>

    </div>
  </div>
</template>