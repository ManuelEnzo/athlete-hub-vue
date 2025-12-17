<script setup lang="ts">
// Importa il componente di input che abbiamo creato e corretto.
// Assicurati che il percorso sia corretto nella tua struttura (es. app/components/dataentry/QuickDataEntry.vue)
import QuickDataEntry from '@/components/dataentry/QuickDataEntry.vue'

// (Opzionale) Puoi impostare il layout della pagina, se usi un layout specifico di Nuxt
// definePageMeta({
//   layout: 'dashboard'
// })
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        
        <QuickDataEntry />
        
    </div>
</template>

<style scoped>
/* Stili specifici per la pagina, se necessari */
</style>