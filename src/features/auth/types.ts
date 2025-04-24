import type { ApiStatusType } from '@lib/api.d'

export interface User {
  id: string
  email: string
  name?: string | null
  avatarUrl?: string
  learningLanguage?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  expiresAt: number | null
  status: ApiStatusType
  error: string | null
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface RawSignupApiResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface SocialLoginPayload {
  provider: string
  access_token: string
}

export interface RegisterPayload {
  email: string
  password: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface VerifyResetTokenPayload {
  token: string
}

export interface ResetPasswordPayload {
  token: string
  new_password: string
}
