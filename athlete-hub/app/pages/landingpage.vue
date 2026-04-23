<script setup lang="ts">
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  Loader2,
  Mail,
  Moon,
  ShieldAlert,
  Smartphone,
  Sun,
  Watch,
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

// // Page-level SEO
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

// useHead({
//   link: [{ rel: 'canonical', href: siteUrl }],
//   script: [
//     {
//       type: 'application/ld+json',
//       innerHTML: JSON.stringify({
//         '@context': 'https://schema.org',
//         '@type': 'SoftwareApplication',
//         'name': 'Athlete Hub',
//         'description': 'Professional sports performance monitoring platform for coaches and sport scientists.',
//         'url': siteUrl,
//         'applicationCategory': 'SportsApplication',
//         'operatingSystem': 'Web',
//         'offers': {
//           '@type': 'Offer',
//           'price': '0',
//           'priceCurrency': 'EUR',
//         },
//         'author': {
//           '@type': 'Person',
//           'name': 'Manuel Enzo',
//           'email': 'athletehub.sport@gmail.com',
//         },
//       }),
//     },
//   ],
// })

// // Gestione Tema (Nuxt Color Mode)
// const colorMode = useColorMode()
// function toggleTheme() {
//   colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
// }

// // Form waitlist
// const email = ref('')
// const isSubmitting = ref(false)
// const isSubmitted = ref(false)

// function scrollToWaitlist() {
//   document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })
// }

// async function handleFormSubmit() {
//   const emailValue = String(email.value || '').trim()
//   const emailRegex = /^\S[^\s@]*@\S[^\s.]*\.\S+$/
//   if (!emailValue || !emailRegex.test(emailValue)) {
//     handler.handleError(new Error(t('landingpage.waitlist.invalidEmail')))
//     return
//   }

//   isSubmitting.value = true
//   try {
//     const endpoint = config.formEndpoint || 'https://formsubmit.co/ajax/athletehub.sport@gmail.com'
//     const response = await fetch(endpoint, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
//       body: JSON.stringify({ email: emailValue }),
//     })

//     if (response.ok) {
//       isSubmitted.value = true
//     }
//     else {
//       throw new Error(t('landingpage.alerts.serverError'))
//     }
//   }
//   catch (err: any) {
//     handler.handleError(err instanceof Error ? err : new Error(String(err)))
//   }
//   finally {
//     isSubmitting.value = false
//   }
// }

// // Features dinamiche
// const coreFeatures = [
//   { titleKey: 'landingpage.features.precisioneACWR', descKey: 'landingpage.features.descPrecisioneACWR', icon: Activity },
//   { titleKey: 'landingpage.features.feedbackLoop', descKey: 'landingpage.features.descFeedbackLoop', icon: Mail },
//   { titleKey: 'landingpage.features.pianificazione', descKey: 'landingpage.features.descPianificazione', icon: Calendar },
//   { titleKey: 'landingpage.features.clinicalData', descKey: 'landingpage.features.descClinicalData', icon: ShieldAlert },
// ]

// // Roadmap dinamica
// const roadmapSteps = [
//   { icon: Watch, titleKey: 'landingpage.roadmap.steps.0.title', dateKey: 'landingpage.roadmap.steps.0.date' },
//   { icon: BrainCircuit, titleKey: 'landingpage.roadmap.steps.1.title', dateKey: 'landingpage.roadmap.steps.1.date' },
//   { icon: Smartphone, titleKey: 'landingpage.roadmap.steps.2.title', dateKey: 'landingpage.roadmap.steps.2.date' },
// ]
</script>

<template>
<p>Ciao</p>
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
