import type {
  Result,
  UserProfileResponse,
  UserSignInResponse,
  UserSignUpRequest,
  UserSignUpResponse,
} from '../types/api'
// api/auth.ts
import api from './client-optimized'

export const authApi = {
  signIn: (data: any) => api.post<Result<UserSignInResponse>>('/Auth/sign-in', data),
  signUp: (data: UserSignUpRequest) => api.post<Result<UserSignUpResponse>>('/Auth/sign-up', data),
  updatePassword: (data: any) => api.post<Result<UserSignInResponse>>('/Auth/update-password', data),
  getProfile: () => api.get<Result<UserProfileResponse>>('/Auth/profile'),
  logout: () => api.post<Result<string>>('/Auth/logout'),
  getPlans: () => api.get<Result<any[]>>('/Plan/get-list-of-plans'),
  forgotPassword: (email: string) => api.post('/Auth/forgot-password', { email }),
  resetPasswordExecution: (data: { token: string, newPassword: string }) => api.post('/Auth/reset-password-execution', data),
}

export interface InvitationResponseDto {
  code: string
  email: string
  createdAt: string
  expiresAt: string
}

// NOTE: the backend endpoint requires [AllowAnonymous] (see InvitationController).
export const invitationApi = {
  generate: (email: string, validityHours = 48) =>
    api.post<Result<InvitationResponseDto>>('/Invitation/generate', { email, validityHours }),
}
