import { defineStore } from 'pinia'
import { authApi } from '~/api/auth' // Assicurati che il percorso sia corretto
import type { UserProfileResponse } from '~/types/api'

export const useAuthStore = defineStore('auth', () => {
  // Cookies per i token
  const token = useCookie<string | null>('auth_token', { path: '/' })
  const refreshToken = useCookie<string | null>('refresh_token', { path: '/' })
  
  // Stato per i dati dell'utente
  const user = ref<UserProfileResponse | null>(null)

  // Carica il profilo dal backend
  async function fetchProfile() {
    // Se non c'è il token, inutile chiamare l'API
    if (!token.value) return

    try {
      const response = await authApi.getProfile()
      if (response.data.isSuccess && response.data.value) {
        user.value = response.data.value
        console.log("PINIA: Profilo caricato", user.value)
      }
    } catch (error) {
      console.error("PINIA: Errore durante il recupero del profilo", error)
      // Se il profilo fallisce perché il token è invalido, potresti forzare il logout
      // await logout() 
    }
  }

  async function logout() {
    console.log("PINIA: Entrato in logout()");
    const userToken = token.value;

    try {
      if (userToken) {
        // Usiamo l'istanza api centralizzata (che passa già il token)
        // o la tua chiamata specifica
        await authApi.logout() 
        console.log("PINIA: API Logout completata");
      }
    } catch (error) {
      console.error("PINIA: Errore API logout:", error);
    } finally {
      // Pulizia totale
      token.value = null
      refreshToken.value = null
      user.value = null // Resetta anche l'utente!

      console.log("PINIA: Logout completato, redirect...");
      return navigateTo('/login')
    }
  }

  return {
    token,
    refreshToken,
    user, // Esponiamo l'utente
    fetchProfile, // Esponiamo l'azione per caricare il profilo
    setTokens: (at: string, rt: string) => {
      token.value = at
      refreshToken.value = rt
    },
    logout
  }
})