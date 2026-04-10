<script setup lang="ts">
import type { AthleteCreateRequest, AthleteResponse, MailRequestDto, PreferredSleepSource } from '../../types/api'
import { Clipboard, ClipboardCheck, ClipboardList, Edit3, HelpCircle, Loader2, Mail, Plus, Search, Smartphone, Trash2, User, X } from 'lucide-vue-next'
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useErrorHandler } from '~/composables/useErrorHandler'

import { useNotificationStore } from '~/stores/notificationStore'
import { useAthletesStore } from '~/stores/athletesStore'
import { athleteApi } from '../../api/business'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

const props = defineProps<{ showForm: boolean }>()
const emit = defineEmits(['update:showForm'])
const { t } = useI18n()
const handler = useErrorHandler({ component: 'AthleteManagement' })
const notifications = useNotificationStore()
const athletesStore = useAthletesStore()

// ---- Store-derived state (no local duplication) ----
const athletes = computed(() => athletesStore.items)
const loading = computed(() => athletesStore.loading)

const editingId = ref<number | null>(null)
const tokenCopied = ref(false)
const formCardRef = ref<HTMLElement | null>(null)
const athleteToDelete = ref<AthleteResponse | null>(null)
const isDeleteDialogOpen = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  sportCategory: '',
  birthDate: '',
  weight: 0,
  height: 0,
  gender: 'F',
  tokenSleepId: '',
  preferredSleepSource: 0 as PreferredSleepSource,
})

// UI state
const searchQuery = ref('')

const sleepSourceOptions = computed(() => [
  { value: 1 as PreferredSleepSource, label: t('fields.sleepSourceDevice'), icon: Smartphone },
  { value: 2 as PreferredSleepSource, label: t('fields.sleepSourceQuestionnaire'), icon: ClipboardList },
  { value: 0 as PreferredSleepSource, label: t('fields.sleepSourceUnknown'), icon: HelpCircle },
])

const displayedAthletes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return athletes.value
  return athletes.value.filter(a => {
    const name = `${a.firstName} ${a.lastName}`.toLowerCase()
    return name.includes(q) || (a.email || '').toLowerCase().includes(q) || (a.sportCategory || '').toLowerCase().includes(q)
  })
})

function openNewAthlete() {
  resetForm()
  emit('update:showForm', true)
}

