<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import Input from '@/components/ui/input/Input.vue'
import KanbanBoard from '~/components/kanban/KanbanBoard.vue'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { useKanban } from '~/composables/useKanban'
import useToggle from '~/composables/useToggle'
import { useAuthStore } from '~/stores/auth'

const { t } = useI18n()
const { state: showNewColumn, set: setShow } = useToggle(false)
const newColumnTitle = ref('')
const { addColumn } = useKanban()
const auth = useAuthStore()
const handler = useErrorHandler({ component: 'KanbanPage' })

// Basic auth check
if (!auth.user) {
  auth.fetchProfile().catch(err => handler.handleError(err instanceof Error ? err : new Error(String(err))))
}

function resetForm() {
  newColumnTitle.value = ''
  setShow(false)
}

function createColumn() {
  try {
    const title = newColumnTitle.value.trim()
    if (!title)
      return
    // sanitize minimal: strip control chars (remove C0 control range and DEL)
    const safeTitle = Array.from(title).filter((ch) => {
      const c = ch.charCodeAt(0)
      return !(c >= 0 && c <= 31) && c !== 127
    }).join('')
    addColumn(safeTitle)
    resetForm()
  }
  catch (err) {
    handler.handleError(err instanceof Error ? err : new Error(String(err)))
  }
}
</script>

<template>
  <div class="h-full">
    <div class="flex flex-col gap-4 h-full">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="text-2xl font-bold tracking-tight">
            {{ t('kanban.title') }}
          </h2>
          <p class="text-muted-foreground">
            {{ t('kanban.description') }}
          </p>
        </div>
        <Button size="sm" @click="setShow(true)">
          {{ t('kanban.addColumn') }}
        </Button>
      </div>
      <KanbanBoard />
    </div>

    <!-- New Column Dialog -->
    <Dialog v-model:open="showNewColumn">
      <DialogContent class="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{{ t('kanban.dialog.title') }}</DialogTitle>
          <DialogDescription class="sr-only">
            {{ t('kanban.dialog.description') }}
          </DialogDescription>
        </DialogHeader>
        <form name="newColumnForm" class="flex flex-col gap-3" @submit.prevent="createColumn">
          <Input v-model="newColumnTitle" :placeholder="t('kanban.newColumnPlaceholder')" />
        </form>
        <DialogFooter>
          <Button variant="secondary" @click="showNewColumn = false">
            {{ t('common.cancel') }}
          </Button>
          <Button type="submit" form="newColumnForm" @click="createColumn">
            {{ t('common.create') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
