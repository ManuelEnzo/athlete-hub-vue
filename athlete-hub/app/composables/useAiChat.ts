import type { Ref } from 'vue'
import { ref } from 'vue'
import { safePost } from '~/api/http'
import { useAuthStore } from '~/stores/auth'

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface AiChatRequest {
  message: string
  sessionToken?: string | null
}

export interface AiChatResponse {
  success: boolean
  intent: string
  commandType: string
  message: string
  data: any | null
  warnings: string[]
  insights: string[]
  errors: string[]
  // multi-turn
  awaitingInput: boolean
  sessionToken: string | null
  missingFields: string[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  response?: AiChatResponse
  loading?: boolean
  error?: boolean
}

// ─── Composable ──────────────────────────────────────────────────────────────

export function useAiChat() {
  const authStore = useAuthStore()
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const awaitingInput = ref(false)
  const currentSessionToken = ref<string | null>(null)

  const sendMessage = async (userText: string): Promise<AiChatResponse | null> => {
    const trimmed = userText.trim()
    if (!trimmed) return null

    // Guard: require authenticated session before sending
    if (!authStore.token) {
      error.value = 'Unauthenticated: missing Bearer token'
      return null
    }

    messages.value.push({ role: 'user', content: trimmed })
    isLoading.value = true
    error.value = null

    const assistantMsg: ChatMessage = { role: 'assistant', content: '', loading: true }
    messages.value.push(assistantMsg)

    try {
      const payload: AiChatRequest = {
        message: trimmed,
        sessionToken: currentSessionToken.value,
      }
      const data = await safePost<AiChatResponse>('/ai/chat', payload)

      // Update session token: keep it alive while bot is still asking questions
      currentSessionToken.value = data.awaitingInput ? data.sessionToken : null
      awaitingInput.value = data.awaitingInput ?? false

      const last = messages.value[messages.value.length - 1]
      if (last) {
        last.content = data.message ?? ''
        last.response = data
        last.loading = false
      }

      return data
    }
    catch (e: any) {
      error.value = e.message ?? 'Unknown error'
      awaitingInput.value = false
      currentSessionToken.value = null
      const last = messages.value[messages.value.length - 1]
      if (last) {
        last.content = ''
        last.loading = false
        last.error = true
      }
      return null
    }
    finally {
      isLoading.value = false
    }
  }

  const clearMessages = () => {
    messages.value = []
    error.value = null
    awaitingInput.value = false
    currentSessionToken.value = null
  }

  return {
    messages,
    isLoading,
    error,
    awaitingInput,
    sendMessage,
    clearMessages,
  }
}
