<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
    Plus, Activity, Stethoscope, Trash2, Edit3, Save,
    X, Loader2, Info, CheckCircle2, AlertCircle
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

// API & Types
import { athleteApi } from '@/api/business'
import type { InjuryResponseDTO, InjuryCreateDTO, InjuryUpdateDTO } from '@/types/api'

// --------------------
// PROPS
// --------------------
const props = defineProps<{
    athleteId: number | null
}>()

const { t } = useI18n()

// --------------------
// STATE
// --------------------
const injuries = ref<InjuryResponseDTO[]>([])
const loading = ref(false)
const isSubmitting = ref(false)
const isDialogOpen = ref(false)

interface InjuryForm {
    id: number | null;
    date: string;
    injury: string;
    category: number;
    severity: number;
    status: number;
    bodyLocation: string;
    expectedReturnDate: string;
}

const injuryForm = reactive<InjuryForm>({
    id: null,
    date: new Date().toISOString().split('T')[0] ?? "",
    injury: '',
    category: 0,
    severity: 0,
    status: 0,
    bodyLocation: '',
    expectedReturnDate: ''
})

// --------------------
// API ACTIONS
// --------------------

// Carica infortuni ogni volta che l'ID atleta cambia
async function fetchInjuries() {
    if (!props.athleteId) {
        injuries.value = []
        return
    }

    loading.value = true
    try {
        const res = await athleteApi.getInjuries(props.athleteId)
        injuries.value = res.data.value ?? []
    } catch {
        toast.error(t('injuries.errors.loadInjuries'))
    } finally {
        loading.value = false
    }
}

async function handleSave() {
    if (!injuryForm.injury || !props.athleteId) {
        toast.error(t('common.validation.requiredFields'))
        return
    }

    const validDate: string = (injuryForm.date || new Date().toISOString().split('T')[0]) ?? "";
    isSubmitting.value = true

    try {
        if (injuryForm.id) {
            const updatePayload: InjuryUpdateDTO = {
                injury: injuryForm.injury,
                category: injuryForm.category,
                severity: injuryForm.severity,
                status: injuryForm.status,
                bodyLocation: injuryForm.bodyLocation,
                expectedReturnDate: injuryForm.expectedReturnDate || undefined,
                date: validDate
            }
            await athleteApi.updateInjury(injuryForm.id, updatePayload)
            toast.success(t('injuries.toast.updated'))
        } else {
            const createPayload: InjuryCreateDTO = {
                athleteId: props.athleteId, // Usa l'ID ricevuto dalle props
                date: validDate,
                injury: injuryForm.injury,
                category: injuryForm.category,
                severity: injuryForm.severity,
                status: injuryForm.status,
                bodyLocation: injuryForm.bodyLocation,
                expectedReturnDate: injuryForm.expectedReturnDate || undefined
            }
            await athleteApi.createInjury(createPayload)
            toast.success(t('injuries.toast.created'))
        }
        isDialogOpen.value = false
        fetchInjuries()
    } catch {
        toast.error(t('injuries.errors.save'))
    } finally {
        isSubmitting.value = false
    }
}

async function deleteInjury(id: number) {
    if (!confirm(t('common.confirmDelete'))) return
    try {
        await athleteApi.deleteInjury(id)
        toast.success(t('injuries.toast.deleted'))
        fetchInjuries()
    } catch {
        toast.error(t('injuries.errors.delete'))
    }
}

// --------------------
// UI LOGIC
// --------------------
function openDialog(injury: InjuryResponseDTO | null = null) {
    if (injury) {
        Object.assign(injuryForm, {
            id: injury.id,
            date: injury.date ? injury.date.split('T')[0] : new Date().toISOString().split('T')[0],
            injury: injury.injury,
            category: injury.category,
            severity: injury.severity,
            status: injury.status,
            bodyLocation: injury.bodyLocation || '',
            expectedReturnDate: injury.expectedReturnDate ? injury.expectedReturnDate.split('T')[0] : ''
        })
    } else {
        resetForm()
    }
    isDialogOpen.value = true
}

