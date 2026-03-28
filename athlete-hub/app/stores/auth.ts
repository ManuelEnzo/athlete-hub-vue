import { defineStore } from 'pinia'
import { authApi } from '~/api/auth'
import type { UserProfileResponse } from '~/types/api'

export const useAuthStore = defineStore('auth', () => {
  // Cookie veri, mutabili
  const tokenCookie = useCookie<string | null>('auth_token', { path: '/' })
  const refreshCookie = useCookie<string | null>('refresh_token', { path: '/' })

  // Computed in sola lettura (ok)
  const token = computed(() => tokenCookie.value)
  const refreshToken = computed(() => refreshCookie.value)

  const user = ref<UserProfileResponse | null>(null)

  async function fetchProfile() {
    if (!token.value) return
    try {
      const response = await authApi.getProfile()
      if (response.data.isSuccess && response.data.value) {
        user.value = response.data.value
      }
    } catch (error) {
      console.error("Errore fetchProfile:", error)
    }
  }

  function setTokens(at: string | null, rt: string | null) {
    tokenCookie.value = at
    refreshCookie.value = rt
  }

  async function logout() {
    try {
      if (token.value) {
        await authApi.logout()
      }
    } catch (error) {
      console.error("Errore logout:", error)
    } finally {
      setTokens(null, null)
      user.value = null
      return navigateTo('/login')
    }
  }

  return {
    token,
    refreshToken,
    user,
    fetchProfile,
    setTokens,
    logout
  }
})