// ---------------- VALIDATION ----------------
function validateForm(): boolean {
  if (!form.firstName.trim()) {
    handler.handleError(new Error(t('athlete.errors.firstNameRequired')))
    return false
  }

  if (!form.lastName.trim()) {
    handler.handleError(new Error(t('athlete.errors.lastNameRequired')))
    return false
  }

  if (!form.email.trim()) {
    handler.handleError(new Error(t('athlete.errors.emailRequired')))
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    handler.handleError(new Error(t('athlete.errors.emailInvalid')))
    return false
  }

  if (!form.birthDate) {
    handler.handleError(new Error(t('athlete.errors.birthDateRequired')))
    return false
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(form.birthDate)) {
    handler.handleError(new Error(t('athlete.errors.birthDateInvalid')))
    return false
  }

  const parts = form.birthDate.split('-')
  const year = Number(parts[0])
  const month = Number(parts[1])
  const day = Number(parts[2])

  const birthDate = new Date(year, month - 1, day)

  if (
    birthDate.getFullYear() !== year
    || birthDate.getMonth() !== month - 1
    || birthDate.getDate() !== day
  ) {
    handler.handleError(new Error(t('athlete.errors.birthDateInvalid')))
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (birthDate > today) {
    handler.handleError(new Error(t('athlete.errors.birthDateFuture')))
    return false
  }

  if (form.weight <= 0 || Number.isNaN(form.weight)) {
    handler.handleError(new Error(t('athlete.errors.weightInvalid')))
    return false
  }

  if (form.height <= 0 || Number.isNaN(form.height)) {
    handler.handleError(new Error(t('athlete.errors.heightInvalid')))
    return false
  }

  if (!['M', 'F', 'O'].includes(form.gender)) {
    handler.handleError(new Error(t('athlete.errors.genderInvalid')))
    return false
  }

  return true
}

// ---------------- API ----------------
async function fetchAthletes() {
  try {
    await athletesStore.initialize()
  }
  catch (err: any) {
    handler.handleError(err instanceof Error ? err : new Error(err?.error?.message || t('athlete.errors.load')))
  }
}

async function saveAthlete() {
  if (!validateForm())
    return

  try {
    if (editingId.value !== null) {
      await athleteApi.update(editingId.value, form)
      notifications.success('', t('athlete.success.updated'))
    }
    else {
      await athleteApi.create(form as AthleteCreateRequest)
      notifications.success('', t('athlete.success.created'))
    }
    // re-sync store
    await athletesStore.initialize()
    resetForm()
  }
  catch (err: any) {
    handler.handleError(err instanceof Error ? err : new Error(err?.error?.message || t('errors.save')))
  }
}

async function confirmDelete() {
  if (!athleteToDelete.value)
    return
  try {
    await athleteApi.delete(athleteToDelete.value.id)
    notifications.success('', t('athlete.success.deleted'))
    await athletesStore.initialize()
  }
  catch (err: any) {
    handler.handleError(err instanceof Error ? err : new Error(err?.error?.message || t('errors.delete')))
  }
  finally {
    isDeleteDialogOpen.value = false
    athleteToDelete.value = null
  }
}

// ---------------- UI ----------------
function editAthlete(a: AthleteResponse) {
  editingId.value = a.id
  const formattedDate = a.dateOfBirth ? a.dateOfBirth.split('T')[0] : ''

  Object.assign(form, {
    firstName: a.firstName,
    lastName: a.lastName,
    email: a.email,
    sportCategory: a.sportCategory,
    birthDate: formattedDate,
    weight: a.weight,
    height: a.height,
    gender: a.gender || 'F',
    tokenSleepId: a.tokenSleepId,
    preferredSleepSource: (a.preferredSleepSource ?? 0) as PreferredSleepSource,
  })

  emit('update:showForm', true)
}

// When the parent opens the form (or we enter edit mode), scroll the form into view and focus first input
watch(
  () => props.showForm,
  async (val) => {
    if (val && editingId.value !== null) {
      await nextTick()
      // scroll card into view (support component proxy or element)
      const el = getElementFromRef(formCardRef.value)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // focus first input inside the form card
      const input = el ? el.querySelector('input') as HTMLInputElement | null : null
      if (input)
        input.focus()
    }
  },
)

// also watch editingId in case showForm already true
watch(
  () => editingId.value,
  async (val) => {
    if (val !== null && props.showForm) {
      await nextTick()
      const el = getElementFromRef(formCardRef.value)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const input = el ? el.querySelector('input') as HTMLInputElement | null : null
      if (input)
        input.focus()
    }
  },
)

function resetForm() {
  editingId.value = null
  Object.assign(form, {
    firstName: '',
    lastName: '',
    email: '',
    sportCategory: '',
    birthDate: '',
    weight: 0,
    height: 0,
    gender: 'F',
    tokenSleepId: '',
    preferredSleepSource: 0 as PreferredSleepSource,
  })

  emit('update:showForm', false)
}

function getElementFromRef(refValue: any): HTMLElement | null {
  if (!refValue)
    return null
  // If it's a native element
  if (refValue instanceof HTMLElement)
    return refValue
  // If it's a Vue component proxy, try $el
  if (typeof refValue === 'object' && '$el' in refValue && refValue.$el instanceof HTMLElement)
    return refValue.$el as HTMLElement
  return null
}

async function copyToken(token: string) {
  if (!token)
    return
  try {
    await navigator.clipboard.writeText(token)
    tokenCopied.value = true
    notifications.success('', t('athlete.success.tokenCopied'))
    setTimeout(() => { tokenCopied.value = false }, 2000)
  }
  catch (err) {
    handler.handleError(err instanceof Error ? err : new Error(String(err)))
  }
}

async function sendTokenEmail() {
  try {
    const now = new Date().toISOString()

    const mail: MailRequestDto = {
      name: `${form.firstName} ${form.lastName}`,
      email: form.email,
      subject: t('athlete.email.tokenSubject'),
      text: t('athlete.email.tokenBody', {
        name: form.firstName,
        token: form.tokenSleepId,
      }),
      inseredAt: now,
      updatedAt: now,
    }
    await athleteApi.createNewMailAsync(mail)
    notifications.success('', t('athlete.message.resendSuccess'))
  }
  catch (err) {
    handler.handleError(err instanceof Error ? err : new Error(t('athlete.message.resend')))
  }
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.showForm) resetForm()
}