function resetForm() {
    Object.assign(injuryForm, {
        id: null,
        date: new Date().toISOString().split('T')[0],
        injury: '',
        category: 0,
        severity: 0,
        status: 0,
        bodyLocation: '',
        expectedReturnDate: ''
    })
}

const getSeverityBadge = (sev: number) => {
    const styles = [
        'bg-green-100 text-green-700 border-green-200',
        'bg-yellow-100 text-yellow-700 border-yellow-200',
        'bg-orange-100 text-orange-700 border-orange-200',
        'bg-red-100 text-red-700 border-red-200'
    ]
    return styles[sev] || 'bg-slate-100'
}

const getStatusIcon = (status: number) => {
    if (status === 0) return AlertCircle
    if (status === 1) return Activity
    return CheckCircle2
}

// Reagisce immediatamente al cambio dell'atleta nel padre
watch(() => props.athleteId, () => {
    fetchInjuries()
}, { immediate: true })

</script>

<template>
    <div class="w-full flex flex-col gap-6">
        <div
            class="flex items-center justify-between bg-muted/20 p-4 rounded-2xl border border-dashed border-primary/20">
            <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Stethoscope class="h-5 w-5" />
                </div>
                <h2 class="text-sm font-black uppercase tracking-widest text-muted-foreground">
                    {{ t('injuries.history_title') || 'Registro Infortuni Atleta' }}
                </h2>
            </div>
            <Button @click="openDialog()" size="sm" class="font-bold uppercase tracking-wider h-9">
                <Plus class="mr-2 h-4 w-4" /> {{ t('injuries.add_new') }}
            </Button>
        </div>

        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton class="h-[160px] w-full rounded-2xl" v-for="i in 3" :key="i" />
        </div>

        <div v-else-if="injuries.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card v-for="item in injuries" :key="item.id"
                class="group border-primary/5 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden">
                <CardHeader class="pb-2 bg-muted/5">
                    <div class="flex justify-between items-start">
                        <div class="flex flex-col">
                            <span class="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">{{
                                item.categoryName }}</span>
                            <CardTitle class="text-sm font-bold leading-tight mt-1">{{ item.injury }}</CardTitle>
                        </div>
                        <Badge variant="outline" class="text-[9px]" :class="getSeverityBadge(item.severity)">
                            {{ item.severityName }}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent class="pt-4 space-y-3">
                    <div class="flex justify-between items-center bg-muted/30 p-2.5 rounded-xl border border-primary/5">
                        <div class="flex items-center gap-2">
                            <component :is="getStatusIcon(item.status)" class="h-3.5 w-3.5"
                                :class="item.status === 2 ? 'text-green-500' : 'text-orange-500'" />
                            <span class="text-[9px] font-black uppercase">{{ item.statusName }}</span>
                        </div>
                        <span class="text-[10px] font-mono font-bold">{{ new Date(item.date).toLocaleDateString()
                            }}</span>
                    </div>

                    <div class="flex justify-between items-center px-1">
                        <div class="flex flex-col">
                            <span class="text-[8px] font-bold text-muted-foreground uppercase">Sede</span>
                            <span class="font-bold text-[10px]">{{ item.bodyLocation || 'N/D' }}</span>
                        </div>
                        <div class="flex flex-col text-right">
                            <span class="text-[8px] font-bold text-muted-foreground uppercase">Stop</span>
                            <span class="font-black text-[10px] text-primary">{{ item.daysOut }} gg</span>
                        </div>
                    </div>

                    <div class="flex justify-end gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" class="h-7 w-7 rounded-full" @click="openDialog(item)">
                            <Edit3 class="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" class="h-7 w-7 rounded-full hover:bg-red-50"
                            @click="deleteInjury(item.id)">
                            <Trash2 class="h-3.5 w-3.5 text-destructive" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div v-else
            class="flex flex-col items-center justify-center py-16 bg-muted/5 rounded-3xl border-2 border-dashed border-muted">
            <Info class="h-8 w-8 text-muted-foreground/20 mb-3" />
            <h3 class="text-xs font-black uppercase text-muted-foreground/60">{{ t('injuries.no_data') }}</h3>
        </div>

        <div v-if="isDialogOpen"
            class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card class="w-full max-w-lg shadow-2xl border-none">
                <CardHeader class="flex flex-row items-center justify-between border-b pb-4">
                    <CardTitle class="text-lg font-black uppercase tracking-tight">
                        {{ injuryForm.id ? 'Aggiorna Infortunio' : 'Nuovo Infortunio' }}
                    </CardTitle>
                    <Button variant="ghost" size="icon" @click="isDialogOpen = false">
                        <X class="h-5 w-5" />
                    </Button>
                </CardHeader>
                <CardContent class="grid grid-cols-2 gap-4 pt-6">
                    <div class="col-span-2">
                        <label class="text-[9px] font-black uppercase text-muted-foreground block mb-1">Diagnosi /
                            Infortunio</label>
                        <Input v-model="injuryForm.injury" placeholder="Es. Lesione II Grado" class="h-9 text-sm" />
                    </div>
                    <div class="col-span-1">
                        <label class="text-[9px] font-black uppercase text-muted-foreground block mb-1">Inizio</label>
                        <Input type="date" v-model="injuryForm.date"
                            class="h-9 text-sm pr-10 appearance-none bg-background focus:ring-2" />
                    </div>
                    <div class="col-span-1">
                        <label class="text-[9px] font-black uppercase text-muted-foreground block mb-1">Rientro
                            Stimato</label>
                        <Input type="date" v-model="injuryForm.expectedReturnDate"
                            class="h-9 text-sm pr-10 appearance-none bg-background focus:ring-2" />
                    </div>
                    <div class="col-span-1">
                        <label
                            class="text-[9px] font-black uppercase text-muted-foreground block mb-1">Categoria</label>
                        <select v-model.number="injuryForm.category"
                            class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs">
                            <option :value="0">Muscolare</option>
                            <option :value="1">Articolare</option>
                            <option :value="2">Tendineo</option>
                            <option :value="3">Osseo</option>
                        </select>
                    </div>
                    <div class="col-span-1">
                        <label class="text-[9px] font-black uppercase text-muted-foreground block mb-1">Gravità</label>
                        <select v-model.number="injuryForm.severity"
                            class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs">
                            <option :value="0">Lieve</option>
                            <option :value="1">Moderata</option>
                            <option :value="2">Grave</option>
                        </select>
                    </div>
                    <div class="col-span-1">
                        <label class="text-[9px] font-black uppercase text-muted-foreground block mb-1">Sede</label>
                        <Input v-model="injuryForm.bodyLocation" placeholder="Es. Coscia DX" class="h-9 text-sm" />
                    </div>
                    <div class="col-span-1">
                        <label class="text-[9px] font-black uppercase text-muted-foreground block mb-1">Stato</label>
                        <select v-model.number="injuryForm.status"
                            class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-bold">
                            <option :value="0">Attivo</option>
                            <option :value="1">Rehab</option>
                            <option :value="2">Rientrato</option>
                        </select>
                    </div>
                    <div class="col-span-2 pt-4 flex justify-end gap-2 border-t mt-2">
                        <Button variant="ghost" size="sm" @click="isDialogOpen = false">{{ t('common.cancel')
                            }}</Button>
                        <Button @click="handleSave" size="sm" :disabled="isSubmitting" class="font-bold">
                            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
                            <Save class="mr-2 h-4 w-4" /> {{ t('common.save') }}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
</template>