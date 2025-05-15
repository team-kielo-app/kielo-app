import * as actionTypes from './authActionTypes'
import type {
  User,
  LoginResponse,
  SocialLoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  RawSignupApiResponse,
  VerifyResetTokenPayload
} from './types'
import { apiClient } from '@lib/api'
import { RootState, AppDispatch, AppThunk } from '@store/store'
import * as tokenStorage from '@lib/tokenStorage'
import { showAuthDebugToast } from '@lib/debugToast'
import { router } from 'expo-router'
import { ApiError } from '@lib/ApiError'
import { GoogleSignin } from '@react-native-google-signin/google-signin'

export const loginRequest = (): actionTypes.LoginRequestAction => ({
  type: actionTypes.LOGIN_REQUEST
})
export const loginSuccess = (
  payload: actionTypes.LoginSuccessAction['payload']
): actionTypes.LoginSuccessAction => ({
  type: actionTypes.LOGIN_SUCCESS,
  payload
})
export const loginFailure = (
  error: string
): actionTypes.LoginFailureAction => ({
  type: actionTypes.LOGIN_FAILURE,
  payload: error
})

export const socialLoginRequest = (): actionTypes.SocialLoginRequestAction => ({
  type: actionTypes.SOCIAL_LOGIN_REQUEST
})
export const socialLoginSuccess = (
  payload: actionTypes.SocialLoginSuccessAction['payload']
): actionTypes.SocialLoginSuccessAction => ({
  type: actionTypes.SOCIAL_LOGIN_SUCCESS,
  payload
})
export const socialLoginFailure = (
  error: string
): actionTypes.SocialLoginFailureAction => ({
  type: actionTypes.SOCIAL_LOGIN_FAILURE,
  payload: error
})

export const registerRequest = (): actionTypes.RegisterRequestAction => ({
  type: actionTypes.REGISTER_REQUEST
})
export const registerFailure = (
  error: string
): actionTypes.RegisterFailureAction => ({
  type: actionTypes.REGISTER_FAILURE,
  payload: error
})

export const forgotPasswordRequest =
  (): actionTypes.ForgotPasswordRequestAction => ({
    type: actionTypes.FORGOT_PASSWORD_REQUEST
  })
export const forgotPasswordSuccess = (
  message: string
): actionTypes.ForgotPasswordSuccessAction => ({
  type: actionTypes.FORGOT_PASSWORD_SUCCESS,
  payload: message
})
export const forgotPasswordFailure = (
  error: string
): actionTypes.ForgotPasswordFailureAction => ({
  type: actionTypes.FORGOT_PASSWORD_FAILURE,
  payload: error
})
export const verifyResetTokenRequest =
  (): actionTypes.VerifyResetTokenRequestAction => ({
    type: actionTypes.VERIFY_RESET_TOKEN_REQUEST
  })
export const verifyResetTokenSuccess =
  (): actionTypes.VerifyResetTokenSuccessAction => ({
    type: actionTypes.VERIFY_RESET_TOKEN_SUCCESS
  })
export const verifyResetTokenFailure = (
  error: string
): actionTypes.VerifyResetTokenFailureAction => ({
  type: actionTypes.VERIFY_RESET_TOKEN_FAILURE,
  payload: error
})
export const resetPasswordRequest =
  (): actionTypes.ResetPasswordRequestAction => ({
    type: actionTypes.RESET_PASSWORD_REQUEST
  })
export const resetPasswordSuccess = (
  message: string
): actionTypes.ResetPasswordSuccessAction => ({
  type: actionTypes.RESET_PASSWORD_SUCCESS,
  payload: message
})
export const resetPasswordFailure = (
  error: string
): actionTypes.ResetPasswordFailureAction => ({
  type: actionTypes.RESET_PASSWORD_FAILURE,
  payload: error
})

export const initializeAuthRequest =
  (): actionTypes.InitializeAuthRequestAction => ({
    type: actionTypes.INITIALIZE_AUTH_REQUEST
  })
