<script setup lang="ts">
import { columns } from '@/components/tasks/components/columns'
import DataTable from '@/components/tasks/components/DataTable.vue'
import tasks from '@/components/tasks/data/tasks.json'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
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
    <DataTable :data="tasks.data" :columns="columns" />
  </div>
</template>

<style scoped>

</style>
