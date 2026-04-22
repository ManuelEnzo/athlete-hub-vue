<script setup lang="ts">
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader,
  Mail,
  RefreshCcw,
  Search,
  Send,
} from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { athleteApi } from '@/api/business'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { useAuthStore } from '~/stores/auth'
import { useNotificationStore } from '~/stores/notificationStore'

const { t } = useI18n()
const handler = useErrorHandler({ component: 'MailCompLayout' })
const notifications = useNotificationStore()
const auth = useAuthStore()

// STATE
const isLoading = ref(false)
const rawData = ref<any[]>([])
const pageIndex = ref(1)
const pageSize = ref(10)

const totalItems = ref(0)
const totalPages = ref(1)

const searchQuery = ref('')
const selectedStatus = ref<string>('__all__')
const selectedAthlete = ref<string>('__all__')

// STATUS CONFIG
function getStatusConfig(status: number) {
  switch (status) {
    case 0:
      return { label: t('rpe.status.pending'), color: 'bg-amber-500/10 text-amber-600 border-amber-200/50', icon: Clock }
    case 1:
      return { label: t('rpe.status.processing'), color: 'bg-blue-500/10 text-blue-600 border-blue-200/50', icon: Loader }
    case 2:
      return { label: t('rpe.status.completed'), color: 'bg-green-500/10 text-green-600 border-green-200/50', icon: CheckCircle2 }
    case 3:
      return { label: t('rpe.status.failed'), color: 'bg-red-500/10 text-red-600 border-red-200/50', icon: AlertCircle }
    default:
      return { label: t('rpe.status.unknown'), color: 'bg-slate-500/10 text-slate-600', icon: Clock }
  }
}

// FETCH (SERVER PAGINATION)
async function fetchStatuses() {
  isLoading.value = true
  try {
    const res = await athleteApi.getInfoForEmailStatus(pageIndex.value, pageSize.value)

    if (res.data.value) {
      rawData.value = res.data.value.items
      totalItems.value = res.data.value.totalCount
      totalPages.value = res.data.value.totalPages
    }
  }
  catch (error) {
    handler.handleError(error instanceof Error ? error : new Error(t('rpe.errors.fetch')))
  }
  finally {
    isLoading.value = false
  }
}

// RESEND
async function handleResend(emailId: number) {
  try {
    await athleteApi.resendRpeEmail(emailId)
    notifications.success('', t('rpe.messages.resendSuccess', { emailId }))
    fetchStatuses()
  }
  catch (err) {
    handler.handleError(err instanceof Error ? err : new Error(t('rpe.errors.resend')))
  }
}