export const initializeAuthSuccess = (
  payload?: actionTypes.InitializeAuthSuccessAction['payload']
): actionTypes.InitializeAuthSuccessAction => ({
  type: actionTypes.INITIALIZE_AUTH_SUCCESS,
  payload
})
export const initializeAuthFailure = (
  error?: string | null
): actionTypes.InitializeAuthFailureAction => ({
  type: actionTypes.INITIALIZE_AUTH_FAILURE,
  payload: error
})
export const setRefreshedTokens = (
  payload: actionTypes.SetRefreshedTokensAction['payload']
): actionTypes.SetRefreshedTokensAction => ({
  type: actionTypes.SET_REFRESHED_TOKENS,
  payload
})
export const logoutUserSuccess = (): actionTypes.LogoutUserAction => ({
  type: actionTypes.LOGOUT_USER
})
export const clearAuthError = (): actionTypes.ClearAuthErrorAction => ({
  type: actionTypes.CLEAR_AUTH_ERROR
})
export const setInitialTokens = (
  payload: actionTypes.SetInitialTokensAction['payload']
): actionTypes.SetInitialTokensAction => ({
  type: actionTypes.SET_INITIAL_TOKENS,
  payload
})

export const loginUserThunk =
  (credentials: { email: string; password: string }): AppThunk<Promise<void>> =>
  async (dispatch: AppDispatch) => {
    dispatch(loginRequest())
    try {
      const loginData = await apiClient.post<LoginResponse>(
        '/auth/login/email',
        credentials,
        dispatch
      )
      const expiresAt = Date.now() + loginData.expires_in * 1000
      await tokenStorage.setStoredTokens(
        loginData.access_token,
        loginData.refresh_token,
        expiresAt
      )
      dispatch(
        loginSuccess({
          token: loginData.access_token,
          refreshToken: loginData.refresh_token,
          user: loginData.user,
          expiresAt: expiresAt
        })
      )
    } catch (error: any) {
      let message = 'Login failed. Please check your credentials.'
      if (error instanceof ApiError) {
        message =
          error.data?.detail || error.data?.message || error.message || message
      } else if (error.message) {
        message = error.message
      }
      dispatch(loginFailure(message))
      throw error
    }
  }

export const loginWithSocialThunk =
  (payload: SocialLoginPayload): AppThunk<Promise<void>> =>
  async (dispatch: AppDispatch) => {
    dispatch(socialLoginRequest())
    try {
      const loginData = await apiClient.post<LoginResponse>(
        '/auth/login/social',
        payload,
        dispatch
      )
      const expiresAt = Date.now() + loginData.expires_in * 1000
      await tokenStorage.setStoredTokens(
        loginData.access_token,
        loginData.refresh_token,
        expiresAt
      )
      dispatch(
        socialLoginSuccess({
          token: loginData.access_token,
          refreshToken: loginData.refresh_token,
          user: loginData.user,
          expiresAt: expiresAt
        })
      )
    } catch (error: any) {
      let message = 'Social login failed. Please try again.'
      if (error instanceof ApiError) {
        message =
          error.data?.detail || error.data?.message || error.message || message
      } else if (error.message) {
        message = error.message
      }
      dispatch(socialLoginFailure(message))
      throw error
    }
  }

export const registerUserThunk =
  (payload: RegisterPayload): AppThunk<Promise<void>> =>
  async (dispatch: AppDispatch) => {
    dispatch(registerRequest())
    try {
      const response = await apiClient.post<RawSignupApiResponse>(
        '/auth/register',
        payload,
        dispatch
      )

      const expiresAt = Date.now() + response.expires_in * 1000
      await tokenStorage.setStoredTokens(
        response.access_token,
        response.refresh_token,
        expiresAt
      )

      dispatch(
        loginSuccess({
          token: response.access_token,
          refreshToken: response.refresh_token,
          user: response.user,
          expiresAt: expiresAt
        })
      )
    } catch (error: any) {
      let message = 'Registration failed. Please try again.'
      if (error instanceof ApiError) {
        message =
          error.data?.detail || error.data?.message || error.message || message
      } else if (error.message) {
        message = error.message
      }
      dispatch(registerFailure(message))
      throw error
    }
  }

export const requestPasswordResetThunk =
  (payload: ForgotPasswordPayload): AppThunk<Promise<{ message: string }>> =>
  async (dispatch: AppDispatch) => {
    dispatch(forgotPasswordRequest())
    try {
      const response = await apiClient.post<{ message: string }>(
        '/auth/forgot-password',
        payload,
        dispatch
      )
      dispatch(forgotPasswordSuccess(response.message))
      return response
    } catch (error: any) {
      let message = 'Could not send reset instructions. Please try again later.'
      if (error instanceof ApiError) {
        message =
          error.data?.detail || error.data?.message || error.message || message
      } else if (error.message) {
        message = error.message
      }
      dispatch(forgotPasswordFailure(message))
      throw error
    }
  }

