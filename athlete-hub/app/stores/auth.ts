import type { UserProfileResponse } from '~/types/api'
import { defineStore } from 'pinia'
import { authApi } from '~/api/auth'
import { useErrorHandler } from '~/composables/useErrorHandler'

export const useAuthStore = defineStore('auth', () => {
  // Cookie veri, mutabili
  const cookieOptions = { path: '/', sameSite: 'lax' as const, secure: import.meta.env.PROD }
  const tokenCookie = useCookie<string | null>('auth_token', cookieOptions)
  const refreshCookie = useCookie<string | null>('refresh_token', cookieOptions)

  // Computed in sola lettura (ok)
  const token = computed(() => tokenCookie.value)
  const refreshToken = computed(() => refreshCookie.value)

  const user = ref<UserProfileResponse | null>(null)

  async function fetchProfile() {
    if (!token.value) {
      return
    }

    try {
      const response = await authApi.getProfile()
      if (response.data.isSuccess && response.data.value) {
        user.value = response.data.value
      }
    }
    catch (error) {
      const handler = useErrorHandler({ component: 'AuthStore' })
      handler.handleError(error instanceof Error ? error : new Error(String(error)))
    }
  }

  function setTokens(at: string | null, rt: string | null) {
    tokenCookie.value = at
    refreshCookie.value = rt
  }

  async function logout() {
    let shouldNavigate = false

    try {
      if (token.value) {
        await authApi.logout()
      }
      shouldNavigate = true
    }
    catch (error) {
      const handler = useErrorHandler({ component: 'AuthStore' })
      handler.handleError(error instanceof Error ? error : new Error(String(error)))
      shouldNavigate = true
    }
    finally {
      setTokens(null, null)
      user.value = null

      // Remove only auth-related localStorage keys
      try {
        if (import.meta.client) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
        }
      }
      catch {
        // ignore storage errors
      }
    }

    if (shouldNavigate) {
      return navigateTo('/login')
    }
  }

  return {
    token,
    refreshToken,
    user,
    fetchProfile,
    setTokens,
    logout,
  }
})
