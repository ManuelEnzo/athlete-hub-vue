<script setup lang="ts">
import { ref } from 'vue'
import AthleteDetail from '@/components/athelete/AthleteDetail.vue'
// Assumiamo che Select e Option siano componenti di Shadcn/UI o simili

// Stato che tiene traccia dell'ID dell'atleta selezionato (default: Marco Rossi)
const selectedAthleteId = ref(1)

// Opzioni per il menu a tendina
const athleteOptions = [
    { id: 1, name: 'Marco Rossi' },
    { id: 2, name: 'Laura Bianchi' },
]
</script>

<template>
    <div class="p-6">
        <div class="flex items-center gap-4 mb-8">
            <h1 class="text-2xl font-semibold">Visualizzazione Atleta</h1>
            
            <select v-model="selectedAthleteId" class="p-2 border rounded-md">
                <option v-for="athlete in athleteOptions" :key="athlete.id" :value="athlete.id">
                    {{ athlete.name }} (ID: {{ athlete.id }})
                </option>
            </select>
        </div>

        <AthleteDetail :athleteId="selectedAthleteId" />
    </div>
</template>