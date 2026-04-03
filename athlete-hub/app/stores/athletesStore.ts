/**
 * 👥 ATHLETES STORE - CENTRALIZZATO
 *
 * Gestisce atleti con:
 * - Filtering e sorting centralizzati
 * - Paginazione intelligente
 * - Caching per ogni page
 * - Real-time search
 *
 * Save as: app/stores/athletesStore.ts
 */

import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { useAthletesService } from '~/services/dataService'

export type SortField = 'firstName' | 'lastName' | 'fullName' | 'email' | 'sportCategory' | 'age'
export type SortOrder = 'asc' | 'desc'

interface SortConfig {
  field: SortField
  order: SortOrder
}

export const useAthletesStore = defineStore('athletes', () => {
  const dataService = useAthletesService()

  // State
  const sortConfig = ref<SortConfig>({ field: 'fullName', order: 'asc' })
  const searchQuery = ref('')
  const selectedDiscipline = ref<string | null>(null)
  const selectedStatus = ref<string | null>(null)

  // Watch filters and update service
  watch(
    () => ({
      search: searchQuery.value,
      discipline: selectedDiscipline.value,
      status: selectedStatus.value,
    }),
    (newFilters) => {
      dataService.setFilters({
        search: newFilters.search,
        discipline: newFilters.discipline || undefined,
        status: newFilters.status || undefined,
      })
    },
    { immediate: false },
  )

  // Load initial data
  const initialize = async () => {
    try {
      await dataService.fetch(0, 20)
    }
    catch (err) {
      const handler = useErrorHandler({ component: 'AthletesStore' })
      handler.handleError(err instanceof Error ? err : new Error(String(err)))
    }
  }

  // Sorting
  const sort = (field: SortField) => {
    if (sortConfig.value.field === field) {
      // Toggle sort order
      sortConfig.value.order = sortConfig.value.order === 'asc' ? 'desc' : 'asc'
    }
    else {
      sortConfig.value = { field, order: 'asc' }
    }
  }

  // Sorted athletes
  const sortedItems = computed(() => {
    const items = dataService.filtered.value
    if (!items)
      return []

    const sorted = [...items].sort((a, b) => {
      let aValue: any = a[sortConfig.value.field]
      let bValue: any = b[sortConfig.value.field]

      // Handle null/undefined
      if (aValue == null && bValue == null)
        return 0
      if (aValue == null)
        return 1
      if (bValue == null)
        return -1

      // String comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue)
        return sortConfig.value.order === 'asc' ? -1 : 1
      if (aValue > bValue)
        return sortConfig.value.order === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  })

  // Getters
  const items = computed(() => sortedItems.value)
  const total = computed(() => dataService.total.value)
  const loading = computed(() => dataService.loading.value)
  const error = computed(() => dataService.error.value)
  const currentPage = computed(() => dataService.currentPage.value)
  const pageSize = computed(() => dataService.pageSize.value)
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
  const hasNextPage = computed(() => currentPage.value < totalPages.value - 1)
  const hasPrevPage = computed(() => currentPage.value > 0)

  // Pagination
  const nextPage = async () => {
    return dataService.nextPage()
  }

  const prevPage = async () => {
    return dataService.prevPage()
  }

  const goToPage = async (page: number) => {
    if (page >= 0 && page < totalPages.value) {
      return dataService.fetch(page, pageSize.value)
    }
  }

  // Filtering
  const search = (query: string) => {
    searchQuery.value = query
  }

  const filterByDiscipline = (discipline: string | null) => {
    selectedDiscipline.value = discipline
  }

  const filterByStatus = (status: string | null) => {
    selectedStatus.value = status
  }

  const clearFilters = () => {
    searchQuery.value = ''
    selectedDiscipline.value = null
    selectedStatus.value = null
    dataService.setFilters({})
  }

  // Get unique disciplines for filter dropdown
  const disciplines = computed(() => {
    const all = dataService.items.value
    const disciplines = new Set(all?.map(a => a.sportCategory).filter(Boolean))
    return Array.from(disciplines)
  })

  // Get unique statuses for filter dropdown
  const statuses = computed(() => {
    // Placeholder, no status field in AthleteResponse
    return []
  })

  return {
    // State
    items,
    total,
    loading,
    error,
    currentPage,
    pageSize,
    totalPages,
    hasNextPage,
    hasPrevPage,
    sortConfig: computed(() => sortConfig.value),
    searchQuery: computed(() => searchQuery.value),
    selectedDiscipline: computed(() => selectedDiscipline.value),
    selectedStatus: computed(() => selectedStatus.value),
    disciplines,
    statuses,

    // Methods
    initialize,
    sort,
    nextPage,
    prevPage,
    goToPage,
    search,
    filterByDiscipline,
    filterByStatus,
    clearFilters,
  }
})
