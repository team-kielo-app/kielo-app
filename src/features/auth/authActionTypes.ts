import { User } from './types'

export const LOGIN_REQUEST = 'auth/LOGIN_REQUEST'
export const LOGIN_SUCCESS = 'auth/LOGIN_SUCCESS'
export const LOGIN_FAILURE = 'auth/LOGIN_FAILURE'

export const SOCIAL_LOGIN_REQUEST = 'auth/SOCIAL_LOGIN_REQUEST'
export const SOCIAL_LOGIN_SUCCESS = 'auth/SOCIAL_LOGIN_SUCCESS'
export const SOCIAL_LOGIN_FAILURE = 'auth/SOCIAL_LOGIN_FAILURE'

export const REGISTER_REQUEST = 'auth/REGISTER_REQUEST'
export const REGISTER_FAILURE = 'auth/REGISTER_FAILURE'

export const FORGOT_PASSWORD_REQUEST = 'auth/FORGOT_PASSWORD_REQUEST'
export const FORGOT_PASSWORD_SUCCESS = 'auth/FORGOT_PASSWORD_SUCCESS'
export const FORGOT_PASSWORD_FAILURE = 'auth/FORGOT_PASSWORD_FAILURE'

export const VERIFY_RESET_TOKEN_REQUEST = 'auth/VERIFY_RESET_TOKEN_REQUEST'
export const VERIFY_RESET_TOKEN_SUCCESS = 'auth/VERIFY_RESET_TOKEN_SUCCESS'
export const VERIFY_RESET_TOKEN_FAILURE = 'auth/VERIFY_RESET_TOKEN_FAILURE'

export const RESET_PASSWORD_REQUEST = 'auth/RESET_PASSWORD_REQUEST'
export const RESET_PASSWORD_SUCCESS = 'auth/RESET_PASSWORD_SUCCESS'
export const RESET_PASSWORD_FAILURE = 'auth/RESET_PASSWORD_FAILURE'

export const INITIALIZE_AUTH_REQUEST = 'auth/INITIALIZE_AUTH_REQUEST'
export const INITIALIZE_AUTH_SUCCESS = 'auth/INITIALIZE_AUTH_SUCCESS'
export const INITIALIZE_AUTH_FAILURE = 'auth/INITIALIZE_AUTH_FAILURE'

export const SET_REFRESHED_TOKENS = 'auth/SET_REFRESHED_TOKENS'

export const LOGOUT_USER = 'auth/LOGOUT_USER'

export const CLEAR_AUTH_ERROR = 'auth/CLEAR_AUTH_ERROR'

export const SET_INITIAL_TOKENS = 'auth/SET_INITIAL_TOKENS'

interface LoginSuccessPayload {
  token: string
  refreshToken: string
  user: User
  expiresAt: number
}
interface SetRefreshedTokensPayload {
  accessToken: string
  refreshToken: string
  expiresAt: number
}
interface SetInitialTokensPayload {
  token: string
  refreshToken: string
  expiresAt: number
}

export interface LoginRequestAction {
  type: typeof LOGIN_REQUEST
}
export interface LoginSuccessAction {
  type: typeof LOGIN_SUCCESS
  payload: LoginSuccessPayload
}
export interface LoginFailureAction {
  type: typeof LOGIN_FAILURE
  payload: string
}

export interface SocialLoginRequestAction {
  type: typeof SOCIAL_LOGIN_REQUEST
}
export interface SocialLoginSuccessAction {
  type: typeof SOCIAL_LOGIN_SUCCESS
  payload: LoginSuccessPayload
}
export interface SocialLoginFailureAction {
  type: typeof SOCIAL_LOGIN_FAILURE
  payload: string
}

export interface RegisterRequestAction {
  type: typeof REGISTER_REQUEST
}
export interface RegisterFailureAction {
  type: typeof REGISTER_FAILURE
  payload: string
}

export interface ForgotPasswordRequestAction {
  type: typeof FORGOT_PASSWORD_REQUEST
}
export interface ForgotPasswordSuccessAction {
  type: typeof FORGOT_PASSWORD_SUCCESS
  payload: string
}
export interface ForgotPasswordFailureAction {
  type: typeof FORGOT_PASSWORD_FAILURE
  payload: string
}

export interface VerifyResetTokenRequestAction {
  type: typeof VERIFY_RESET_TOKEN_REQUEST
}
export interface VerifyResetTokenSuccessAction {
  type: typeof VERIFY_RESET_TOKEN_SUCCESS
}
export interface VerifyResetTokenFailureAction {
  type: typeof VERIFY_RESET_TOKEN_FAILURE
  payload: string
}

export interface ResetPasswordRequestAction {
  type: typeof RESET_PASSWORD_REQUEST
}
export interface ResetPasswordSuccessAction {
  type: typeof RESET_PASSWORD_SUCCESS
  payload: string
}
export interface ResetPasswordFailureAction {
  type: typeof RESET_PASSWORD_FAILURE
  payload: string
}

export interface InitializeAuthRequestAction {
  type: typeof INITIALIZE_AUTH_REQUEST
}
export interface InitializeAuthSuccessAction {
  type: typeof INITIALIZE_AUTH_SUCCESS
  payload?: LoginSuccessPayload | null
}
export interface InitializeAuthFailureAction {
  type: typeof INITIALIZE_AUTH_FAILURE
  payload?: string | null
}

export interface SetRefreshedTokensAction {
  type: typeof SET_REFRESHED_TOKENS
  payload: SetRefreshedTokensPayload
}
export interface LogoutUserAction {
  type: typeof LOGOUT_USER
}
export interface ClearAuthErrorAction {
  type: typeof CLEAR_AUTH_ERROR
}
export interface SetInitialTokensAction {
  type: typeof SET_INITIAL_TOKENS
  payload: SetInitialTokensPayload
}

export type AuthAction =
  | LoginRequestAction
  | LoginSuccessAction
  | LoginFailureAction
  | SocialLoginRequestAction
  | SocialLoginSuccessAction
  | SocialLoginFailureAction
  | RegisterRequestAction
  | RegisterFailureAction
  | InitializeAuthRequestAction
  | InitializeAuthSuccessAction
  | InitializeAuthFailureAction
  | SetRefreshedTokensAction
  | LogoutUserAction
  | ClearAuthErrorAction
  | SetInitialTokensAction