onMounted(() => {
  fetchAthletes()
  window.addEventListener('keydown', handleEscape)
})
onUnmounted(() => window.removeEventListener('keydown', handleEscape))
</script>

<template>
  <div class="w-full flex flex-col gap-8 mx-auto p-4 relative">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <div class="relative flex-1 sm:w-72">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            v-model="searchQuery"
            :placeholder="t('athlete.search')"
            class="pl-9 h-10 w-full"
            :class="searchQuery ? 'pr-8' : ''"
            aria-label="Search athletes"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground rounded transition-colors"
            @click="searchQuery = ''"
          >
            <X class="h-3.5 w-3.5" />
          </button>
        </div>
        <span v-if="searchQuery" class="text-xs text-muted-foreground whitespace-nowrap shrink-0">
          {{ displayedAthletes.length }}/{{ athletes.length }}
        </span>
      </div>
    </div>

    <Transition name="expand">
      <Card v-if="props.showForm" ref="formCardRef" class="border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-primary">
            <Edit3 v-if="editingId" class="h-5 w-5" />
            <Plus v-else class="h-5 w-5" />
            {{ editingId ? t('athlete.edit') : t('athlete.new') }}
          </CardTitle>
        </CardHeader>

        <CardContent class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 items-end">
          <div class="space-y-1.5">
            <label class="text-[11px] font-bold uppercase ml-1 text-muted-foreground block h-4">{{ t('fields.firstName')
            }}</label>
            <Input v-model="form.firstName" :placeholder="t('fields.firstName')" class="h-10" />
          </div>

          <div class="space-y-1.5">
            <label class="text-[11px] font-bold uppercase ml-1 text-muted-foreground block h-4">{{ t('fields.lastName')
            }}</label>
            <Input v-model="form.lastName" :placeholder="t('fields.lastName')" class="h-10" />
          </div>

          <div class="space-y-1.5">
            <label class="text-[11px] font-bold uppercase ml-1 text-muted-foreground block h-4">{{ t('fields.email')
            }}</label>
            <Input v-model="form.email" type="email" :placeholder="t('fields.email')" class="h-10" />
          </div>

          <div class="space-y-1.5">
            <label class="text-[11px] font-bold uppercase ml-1 text-muted-foreground block h-4">{{
              t('fields.sportCategory') }}</label>
            <Input v-model="form.sportCategory" :placeholder="t('fields.sportCategoryPlaceholder')" class="h-10" />
          </div>

          <div class="space-y-1.5">
            <label class="text-[11px] font-bold uppercase ml-1 text-muted-foreground block h-4 truncate">
              {{ t('fields.birthDate') }}
            </label>
            <Input v-model="form.birthDate" type="date" class="h-10 w-full" />
          </div>

          <div class="space-y-1.5">
            <label class="text-[11px] font-bold uppercase ml-1 text-muted-foreground block h-4">{{ t('fields.weight') }}
              (kg)</label>
            <Input v-model.number="form.weight" type="number" step="0.1" class="h-10" />
          </div>

          <div class="space-y-1.5">
            <label class="text-[11px] font-bold uppercase ml-1 text-muted-foreground block h-4">{{ t('fields.height') }}
              (cm)</label>
            <Input v-model.number="form.height" type="number" class="h-10" />
          </div>

          <div v-if="editingId" class="space-y-1.5 md:col-span-2 lg:col-span-2">
            <label class="text-[11px] font-bold uppercase ml-1 text-muted-foreground block h-4">
              Token Sleep ID
            </label>

            <TooltipProvider :delay-duration="300">
              <div class="flex items-center gap-2">
                <!-- readonly -->
                <Input :model-value="form.tokenSleepId" readonly class="h-10 font-mono text-xs" />
                <!-- copy -->
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      type="button" size="icon" variant="ghost"
                      class="h-9 w-9 shrink-0 transition-colors"
                      :class="tokenCopied ? 'text-green-600 hover:text-green-600' : ''"
                      @click="copyToken(form.tokenSleepId)"
                    >
                      <ClipboardCheck v-if="tokenCopied" class="h-4 w-4" />
                      <Clipboard v-else class="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {{ tokenCopied ? t('athlete.success.tokenCopied') : t('athlete.success.tokenCopied').replace('copiato', 'Copia') }}
                  </TooltipContent>
                </Tooltip>
                <!-- email -->
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      type="button" size="icon" variant="ghost"
                      class="h-9 w-9 shrink-0"
                      @click="sendTokenEmail"
                    >
                      <Mail class="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {{ t('athlete.email.sendTokenTooltip') }}
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>

          <div class="space-y-1.5">
            <label class="text-[11px] font-bold uppercase ml-1 text-muted-foreground block h-4">{{ t('fields.gender')
            }}</label>
            <Select v-model="form.gender">
              <SelectTrigger class="h-10">
                <SelectValue :placeholder="t('fields.genderPlaceholder')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">
                  {{ t('genders.male') }}
                </SelectItem>
                <SelectItem value="F">
                  {{ t('genders.female') }}
                </SelectItem>
                <SelectItem value="O">
                  {{ t('genders.other') }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Sleep source selector — full width row -->
          <div class="space-y-1.5 col-span-full">
            <label class="text-[11px] font-bold uppercase ml-1 text-muted-foreground block h-4">{{ t('fields.sleepSource') }}</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="opt in sleepSourceOptions"
                :key="opt.value"
                type="button"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
                :class="form.preferredSleepSource === opt.value
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'"
                @click="form.preferredSleepSource = opt.value"
              >
                <component :is="opt.icon" class="h-3.5 w-3.5" />
                {{ opt.label }}
              </button>
            </div>
            <p class="text-[10px] text-muted-foreground ml-1 mt-0.5">{{ t('fields.sleepSourceHint') }}</p>
          </div>
        </CardContent>

        <CardFooter class="flex justify-end gap-2 bg-muted/50 p-4 mt-2">
          <Button variant="ghost" @click="resetForm">
            {{ t('common.cancel') }}
          </Button>
          <Button :disabled="loading" @click="saveAthlete">
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            {{ editingId ? t('common.update') : t('common.create') }}
          </Button>
        </CardFooter>
      </Card>
    </Transition>

    <div v-if="loading && athletes.length === 0" class="flex justify-center items-center py-20">
      <Loader2 class="h-12 w-12 animate-spin text-primary" />
    </div>

    <TransitionGroup tag="div" name="grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        v-for="athlete in displayedAthletes" :key="athlete.id"
        class="group relative overflow-hidden border-muted/40 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md card-interactive"
        role="listitem"
      >
        <CardContent class="p-0">
          <div class="flex items-center gap-4 p-5">
            <div
              class="h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-inner"
            >
              <User class="h-7 w-7" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-lg truncate uppercase tracking-tight">
                {{ athlete.firstName }} {{ athlete.lastName }}
              </h3>
              <div class="flex items-center gap-2">
                <Badge variant="secondary" class="text-[10px] font-bold px-2 py-0">
                  {{ athlete.sportCategory }}
                </Badge>
                <span class="text-[11px] text-muted-foreground italic truncate">
                  {{ athlete.email }}
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 border-t border-muted/30 bg-muted/5 py-3 text-center">
            <div>
              <p class="text-[10px] text-muted-foreground uppercase">
                {{ t('fields.age') }}
              </p>
              <p class="text-sm font-semibold">
                {{ athlete.age || '-' }}
              </p>
            </div>
            <div class="border-x border-muted/30">
              <p class="text-[10px] text-muted-foreground uppercase">
                {{ t('fields.weightShort') }}
              </p>
              <p class="text-sm font-semibold">
                {{ athlete.weight }} kg
              </p>
            </div>
            <div>
              <p class="text-[10px] text-muted-foreground uppercase">
                {{ t('fields.heightShort') }}
              </p>
              <p class="text-sm font-semibold">
                {{ athlete.height }} cm
              </p>
            </div>
          </div>
        </CardContent>

        <div class="absolute top-3 right-3 actions-overlay">
          <Button
            variant="ghost" size="icon"
            class="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            @click="editAthlete(athlete)"
            :aria-label="t('common.edit')"
            :title="t('common.edit')"
          >
            <Edit3 class="h-4 w-4" />
          </Button>

          <Button
            variant="ghost" size="icon" class="h-9 w-9 rounded-full text-destructive"
            @click="athleteToDelete = athlete; isDeleteDialogOpen = true"
            :aria-label="t('common.delete')"
            :title="t('common.delete')"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </TransitionGroup>

    <div
      v-if="!loading && athletes.length > 0 && displayedAthletes.length === 0"
      class="text-center py-16 bg-muted/10 rounded-xl border-2 border-dashed"
    >
      <Search class="h-10 w-10 mx-auto text-muted-foreground opacity-40 mb-3" />
      <p class="font-medium text-muted-foreground">{{ t('common.noRecords') }}</p>
      <button type="button" class="mt-2 text-sm text-primary hover:underline" @click="searchQuery = ''">{{ t('common.close') }}</button>
    </div>

    <div
      v-if="!loading && athletes.length === 0"
      class="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed"
    >
      <User class="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
      <p class="text-muted-foreground">
        {{ t('athlete.noData') }}
      </p>
      <Button class="mt-5 gap-1.5" size="sm" @click="openNewAthlete">
        <Plus class="h-4 w-4" />
        {{ t('athlete.new') }}
      </Button>
    </div>
  </div>

  <Dialog v-model:open="isDeleteDialogOpen">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ t('athlete.deleteConfirm') }}</DialogTitle>
      </DialogHeader>
      <div class="py-4">
        <p class="text-sm">
          {{ t('athlete.deleteQuestion') }}
          <span class="font-bold text-foreground">{{ athleteToDelete?.firstName }} {{ athleteToDelete?.lastName
          }}</span>?
        </p>
        <p class="text-[12px] text-destructive mt-2">
          {{ t('athlete.deleteWarning') }}
        </p>
      </div>
      <div class="flex justify-end gap-2">
        <Button variant="ghost" @click="isDeleteDialogOpen = false">
          {{ t('common.cancel') }}
        </Button>
        <Button variant="destructive" :disabled="loading" @click="confirmDelete">
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          {{ t('common.delete') }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 600px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.grid-enter-active,
.grid-leave-active {
  transition: all 0.4s ease;
}

.grid-enter-from,
.grid-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Rimuove lo spin nativo degli input number per un look più pulito */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.card-interactive:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(2,6,23,0.08); }
.card-interactive:focus-within { outline: 2px solid rgba(99,102,241,0.12); }

.actions-overlay {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.group:hover .actions-overlay,
.group:focus-within .actions-overlay {
  opacity: 1;
}
</style>
