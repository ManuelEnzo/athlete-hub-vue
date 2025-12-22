import api from './client'
import type {
  AthleteCreateRequest,
  AthleteResponse,
  AthleteUpdateRequest,
  Result,
  AthleteMeasurementsCreateRequest,
  AthleteMeasurementsUpdateRequest,
  AthleteMeasurementsResponse,
  // Assicurati di aggiungere questi tipi nel tuo file ../types/api
  CalendarEventResponse,
  CalendarEventCreateRequest,
  CalendarSessionResponse,
  CalendarEventUpdateRequest
} from '../types/api'

export const athleteApi = {
  // Atleti
  getDistribution: () => api.get<Result<any>>('/Athletes/distribution'),
  getMetrics: () => api.get<Result<any>>('/Athletes/metrics'),
  getReadiness: () => api.get<Result<any>>('/Readiness'),
  getWorkloads: () => api.get<Result<any>>('/Workload/workloads'),
  getAll: () => api.get<Result<AthleteResponse[]>>('/Athletes'),
  getById: (id: number) => api.get<Result<AthleteResponse>>(`/Athletes/${id}`),
  create: (data: AthleteCreateRequest) => api.post<Result<AthleteResponse>>('/Athletes', data),
  update: (id: number, data: AthleteUpdateRequest) => api.put<Result<boolean>>(`/Athletes/${id}`, data),
  delete: (id: number) => api.delete<Result<boolean>>(`/Athletes/${id}`),

  // Misurazioni Atleti
  getAllMeasurements: () => api.get<Result<AthleteMeasurementsResponse[]>>('/AthleteMeasurements'),
  getMeasurementById: (id: number) => api.get<Result<AthleteMeasurementsResponse>>(`/AthleteMeasurements/${id}`),
  getMeasurementsByAthlete: (athleteId: number) => api.get<Result<AthleteMeasurementsResponse[]>>(`/AthleteMeasurements/athlete/${athleteId}`),
  createMeasurement: (data: AthleteMeasurementsCreateRequest) => api.post<Result<AthleteMeasurementsResponse>>('/AthleteMeasurements', data),
  updateMeasurement: (id: number, data: AthleteMeasurementsUpdateRequest) => api.put<Result<boolean>>(`/AthleteMeasurements/${id}`, data),
  deleteMeasurement: (id: number) => api.delete<Result<boolean>>(`/AthleteMeasurements/${id}`),

  // --- Calendario / Agenda ---
  // --- Calendario / Agenda ---

  // 1. Recupera tutti gli eventi (con filtri opzionali month/year)
  getAllEvents: (month?: number, year?: number) => {
    const params = month || year ? { params: { month, year } } : {}
    return api.get<Result<CalendarEventResponse[]>>('/Calendar', params)
  },
  // 2. Recupera le sessioni imminenti (per il widget della Dashboard)
  getUpcomingSessions: () =>
    api.get<Result<CalendarSessionResponse[]>>('/Calendar/sessions'),

  // 3. Recupera eventi di un singolo atleta
  getEventsByAthlete: (athleteId: number) =>
    api.get<Result<CalendarEventResponse[]>>(`/Calendar/athlete/${athleteId}`),

  // 4. Crea un nuovo evento
  createEvent: (data: CalendarEventCreateRequest) =>
    api.post<Result<CalendarEventResponse>>('/Calendar', data),

  // 5. Aggiorna un evento esistente (Metodo che mancava)
  updateEvent: (id: number, data: CalendarEventUpdateRequest) =>
    api.put<Result<boolean>>(`/Calendar/${id}`, data),

  // 6. Elimina un evento
  deleteEvent: (id: number) =>
    api.delete<Result<boolean>>(`/Calendar/${id}`),
}