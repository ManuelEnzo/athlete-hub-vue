<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { User, X } from 'lucide-vue-next'

// MOCK DATA
const athletes = ref([
  {
    id: 1,
    name: 'Mario Rossi',
    lastSession: { date: '2026-01-04', session: 'Forza', rpe: 7, notes: 'Molto faticoso' },
    history: [
      { date: '2026-01-01', session: 'Resistenza', rpe: 5, notes: 'Ok' },
      { date: '2026-01-02', session: 'Forza', rpe: 6, notes: '' },
      { date: '2026-01-03', session: 'Velocità', rpe: 8, notes: 'Duro' }
    ]
  },
  {
    id: 2,
    name: 'Anna Verdi',
    lastSession: { date: '2026-01-04', session: 'Forza', rpe: 9, notes: 'Fatica massima!' },
    history: [
      { date: '2026-01-01', session: 'Resistenza', rpe: 6, notes: 'Ok' },
      { date: '2026-01-02', session: 'Forza', rpe: 8, notes: 'Duro' }
    ]
  }
])

const focusedAthleteId = ref<number | null>(null)

// Computed property per l'atleta selezionato
const focusedAthlete = computed(() => {
  return athletes.value.find(a => a.id === focusedAthleteId.value) || null
})

function toggleFocus(id: number) {
  focusedAthleteId.value = focusedAthleteId.value === id ? null : id
}

function getRpeColor(val: number) {
  if (val <= 2) return 'bg-green-200 text-green-800'
  if (val <= 4) return 'bg-yellow-200 text-yellow-800'
  if (val <= 6) return 'bg-orange-200 text-orange-800'
  if (val <= 8) return 'bg-red-200 text-red-800'
  return 'bg-red-900 text-white'
}

function getRpeLabel(val: number) {
  if (val === 0) return 'Nessuno 😴'
  if (val <= 2) return 'Molto leggero 🙂'
  if (val <= 4) return 'Moderato 😐'
  if (val <= 6) return 'Impegnativo 😰'
  if (val <= 8) return 'Duro 🥵'
  if (val <= 9.5) return 'Estremo 💀'
  return 'Massimale 🔥'
}
</script>

<template>
  <div class="p-4 flex flex-col gap-6">
    <h1 class="text-2xl font-bold mb-4">RPE Dashboard</h1>

    <!-- CARD ATLETI -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" v-if="!focusedAthleteId">
      <div v-for="athlete in athletes" :key="athlete.id">
        <Card class="border shadow-sm hover:shadow-md transition cursor-pointer" @click="toggleFocus(athlete.id)">
          <CardHeader>
            <CardTitle class="flex items-center justify-between">
              <span class="flex items-center gap-2">
                <User class="w-5 h-5 text-primary" /> {{ athlete.name }}
              </span>
              <Badge class="bg-secondary text-secondary-foreground">Ultima sessione</Badge>
            </CardTitle>
          </CardHeader>

          <CardContent class="space-y-2">
            <p class="text-sm text-muted-foreground">Sessione: {{ athlete.lastSession.session }}</p>
            <p class="text-sm text-muted-foreground">Data: {{ athlete.lastSession.date }}</p>
            <p :class="getRpeColor(athlete.lastSession.rpe) + ' px-2 py-1 rounded-md font-semibold inline-block'">
              {{ getRpeLabel(athlete.lastSession.rpe) }} ({{ athlete.lastSession.rpe }})
            </p>
            <p class="text-sm text-muted-foreground">Note: {{ athlete.lastSession.notes || '-' }}</p>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- DETTAGLIO ATLETA + STORICO -->
    <div v-if="focusedAthlete">
      <Card class="border shadow-sm transition">
        <CardHeader>
          <CardTitle class="flex items-center justify-between">
            <span class="flex items-center gap-2">
              <User class="w-5 h-5 text-primary" /> {{ focusedAthlete.name }}
            </span>
            <Button variant="ghost" size="sm" @click="focusedAthleteId = null">
              <X class="w-4 h-4" /> Torna indietro
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent class="space-y-2">
          <p class="text-sm text-muted-foreground">Ultima sessione: {{ focusedAthlete.lastSession.session }} ({{ focusedAthlete.lastSession.date }})</p>
          <p :class="getRpeColor(focusedAthlete.lastSession.rpe) + ' px-2 py-1 rounded-md font-semibold inline-block'">
            {{ getRpeLabel(focusedAthlete.lastSession.rpe) }} ({{ focusedAthlete.lastSession.rpe }})
          </p>
          <p class="text-sm text-muted-foreground">Note: {{ focusedAthlete.lastSession.notes || '-' }}</p>
        </CardContent>
      </Card>

      <!-- GRIGLIA STORICO -->
      <div class="mt-4 p-2 border-l-4 border-primary bg-muted/5 rounded-md">
        <h3 class="font-semibold mb-2">Storico RPE</h3>
        <div class="grid grid-cols-1 gap-1">
          <div v-for="entry in focusedAthlete.history" :key="entry.date + entry.session" class="flex justify-between items-center p-2 border-b border-muted/30 rounded-md hover:bg-muted/10 transition">
            <div class="flex-1">
              <p class="text-sm font-medium">{{ entry.date }} - {{ entry.session }}</p>
              <p class="text-xs text-muted-foreground">Note: {{ entry.notes || '-' }}</p>
            </div>
            <span :class="getRpeColor(entry.rpe) + ' px-2 py-1 rounded-md font-semibold'">
              {{ getRpeLabel(entry.rpe) }} ({{ entry.rpe }})
            </span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
