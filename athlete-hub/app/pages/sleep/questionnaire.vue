<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { athleteApi } from '@/api/business'
import notifications from '@/lib/notificationService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

definePageMeta({ layout: 'blank', auth: false })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const token = (route.query.token as string) || null
const loading = ref(false)
const submitted = ref(false)

const form = reactive({
  date: new Date().toISOString().slice(0, 10),
  hoursSlept: '' as string,
  sleepQuality: '' as string,
  notes: '' as string,
})

function validate() {
  // Athlete ID is no longer required or submitted
  if (!form.hoursSlept) {
    notifications.error(t('sleep.questionnaire.errors.requireHours'))
    return false
  }
  if (!form.sleepQuality) {
    notifications.error(t('sleep.questionnaire.errors.requireQuality'))
    return false
  }
  const q = Number(form.sleepQuality)
  if (isNaN(q) || q < 1 || q > 10) {
    notifications.error(t('sleep.questionnaire.errors.qualityRange'))
    return false
  }
  return true
}

async function submitForm() {
  if (!validate()) return
  loading.value = true

  const payload = {
    Token: token ?? null,
    Date: form.date,
    HoursSlept: Number(form.hoursSlept),
    SleepQuality: Number(form.sleepQuality),
    Notes: form.notes || null,
  }

  try {
    await athleteApi.submitQuestionnaire(payload)
    submitted.value = true
    notifications.success(t('sleep.questionnaire.success'))
  }
  catch (e: any) {
    const msg = e?.message || t('sleep.questionnaire.errors.sending')
    notifications.error(msg)
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  // nothing special on mount for athlete id (removed requirement)
})
</script>

<template>
  <div class="max-w-md mx-auto p-4 min-h-[60vh] flex items-center justify-center">
    <Card class="w-full">
      <CardHeader>
        <CardTitle class="text-lg font-bold">{{ t('sleep.questionnaire.title') }}</CardTitle>
      </CardHeader>

      <CardContent class="space-y-4">
        <p class="text-sm text-muted-foreground">{{ t('sleep.questionnaire.description') }}</p>

        <div>
          <Label class="text-xs">{{ t('sleep.fields.date') }}</Label>
          <Input v-model="form.date" type="date" disabled />
        </div>

        <div>
          <Label class="text-xs">{{ t('sleep.fields.hoursSlept') }}</Label>
          <Input v-model="form.hoursSlept" type="number" step="0.1" placeholder="7.5" />
        </div>

        <div>
          <Label class="text-xs">{{ t('sleep.fields.sleepQuality') }} (1-10)</Label>
          <Input v-model="form.sleepQuality" type="number" min="1" max="10" placeholder="7" />
        </div>

        <div>
          <Label class="text-xs">{{ t('sleep.notes') }}</Label>
          <textarea v-model="form.notes" class="w-full p-2 rounded-md bg-background border border-input" rows="4" />
        </div>
      </CardContent>

      <CardFooter class="p-4">
        <Button class="w-full" :disabled="loading || submitted" @click="submitForm">
          {{ submitted ? t('sleep.questionnaire.sent') : t('sleep.questionnaire.submit') }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<style scoped></style>
