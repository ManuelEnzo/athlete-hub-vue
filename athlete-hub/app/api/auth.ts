// api/auth.ts
import api from './client'
import type {
  Result,
  UserSignInResponse,
  UserSignUpRequest,
  UserSignUpResponse,
  UserProfileResponse
} from '../types/api'

export const authApi = {
  signIn: (data: any) =>  api.post<Result<UserSignInResponse>>('/Auth/sign-in', data),
  signUp: (data: UserSignUpRequest) => api.post<Result<UserSignUpResponse>>('/Auth/sign-up', data),
  updatePassword: (data: any) => api.post<Result<UserSignInResponse>>('/Auth/update-password', data),
  getProfile: () => api.get<Result<UserProfileResponse>>('/Auth/profile'),
  logout: () => api.post<Result<string>>('/Auth/logout'),
  getPlans: () => api.get<Result<any[]>>('/Plan/get-list-of-plans'),
  forgotPassword: (email: string) => api.post('/Auth/forgot-password', { email: email }),
  resetPasswordExecution: (data: { token: string, newPassword: string }) => api.post('/Auth/reset-password-execution', data),
}