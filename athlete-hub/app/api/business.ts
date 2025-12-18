import api from './client' // o './client'
import type { AthleteCreateRequest, AthleteResponse, AthleteUpdateRequest, Result } from '../types/api'

export const athleteApi = {
  // Specifichiamo che ogni chiamata restituisce un Result tipizzato
  getDistribution: () => api.get<Result<any>>('/Athletes/distribution'),
  getMetrics: () => api.get<Result<any>>('/Athletes/metrics'),
  getReadiness: () => api.get<Result<any>>('/Readiness'),
  getWorkloads: () => api.get<Result<any>>('/Workload/workloads'),
  getAll: () => api.get<Result<AthleteResponse[]>>('/Athletes'),
  getById: (id: number) => api.get<Result<AthleteResponse>>(`/Athletes/${id}`),
  create: (data: AthleteCreateRequest) => api.post<Result<AthleteResponse>>('/Athletes', data),
  update: (id: number, data: AthleteUpdateRequest) => api.put<Result<boolean>>(`/Athletes/${id}`, data),
  delete: (id: number) => api.delete<Result<boolean>>(`/Athletes/${id}`),
}