<script setup lang="ts">
import type { Task } from '@/components/tasks/data/schema'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { columns } from '@/components/tasks/components/columns'
import DataTable from '@/components/tasks/components/DataTable.vue'
import rawTasks from '@/components/tasks/data/tasks.json'
import { useErrorHandler } from '~/composables/useErrorHandler'

const { t } = useI18n()
const handler = useErrorHandler({ component: 'TasksPage' })

const tasks = ref<Task[]>([])

onMounted(() => {
  try {
    tasks.value = Array.isArray(rawTasks.data) ? rawTasks.data : []
  }
  catch (err) {
    handler.handleError(err instanceof Error ? err : new Error(String(err)))
    tasks.value = []
  }
})
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          {{ t('tasks.title') }}
        </h2>
        <p class="text-muted-foreground">
          {{ t('tasks.description') }}
        </p>
      </div>
    </div>
    <DataTable :data="tasks" :columns="columns" />
  </div>
</template>

<style scoped>

</style>
