import { store, AppDispatch } from '@store/store'
import * as authActions from '@features/auth/authActions'
import * as authSelectors from '@features/auth/authSelectors'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import * as tokenStorage from '@lib/tokenStorage'
import * as secureStorage from './secureStorage'
import { showAuthDebugToast } from './debugToast'
import { ApiError } from './ApiError'
import { API_URL } from './apiRoot'

const DEVICE_TOKEN_KEY = 'kielo_device_token'
let _deviceToken: string | null = null

export const initializeDeviceToken = async (): Promise<string | null> => {
  if (_deviceToken) return _deviceToken

  try {
    const storedToken = await secureStorage.getSecureItem(DEVICE_TOKEN_KEY)
    if (storedToken) {
      _deviceToken = storedToken
      return _deviceToken
    }

    if (Platform.OS === 'web') {
      _deviceToken =
        'web-' +
        Date.now().toString(36) +
        Math.random().toString(36).substring(2)
    } else {
      const identifier =
        Device.osInternalBuildId ||
        Device.osInstallationId ||
        Device.deviceName ||
        `native-${Date.now()}`
      const generatedToken = identifier.replace(/[^a-zA-Z0-9_-]/g, '')
      _deviceToken = generatedToken
    }

    await secureStorage.setSecureItem(DEVICE_TOKEN_KEY, _deviceToken)
    console.log('Generated and Stored New Device Token:', _deviceToken)
    return _deviceToken
  } catch (error) {
    console.error('Error initializing device token:', error)
    _deviceToken = 'error-fallback-' + Math.random().toString(36).substring(2)
    return _deviceToken
  }
}

// Getter for the device token, ensures initialization has been attempted.
// This should ideally be called after initializeDeviceToken has run at least once.
export const getDeviceToken = (): string | null => {
  return _deviceToken
}

// --- Token Refresh Manager ---
const tokenRefresher = {
  isRefreshing: false,
  hasFailedRecently: false, // Indicates if a refresh attempt failed and we should not retry immediately
  promise: null as Promise<string | null> | null,

  resetFailure() {
    this.hasFailedRecently = false // Call this when user logs in successfully or app restarts
  },

  async refresh(dispatch: AppDispatch): Promise<string | null> {
    // Actual refresh logic will be moved here
    // For now, just outlining the structure
    return null
  }
}

// Optional: Expose a way to reset the refresh failure flag, e.g., on successful login
export const resetTokenRefreshFailure = () => {
  tokenRefresher.resetFailure()
}

const handleRefreshToken = async (
  dispatch: AppDispatch
): Promise<string | null> => {
  // Use the tokenRefresher state
  if (tokenRefresher.hasFailedRecently) {
    console.warn(
      'Token refresh previously failed, not attempting again immediately.'
    )
    return null
  }

  if (!tokenRefresher.isRefreshing) {
    tokenRefresher.isRefreshing = true
    // tokenRefresher.hasFailedRecently = false; // Reset this at the start of an attempt

    const currentRefreshToken =
      authSelectors.selectRefreshToken(store.getState()) ||
      (await tokenStorage.getStoredTokens()).refreshToken
    if (!currentRefreshToken) {
      tokenRefresher.isRefreshing = false
      return null
    }
    console.log('Attempting to refresh token...')
    tokenRefresher.promise = (async () => {
      try {
        const currentDeviceToken = getDeviceToken()
        if (!currentDeviceToken) {
          // This should ideally not happen if initialized at startup
          console.warn(
            "Device token not available for token refresh. Using 'missing'."
          )
        }

        const response = await fetch(`${API_URL}/auth/refresh`, {
          // Now always use the initialized token
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Device-Token': currentDeviceToken || 'missing'
          },
          body: JSON.stringify({ refresh_token: currentRefreshToken })
        })
        if (!response.ok) {
          throw new Error(`Refresh failed: ${response.status}`)
        }
        const data: {
          access_token: string
          refresh_token?: string
          expires_in: number
        } = await response.json()
        showAuthDebugToast('success', 'Token Refreshed')
        const newAccessToken = data.access_token
        const newRefreshToken = data.refresh_token
        const newExpiresAt = Date.now() + data.expires_in * 1000
        const finalRefreshToken = newRefreshToken || currentRefreshToken
        dispatch(
          authActions.setRefreshedTokens({
            accessToken: newAccessToken,
            refreshToken: finalRefreshToken,
            expiresAt: newExpiresAt
          })
        )
        await tokenStorage.setStoredTokens(
          newAccessToken,
          finalRefreshToken,
          newExpiresAt
        )
        console.log('Token refreshed successfully.')
        tokenRefresher.isRefreshing = false
        tokenRefresher.promise = null
        tokenRefresher.hasFailedRecently = false // Successful refresh, clear failure flag
        return newAccessToken
      } catch (error) {
        console.error('Failed to refresh token:', error)
        showAuthDebugToast(
          'error',
          'Token Refresh Failed',
          `Status: ${
            (error as ApiError)?.status || 'Network Error'
          }. Logging out.`
        )
        tokenRefresher.isRefreshing = false
        tokenRefresher.hasFailedRecently = true // Mark that refresh failed
        tokenRefresher.promise = null
        dispatch(authActions.logoutUser())
        return null
      }
    })()
    return tokenRefresher.promise
  } else {
    console.log('Refresh already in progress, waiting...')
    return tokenRefresher.promise
  }
}

