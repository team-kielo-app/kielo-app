import type { ApiStatusType } from '@lib/api.d'

export interface User {
  id: string
  email: string
  name?: string | null
  avatarUrl?: string
  learningLanguage?: string
}

export interface AuthState {
  userId: string | null
  initialAuthChecked: boolean
  status: ApiStatusType | 'sessionInvalid'
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
  email: string
  token: string
}

export interface ResetPasswordPayload {
  email: string
  token: string
  new_password: string
}
