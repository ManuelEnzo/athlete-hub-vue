<script setup lang="ts">
import AthletesMeasurements from '~/components/athletemeasurements/AthletesMeasurements.vue';
</script>
<template>
    <div class="min-h-screen">
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between  pb-6">
            <h2 class="text-2xl font-bold tracking-tight flex items-center ">
                <span></span> Athletes' Health Status
            </h2>

            <div class="flex items-center space-x-2">
                <Button variant="outline">Esporta</Button>
                <Button>
                    <Info class="h-4 w-4 mr-2" /> Dettagli
                </Button>
            </div>
        </div>

        <AthletesMeasurements />

    </div>
</template>