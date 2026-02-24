<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Mail, Send, Search, ChevronLeft, ChevronRight,
  CheckCircle2, AlertCircle, Clock, RefreshCcw, Loader2, Loader
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { athleteApi } from '@/api/business'

// UI Components
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// --- STATE ---
const { t } = useI18n()
const isLoading = ref(false)
const rawData = ref<any[]>([])
const pageIndex = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const selectedStatus = ref<string | number>('')
const selectedAthlete = ref<string>('')

/** * Mapping Enum RpeStatus:
 * 0: Pending, 1: Processing, 2: Completed, 3: Failed
 */
const getStatusConfig = (status: number) => {
  switch (status) {
    case 0: // Pending
      return { label: t('rpe.status.pending'), color: 'bg-amber-500/10 text-amber-600 border-amber-200/50', icon: Clock }
    case 1: // Processing
      return { label: t('rpe.status.processing'), color: 'bg-blue-500/10 text-blue-600 border-blue-200/50', icon: Loader }
    case 2: // Completed
      return { label: t('rpe.status.completed'), color: 'bg-green-500/10 text-green-600 border-green-200/50', icon: CheckCircle2 }
    case 3: // Failed
      return { label: t('rpe.status.failed'), color: 'bg-red-500/10 text-red-600 border-red-200/50', icon: AlertCircle }
    default:
      return { label: t('rpe.status.unknown'), color: 'bg-slate-500/10 text-slate-600', icon: Clock }
  }
}

const fetchStatuses = async () => {
  isLoading.value = true
  try {
    const res = await athleteApi.getInfoForEmailStatus(pageIndex.value, pageSize.value)
    if (res.data.value) {
      // keep raw data and let client-side filters/pagination handle presentation
      rawData.value = res.data.value.items
    }
  } catch (error) {
    toast.error(t('rpe.errors.fetch'))
  } finally {
    isLoading.value = false
  }
}

const handleResend = async (email: string, status?: number) => {
  // prevent resending when status is 'Processing' (1)
  if (status === 1) {
    toast.error(t('rpe.errors.cannotResendProcessing') || t('rpe.errors.resend'))
    return
  }

  try {
    await athleteApi.resendRpeEmail(email)
    toast.success(t('rpe.messages.resendSuccess', { email }))
    fetchStatuses()
  } catch {
    toast.error(t('rpe.errors.resend'))
  }
}

const formatDate = (date: string | null) => {
  if (!date) return '--:--'
  return new Date(date).toLocaleString('it-IT', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  })
}

onMounted(fetchStatuses)
watch(pageIndex, () => {
  // when changing pageIndex we don't need to refetch from API for client-side filtering
})

// Derived lists and filtering
const statusOptions = computed(() => {
  const set = new Map<number, string>()
  rawData.value.forEach(r => {
    if (r.statoEmail !== undefined && r.statoEmail !== null) {
      const key = Number(r.statoEmail)
      if (!set.has(key)) set.set(key, getStatusConfig(key).label)
    }
  })
  return Array.from(set.entries()).map(([value, label]) => ({ value, label }))
})

const athleteOptions = computed(() => {
  const set = new Set<string>()
  rawData.value.forEach(r => { if (r.nomeAtleta) set.add(r.nomeAtleta) })
  return Array.from(set.values())
})

const filtered = computed(() => {
  const q = searchQuery.value?.toString().trim().toLowerCase() || ''
  return rawData.value.filter(r => {
    // filter by athlete
    if (selectedAthlete.value && r.nomeAtleta !== selectedAthlete.value) return false
    // filter by status
    if (selectedStatus.value !== '' && String(r.statoEmail) !== String(selectedStatus.value)) return false
    // search across name and email
    if (!q) return true
    const name = (r.nomeAtleta || '').toString().toLowerCase()
    const email = (r.emailAtleta || '').toString().toLowerCase()
    const statusLabel = getStatusConfig(Number(r.statoEmail)).label?.toString().toLowerCase() || ''
    return name.includes(q) || email.includes(q) || statusLabel.includes(q)
  })
})

const totalItems = computed(() => filtered.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize.value)))

