// Action type constants for authentication

// Login (Email/Password)
export const LOGIN_REQUEST = "auth/LOGIN_REQUEST";
export const LOGIN_SUCCESS = "auth/LOGIN_SUCCESS";
export const LOGIN_FAILURE = "auth/LOGIN_FAILURE";

// Login (Social)
export const SOCIAL_LOGIN_REQUEST = "auth/SOCIAL_LOGIN_REQUEST";
export const SOCIAL_LOGIN_SUCCESS = "auth/SOCIAL_LOGIN_SUCCESS";
export const SOCIAL_LOGIN_FAILURE = "auth/SOCIAL_LOGIN_FAILURE";

// Initialize Auth State
export const INITIALIZE_AUTH_REQUEST = "auth/INITIALIZE_AUTH_REQUEST";
export const INITIALIZE_AUTH_SUCCESS = "auth/INITIALIZE_AUTH_SUCCESS";
export const INITIALIZE_AUTH_FAILURE = "auth/INITIALIZE_AUTH_FAILURE";

// Token Refresh (Triggered by apiClient)
export const SET_REFRESHED_TOKENS = "auth/SET_REFRESHED_TOKENS"; // Used by apiClient's successful refresh

// Logout
export const LOGOUT_USER = "auth/LOGOUT_USER";

// Error Clearing
export const CLEAR_AUTH_ERROR = "auth/CLEAR_AUTH_ERROR";

// --- Action Shape Interfaces (Optional but helpful) ---
interface LoginSuccessPayload {
  token: string;
  refreshToken: string;
  user: User;
  expiresAt: number;
}
interface SetRefreshedTokensPayload {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginRequestAction {
  type: typeof LOGIN_REQUEST;
}
export interface LoginSuccessAction {
  type: typeof LOGIN_SUCCESS;
  payload: LoginSuccessPayload;
}
export interface LoginFailureAction {
  type: typeof LOGIN_FAILURE;
  payload: string;
} // Error message

export interface SocialLoginRequestAction {
  type: typeof SOCIAL_LOGIN_REQUEST;
}
export interface SocialLoginSuccessAction {
  type: typeof SOCIAL_LOGIN_SUCCESS;
  payload: LoginSuccessPayload;
}
export interface SocialLoginFailureAction {
  type: typeof SOCIAL_LOGIN_FAILURE;
  payload: string;
}

export interface InitializeAuthRequestAction {
  type: typeof INITIALIZE_AUTH_REQUEST;
}
export interface InitializeAuthSuccessAction {
  type: typeof INITIALIZE_AUTH_SUCCESS;
  payload: LoginSuccessPayload | null;
}
export interface InitializeAuthFailureAction {
  type: typeof INITIALIZE_AUTH_FAILURE;
  payload: string;
}

export interface SetRefreshedTokensAction {
  type: typeof SET_REFRESHED_TOKENS;
  payload: SetRefreshedTokensPayload;
}

export interface LogoutUserAction {
  type: typeof LOGOUT_USER;
}
export interface ClearAuthErrorAction {
  type: typeof CLEAR_AUTH_ERROR;
}

export const SET_INITIAL_TOKENS = "auth/SET_INITIAL_TOKENS";

interface SetInitialTokensPayload {
  token: string;
  refreshToken: string;
  expiresAt: number;
}

export interface SetInitialTokensAction {
  type: typeof SET_INITIAL_TOKENS;
  payload: SetInitialTokensPayload;
}

// Union type for all possible auth actions
export type AuthAction =
  | LoginRequestAction
  | LoginSuccessAction
  | LoginFailureAction
  | SocialLoginRequestAction
  | SocialLoginSuccessAction
  | SocialLoginFailureAction
  | InitializeAuthRequestAction
  | InitializeAuthSuccessAction
  | InitializeAuthFailureAction
  | SetRefreshedTokensAction
  | LogoutUserAction
  | ClearAuthErrorAction
  | SetInitialTokensAction;

