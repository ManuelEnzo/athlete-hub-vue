<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAiChat } from '~/composables/useAiChat'
import AiDataCard from './AiDataCard.vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AI_SUGGESTIONS } from '~/constants/aiSuggestions'

const { t } = useI18n()
const { messages, isLoading, error, awaitingInput, sendMessage, clearMessages } = useAiChat()

const inputText = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLTextAreaElement | null>(null)

async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({ top: messagesContainer.value.scrollHeight, behavior: 'smooth' })
  }
}

// Auto-scroll whenever messages change (new message added OR bot response updates)
watch(messages, scrollToBottom, { deep: true })

async function send() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return
  inputText.value = ''
  // send and then ensure UI scrolls and input remains focused so the user can continue typing
  await sendMessage(text)
  await scrollToBottom()
  await nextTick()
  if (inputRef.value) {
    try {
      inputRef.value.focus()
      const len = inputRef.value.value?.length || 0
      inputRef.value.setSelectionRange(len, len)
    }
    catch (e) {
      // ignore focus/selection errors in non-DOM environments
    }
  }
}

function useSuggestion(text: string) {
  inputText.value = text
  inputRef.value?.focus()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

// Determine bubble style based on response
function bubbleClass(msg: typeof messages.value[0]) {
  if (msg.role === 'user') return 'bg-primary text-primary-foreground self-end'
  if (msg.error) return 'bg-destructive/10 border border-destructive/30 text-destructive self-start'
  if (msg.response?.commandType === 'Fallback' || msg.response?.intent === 'external_ai') return 'bg-muted/80 border border-border text-muted-foreground self-start'
  if (msg.response && !msg.response.success) return 'bg-destructive/10 border border-destructive/30 text-foreground self-start'
  if (msg.response?.awaitingInput) return 'bg-primary/5 border border-primary/40 text-foreground self-start'
  return 'bg-card border border-border text-foreground self-start'
}
</script>

<template>
  <div class="flex flex-col h-full bg-background rounded-xl border border-border shadow overflow-hidden px-4 md:px-6">

    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card shrink-0">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon name="lucide:bot" class="w-4.5 h-4.5 text-primary" />
        </div>
        <div>
          <span class="font-bold text-sm block leading-tight">{{ t('aiChat.title') }}</span>
          <span class="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">AI Assistant</span>
        </div>
        <div v-if="awaitingInput" class="ml-1 flex items-center gap-1 text-[10px] text-primary font-semibold animate-pulse">
          <Icon name="lucide:message-circle-question" class="w-3 h-3" />
          In attesa di risposta
        </div>
      </div>
      <Button variant="ghost" size="sm" @click="clearMessages" :title="t('aiChat.clearChat')" class="text-muted-foreground hover:text-destructive">
        <Icon name="lucide:trash-2" class="w-4 h-4" />
      </Button>
    </div>

    <!-- ── Messages ───────────────────────────────────────────── -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4"
    >
      <!-- Empty state -->
      <div v-if="!messages.length" class="flex-1 flex flex-col items-center justify-center text-center gap-4 text-muted-foreground">
        <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Icon name="lucide:bot" class="w-8 h-8 text-primary/60" />
        </div>
        <div>
          <p class="text-sm font-semibold text-foreground mb-1">{{ t('aiChat.title') }}</p>
          <p class="text-xs text-muted-foreground">{{ t('aiChat.emptyHint') }}</p>
        </div>
        <!-- Suggestions -->
        <div class="flex flex-wrap gap-2 justify-center mt-1">
          <button
            v-for="s in AI_SUGGESTIONS.slice(0, 6)"
            :key="s.text"
            class="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary border border-border transition-colors cursor-pointer"
            @click="useSuggestion(s.text)"
          >
            {{ s.label }}
          </button>
        </div>
      </div>

      <!-- Messages list -->
      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="flex gap-2.5"
        :class="msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'"
      >
        <!-- Avatar -->
        <div
          class="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
          :class="msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border text-muted-foreground'"
        >
          <Icon v-if="msg.role === 'assistant'" name="lucide:bot" class="w-3.5 h-3.5" />
          <Icon v-else name="lucide:user" class="w-3.5 h-3.5" />
        </div>

        <!-- Bubble + extras -->
        <div class="flex flex-col gap-1.5 max-w-[80%]" :class="msg.role === 'user' ? 'items-end' : 'items-start'">
          <!-- Bubble -->
          <div
            class="rounded-2xl px-4 py-3 text-sm leading-relaxed"
            :class="bubbleClass(msg)"
          >
            <!-- Loading -->
            <span v-if="msg.loading" class="flex items-center gap-1.5 py-0.5">
              <span class="animate-bounce inline-block w-2 h-2 rounded-full bg-primary/50" style="animation-delay:0ms" />
              <span class="animate-bounce inline-block w-2 h-2 rounded-full bg-primary/50" style="animation-delay:150ms" />
              <span class="animate-bounce inline-block w-2 h-2 rounded-full bg-primary/50" style="animation-delay:300ms" />
            </span>
            <!-- Error -->
            <span v-else-if="msg.error" class="flex items-center gap-1.5">
              <Icon name="lucide:wifi-off" class="w-4 h-4 shrink-0" />
              {{ t('aiChat.networkError') }}
            </span>
            <!-- Content -->
            <span v-else class="whitespace-pre-wrap break-words">
              <span v-if="msg.response?.intent === 'external_ai'" class="mr-1">🤖</span>{{ msg.content }}
            </span>
          </div>

          <!-- Awaiting indicator -->
          <div v-if="msg.response?.awaitingInput" class="flex items-center gap-1 text-[10px] text-primary font-semibold px-1">
            <Icon name="lucide:circle-dot" class="w-3 h-3 animate-pulse" />
            Rispondi qui sotto
          </div>

          <!-- Structured data card -->
          <AiDataCard
            v-if="msg.role === 'assistant' && msg.response?.data && !msg.loading && !msg.response?.awaitingInput"
            :intent="msg.response.intent"
            :data="msg.response.data"
            class="w-full"
          />

          <!-- Warnings / Insights / Errors badges -->
          <div v-if="msg.response?.warnings?.length || msg.response?.insights?.length || msg.response?.errors?.length" class="flex flex-wrap gap-1">
            <Badge
              v-for="w in msg.response?.warnings"
              :key="w"
              variant="outline"
              class="text-xs text-yellow-600 border-yellow-400"
            >⚠ {{ w }}</Badge>
            <Badge
              v-for="ins in msg.response?.insights"
              :key="ins"
              variant="secondary"
              class="text-xs"
            >💡 {{ ins }}</Badge>
            <Badge
              v-for="e in msg.response?.errors"
              :key="e"
              variant="destructive"
              class="text-xs"
            >{{ e }}</Badge>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Suggestions bar: hidden while bot is collecting data ── -->
    <div v-if="messages.length && !awaitingInput" class="px-5 py-2 border-t border-border bg-card/40 shrink-0 overflow-x-auto scrollbar-none">
      <div class="flex gap-1.5 w-max">
        <button
          v-for="s in AI_SUGGESTIONS.slice(0, 6)"
          :key="s.text"
          class="text-xs px-3 py-1 rounded-full bg-muted hover:bg-primary/10 hover:text-primary border border-border whitespace-nowrap transition-colors cursor-pointer shrink-0"
          @click="useSuggestion(s.text)"
        >
          {{ s.label }}
        </button>
      </div>
    </div>

    <!-- ── Input ──────────────────────────────────────────────── -->
    <div class="px-5 py-4 border-t border-border bg-card shrink-0">
      <div class="flex gap-2 items-end">
        <textarea
          ref="inputRef"
          v-model="inputText"
          @keydown="onKeydown"
          :placeholder="awaitingInput ? t('aiChat.replyPlaceholder') : t('aiChat.placeholder')"
          :disabled="isLoading"
          rows="1"
          :class="[
            'flex-1 resize-none rounded-xl border bg-background px-4 py-2.5 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 min-h-[42px] max-h-[140px] transition-all leading-relaxed',
            awaitingInput ? 'border-primary/60 ring-2 ring-primary/20' : 'border-input',
          ]"
        />
        <Button
          @click="send"
          :disabled="isLoading || !inputText.trim()"
          size="icon"
          class="shrink-0 w-10 h-10 rounded-xl"
        >
          <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <Icon v-else name="lucide:send" class="w-4 h-4" />
        </Button>
      </div>
      <p v-if="error" class="text-xs text-destructive mt-2">{{ error }}</p>
      <p class="text-[10px] text-muted-foreground mt-1.5">Enter per inviare · Shift+Enter per andare a capo</p>
    </div>

  </div>
</template>
