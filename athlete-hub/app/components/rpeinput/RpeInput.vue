<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { Loader2, User, Calendar, Send, Edit3 } from 'lucide-vue-next'

import { Button } from '../ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card'
import { Input } from '../ui/input'
import { Separator } from '../ui/separator'
import { Badge } from '../ui/badge'

import { athleteApi } from '../../api/business'
import type { RpeLinkQueueSubmitRpeDto, RpeLinkQueueResponseDto } from '../../types/api'

const props = defineProps<{
  token: string
}>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// Token e stati
const rpeToken = route.params.token as string
const loading = ref(false)
const fetchingData = ref(true)
const submitted = ref(false)
const sessionInfo = ref<RpeLinkQueueResponseDto | null>(null)

const form = reactive({
  rpeValue: 1,
  notes: ''
})

function getRpeLabel(val: number) {
  if (val === 0) return t('rpe.labels.0')
  if (val <= 2) return t('rpe.labels.2')
  if (val <= 4) return t('rpe.labels.4')
  if (val <= 6) return t('rpe.labels.6')
  if (val <= 8) return t('rpe.labels.8')
  if (val <= 9.5) return t('rpe.labels.9.5')
  return t('rpe.labels.10')
}

// ---------------- API ----------------

async function fetchSessionDetails() {
  fetchingData.value = true
  try {
    const res = await athleteApi.getAllInfoFromToken(rpeToken)
    sessionInfo.value = res.data.value
  } catch (err: any) {
    const msg = err.error?.message || t('rpe.error.invalidToken')
    toast.error(msg)
  } finally {
    fetchingData.value = false
  }
}

async function submitRpe() {
  if (form.rpeValue < 0 || form.rpeValue > 10) {
    toast.error(t('rpe.validation.range'))
    return
  }

  loading.value = true
  try {
    const payload: RpeLinkQueueSubmitRpeDto = {
      tokenId: rpeToken,
      rpeValue: form.rpeValue,
      notes: form.notes
    }
    await athleteApi.submitRpe(payload)
    submitted.value = true
    toast.success(t('rpe.success.sent'))
  } catch (err: any) {
    const msg = err.error?.message || t('rpe.error.sending')
    toast.error(msg)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!rpeToken) {
    toast.error(t('rpe.error.invalidToken'))
    router.push('/login')
  } else {
    fetchSessionDetails()
  }
})
</script>

<template>
  <div class="max-w-md mx-auto p-4 min-h-[60vh] flex items-center justify-center">
    
    <div v-if="fetchingData" class="text-center space-y-4">
      <Loader2 class="h-10 w-10 animate-spin text-primary mx-auto" />
      <p class="text-muted-foreground animate-pulse">{{ t('common.loading') }}...</p>
    </div>

    <Transition name="expand">
      <Card v-if="!fetchingData && sessionInfo" class="w-full border-primary/20 shadow-lg overflow-hidden">
        <CardHeader class="bg-muted/30 pb-6">
          <CardTitle class="text-primary flex items-center gap-2">
            <Send class="h-5 w-5" />
            {{ t('rpe.title') }}
          </CardTitle>
          
          <div class="mt-4 space-y-2 bg-background/50 p-3 rounded-lg border border-primary/10">
            <div class="flex items-center gap-2 text-sm font-bold">
              <User class="h-4 w-4 text-primary" />
              {{ sessionInfo.athleteFullName }}
            </div>
            <Separator />
            <div class="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar class="h-4 w-4" />
              {{ sessionInfo.eventName }}
            </div>
          </div>
        </CardHeader>

        <CardContent class="space-y-6 pt-6">
          <p class="text-sm text-muted-foreground italic">
            {{ t('rpe.description') }}
          </p>

          <div class="space-y-4">
            <div class="flex justify-between items-end">
              <label class="text-xs font-semibold uppercase text-muted-foreground ml-1">
                {{ t('rpe.fields.rpe') }} (0-10)
              </label>
              <span class="text-2xl font-bold text-primary">{{ form.rpeValue }}</span>
            </div>
            
            <input 
              type="range" 
              min="1" max="10" step="1" 
              v-model.number="form.rpeValue"
              :disabled="submitted"
              class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            
            <div class="flex justify-center">
              <Badge variant="secondary" class="text-[10px] font-bold uppercase">
                {{ getRpeLabel(form.rpeValue) }}
              </Badge>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase text-muted-foreground ml-1">
              {{ t('rpe.fields.notes') }}
            </label>
            <textarea 
              v-model="form.notes"
              :placeholder="t('rpe.fields.notesPlaceholder')"
              :disabled="submitted"
              class="w-full min-h-[80px] p-3 rounded-md bg-background border border-input focus:ring-1 focus:ring-primary transition-all resize-none text-sm"
            ></textarea>
          </div>
        </CardContent>

        <CardFooter class="flex flex-col gap-3 bg-muted/30 p-4">
          <Button 
            class="w-full" 
            @click="submitRpe" 
            :disabled="loading || submitted"
          >
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            {{ submitted ? t('rpe.buttons.sent') : t('rpe.buttons.submit') }}
          </Button>
          
          <p v-if="submitted" class="text-[11px] text-center text-green-600 font-medium">
            {{ t('rpe.success.details') }}
          </p>
        </CardFooter>
      </Card>
    </Transition>

    <div v-if="!fetchingData && !sessionInfo" class="text-center space-y-4">
      <div class="bg-destructive/10 p-6 rounded-full inline-block">
        <User class="h-10 w-10 text-destructive" />
      </div>
      <h2 class="text-xl font-bold">{{ t('rpe.error.invalidToken') }}</h2>
      <p class="text-muted-foreground text-sm">{{ t('rpe.error.contactCoach') }}</p>
    </div>

  </div>
</template>

<style scoped>
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 600px;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}
</style>