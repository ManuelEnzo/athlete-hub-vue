<script setup lang="ts">
import RpeDetails from '~/components/rpedetails/RpeDetailsCmp.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
    <div class="w-full flex flex-col items-stretch gap-4">
        <RpeDetails />
    </div>
</template>

<style scoped></style>