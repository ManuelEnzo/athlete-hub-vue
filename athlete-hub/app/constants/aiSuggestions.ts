export interface AiSuggestion {
  label: string
  text: string
}

export const AI_SUGGESTIONS: AiSuggestion[] = [
  // IT
  { label: '🏃 Stato atleta', text: 'Stato atleta Mario Rossi' },
  { label: '😴 Sonno', text: 'Come ha dormito Mario Rossi?' },
  { label: '⚡ Carico lavoro', text: 'Carico di lavoro di Mario Rossi' },
  { label: '📊 Performance', text: 'Prestazioni di Mario Rossi' },
  { label: '🩹 Infortuni', text: 'Infortuni di Mario Rossi' },
  { label: '📅 Agenda', text: 'Agenda di Mario Rossi questa settimana' },
  { label: '📏 Misurazioni', text: 'Misurazioni di Mario Rossi' },
  { label: '➕ Crea atleta', text: 'Crea atleta Nome Luca Rossi età 23 sport Calcio altezza 178' },
  { label: '📆 Evento', text: 'Aggiungi allenamento il 20/06 alle 10:00 durata 90 minuti' },
  // EN
  { label: '🏃 Athlete status', text: 'Status of athlete Mario Rossi' },
  { label: '😴 Sleep', text: 'How did Mario Rossi sleep?' },
  { label: '⚡ Workload', text: 'Workload of Mario Rossi' },
]
