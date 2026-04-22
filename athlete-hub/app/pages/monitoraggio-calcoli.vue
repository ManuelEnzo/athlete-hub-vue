<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

definePageMeta({ layout: 'default' })
const { t } = useI18n()

const toc = [
  { id: 's1', key: 'monitoringDoc.sections.s1' },
  { id: 's2', key: 'monitoringDoc.sections.s2' },
  { id: 's3', key: 'monitoringDoc.sections.s3' },
  { id: 's4', key: 'monitoringDoc.sections.s4' },
  { id: 's5', key: 'monitoringDoc.sections.s5' },
  { id: 's6', key: 'monitoringDoc.sections.s6' },
  { id: 's7', key: 'monitoringDoc.sections.s7' },
  { id: 's8', key: 'monitoringDoc.sections.s8' },
  { id: 's9', key: 'monitoringDoc.sections.s9' },
  { id: 's10', key: 'monitoringDoc.sections.s10' },
  { id: 's11', key: 'monitoringDoc.sections.s11' },
  { id: 's12', key: 'monitoringDoc.sections.s12' },
] as const
</script>

<template>
  <div class="min-h-full bg-background">

    <!-- Page Header -->
    <div class="border-b border-border/60 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
      <div class="px-6 py-4 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20">
            <BookOpen class="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 class="text-base font-semibold tracking-tight text-foreground leading-none">
              {{ t('monitoringDoc.title') }}
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">
              {{ t('monitoringDoc.subtitle') }}
            </p>
          </div>
        </div>
        <span class="text-xs text-muted-foreground hidden sm:block">
          {{ t('monitoringDoc.lastUpdated') }}: {{ new Date().toLocaleDateString() }}
        </span>
      </div>
    </div>

    <div class="px-6 py-6 max-w-[1600px] mx-auto space-y-6">

      <!-- Summary banner -->
      <div class="rounded-xl border border-border bg-primary/5 px-5 py-4 text-sm text-muted-foreground">
        {{ t('monitoringDoc.summary') }}
      </div>

      <!-- Content: sidebar + sections -->
      <div class="flex gap-6 items-start">

        <!-- Sticky TOC sidebar (desktop) -->
        <aside class="hidden xl:flex flex-col gap-0.5 w-56 shrink-0 sticky top-20">
          <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 px-2">
            Indice
          </p>
          <a
            v-for="(item, i) in toc"
            :key="item.id"
            :href="`#${item.id}`"
            class="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <span class="w-4 h-4 rounded bg-primary/10 text-primary text-[9px] font-black flex items-center justify-center shrink-0">
              {{ i + 1 }}
            </span>
            <span class="truncate">{{ t(item.key + '.title') }}</span>
          </a>
        </aside>

        <!-- Main sections -->
        <div class="flex-1 space-y-4 min-w-0">

          <!-- S1: Time windows -->
          <section id="s1" class="bg-card border border-border rounded-xl p-5 space-y-3 scroll-mt-20">
            <SectionHeader :n="1" :title="t('monitoringDoc.sections.s1.title')" />
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li class="flex items-start gap-2">
                <span class="mt-0.5 text-primary/60 shrink-0">→</span>
                <span>{{ t('monitoringDoc.s1.referenceDate') }}</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-0.5 text-primary/60 shrink-0">→</span>
                <span><strong class="text-foreground">{{ t('monitoringDoc.s1.acute').split(':')[0] }}:</strong> {{ t('monitoringDoc.s1.acute').split(':').slice(1).join(':').trim() }}</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-0.5 text-primary/60 shrink-0">→</span>
                <span><strong class="text-foreground">{{ t('monitoringDoc.s1.chronic').split(':')[0] }}:</strong> {{ t('monitoringDoc.s1.chronic').split(':').slice(1).join(':').trim() }}</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-0.5 text-primary/60 shrink-0">→</span>
                <span>{{ t('monitoringDoc.s1.rpeWindow') }}</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-0.5 text-primary/60 shrink-0">→</span>
                <span>{{ t('monitoringDoc.s1.sleepWindow') }}</span>
              </li>
            </ul>
          </section>

          <!-- S2: Workload -->
          <section id="s2" class="bg-card border border-border rounded-xl p-5 space-y-3 scroll-mt-20">
            <SectionHeader :n="2" :title="t('monitoringDoc.sections.s2.title')" />
            <p class="text-sm text-muted-foreground">{{ t('monitoringDoc.s2.intro') }}</p>
            <FormulaBlock>{{ t('monitoringDoc.s2.formula') }}</FormulaBlock>
            <p class="text-xs text-muted-foreground italic">{{ t('monitoringDoc.s2.exampleWorkload') }}</p>
            <p class="text-xs text-muted-foreground">{{ t('monitoringDoc.s2.missingWorkload') }}</p>
          </section>

          <!-- S3: ACWR -->
          <section id="s3" class="bg-card border border-border rounded-xl p-5 space-y-3 scroll-mt-20">
            <SectionHeader :n="3" :title="t('monitoringDoc.sections.s3.title')" />
            <p class="text-sm text-muted-foreground">{{ t('monitoringDoc.s3.intro') }}</p>
            <FormulaBlock>{{ t('monitoringDoc.s3.formula') }}</FormulaBlock>
            <div class="grid grid-cols-3 gap-2">
              <div v-for="zone in [
                { label: '< 0.8', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
                { label: '0.8 – 1.3', color: 'bg-green-500/10 text-green-600 border-green-200' },
                { label: '> 1.3', color: 'bg-red-500/10 text-red-600 border-red-200' },
              ]" :key="zone.label"
                :class="`rounded-lg border p-2 text-center text-xs font-black ${zone.color}`"
              >
                {{ zone.label }}
              </div>
            </div>
            <p class="text-xs text-muted-foreground italic">{{ t('monitoringDoc.s3.interpretation') }}</p>
            <p class="text-xs text-muted-foreground">{{ t('monitoringDoc.s3.acwrFallback') }}</p>
          </section>

          <!-- S4: Monotony -->
          <section id="s4" class="bg-card border border-border rounded-xl p-5 space-y-3 scroll-mt-20">
            <SectionHeader :n="4" :title="t('monitoringDoc.sections.s4.title')" />
            <p class="text-sm text-muted-foreground">{{ t('monitoringDoc.s4.intro') }}</p>
            <FormulaBlock>{{ t('monitoringDoc.s4.formula') }}</FormulaBlock>
            <p class="text-xs text-muted-foreground italic">{{ t('monitoringDoc.s4.note') }}</p>
          </section>

          <!-- S5: Sleep Factor -->
          <section id="s5" class="bg-card border border-border rounded-xl p-5 space-y-3 scroll-mt-20">
            <SectionHeader :n="5" :title="t('monitoringDoc.sections.s5.title')" />
            <p class="text-sm text-muted-foreground">{{ t('monitoringDoc.s5.intro') }}</p>
            <p class="text-xs font-bold uppercase tracking-widest text-muted-foreground">{{ t('monitoringDoc.s5.componentsTitle') }}</p>
            <p class="text-sm text-muted-foreground">{{ t('monitoringDoc.s5.components') }}</p>
            <p class="text-xs font-bold uppercase tracking-widest text-muted-foreground">{{ t('monitoringDoc.s5.weightsTitle') }}</p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div v-for="w in [
                { label: 'Ore sonno', value: '40%' },
                { label: 'Qualità', value: '25%' },
                { label: 'Efficienza', value: '25%' },
                { label: 'Score wearable', value: '10%' },
              ]" :key="w.label"
                class="rounded-lg border border-border bg-muted/40 p-2 text-center"
              >
                <p class="text-[10px] font-bold uppercase text-muted-foreground">{{ w.label }}</p>
                <p class="text-sm font-black text-primary">{{ w.value }}</p>
              </div>
            </div>
            <p class="text-xs text-muted-foreground">{{ t('monitoringDoc.s5.calculation') }}</p>
          </section>

          <!-- S6: Readiness -->
          <section id="s6" class="bg-card border border-border rounded-xl p-5 space-y-3 scroll-mt-20">
            <SectionHeader :n="6" :title="t('monitoringDoc.sections.s6.title')" />
            <p class="text-sm text-muted-foreground">{{ t('monitoringDoc.s6.intro') }}</p>
            <div class="space-y-2">
              <div class="flex items-start gap-2 text-sm">
                <span class="mt-0.5 text-green-500 shrink-0">↑</span>
                <span class="text-muted-foreground">{{ t('monitoringDoc.s6.recovery') }}</span>
              </div>
              <div class="flex items-start gap-2 text-sm">
                <span class="mt-0.5 text-red-500 shrink-0">↓</span>
                <span class="text-muted-foreground">{{ t('monitoringDoc.s6.fatigue') }}</span>
              </div>
              <div class="flex items-start gap-2 text-sm">
                <span class="mt-0.5 text-blue-500 shrink-0">+</span>
                <span class="text-muted-foreground">{{ t('monitoringDoc.s6.fitness') }}</span>
              </div>
            </div>
            <FormulaBlock>{{ t('monitoringDoc.s6.formula') }}</FormulaBlock>
          </section>

          <!-- S7: Injury Penalty -->
          <section id="s7" class="bg-card border border-border rounded-xl p-5 space-y-3 scroll-mt-20">
            <SectionHeader :n="7" :title="t('monitoringDoc.sections.s7.title')" />
            <p class="text-sm text-muted-foreground">{{ t('monitoringDoc.s7.intro') }}</p>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li class="flex items-start gap-2">
                <span class="mt-0.5 text-green-500 shrink-0">✓</span>
                <span>{{ t('monitoringDoc.s7.statusReturned') }}</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-0.5 text-primary/60 shrink-0">→</span>
                <span>{{ t('monitoringDoc.s7.basePenalty') }}</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-0.5 text-primary/60 shrink-0">→</span>
                <span>{{ t('monitoringDoc.s7.severityMultiplier') }}</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-0.5 text-primary/60 shrink-0">→</span>
                <span>{{ t('monitoringDoc.s7.recoveryDecay') }}</span>
              </li>
            </ul>
            <FormulaBlock>{{ t('monitoringDoc.s7.penaltyFormula') }}</FormulaBlock>
          </section>

          <!-- S8: Pipeline -->
          <section id="s8" class="bg-card border border-border rounded-xl p-5 space-y-3 scroll-mt-20">
            <SectionHeader :n="8" :title="t('monitoringDoc.sections.s8.title')" />
            <p class="text-sm text-muted-foreground">{{ t('monitoringDoc.s8.intro') }}</p>
            <ol class="space-y-3">
              <li v-for="(step, i) in ['s8.step1', 's8.step2', 's8.step3']" :key="step" class="flex items-start gap-3">
                <span class="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {{ i + 1 }}
                </span>
                <span class="text-sm text-muted-foreground">{{ t(`monitoringDoc.${step}`) }}</span>
              </li>
            </ol>
          </section>

          <!-- S9: Predictions -->
          <section id="s9" class="bg-card border border-border rounded-xl p-5 space-y-3 scroll-mt-20">
            <SectionHeader :n="9" :title="t('monitoringDoc.sections.s9.title')" />
            <p class="text-sm text-muted-foreground">{{ t('monitoringDoc.s9.description') }}</p>
          </section>

          <!-- S10: Test comparison -->
          <section id="s10" class="bg-card border border-border rounded-xl p-5 space-y-3 scroll-mt-20">
            <SectionHeader :n="10" :title="t('monitoringDoc.sections.s10.title')" />
            <p class="text-sm text-muted-foreground">{{ t('monitoringDoc.s10.description') }}</p>
          </section>

          <!-- S11: Fallbacks -->
          <section id="s11" class="bg-card border border-border rounded-xl p-5 space-y-3 scroll-mt-20">
            <SectionHeader :n="11" :title="t('monitoringDoc.sections.s11.title')" />
            <p class="text-sm text-muted-foreground">{{ t('monitoringDoc.s11.missingData') }}</p>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li v-for="fb in ['s11.fallback1', 's11.fallback2', 's11.fallback3', 's11.fallback4']" :key="fb"
                class="flex items-start gap-2"
              >
                <span class="mt-0.5 text-primary/60 shrink-0">→</span>
                <span>{{ t(`monitoringDoc.${fb}`) }}</span>
              </li>
            </ul>
          </section>

          <!-- S12: Summary -->
          <section id="s12" class="bg-card border border-border rounded-xl p-5 space-y-3 scroll-mt-20">
            <SectionHeader :n="12" :title="t('monitoringDoc.sections.s12.title')" />
            <p class="text-sm text-muted-foreground">{{ t('monitoringDoc.s12.summary') }}</p>
          </section>

        </div><!-- /sections -->
      </div><!-- /content -->
    </div>
  </div>
</template>
