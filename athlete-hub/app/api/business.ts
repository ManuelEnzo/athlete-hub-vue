import api from './client'
import type {
  AthleteCreateRequest,
  AthleteResponse,
  AthleteUpdateRequest,
  Result,
  AthleteMeasurementsCreateRequest,
  AthleteMeasurementsUpdateRequest,
  AthleteMeasurementsResponse,
  CalendarEventResponse,
  CalendarEventCreateRequest,
  CalendarSessionResponse,
  CalendarEventUpdateRequest,
  // NUOVI TIPI DA AGGIUNGERE NEL TUO FILE types/api.ts
  TestResultSaveDto,
  TestEntryGridDto
} from '../types/api'

export const athleteApi = {
  // Atleti
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
  getAllEvents: (month?: number, year?: number) => {
    const params = month || year ? { params: { month, year } } : {}
    return api.get<Result<CalendarEventResponse[]>>('/Calendar', params)
  },
  getUpcomingSessions: () =>
    api.get<Result<CalendarSessionResponse[]>>('/Calendar/sessions'),

  getEventsByAthlete: (athleteId: number) =>
    api.get<Result<CalendarEventResponse[]>>(`/Calendar/athlete/${athleteId}`),

  createEvent: (data: CalendarEventCreateRequest) =>
    api.post<Result<CalendarEventResponse>>('/Calendar', data),

  updateEvent: (id: number, data: CalendarEventUpdateRequest) =>
    api.put<Result<boolean>>(`/Calendar/${id}`, data),

  deleteEvent: (id: number) =>
    api.delete<Result<boolean>>(`/Calendar/${id}`),

  // --- NUOVA SEZIONE: TEST E PERFORMANCE ---

  // 1. Recupera i protocolli di test disponibili (es. Salto CMJ, Sprint 30m)
  getTestDefinitions: () => 
    api.get<Result<any[]>>('/Calendar/test-definitions'), // Assicurati di avere questo controller o endpoint

  // 2. Recupera la griglia di inserimento per un evento specifico
  getTestGrid: (eventId: number) => 
    api.get<Result<TestEntryGridDto>>(`/Calendar/${eventId}/test-grid`),

  // 3. Salva i risultati del test in modo massivo
  saveTestResults: (eventId: number, results: TestResultSaveDto[]) => 
    api.post<Result<boolean>>(`/Calendar/${eventId}/results`, results),
}