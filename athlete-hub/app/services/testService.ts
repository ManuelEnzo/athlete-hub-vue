import { ref } from 'vue'
import { athleteApi } from '~/api/business'
import type { TestComparisonDto } from '~/types/api'

export function useTestService() {
  const data = ref<TestComparisonDto[] | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const fetchForAthlete = async (athleteId: number) => {
    loading.value = true
    error.value = null
    data.value = null
    try {
      const res = await athleteApi.getTestComparisons(athleteId)
      if (!res.data.isSuccess) throw new Error(res.data.error?.message || 'API error')
      data.value = res.data.value ?? []
      return data.value
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw error.value
    }
    finally {
      loading.value = false
    }
  }

  return {
    data,
    loading,
    error,
    fetchForAthlete,
  }
}