const displayedData = computed(() => {
  const start = (pageIndex.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

// reset page when filters/search change
watch([searchQuery, selectedStatus, selectedAthlete], () => { pageIndex.value = 1 })
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Mail class="h-6 w-6 text-primary" />
          {{ t('rpe.pageTitle') }}
        </h1>
        <p class="text-sm text-muted-foreground">{{ t('rpe.pageDescription') }}</p>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <select v-model="selectedAthlete" class="px-2 py-1 bg-background border rounded">
            <option value="">{{ t('rpe.filters.allAthletes') || 'All athletes' }}</option>
            <option v-for="name in athleteOptions" :key="name" :value="name">{{ name }}</option>
          </select>

          <select v-model="selectedStatus" class="px-2 py-1 bg-background border rounded">
            <option value="">{{ t('rpe.filters.allStatuses') || 'All statuses' }}</option>
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>

        <div class="relative w-64">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input v-model="searchQuery" :placeholder="t('rpe.searchPlaceholder')"
            class="pl-9 bg-background border-foreground/10 focus-visible:ring-primary" />
        </div>
        <Button variant="outline" size="icon" @click="fetchStatuses" :disabled="isLoading" class="border-foreground/10">
          <RefreshCcw class="h-4 w-4" :class="{ 'animate-spin': isLoading }" />
        </Button>
      </div>
    </div>

    <Card class="border border-foreground/10 shadow-md overflow-hidden">
      <CardContent class="p-0">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-muted/30 border-b border-foreground/5">
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">{{
                  t('rpe.table.athlete') }}</th>
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">{{
                  t('rpe.table.emailStatus') }}</th>
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">{{
                  t('rpe.table.lastSent') }}</th>
                <th class="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">{{
                  t('rpe.table.submission') }}</th>
                <th class="p-4 text-right"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-foreground/5">
              <tr v-if="isLoading" v-for="i in 5" :key="'skeleton-' + i" class="animate-pulse">
                <td colspan="5" class="p-6">
                  <div class="h-6 bg-muted/50 rounded-full w-full"></div>
                </td>
              </tr>

              <tr v-else-if="displayedData.length > 0" v-for="(row, idx) in displayedData" :key="(row.emailAtleta || 'noemail') + '::' + (row.nomeAtleta || 'noname') + '::' + idx"
                class="hover:bg-muted/30 transition-colors group">
                <td class="p-4">
                  <div class="flex flex-col">
                    <span class="font-semibold text-sm text-foreground">{{ row.nomeAtleta }}</span>
                    <span class="text-xs text-muted-foreground/70">{{ row.emailAtleta }}</span>
                  </div>
                </td>
                <td class="p-4">
                  <Badge variant="outline" class="gap-1.5 px-2 py-0.5 font-bold text-[10px] border shadow-none"
                    :class="getStatusConfig(row.statoEmail).color">
                    <component :is="getStatusConfig(row.statoEmail).icon" class="h-3 w-3" />
                    {{ getStatusConfig(row.statoEmail).label }}
                  </Badge>
                </td>
                <td class="p-4 text-sm font-medium text-muted-foreground">
                  {{ formatDate(row.dataInvio) }}
                </td>
                <td class="p-4 text-sm font-bold text-primary">
                  <div v-if="row.dataInserimento" class="flex items-center gap-1.5">
                    <CheckCircle2 class="h-3.5 w-3.5" /> {{ formatDate(row.dataInserimento) }}
                  </div>
                  <span v-else class="text-xs font-medium text-muted-foreground/40 italic">
                    {{ t('rpe.status.waiting') }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all"
                    :disabled="row.statoEmail === 1"
                    :title="row.statoEmail === 1 ? t('rpe.status.processing') : t('rpe.actions.resend')"
                    @click="handleResend(row.emailAtleta, row.statoEmail)">
                    <Send class="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>

              <tr v-else>
                <td colspan="5" class="p-20 text-center">
                  <div class="flex flex-col items-center gap-2 opacity-40">
                    <Mail class="h-10 w-10" />
                    <span class="text-sm font-bold uppercase tracking-widest">{{ t('common.noRecords') }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>

      <div class="p-4 border-t border-foreground/5 flex items-center justify-between bg-muted/10">
        <span class="text-xs font-medium text-muted-foreground">
          {{ t('common.paginationInfo', { current: pageIndex, total: totalPages, count: totalItems }) }}
        </span>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" class="h-8 border-foreground/10 font-semibold text-xs"
            :disabled="pageIndex === 1" @click="pageIndex--">
            <ChevronLeft class="h-4 w-4 mr-1" /> {{ t('common.prev') }}
          </Button>
          <Button variant="outline" size="sm" class="h-8 border-foreground/10 font-semibold text-xs"
            :disabled="pageIndex === totalPages" @click="pageIndex++">
            {{ t('common.next') }}
            <ChevronRight class="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  </div>
</template>