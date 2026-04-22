<script setup lang="ts">
import { useI18n } from 'vue-i18n'

definePageMeta({
  layout: 'blank',
  auth: false,
})
const { t } = useI18n()
</script>

<template>
  <div class="w-full min-h-screen bg-background text-foreground transition-colors duration-300">
    <div class="bg-gradient-to-r from-primary/10 to-transparent border-b border-border px-4 md:px-6 py-6 md:py-8">
      <div class="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between gap-3 md:gap-0 items-start">
        <div>
          <h1 class="text-2xl md:text-4xl font-bold tracking-tight mb-1 md:mb-2 italic">
            {{ t('dataPolicy.title') }}
          </h1>
          <p class="text-muted-foreground text-xs md:text-sm font-medium">
            {{ t('dataPolicy.privacyMatters') }}
          </p>
        </div>
        <NuxtLink to="/landing/landingpage" class="mt-2 md:mt-0 inline-flex items-center gap-2 text-primary hover:opacity-80 transition text-sm font-semibold">
          <Icon name="lucide:arrow-left" class="w-4 h-4" />
          {{ t('dataPolicy.backHome') }}
        </NuxtLink>
      </div>
    </div>

    <main class="px-4 md:px-6 py-8 space-y-8 max-w-6xl mx-auto">
      <section class="mb-12">
        <div class="bg-card border border-border rounded-lg p-8 mb-8 shadow-sm">
          <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
            <Icon name="lucide:shield" class="w-6 h-6 text-blue-500" />
            {{ t('dataPolicy.privacyMatters') }}
          </h2>
          <p class="text-muted-foreground mb-4">
            {{ t('dataPolicy.introduction') }}
          </p>
          <p class="text-muted-foreground/60 text-sm">
            <strong>{{ t('dataPolicy.lastUpdated') }}:</strong> {{ new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' }) }}
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-4 mb-8">
          <div class="bg-card border border-border rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <Icon name="lucide:lock" class="w-5 h-5 text-green-500" />
              <span class="font-semibold">{{ t('dataPolicy.encryption') }}</span>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ t('dataPolicy.encryptionDesc') }}
            </p>
          </div>
          <div class="bg-card border border-border rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <Icon name="lucide:key" class="w-5 h-5 text-blue-500" />
              <span class="font-semibold">{{ t('dataPolicy.jwtSecure') }}</span>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ t('dataPolicy.jwtSecureDesc') }}
            </p>
          </div>
          <div class="bg-card border border-border rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <Icon name="lucide:check-circle" class="w-5 h-5 text-purple-500" />
              <span class="font-semibold">{{ t('dataPolicy.gdprCompliance') }}</span>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ t('dataPolicy.gdprComplianceDesc') }}
            </p>
          </div>
        </div>
      </section>

      <section class="mb-12">
        <h3 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <span class="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">1</span>
          {{ t('dataPolicy.dataController') }}
        </h3>
        <div class="bg-accent/30 border border-border rounded-lg p-6 space-y-3">
          <p><strong>{{ t('dataPolicy.companyName') }}:</strong> Athlete Hub</p>
          <p><strong>{{ t('dataPolicy.privacyEmail') }}:</strong> <a href="mailto:athletehub.sport@gmail.com" class="text-blue-500 hover:underline">athletehub.sport@gmail.com</a></p>
          <p><strong>{{ t('dataPolicy.dpoTitle') }}:</strong> Data Protection Officer</p>
          <p class="text-muted-foreground text-sm mt-4">
            {{ t('dataPolicy.contactDpo') }}
          </p>
        </div>
      </section>

      <section class="mb-12">
        <h3 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <span class="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">2</span>
          {{ t('dataPolicy.dataCollected') }}
        </h3>

        <div class="space-y-4">
          <div class="bg-card border border-border rounded-lg p-6">
            <h4 class="font-semibold text-lg mb-3 flex items-center gap-2">
              <Icon name="lucide:user" class="w-5 h-5 text-green-500" />
              {{ t('dataPolicy.authentication') }}
            </h4>
            <ul class="space-y-2 text-foreground/80">
              <li v-for="item in ['email', 'password', 'phone']" :key="item" class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                <span><strong>{{ t(`dataPolicy.${item}`) }}:</strong> {{ t(`dataPolicy.${item}Desc`) }}</span>
              </li>
            </ul>
            <p class="text-blue-600 dark:text-blue-400 text-sm mt-3 bg-blue-500/10 border border-blue-500/20 rounded p-2">
              💡 <strong>{{ t('dataPolicy.authDesc') }}</strong>
            </p>
          </div>

          <div class="bg-card border border-border rounded-lg p-6">
            <h4 class="font-semibold text-lg mb-3 flex items-center gap-2">
              <Icon name="lucide:user-circle" class="w-5 h-5 text-purple-500" />
              {{ t('dataPolicy.personalData') }}
            </h4>
            <ul class="space-y-2 text-foreground/80">
              <li v-for="item in ['fullName', 'dateOfBirth', 'gender', 'sportTeam', 'avatar']" :key="item" class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                <span><strong>{{ t(`dataPolicy.${item}`) }}:</strong> {{ t(`dataPolicy.${item}Desc`) }}</span>
              </li>
            </ul>
            <p class="text-blue-600 dark:text-blue-400 text-sm mt-3 bg-blue-500/10 border border-blue-500/20 rounded p-2">
              💡 <strong>{{ t('dataPolicy.personalDataDesc') }}</strong>
            </p>
          </div>

          <div class="bg-card border border-border rounded-lg p-6">
            <h4 class="font-semibold text-lg mb-3 flex items-center gap-2 text-red-500">
              <Icon name="lucide:heart" class="w-5 h-5" />
              {{ t('dataPolicy.healthData') }}
            </h4>
            <p class="text-red-600 dark:text-red-400 text-sm mb-3">
              ⚠️ <strong>{{ t('dataPolicy.healthWarning') }}:</strong> {{ t('dataPolicy.healthDataDesc') }}
            </p>
            <ul class="space-y-2 text-foreground/80">
              <li v-for="item in ['rpe', 'athleticTests', 'bodyMeasures', 'injuryData', 'healthStatus', 'trainingSchedule']" :key="item" class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-red-500 flex-shrink-0 mt-1" />
                <span><strong>{{ t(`dataPolicy.${item}`) }}:</strong> {{ t(`dataPolicy.${item}Desc`) }}</span>
              </li>
            </ul>
            <p class="text-red-600 dark:text-red-400 text-sm mt-3 bg-red-500/10 border border-red-500/20 rounded p-2">
              💡 <strong>{{ t('dataPolicy.specialConsent') }}</strong>
            </p>
          </div>

          <div class="bg-card border border-border rounded-lg p-6">
            <h4 class="font-semibold text-lg mb-3 flex items-center gap-2">
              <Icon name="lucide:activity" class="w-5 h-5 text-yellow-500" />
              {{ t('dataPolicy.usageData') }}
            </h4>
            <ul class="space-y-2 text-foreground/80">
              <li v-for="item in ['ipAddress', 'userAgent', 'timestamp', 'pagesVisited', 'actionsPerformed']" :key="item" class="flex gap-2">
                <Icon name="lucide:check" class="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                <span><strong>{{ t(`dataPolicy.${item}`) }}:</strong> {{ t(`dataPolicy.${item}Desc`) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section class="mb-12">
        <h3 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <span class="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">3</span>
          {{ t('dataPolicy.authenticationTitle') }}
        </h3>

        <div class="bg-card border border-border rounded-lg p-6 mb-6 shadow-sm">
          <p class="text-foreground/80 mb-4">
            <strong>JWT (JSON Web Token)</strong> {{ t('dataPolicy.jwtExplanation') }}
          </p>

          <div class="bg-accent rounded-lg p-4 mb-4 border border-border">
            <p class="font-mono text-xs text-foreground/70 break-all">
              eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkF0aGxldGEiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxw...
            </p>
            <p class="text-[10px] text-muted-foreground mt-2 uppercase">
              Esempio di JWT (ridotto per brevità)
            </p>
          </div>

          <h4 class="font-semibold mb-3">
            {{ t('dataPolicy.loginProcess') }}:
          </h4>
          <ol class="space-y-3 text-foreground/80">
            <li v-for="step in [1, 2, 3, 4, 5]" :key="step" class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{{ step }}</span>
              <span><strong>{{ t(`dataPolicy.step${step}`) }}:</strong> {{ t(`dataPolicy.step${step}Desc`) }}</span>
            </li>
          </ol>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-card border border-border rounded-lg p-4">
            <h5 class="font-bold text-green-600 dark:text-green-400 mb-2">
              {{ t('dataPolicy.accessToken') }}
            </h5>
            <ul class="text-sm text-muted-foreground space-y-1">
              <li>⏱️ <strong>{{ t('dataPolicy.accessTokenExpiry') }}</strong></li>
              <li>🔐 <strong>{{ t('dataPolicy.accessTokenUsage') }}</strong></li>
              <li>📝 <strong>{{ t('dataPolicy.accessTokenContains') }}</strong></li>
            </ul>
          </div>
          <div class="bg-card border border-border rounded-lg p-4">
            <h5 class="font-bold text-purple-600 dark:text-purple-400 mb-2">
              {{ t('dataPolicy.refreshToken') }}
            </h5>
            <ul class="text-sm text-muted-foreground space-y-1">
              <li>⏱️ <strong>{{ t('dataPolicy.refreshTokenExpiry') }}</strong></li>
              <li>🔄 <strong>{{ t('dataPolicy.refreshTokenUsage') }}</strong></li>
              <li>🔒 <strong>{{ t('dataPolicy.refreshTokenPlacement') }}</strong></li>
            </ul>
          </div>
        </div>
      </section>

      <section class="mb-12">
        <h3 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <span class="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">7</span>
          {{ t('dataPolicy.dataRetention') }}
        </h3>

        <div class="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-muted text-muted-foreground">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold">
                    {{ t('dataPolicy.dataType') }}
                  </th>
                  <th class="px-4 py-3 text-left font-semibold">
                    {{ t('dataPolicy.retentionPeriod') }}
                  </th>
                  <th class="px-4 py-3 text-left font-semibold">
                    {{ t('dataPolicy.reason') }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr v-for="row in ['jwt', 'credentials', 'profile', 'trainingData', 'injuryRecords', 'logs', 'backup']" :key="row" class="hover:bg-accent/50 transition-colors">
                  <td class="px-4 py-3 font-medium">
                    {{ t(`dataPolicy.${row}Retention`) }}
                  </td>
                  <td class="px-4 py-3 text-muted-foreground">
                    {{ t(`dataPolicy.${row}RetentionPeriod`) }}
                  </td>
                  <td class="px-4 py-3 text-muted-foreground italic text-xs">
                    {{ t(`dataPolicy.${row}RetentionReason`) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- <section class="mb-12">
        <h3 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <span class="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">8</span>
          {{ t('dataPolicy.userRights') }}
        </h3>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="right in ['Access', 'Rectification', 'ToBeForget', 'Portability', 'Restriction', 'Object', 'AutomatedDecisions']" :key="right" class="bg-card border border-border rounded-lg p-4">
            <h4 class="font-semibold text-primary mb-2 flex items-center gap-2">
              {{ t(`dataPolicy.rightOf${right}`) }}
            </h4>
            <p class="text-xs text-muted-foreground leading-relaxed">
              {{ t(`dataPolicy.rightOf${right}Desc`) }}
            </p>
          </div>
        </div>
      </section> -->
    </main>
  </div>
</template>