export const verifyResetTokenThunk =
  (payload: VerifyResetTokenPayload): AppThunk<Promise<void>> =>
  async (dispatch: AppDispatch) => {
    dispatch(verifyResetTokenRequest())
    try {
      await apiClient.post<void>('/auth/verify-reset-token', payload, dispatch)
      dispatch(verifyResetTokenSuccess())
    } catch (error: any) {
      let message = 'Invalid or expired verification code.'
      if (error instanceof ApiError) {
        message =
          error.data?.detail || error.data?.message || error.message || message
      } else if (error.message) {
        message = error.message
      }
      dispatch(verifyResetTokenFailure(message))
      throw error
    }
  }

export const executePasswordResetThunk =
  (payload: ResetPasswordPayload): AppThunk<Promise<{ message: string }>> =>
  async (dispatch: AppDispatch) => {
    dispatch(resetPasswordRequest())
    try {
      const response = await apiClient.post<{ message: string }>(
        '/auth/reset-password',
        payload,
        dispatch
      )
      dispatch(resetPasswordSuccess(response.message))
      return response
    } catch (error: any) {
      let message = 'Password reset failed. Please try again.'
      if (error instanceof ApiError) {
        message =
          error.data?.detail || error.data?.message || error.message || message
      } else if (error.message) {
        message = error.message
      }
      dispatch(resetPasswordFailure(message))
      throw error
    }
  }

export const logoutUser = (): AppThunk => async dispatch => {
  if ((await GoogleSignin.getCurrentUser()) !== null) {
    try {
      await GoogleSignin.revokeAccess()
      await GoogleSignin.signOut()
    } catch (error) {
      console.error('Error during Google Sign-out:', error)
      showAuthDebugToast(
        'error',
        'Google Sign-out Failed',
        'Could not sign out from Google. Please try again.'
      )
    }
  }
  await tokenStorage.removeStoredTokens()

  dispatch(logoutUserSuccess())
  showAuthDebugToast(
    'info',
    'Logout Initiated',
    'Clearing tokens and session data...'
  )

  router.replace('/(auth)/login')
}

export const initializeAuthThunk =
  (): AppThunk<Promise<void>> =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(initializeAuthRequest())
    const storedData = await tokenStorage.getStoredTokens()
    const { token, refreshToken, expiresAt } = storedData

    if (token && refreshToken && expiresAt && expiresAt > Date.now()) {
      console.log('InitializeAuth: Tokens found, validating...')
      dispatch(setInitialTokens({ token, refreshToken, expiresAt }))
      try {
        const user = await apiClient.get<User>('/auth/me', dispatch)
        console.log('InitializeAuth: /auth/me fetch successful.')
        const currentState = getState().auth
        dispatch(
          initializeAuthSuccess(
            currentState.token &&
              currentState.refreshToken &&
              currentState.expiresAt
              ? {
                  token: currentState.token!,
                  refreshToken: currentState.refreshToken!,
                  user: user,
                  expiresAt: currentState.expiresAt!
                }
              : null
          )
        )
        showAuthDebugToast(
          'success',
          'Session Initialized',
          `User: ${user.email}`
        )
        console.log('InitializeAuth: Auth initialized successfully.')
      } catch (error: any) {
        console.error('InitializeAuth: /auth/me fetch failed.', error)
        let message = 'Session invalid or expired.'
        if (error instanceof ApiError) {
          message =
            error.data?.detail ||
            error.data?.message ||
            error.message ||
            message
        } else if (error.message) {
          message = error.message
        }
        showAuthDebugToast(
          'error',
          'Session Validation Failed',
          `Error: ${message}. Logging out.`
        )
        dispatch(initializeAuthFailure(message))
        dispatch(logoutUser())
        console.log('InitializeAuth: Failure, logged out.')
      }
    } else {
      let reason = 'No tokens found.'
      if (token || refreshToken) {
        reason = 'Tokens found but invalid/expired.'
        await tokenStorage.removeStoredTokens()
      }
      console.log(`InitializeAuth: ${reason}`)
      showAuthDebugToast('info', 'No Active Session', reason)
      dispatch(initializeAuthFailure())
      console.log('InitializeAuth: Finished (no valid session).')
    }
  }
