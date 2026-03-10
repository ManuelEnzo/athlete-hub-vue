<script setup lang="ts">
definePageMeta({
  layout: 'blank',
  auth: false
})
import { useI18n } from 'vue-i18n'
import { Shield, Lock, Key, AlertCircle } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
const { t } = useI18n()

</script>

<template>
  <div class="w-full min-h-screen">
    <!-- Header -->
    <div class="bg-gradient-to-r from-primary/5 to-transparent border-b border-primary/10 px-4 md:px-6 py-6 md:py-8">
      <div class="flex flex-col md:flex-row md:justify-between gap-3 md:gap-0 items-start">
        <div>
          <h1 class="text-2xl md:text-4xl font-bold tracking-tight mb-1 md:mb-2">{{ t('dataPolicy.title') }}</h1>
          <p class="text-muted-foreground text-xs md:text-sm font-medium">{{ t('dataPolicy.privacyMatters') }}</p>
        </div>
        <NuxtLink to="/landingpage" class="mt-2 md:mt-0 inline-flex items-center gap-2 text-primary hover:opacity-80 transition text-sm font-semibold">
          <Icon name="lucide:arrow-left" class="w-4 h-4" />
          {{ t('dataPolicy.backHome') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Main Content -->
    <main class="px-4 md:px-6 py-8 space-y-8 max-w-6xl mx-auto">
      <!-- Introduzione -->
      <section class="mb-12">
        <div class="bg-slate-800/50 border border-slate-700 rounded-lg p-8 mb-8">
          <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
            <Icon name="lucide:shield" class="w-6 h-6 text-blue-400" />
            {{ t('dataPolicy.privacyMatters') }}
          </h2>
          <p class="text-slate-300 mb-4">
            {{ t('dataPolicy.introduction') }}
          </p>
          <p class="text-slate-400 text-sm">
            <strong>{{ t('dataPolicy.lastUpdated') }}:</strong> {{ new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' }) }}
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-4 mb-8">
          <div class="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <Icon name="lucide:lock" class="w-5 h-5 text-green-400" />
              <span class="font-semibold">{{ t('dataPolicy.encryption') }}</span>
            </div>
            <p class="text-sm text-slate-400">{{ t('dataPolicy.encryptionDesc') }}</p>
          </div>
          <div class="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <Icon name="lucide:key" class="w-5 h-5 text-blue-400" />
              <span class="font-semibold">{{ t('dataPolicy.jwtSecure') }}</span>
            </div>
            <p class="text-sm text-slate-400">{{ t('dataPolicy.jwtSecureDesc') }}</p>
          </div>
          <div class="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <Icon name="lucide:check-circle" class="w-5 h-5 text-purple-400" />
              <span class="font-semibold">{{ t('dataPolicy.gdprCompliance') }}</span>
            </div>
            <p class="text-sm text-slate-400">{{ t('dataPolicy.gdprComplianceDesc') }}</p>
          </div>
        </div>
      </section>

      <!-- 1. Titolare del Trattamento -->
      <section class="mb-12">
        <h3 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <span class="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-sm font-bold">1</span>
          {{ t('dataPolicy.dataController') }}
        </h3>
        <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-6 space-y-3">
          <p><strong>{{ t('dataPolicy.companyName') }}:</strong> Athlete Hub</p>
          <p><strong>{{ t('dataPolicy.privacyEmail') }}:</strong> <a href="mailto:manuelenzo2000@gmail.com" class="text-blue-400 hover:underline">manuelenzo2000@gmail.com</a></p>
          <p><strong>{{ t('dataPolicy.dpoTitle') }}:</strong> Data Protection Officer</p>
          <p class="text-slate-400 text-sm mt-4">{{ t('dataPolicy.contactDpo') }}</p>
        </div>
      </section>

      <!-- 2. Dati Raccolti -->
      <section class="mb-12">
        <h3 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <span class="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-sm font-bold">2</span>
          {{ t('dataPolicy.dataCollected') }}
        </h3>

        <div class="space-y-4">
          <!-- Dati di Autenticazione -->
          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
            <h4 class="font-semibold text-lg mb-3 flex items-center gap-2">
              <Icon name="lucide:user" class="w-5 h-5 text-green-400" />
              {{ t('dataPolicy.authentication') }}
            </h4>
            <ul class="space-y-2 text-slate-300">
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.email') }}:</strong> {{ t('dataPolicy.emailDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.password') }}:</strong> {{ t('dataPolicy.passwordDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.phone') }}:</strong> {{ t('dataPolicy.phoneDesc') }}</span>
              </li>
            </ul>
            <p class="text-slate-400 text-sm mt-3 bg-blue-900/20 border border-blue-700/30 rounded p-2">
              💡 <strong>{{ t('dataPolicy.authDesc') }}</strong>
            </p>
          </div>

          <!-- Dati Personali -->
          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
            <h4 class="font-semibold text-lg mb-3 flex items-center gap-2">
              <Icon name="lucide:user-circle" class="w-5 h-5 text-purple-400" />
              {{ t('dataPolicy.personalData') }}
            </h4>
            <ul class="space-y-2 text-slate-300">
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.fullName') }}:</strong> {{ t('dataPolicy.fullNameDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.dateOfBirth') }}:</strong> {{ t('dataPolicy.dateOfBirthDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.gender') }}:</strong> {{ t('dataPolicy.genderDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.sportTeam') }}:</strong> {{ t('dataPolicy.sportTeamDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.avatar') }}:</strong> {{ t('dataPolicy.avatarDesc') }}</span>
              </li>
            </ul>
            <p class="text-slate-400 text-sm mt-3 bg-blue-900/20 border border-blue-700/30 rounded p-2">
              💡 <strong>{{ t('dataPolicy.personalDataDesc') }}</strong>
            </p>
          </div>

          <!-- Dati Sanitari -->
          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
            <h4 class="font-semibold text-lg mb-3 flex items-center gap-2">
              <Icon name="lucide:heart" class="w-5 h-5 text-red-400" />
              {{ t('dataPolicy.healthData') }}
            </h4>
            <p class="text-slate-400 text-sm mb-3">
              ⚠️ <strong>{{ t('dataPolicy.healthWarning') }}:</strong> {{ t('dataPolicy.healthDataDesc') }}
            </p>
            <ul class="space-y-2 text-slate-300">
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.rpe') }}:</strong> {{ t('dataPolicy.rpeDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.athleticTests') }}:</strong> {{ t('dataPolicy.athleticTestsDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.bodyMeasures') }}:</strong> {{ t('dataPolicy.bodyMeasuresDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.injuryData') }}:</strong> {{ t('dataPolicy.injuryDataDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.healthStatus') }}:</strong> {{ t('dataPolicy.healthStatusDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.trainingSchedule') }}:</strong> {{ t('dataPolicy.trainingScheduleDesc') }}</span>
              </li>
            </ul>
            <p class="text-slate-400 text-sm mt-3 bg-red-900/20 border border-red-700/30 rounded p-2">
              💡 <strong>{{ t('dataPolicy.specialConsent') }}</strong>
            </p>
          </div>

          <!-- Dati di Utilizzo -->
          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
            <h4 class="font-semibold text-lg mb-3 flex items-center gap-2">
              <Icon name="lucide:activity" class="w-5 h-5 text-yellow-400" />
              {{ t('dataPolicy.usageData') }}
            </h4>
            <ul class="space-y-2 text-slate-300">
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.ipAddress') }}:</strong> {{ t('dataPolicy.ipAddressDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.userAgent') }}:</strong> {{ t('dataPolicy.userAgentDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.timestamp') }}:</strong> {{ t('dataPolicy.timestampDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.pagesVisited') }}:</strong> {{ t('dataPolicy.pagesVisitedDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.actionsPerformed') }}:</strong> {{ t('dataPolicy.actionsPerformedDesc') }}</span>
              </li>
            </ul>
            <p class="text-slate-400 text-sm mt-3 bg-blue-900/20 border border-blue-700/30 rounded p-2">
              💡 <strong>{{ t('dataPolicy.usageDataDesc') }}</strong>
            </p>
          </div>
        </div>
      </section>

      <!-- 3. Autenticazione JWT -->
      <section class="mb-12">
        <h3 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <span class="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-sm font-bold">3</span>
          {{ t('dataPolicy.authenticationTitle') }}
        </h3>

        <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-6 mb-6">
          <p class="text-slate-300 mb-4">
            <strong>JWT (JSON Web Token)</strong> {{ t('dataPolicy.jwtExplanation') }}
          </p>

          <div class="bg-slate-900/50 rounded-lg p-4 mb-4 border border-slate-600">
            <p class="font-mono text-sm text-slate-200 break-all">
              eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkF0aGxldGEiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxw...
            </p>
            <p class="text-xs text-slate-400 mt-2">Esempio di JWT (ridotto per brevità)</p>
          </div>

          <h4 class="font-semibold mb-3">{{ t('dataPolicy.loginProcess') }}:</h4>
          <ol class="space-y-3 text-slate-300">
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">1</span>
              <span><strong>{{ t('dataPolicy.step1') }}:</strong> {{ t('dataPolicy.step1Desc') }}</span>
            </li>
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">2</span>
              <span><strong>{{ t('dataPolicy.step2') }}:</strong> {{ t('dataPolicy.step2Desc') }}</span>
            </li>
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">3</span>
              <span><strong>{{ t('dataPolicy.step3') }}:</strong> {{ t('dataPolicy.step3Desc') }}</span>
            </li>
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">4</span>
              <span><strong>{{ t('dataPolicy.step4') }}:</strong> {{ t('dataPolicy.step4Desc') }}</span>
            </li>
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">5</span>
              <span><strong>{{ t('dataPolicy.step5') }}:</strong> {{ t('dataPolicy.step5Desc') }}</span>
            </li>
          </ol>
        </div>

        <h4 class="font-semibold mb-3 text-lg">{{ t('dataPolicy.accessToken') }} & {{ t('dataPolicy.refreshToken') }}:</h4>
        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <h5 class="font-semibold text-green-400 mb-2">{{ t('dataPolicy.accessToken') }}</h5>
            <ul class="text-sm text-slate-300 space-y-1">
              <li>⏱️ <strong>{{ t('dataPolicy.accessTokenExpiry') }}</strong></li>
              <li>🔐 <strong>{{ t('dataPolicy.accessTokenUsage') }}</strong></li>
              <li>📝 <strong>{{ t('dataPolicy.accessTokenContains') }}</strong></li>
              <li>🔒 <strong>{{ t('dataPolicy.accessTokenPlacement') }}</strong></li>
            </ul>
          </div>
          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <h5 class="font-semibold text-purple-400 mb-2">{{ t('dataPolicy.refreshToken') }}</h5>
            <ul class="text-sm text-slate-300 space-y-1">
              <li>⏱️ <strong>{{ t('dataPolicy.refreshTokenExpiry') }}</strong></li>
              <li>🔄 <strong>{{ t('dataPolicy.refreshTokenUsage') }}</strong></li>
              <li>📝 <strong>{{ t('dataPolicy.refreshTokenContains') }}</strong></li>
              <li>🔒 <strong>{{ t('dataPolicy.refreshTokenPlacement') }}</strong></li>
            </ul>
          </div>
        </div>

        <p class="text-slate-400 text-sm mt-4 bg-blue-900/20 border border-blue-700/30 rounded p-3">
          💡 <strong>{{ t('dataPolicy.jwtBenefits') }}:</strong> {{ t('dataPolicy.jwtBenefitsDesc') }}
        </p>
      </section>

      <!-- 4. Come Usiamo i Dati -->
      <section class="mb-12">
        <h3 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <span class="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-sm font-bold">4</span>
          {{ t('dataPolicy.dataUsage') }}
        </h3>

        <div class="space-y-4">
          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <h4 class="font-semibold text-green-400 mb-2 flex items-center gap-2">
              <Icon name="lucide:check-circle" class="w-4 h-4" />
              {{ t('dataPolicy.serviceDelivery') }}
            </h4>
            <p class="text-slate-300 text-sm">
              {{ t('dataPolicy.serviceDeliveryDesc') }}
            </p>
          </div>

          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <h4 class="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Icon name="lucide:bar-chart-2" class="w-4 h-4" />
              {{ t('dataPolicy.analyticsTitle') }}
            </h4>
            <p class="text-slate-300 text-sm">
              {{ t('dataPolicy.analyticsDesc') }}
            </p>
          </div>

          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <h4 class="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <Icon name="lucide:shield-alert" class="w-4 h-4" />
              {{ t('dataPolicy.securityTitle') }}
            </h4>
            <p class="text-slate-300 text-sm">
              {{ t('dataPolicy.securityDesc') }}
            </p>
          </div>

          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <h4 class="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <Icon name="lucide:mail" class="w-4 h-4" />
              {{ t('dataPolicy.communicationsTitle') }}
            </h4>
            <p class="text-slate-300 text-sm">
              {{ t('dataPolicy.communicationsDesc') }}
            </p>
          </div>

          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <h4 class="font-semibold text-red-400 mb-2 flex items-center gap-2">
              <Icon name="lucide:alert-triangle" class="w-4 h-4" />
              {{ t('dataPolicy.legalTitle') }}
            </h4>
            <p class="text-slate-300 text-sm">
              {{ t('dataPolicy.legalDesc') }}
            </p>
          </div>
        </div>
      </section>

      <!-- 5. Sicurezza -->
      <section class="mb-12">
        <h3 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <span class="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-sm font-bold">5</span>
          {{ t('dataPolicy.dataProtection') }}
        </h3>

        <div class="space-y-4">
          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
            <h4 class="font-semibold mb-3 flex items-center gap-2">
              <Icon name="lucide:shield-check" class="w-5 h-5 text-green-400" />
              {{ t('dataPolicy.securityMeasures') }}
            </h4>
            <ul class="space-y-2 text-slate-300">
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.https') }}:</strong> {{ t('dataPolicy.httpsDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.encryptionAtRest') }}:</strong> {{ t('dataPolicy.encryptionAtRestDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.passwordHashing') }}:</strong> {{ t('dataPolicy.passwordHashingDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.jwtSigned') }}:</strong> {{ t('dataPolicy.jwtSignedDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.httpOnlyCookies') }}:</strong> {{ t('dataPolicy.httpOnlyCookiesDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.corsConfigured') }}:</strong> {{ t('dataPolicy.corsConfiguredDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.rateLimiting') }}:</strong> {{ t('dataPolicy.rateLimitingDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.auditLogging') }}:</strong> {{ t('dataPolicy.auditLoggingDesc') }}</span>
              </li>
              <li class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>{{ t('dataPolicy.monitoring') }}:</strong> {{ t('dataPolicy.monitoringDesc') }}</span>
              </li>
            </ul>
          </div>

          <div class="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4">
            <p class="text-sm text-slate-300">
              ⚠️ <strong>{{ t('dataPolicy.responsibility') }}:</strong> {{ t('dataPolicy.responsibilityDesc') }}
            </p>
          </div>
        </div>
      </section>

      <!-- 6. Base Legale -->
      <section class="mb-12">
        <h3 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <span class="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-sm font-bold">6</span>
          {{ t('dataPolicy.legalBasis') }}
        </h3>

        <div class="space-y-4">
          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <h4 class="font-semibold mb-2">{{ t('dataPolicy.gdprArticle6') }}:</h4>
            <ul class="text-sm text-slate-300 space-y-2">
              <li><strong>{{ t('dataPolicy.gdprArticle6a') }}</strong></li>
              <li><strong>{{ t('dataPolicy.gdprArticle6b') }}</strong></li>
            </ul>
          </div>

          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <h4 class="font-semibold mb-2">{{ t('dataPolicy.gdprArticle9') }}:</h4>
            <ul class="text-sm text-slate-300 space-y-2">
              <li><strong>{{ t('dataPolicy.gdprArticle9a') }}</strong></li>
              <li><strong>{{ t('dataPolicy.gdprArticle9h') }}</strong></li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 7. Retention dei Dati -->
      <section class="mb-12">
        <h3 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <span class="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-sm font-bold">7</span>
          {{ t('dataPolicy.dataRetention') }}
        </h3>

        <div class="bg-slate-800/30 border border-slate-700 rounded-lg overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-700">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold">{{ t('dataPolicy.dataType') }}</th>
                  <th class="px-4 py-3 text-left font-semibold">{{ t('dataPolicy.retentionPeriod') }}</th>
                  <th class="px-4 py-3 text-left font-semibold">{{ t('dataPolicy.reason') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-700">
                <tr class="hover:bg-slate-700/30">
                  <td class="px-4 py-3">{{ t('dataPolicy.jwtRetention') }}</td>
                  <td class="px-4 py-3">{{ t('dataPolicy.jwtRetentionPeriod') }}</td>
                  <td class="px-4 py-3">{{ t('dataPolicy.jwtRetentionReason') }}</td>
                </tr>
                <tr class="hover:bg-slate-700/30">
                  <td class="px-4 py-3">{{ t('dataPolicy.credentialsRetention') }}</td>
                  <td class="px-4 py-3">{{ t('dataPolicy.credentialsRetentionPeriod') }}</td>
                  <td class="px-4 py-3">{{ t('dataPolicy.credentialsRetentionReason') }}</td>
                </tr>
                <tr class="hover:bg-slate-700/30">
                  <td class="px-4 py-3">{{ t('dataPolicy.profileRetention') }}</td>
                  <td class="px-4 py-3">{{ t('dataPolicy.profileRetentionPeriod') }}</td>
                  <td class="px-4 py-3">{{ t('dataPolicy.profileRetentionReason') }}</td>
                </tr>
                <tr class="hover:bg-slate-700/30">
                  <td class="px-4 py-3">{{ t('dataPolicy.trainingDataRetention') }}</td>
                  <td class="px-4 py-3">{{ t('dataPolicy.trainingDataRetentionPeriod') }}</td>
                  <td class="px-4 py-3">{{ t('dataPolicy.trainingDataRetentionReason') }}</td>
                </tr>
                <tr class="hover:bg-slate-700/30">
                  <td class="px-4 py-3">{{ t('dataPolicy.injuryRecordsRetention') }}</td>
                  <td class="px-4 py-3">{{ t('dataPolicy.injuryRecordsRetentionPeriod') }}</td>
                  <td class="px-4 py-3">{{ t('dataPolicy.injuryRecordsRetentionReason') }}</td>
                </tr>
                <tr class="hover:bg-slate-700/30">
                  <td class="px-4 py-3">{{ t('dataPolicy.logsRetention') }}</td>
                  <td class="px-4 py-3">{{ t('dataPolicy.logsRetentionPeriod') }}</td>
                  <td class="px-4 py-3">{{ t('dataPolicy.logsRetentionReason') }}</td>
                </tr>
                <tr class="hover:bg-slate-700/30">
                  <td class="px-4 py-3">{{ t('dataPolicy.backupRetention') }}</td>
                  <td class="px-4 py-3">{{ t('dataPolicy.backupRetentionPeriod') }}</td>
                  <td class="px-4 py-3">{{ t('dataPolicy.backupRetentionReason') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p class="text-slate-400 text-sm mt-4">
          💡 <strong>{{ t('dataPolicy.dataRetention') }}:</strong> {{ t('dataPolicy.retentionNote') }}
        </p>
      </section>

      <!-- 8. Diritti dell'Utente -->
      <section class="mb-12">
        <h3 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <span class="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-sm font-bold">8</span>
          {{ t('dataPolicy.userRights') }}
        </h3>

        <p class="text-slate-300 mb-6">
          {{ t('dataPolicy.userRightsIntro') }}:
        </p>

        <div class="space-y-3">
          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <h4 class="font-semibold text-green-400 mb-2 flex items-center gap-2">
              <Icon name="lucide:download" class="w-4 h-4" />
              {{ t('dataPolicy.rightOfAccess') }}
            </h4>
            <p class="text-sm text-slate-300">
              {{ t('dataPolicy.rightOfAccessDesc') }}
            </p>
          </div>

          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <h4 class="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Icon name="lucide:edit" class="w-4 h-4" />
              {{ t('dataPolicy.rightOfRectification') }}
            </h4>
            <p class="text-sm text-slate-300">
              {{ t('dataPolicy.rightOfRectificationDesc') }}
            </p>
          </div>

          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <h4 class="font-semibold text-red-400 mb-2 flex items-center gap-2">
              <Icon name="lucide:trash-2" class="w-4 h-4" />
              {{ t('dataPolicy.rightToBeForget') }}
            </h4>
            <p class="text-sm text-slate-300">
              {{ t('dataPolicy.rightToBeForgetDesc') }}
            </p>
          </div>

          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <h4 class="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <Icon name="lucide:database-export" class="w-4 h-4" />
              {{ t('dataPolicy.rightToPortability') }}
            </h4>
            <p class="text-sm text-slate-300">
              {{ t('dataPolicy.rightToPortabilityDesc') }}
            </p>
          </div>

          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <h4 class="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <Icon name="lucide:pause" class="w-4 h-4" />
              {{ t('dataPolicy.rightToRestriction') }}
            </h4>
            <p class="text-sm text-slate-300">
              {{ t('dataPolicy.rightToRestrictionDesc') }}
            </p>
          </div>

          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <h4 class="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
              <Icon name="lucide:ban" class="w-4 h-4" />
              {{ t('dataPolicy.rightToObject') }}
            </h4>
            <p class="text-sm text-slate-300">
              {{ t('dataPolicy.rightToObjectDesc') }}
            </p>
          </div>

          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <h4 class="font-semibold text-pink-400 mb-2 flex items-center gap-2">
              <Icon name="lucide:scale" class="w-4 h-4" />
              {{ t('dataPolicy.rightToAutomatedDecisions') }}
            </h4>
            <p class="text-sm text-slate-300">
              {{ t('dataPolicy.rightToAutomatedDecisionsDesc') }}
            </p>
          </div>
        </div>

        <div class="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 mt-6">
          <h4 class="font-semibold text-blue-300 mb-2 flex items-center gap-2">
            <Icon name="lucide:mail" class="w-4 h-4" />
            {{ t('dataPolicy.howToExerciseRights') }}
          </h4>
          <p class="text-sm text-slate-300">
            {{ t('dataPolicy.exerciseRightsDesc') }}
            <a href="mailto:manuelenzo2000@gmail.com" class="text-blue-400 hover:underline font-semibold">manuelenzo2000@gmail.com</a>
          </p>
          <p class="text-xs text-slate-400 mt-2">
            {{ t('dataPolicy.exerciseRightsNote') }}
          </p>
        </div>
      </section>

      <!-- 9. Condivisione Dati -->
      <section class="mb-12">
        <h3 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <span class="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-sm font-bold">9</span>
          {{ t('dataPolicy.dataSharing') }}
        </h3>

        <div class="space-y-4">
          <p class="text-slate-300">
            {{ t('dataPolicy.dataSharingIntro') }}:
          </p>

          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <h4 class="font-semibold mb-2">{{ t('dataPolicy.serviceProviders') }}:</h4>
            <ul class="text-sm text-slate-300 space-y-2">
              <li>🖥️ <strong>{{ t('dataPolicy.hosting') }}:</strong> {{ t('dataPolicy.hostingDesc') }}</li>
              <li>📧 <strong>{{ t('dataPolicy.email') }}:</strong> {{ t('dataPolicy.emailDesc') }}</li>
              <li>🔐 <strong>{{ t('dataPolicy.payments') }}:</strong> {{ t('dataPolicy.paymentsDesc') }}</li>
              <li>🌍 <strong>{{ t('dataPolicy.cdn') }}:</strong> {{ t('dataPolicy.cdnDesc') }}</li>
            </ul>
          </div>

          <p class="text-slate-400 text-sm bg-blue-900/20 border border-blue-700/30 rounded p-3">
            💡 <strong>{{ t('dataPolicy.dpaNoteTitle') }}:</strong> {{ t('dataPolicy.dpaNoteDesc') }}
          </p>

          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <h4 class="font-semibold mb-2">{{ t('dataPolicy.sharingWithoutConsent') }}:</h4>
            <ul class="text-sm text-slate-300 space-y-2">
              <li>⚖️ {{ t('dataPolicy.legalOrder') }}</li>
              <li>🚨 {{ t('dataPolicy.protectRights') }}</li>
              <li>🔄 {{ t('dataPolicy.acquisition') }}</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 10. Cookie e Tracciamento -->
      <section class="mb-12">
        <h3 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <span class="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-sm font-bold">10</span>
          {{ t('dataPolicy.cookiesTracking') }}
        </h3>

        <div class="space-y-4">
          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <h4 class="font-semibold mb-3">{{ t('dataPolicy.cookiesUsed') }}:</h4>
            <div class="space-y-3">
              <div class="border-l-4 border-blue-500 pl-3">
                <p class="font-semibold text-sm">{{ t('dataPolicy.authTokenCookie') }}</p>
                <p class="text-xs text-slate-400">{{ t('dataPolicy.authTokenCookieDesc') }}</p>
              </div>
              <div class="border-l-4 border-gray-500 pl-3">
                <p class="font-semibold text-sm">{{ t('dataPolicy.themeCookie') }}</p>
                <p class="text-xs text-slate-400">{{ t('dataPolicy.themeCookieDesc') }}</p>
              </div>
            </div>
          </div>

          <p class="text-slate-300 text-sm">
            ✅ <strong>{{ t('dataPolicy.noTracking') }}:</strong> {{ t('dataPolicy.noTrackingDesc') }}
          </p>
        </div>
      </section>

      <!-- 11. Contatti e Reclami -->
      <section class="mb-12">
        <h3 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <span class="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-sm font-bold">11</span>
          {{ t('dataPolicy.contactsComplaints') }}
        </h3>

        <div class="space-y-4">
          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
            <h4 class="font-semibold mb-3 flex items-center gap-2">
              <Icon name="lucide:mail" class="w-5 h-5 text-blue-400" />
              {{ t('dataPolicy.contactPrivacy') }}
            </h4>
            <p class="text-slate-300 mb-2">{{ t('dataPolicy.contactPrivacyDesc') }}:</p>
            <p class="text-blue-400 font-semibold">📧 <a href="mailto:manuelenzo2000@gmail.com" class="hover:underline">manuelenzo2000@gmail.com</a></p>
            <p class="text-slate-400 text-sm mt-2">{{ t('dataPolicy.responseTime') }}</p>
          </div>

          <div class="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
            <h4 class="font-semibold mb-3 flex items-center gap-2">
              <Icon name="lucide:alert-circle" class="w-5 h-5 text-orange-400" />
              {{ t('dataPolicy.complaintToAuthority') }}
            </h4>
            <p class="text-slate-300 mb-3">
              {{ t('dataPolicy.complaintToAuthorityDesc') }}:
            </p>
            <p class="text-slate-300">🇮🇹 <strong>{{ t('dataPolicy.garante') }}</strong></p>
            <p class="text-slate-400 text-sm">{{ t('dataPolicy.garanteAddress') }}</p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <section class="bg-slate-800/30 border border-slate-700 rounded-lg p-6 text-center text-sm text-slate-400">
        <p>
          <strong>{{ t('dataPolicy.lastUpdated') }}:</strong> {{ new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' }) }}
        </p>
        <p class="mt-2">
          {{ t('dataPolicy.footer') }}
        </p>
        <p class="mt-4 text-xs">
          {{ t('dataPolicy.copyright') }}
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}
</style>
