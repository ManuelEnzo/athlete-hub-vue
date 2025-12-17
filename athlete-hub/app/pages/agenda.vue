<script setup lang="ts">
import AgendaCalendarVue from '@/components/agenda/AgendaCalendar.vue'
</script>

<template>
    <div class="w-full flex flex-col items-stretch gap-4">
        <div class="flex flex-wrap items-end justify-between gap-2">
            <div>
                <h2 class="text-2xl font-bold tracking-tight">📅 Session and Appointments</h2>
                <p class="text-muted-foreground">
                    Here&apos;s a list of your tasks for this month!
                </p>
            </div>
        </div>
        <AgendaCalendar />
    </div>
</template>

<style scoped></style>