const request = async <T>(
  url: string,
  options: RequestInit = {},
  dispatch: AppDispatch,
  isRetry: boolean = false
): Promise<T> => {
  if (!API_URL) throw new Error('API base URL not configured.')
  // Use the getter. Assumes initializeDeviceToken was called at app startup.
  const currentDeviceToken = getDeviceToken()
  if (!currentDeviceToken) {
    console.warn(
      'Device token not yet initialized when making API request. This might lead to issues if X-Device-Token is strictly required by backend for all requests OR if called too early in app lifecycle.'
    )
    // Depending on backend requirements, you might throw an error here or proceed.
    // For now, let's proceed but log a warning. The backend might allow some initial calls without it.
  }

  const state = store.getState()
  let token = authSelectors.selectAuthToken(state)
  const expiresAt = authSelectors.selectTokenExpiresAt(state)
  const bufferSeconds = 60

  if (token && expiresAt && expiresAt - bufferSeconds * 1000 < Date.now()) {
    console.log('Token expired or nearing expiry, attempting refresh...')
    token = await handleRefreshToken(dispatch)
    if (!token && !url.includes('/auth/')) {
      throw new Error('Authentication required or refresh failed.')
    }
  }

  const headers: HeadersInit = {
    ...options.headers,
    'Content-Type': 'application/json',
    'X-Device-Token': currentDeviceToken || 'uninitialized'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: headers
    })
    if (!response.ok) {
      if (
        response.status === 401 &&
        !isRetry &&
        !url.includes('/auth/refresh')
      ) {
        console.log('Received 401 Unauthorized, attempting token refresh...')
        const newToken = await handleRefreshToken(dispatch)
        if (newToken) {
          console.log(
            'Refresh successful after 401, retrying original request...'
          )
          return request<T>(url, options, dispatch, true)
        } else {
          showAuthDebugToast(
            'error',
            'Authentication Error',
            `Session invalid or refresh failed for ${url}. Please log in again.`
          )
        }
      }
      let errorData
      try {
        errorData = await response.json()
      } catch (e) {
        errorData = await response.text()
      }
      console.error('API Error:', response.status, errorData)
      const errorMessage =
        typeof errorData === 'string'
          ? errorData
          : // Attempt to get a message from a common error structure
            errorData?.message ||
            errorData?.error ||
            `HTTP error! status: ${response.status}`
      const error = new ApiError(errorMessage, response.status, errorData)
      throw error
    }
    if (response.status === 204) return null as T
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return response.json() as Promise<T>
    }
    return response.text() as any as Promise<T>
  } catch (error) {
    console.error(`Network or other error during fetch to ${url}:`, error)
    // If it's not already an ApiError, wrap it for consistency upstream
    // though thunks will likely catch and re-throw with specific messages.
    if (!(error instanceof ApiError)) {
      throw new ApiError(
        error.message || 'A network error occurred.',
        undefined,
        error
      )
    } else {
      throw error
    }
  }
}

export const apiClient = {
  get: <T>(url: string, dispatch: AppDispatch): Promise<T> =>
    request<T>(url, { method: 'GET' }, dispatch),
  post: <T>(url: string, data: any, dispatch: AppDispatch): Promise<T> =>
    request<T>(url, { method: 'POST', body: JSON.stringify(data) }, dispatch),
  put: <T>(url: string, data: any, dispatch: AppDispatch): Promise<T> =>
    request<T>(url, { method: 'PUT', body: JSON.stringify(data) }, dispatch),
  delete: <T>(url: string, dispatch: AppDispatch): Promise<T> =>
    request<T>(url, { method: 'DELETE' }, dispatch)
}