// DATE FORMAT
function formatDate(date: string | null) {
  if (!date)
    return '--:--'
  return new Date(date).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// LOAD FIRST PAGE
onMounted(() => {
  // Ensure auth profile and then load statuses
  auth.fetchProfile().catch(err => handler.handleError(err instanceof Error ? err : new Error(String(err))))
  fetchStatuses()
})

// WHEN PAGE CHANGES → REFETCH
watch(pageIndex, () => {
  fetchStatuses()
})

// FILTERS
const statusOptions = computed(() => {
  const set = new Map<number, string>()
  rawData.value.forEach((r) => {
    if (r.statoEmail !== undefined && r.statoEmail !== null) {
      const key = Number(r.statoEmail)
      if (!set.has(key))
        set.set(key, getStatusConfig(key).label)
    }
  })
  return Array.from(set.entries()).map(([value, label]) => ({ value, label }))
})

const athleteOptions = computed(() => {
  const set = new Set<string>()
  rawData.value.forEach((r) => {
    if (r.nomeAtleta)
      set.add(r.nomeAtleta)
  })
  return Array.from(set.values())
})

const filtered = computed(() => {
  const q = searchQuery.value?.toString().trim().toLowerCase() || ''
  return rawData.value.filter((r) => {
    if (selectedAthlete.value !== '__all__' && r.nomeAtleta !== selectedAthlete.value)
      return false
    if (selectedStatus.value !== '__all__' && String(r.statoEmail) !== String(selectedStatus.value))
      return false

    if (!q)
      return true

    const name = (r.nomeAtleta || '').toLowerCase()
    const email = (r.emailAtleta || '').toLowerCase()
    const statusLabel = getStatusConfig(Number(r.statoEmail)).label.toLowerCase()

    return name.includes(q) || email.includes(q) || statusLabel.includes(q)
  })
})

// DISPLAYED DATA = FILTERED (NO CLIENT PAGINATION)
const displayedData = computed(() => filtered.value)

// RESET PAGE WHEN FILTERS CHANGE
watch([searchQuery, selectedStatus, selectedAthlete], () => {
  pageIndex.value = 1
})

// STATS
const stats = computed(() => {
  const all = rawData.value
  return {
    total: totalItems.value,
    completed: all.filter(r => r.statoEmail === 2).length,
    pending: all.filter(r => r.statoEmail === 0).length,
    failed: all.filter(r => r.statoEmail === 3).length,
  }
})
</script>

<template>
  <div class="min-h-full bg-background">
    <!-- Page Header -->
    <div class="border-b border-border/60 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
      <div class="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20">
            <Mail class="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h1 class="text-base font-semibold tracking-tight text-foreground leading-none">
              {{ t('rpe.pageTitle') }}
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">
              {{ t('rpe.pageDescription') }}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          :disabled="isLoading"
          class="gap-1.5 h-8 text-xs font-medium border-border/60 self-start sm:self-auto"
          @click="fetchStatuses"
        >
          <RefreshCcw class="h-3.5 w-3.5" :class="{ 'animate-spin': isLoading }" />
          {{ t('common.refresh') || 'Aggiorna' }}
        </Button>
      </div>
    </div>

    <div class="px-6 py-6 space-y-6">
      <!-- Stats Row -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="rounded-xl border border-border/60 bg-card p-4 flex flex-col gap-1">
          <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Totale</span>
          <span class="text-2xl font-bold text-foreground tabular-nums">{{ stats.total }}</span>
        </div>
        <div class="rounded-xl border border-green-500/20 bg-green-500/5 p-4 flex flex-col gap-1">
          <span class="text-xs font-medium text-green-600 uppercase tracking-wider">Completati</span>
          <span class="text-2xl font-bold text-green-600 tabular-nums">{{ stats.completed }}</span>
        </div>
        <div class="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col gap-1">
          <span class="text-xs font-medium text-amber-600 uppercase tracking-wider">In attesa</span>
          <span class="text-2xl font-bold text-amber-600 tabular-nums">{{ stats.pending }}</span>
        </div>
        <div class="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex flex-col gap-1">
          <span class="text-xs font-medium text-red-600 uppercase tracking-wider">Falliti</span>
          <span class="text-2xl font-bold text-red-600 tabular-nums">{{ stats.failed }}</span>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="flex flex-col sm:flex-row gap-2.5">
        <div class="relative flex-1 max-w-xs">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
          <Input
            v-model="searchQuery"
            :placeholder="t('rpe.searchPlaceholder')"
            class="pl-9 h-9 text-sm bg-background border-border/60 focus-visible:ring-primary/30"
          />
        </div>

        <Select v-model="selectedAthlete">
          <SelectTrigger class="h-9 w-full sm:w-44 text-sm border-border/60">
            <SelectValue :placeholder="t('rpe.filters.allAthletes') || 'Tutti gli atleti'" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">
              {{ t('rpe.filters.allAthletes') || 'Tutti gli atleti' }}
            </SelectItem>
            <SelectItem v-for="name in athleteOptions" :key="name" :value="name">
              {{ name }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="selectedStatus">
          <SelectTrigger class="h-9 w-full sm:w-44 text-sm border-border/60">
            <SelectValue :placeholder="t('rpe.filters.allStatuses') || 'Tutti gli stati'" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">
              {{ t('rpe.filters.allStatuses') || 'Tutti gli stati' }}
            </SelectItem>
            <SelectItem v-for="opt in statusOptions" :key="opt.value" :value="String(opt.value)">
              {{ opt.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Desktop Table -->
      <Card class="hidden md:block border border-border/60 shadow-sm overflow-hidden">
        <CardContent class="p-0">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-border/60 bg-muted/40">
                <th class="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {{ t('rpe.table.athlete') }}
                </th>
                <th class="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {{ t('rpe.table.emailStatus') }}
                </th>
                <th class="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {{ t('rpe.table.lastSent') }}
                </th>
                <th class="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {{ t('rpe.table.submission') }}
                </th>
                <th class="px-5 py-3 w-12" />
              </tr>
            </thead>
            <tbody>
              <!-- Loading skeleton -->
              <template v-if="isLoading">
                <tr v-for="i in 6" :key="`sk-${i}`" class="border-b border-border/40 last:border-0">
                  <td class="px-5 py-4">
                    <div class="space-y-1.5">
                      <div class="h-3.5 bg-muted animate-pulse rounded-full w-32" />
                      <div class="h-2.5 bg-muted animate-pulse rounded-full w-44 opacity-60" />
                    </div>
                  </td>
                  <td class="px-5 py-4">
                    <div class="h-5 bg-muted animate-pulse rounded-full w-20" />
                  </td>
                  <td class="px-5 py-4">
                    <div class="h-3.5 bg-muted animate-pulse rounded-full w-24" />
                  </td>
                  <td class="px-5 py-4">
                    <div class="h-3.5 bg-muted animate-pulse rounded-full w-24" />
                  </td>
                  <td class="px-5 py-4" />
                </tr>
              </template>

              <!-- Data rows -->
              <template v-else-if="displayedData.length > 0">
                <tr
                  v-for="(row, idx) in displayedData"
                  :key="`${row.emailAtleta || 'noemail'}::${row.nomeAtleta || 'noname'}::${idx}`"
                  class="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors group"
                >
                  <td class="px-5 py-4">
                    <div class="flex flex-col gap-0.5">
                      <span class="text-sm font-semibold text-foreground leading-none">{{ row.nomeAtleta }}</span>
                      <span class="text-xs text-muted-foreground">{{ row.emailAtleta }}</span>
                    </div>
                  </td>
                  <td class="px-5 py-4">
                    <Badge
                      variant="outline"
                      class="gap-1.5 px-2.5 py-1 text-[11px] font-semibold border rounded-md shadow-none"
                      :class="getStatusConfig(row.statoEmail).color"
                    >
                      <component :is="getStatusConfig(row.statoEmail).icon" class="h-3 w-3" />
                      {{ getStatusConfig(row.statoEmail).label }}
                    </Badge>
                  </td>
                  <td class="px-5 py-4">
                    <span class="text-sm text-muted-foreground tabular-nums">{{ formatDate(row.dataInvio) }}</span>
                  </td>
                  <td class="px-5 py-4">
                    <div v-if="row.dataInserimento" class="flex items-center gap-1.5 text-green-600">
                      <CheckCircle2 class="h-3.5 w-3.5 shrink-0" />
                      <span class="text-sm font-medium tabular-nums">{{ formatDate(row.dataInserimento) }}</span>
                    </div>
                    <span v-else class="text-xs text-muted-foreground/50 italic">{{ t('rpe.status.waiting') }}</span>
                  </td>
                  <td class="px-5 py-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary"
                      :title="t('rpe.actions.resend')"
                      @click="handleResend(row.emailId)"
                    >
                      <Send class="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              </template>

              <!-- Empty state -->
              <template v-else>
                <tr>
                  <td colspan="5" class="py-20">
                    <div class="flex flex-col items-center gap-3 text-muted-foreground/40">
                      <div class="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                        <Mail class="h-5 w-5" />
                      </div>
                      <div class="text-center">
                        <p class="text-sm font-semibold">{{ t('common.noRecords') }}</p>
                        <p class="text-xs mt-0.5 opacity-70">Nessuna email trovata per i filtri selezionati</p>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </CardContent>

        <!-- Pagination footer -->
        <div class="px-5 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-between">
          <span class="text-xs text-muted-foreground">
            {{ t('common.paginationInfo', { current: pageIndex, total: totalPages, count: totalItems }) }}
          </span>
          <div class="flex items-center gap-1.5">
            <Button
              variant="outline" size="sm"
              class="h-7 px-2.5 text-xs font-medium border-border/60"
              :disabled="pageIndex === 1"
              @click="pageIndex--"
            >
              <ChevronLeft class="h-3.5 w-3.5 mr-1" />{{ t('common.prev') }}
            </Button>
            <span class="text-xs font-medium text-muted-foreground px-2">{{ pageIndex }} / {{ totalPages }}</span>
            <Button
              variant="outline" size="sm"
              class="h-7 px-2.5 text-xs font-medium border-border/60"
              :disabled="pageIndex === totalPages"
              @click="pageIndex++"
            >
              {{ t('common.next') }}<ChevronRight class="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      <!-- Mobile Card View -->
      <div class="md:hidden space-y-2.5">
        <!-- Loading -->
        <div v-if="isLoading" class="space-y-2.5">
          <div v-for="i in 4" :key="`sk-m-${i}`" class="h-28 bg-muted/40 rounded-xl animate-pulse border border-border/40" />
        </div>

        <!-- Data -->
        <template v-else-if="displayedData.length > 0">
          <Card
            v-for="(row, idx) in displayedData"
            :key="`${row.emailAtleta || 'noemail'}::${row.nomeAtleta || 'noname'}::${idx}`"
            class="border border-border/60 shadow-none overflow-hidden"
          >
            <CardContent class="p-4 space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div class="flex flex-col gap-0.5 min-w-0">
                  <span class="text-sm font-semibold text-foreground truncate">{{ row.nomeAtleta }}</span>
                  <span class="text-xs text-muted-foreground truncate">{{ row.emailAtleta }}</span>
                </div>
                <Badge
                  variant="outline"
                  class="shrink-0 gap-1.5 px-2 py-0.5 text-[11px] font-semibold border shadow-none"
                  :class="getStatusConfig(row.statoEmail).color"
                >
                  <component :is="getStatusConfig(row.statoEmail).icon" class="h-2.5 w-2.5" />
                  {{ getStatusConfig(row.statoEmail).label }}
                </Badge>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-0.5">
                  <p class="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{{ t('rpe.table.lastSent') }}</p>
                  <p class="text-xs font-medium tabular-nums">{{ formatDate(row.dataInvio) }}</p>
                </div>
                <div class="space-y-0.5">
                  <p class="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{{ t('rpe.table.submission') }}</p>
                  <div v-if="row.dataInserimento" class="flex items-center gap-1 text-green-600">
                    <CheckCircle2 class="h-3 w-3 shrink-0" />
                    <span class="text-xs font-medium tabular-nums">{{ formatDate(row.dataInserimento) }}</span>
                  </div>
                  <span v-else class="text-xs text-muted-foreground/50 italic">{{ t('rpe.status.waiting') }}</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                class="w-full h-8 text-xs font-medium gap-1.5 border-border/60"
                @click="handleResend(row.emailId)"
              >
                <Send class="h-3 w-3" />{{ t('rpe.actions.resend') }}
              </Button>
            </CardContent>
          </Card>
        </template>

        <!-- Empty -->
        <div v-else class="py-20 flex flex-col items-center gap-3 text-muted-foreground/40">
          <div class="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
            <Mail class="h-5 w-5" />
          </div>
          <p class="text-sm font-semibold">{{ t('common.noRecords') }}</p>
        </div>

        <!-- Mobile Pagination -->
        <div class="flex items-center justify-between pt-1">
          <span class="text-xs text-muted-foreground">
            {{ t('common.paginationInfo', { current: pageIndex, total: totalPages, count: totalItems }) }}
          </span>
          <div class="flex gap-1.5">
            <Button
              variant="outline" size="icon"
              class="h-8 w-8 border-border/60"
              :disabled="pageIndex === 1"
              @click="pageIndex--"
            >
              <ChevronLeft class="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline" size="icon"
              class="h-8 w-8 border-border/60"
              :disabled="pageIndex === totalPages"
              @click="pageIndex++"
            >
              <ChevronRight class="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
