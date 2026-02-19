<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
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
const data = ref<any[]>([])
const pageIndex = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const totalPages = ref(0)
const searchQuery = ref('')

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
      data.value = res.data.value.items
      totalItems.value = res.data.value.totalCount
      totalPages.value = Math.ceil(totalItems.value / pageSize.value)
    }
  } catch (error) {
    toast.error(t('rpe.errors.fetch'))
  } finally {
    isLoading.value = false
  }
}

const handleResend = async (email: string) => {
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
watch(pageIndex, fetchStatuses)
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

              <tr v-else-if="data.length > 0" v-for="row in data" :key="row.emailAtleta"
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
                  <Button variant="ghost" size="icon" class="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all"
                    @click="handleResend(row.emailAtleta)">
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