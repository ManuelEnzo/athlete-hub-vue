/**
 * 📄 PAGINATION COMPOSABLE
 *
 * Handles paginated API responses with proper loading states
 * Reduces initial payload from 500-1000 items to 20-50 items
 */

import { computed, ref } from 'vue'

export interface PaginationMeta {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function usePagination(initialPageSize: number = 20) {
  const currentPage = ref(1)
  const pageSize = ref(initialPageSize)
  const totalItems = ref(0)
  const items = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  // Computed properties
  const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))
  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)
  const offset = computed(() => (currentPage.value - 1) * pageSize.value)

  const metadata = computed<PaginationMeta>(() => ({
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    totalItems: totalItems.value,
    totalPages: totalPages.value,
    hasNextPage: hasNextPage.value,
    hasPrevPage: hasPrevPage.value,
  }))

  /**
   * Fetch paginated data
   */
  const paginate = async (
    fetcher: (pageIndex: number, pageSize: number) => Promise<{
      data: any[]
      total: number
    }>,
  ) => {
    isLoading.value = true
    error.value = null

    try {
      // API uses 0-indexed page numbers
      const result = await fetcher(currentPage.value - 1, pageSize.value)
      items.value = result.data
      totalItems.value = result.total
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      console.error('[Pagination] Fetch failed:', error.value)
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Navigate to next page
   */
  const nextPage = async (fetcher: (...args: unknown[]) => Promise<any>) => {
    if (hasNextPage.value) {
      currentPage.value++
      await paginate(fetcher as any)
    }
  }

  /**
   * Navigate to previous page
   */
  const prevPage = async (fetcher: (...args: unknown[]) => Promise<any>) => {
    if (hasPrevPage.value) {
      currentPage.value--
      await paginate(fetcher as any)
    }
  }

  /**
   * Go to specific page
   */
  const goToPage = async (page: number, fetcher: (...args: unknown[]) => Promise<any>) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      await paginate(fetcher as any)
    }
  }

  /**
   * Change page size (resets to page 1)
   */
  const changePageSize = async (newSize: number, fetcher: (...args: unknown[]) => Promise<any>) => {
    pageSize.value = newSize
    currentPage.value = 1
    await paginate(fetcher as any)
  }

  /**
   * Reset pagination state
   */
  const reset = () => {
    currentPage.value = 1
    items.value = []
    totalItems.value = 0
    error.value = null
  }

  return {
    // State
    items,
    isLoading,
    error,
    currentPage,
    pageSize,
    totalItems,
    totalPages,

    // Computed
    hasNextPage,
    hasPrevPage,
    offset,
    metadata,

    // Methods
    paginate,
    nextPage,
    prevPage,
    goToPage,
    changePageSize,
    reset,
  }
}

/**
 * Example usage in a component:
 *
 * const { items, isLoading, paginate, nextPage, hasNextPage } = usePagination(20)
 *
 * const fetchAthletes = async (pageIndex: number, pageSize: number) => {
 *   const response = await athleteApi.getAll(pageIndex, pageSize)
 *   return {
 *     data: response.data.value,
 *     total: response.data.total
 *   }
 * }
 *
 * onMounted(() => paginate(fetchAthletes))
 */
