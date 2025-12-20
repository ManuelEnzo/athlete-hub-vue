import api from './client'
import type { 
  AthleteCreateRequest, 
  AthleteResponse, 
  AthleteUpdateRequest, 
  Result,
  AthleteMeasurementsCreateRequest,
  AthleteMeasurementsUpdateRequest,
  AthleteMeasurementsResponse
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
}
