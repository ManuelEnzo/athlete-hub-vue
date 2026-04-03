import type {
  AthleteAnalyticsDto,
  AthleteCreateRequest,
  AthleteMeasurementsCreateRequest,
  AthleteMeasurementsResponse,
  AthleteMeasurementsUpdateRequest,
  AthleteResponse,
  AthleteUpdateRequest,
  CalendarEventCreateRequest,
  CalendarEventResponse,
  CalendarEventUpdateRequest,
  CalendarSessionResponse,
  CoachDashboardSummaryDto,
  InjuryCreateDTO,
  InjuryResponseDTO,
  InjuryUpdateDTO,
  MailRequestDto,
  Pagination,
  Result,
  RpeEmailStatus,
  RpeHistoricalEntryDto,
  RpeLastSessionOverviewDto,
  RpeLinkQueueResponseDto,
  RpeLinkQueueSubmitRpeDto,
  TestDefinitionDto,
  TestEntryGridDto,
  TestManagementCreateRequest,
  TestManagementUpdateRequest,
  TestResultSaveDto,
} from '../types/api'
import api from './client-optimized'

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

  // 1. Recupera i protocolli di test disponibili (es. Salto CMJ, Sprint 30m)
  getTestDefinitions: () =>
    api.get<Result<any[]>>('/Calendar/test-definitions'), // Assicurati di avere questo controller o endpoint

  // 2. Recupera la griglia di inserimento per un evento specifico
  getTestGrid: (eventId: number) =>
    api.get<Result<TestEntryGridDto>>(`/Calendar/${eventId}/test-grid`),

  // 3. Salva i risultati del test in modo massivo
  saveTestResults: (eventId: number, results: TestResultSaveDto[]) =>
    api.post<Result<boolean>>(`/Calendar/${eventId}/results`, results),

  submitRpe: (data: RpeLinkQueueSubmitRpeDto) =>
    api.post<Result<boolean>>('/RpeLinkQueue/submit-rpe-value', data),

  getAllInfoFromToken: (tokenId: string) =>
    api.post<Result<RpeLinkQueueResponseDto>>(`/RpeLinkQueue/get-all-info-from-token`, { rpeTokenId: tokenId }),

  getLastSessionInfo: () =>
    api.get<Result<RpeLastSessionOverviewDto>>('/RpeLinkQueue/get-last-session-info'),
  // Esempio nel file api
  getHistoricalAnalysis: (
    athleteId: number,
    pageIndex: number,
    pageSize: number,
  ) => {
    const params = { params: { athleteId, pageIndex, pageSize } }
    return api.get<Result<Pagination<RpeHistoricalEntryDto>>>(
      '/RpeLinkQueue/get-historical-session-datas',
      params,
    )
  },
  getDatasForAnalytics: (id: number, from: string, to: string) => {
    const params = { params: { id, from, to } }
    return api.get<Result<AthleteAnalyticsDto>>('/Athletes/get-datas-for-analytics', params)
  },
  /**
   * Recupera lo storico infortuni di un atleta specifico
   * @param athleteId ID dell'atleta
   */
  getInjuries: (athleteId: number) =>
    api.get<Result<InjuryResponseDTO[]>>(`/Injury/athlete/${athleteId}`),

  /**
   * Registra un nuovo infortunio
   * @param data DTO di creazione infortunio (con Enum numerici)
   */
  createInjury: (data: InjuryCreateDTO) =>
    api.post<Result<InjuryResponseDTO>>('/Injury', data),

  /**
   * Aggiorna i dettagli o lo stato di un infortunio esistente
   * @param id ID del record infortunio
   * @param data DTO di aggiornamento
   */
  updateInjury: (id: number, data: InjuryUpdateDTO) =>
    api.put<Result<boolean>>(`/Injury/${id}`, data),

  /**
   * Elimina un record di infortunio
   * @param id ID del record infortunio
   */
  deleteInjury: (id: number) =>
    api.delete<Result<boolean>>(`/Injury/${id}`),

  getSummary: () => api.get<Result<CoachDashboardSummaryDto>>('/dashboard/get-data-for-dashboard'),

  // Recupera i lookup veloci (ID e Nome)
  testDefGetAllLookups: () =>
    api.get<Result<any[]>>('/TestDefinitions'),

  // Recupera tutte le definizioni complete di metriche
  testDefGetAllDefinitions: () =>
    api.get<Result<TestDefinitionDto[]>>('/TestDefinitions/all'),

  // Recupera una definizione specifica per ID
  testDefGetById: (id: number) =>
    api.get<Result<TestDefinitionDto>>(`/TestDefinitions/${id}`),

  // Crea una nuova codifica test
  testDefCreate: (data: TestManagementCreateRequest) =>
    api.post<Result<TestDefinitionDto>>('/TestDefinitions', data),

  // Aggiorna una codifica esistente
  testDefUpdate: (id: number, data: TestManagementUpdateRequest) =>
    api.put<Result<TestDefinitionDto>>(`/TestDefinitions/${id}`, data),

  // Elimina una codifica test
  testDefDelete: (id: number) =>
    api.delete<Result<boolean>>(`/TestDefinitions/${id}`),

  getInfoForEmailStatus: (pageIndex: number, pageSize: number) =>
    api.get<Result<Pagination<RpeEmailStatus>>>(`/RpeLinkQueue/get-info-status-email`, {
      params: { pageIndex, pageSize },
    }),

  resendRpeEmail: (emailId: number) =>
    api.post(`/RpeLinkQueue/resend`, { emailId }),

  createNewMailAsync: (data: MailRequestDto) =>
    api.post(`/Mail/create-new-mail`, data),

}
