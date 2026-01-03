<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { Button } from '../ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card'
import { Input } from '../ui/input'
import { Loader2 } from 'lucide-vue-next'

import { athleteApi } from '../../api/business'
import type { RpeLinkQueueSubmitRpeDto } from '../../types/api'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// RPE token preso dall'URL
const rpeToken = route.params.token as string

const loading = ref(false)
const submitted = ref(false)

const form = reactive({
    rpeValue: 0,
    notes: ''
})

// ---------------- API ----------------
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
        toast.error(err.error?.message || t('rpe.error.sending'))
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    if (!rpeToken) {
        toast.error(t('rpe.error.invalidToken'))
        router.push('/') // ritorna alla home
    }
})
</script>

<template>
    <div class="max-w-md mx-auto p-4">
        <Card class="border-primary/20 shadow-lg">
            <CardHeader>
                <CardTitle class="text-primary text-lg font-bold">
                    {{ t('rpe.title') }}
                </CardTitle>
            </CardHeader>

            <CardContent class="space-y-4">
                <p class="text-sm text-muted-foreground">
                    {{ t('rpe.description') }}
                </p>

                <div class="space-y-1">
                    <label class="text-xs font-semibold text-muted-foreground ml-1">{{ t('rpe.fields.rpe') }}</label>
                    <Input type="number" min="0" max="10" step="0.1" v-model.number="form.rpeValue" />
                </div>

                <div class="space-y-1">
                    <label class="text-xs font-semibold text-muted-foreground ml-1">{{ t('rpe.fields.notes') }}</label>
                    <Input type="text" v-model="form.notes" :placeholder="t('rpe.fields.notesPlaceholder')" />
                </div>
            </CardContent>

            <CardFooter class="flex justify-end gap-2 bg-muted/50 p-4">
                <Button @click="submitRpe" :disabled="loading || submitted">
                    <Loader2 v-if="loading" class="h-4 w-4 animate-spin mr-2" />
                    {{ submitted ? t('rpe.buttons.sent') : t('rpe.buttons.submit') }}
                </Button>
            </CardFooter>
        </Card>
    </div>
</template>
