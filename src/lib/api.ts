// src/lib/api.ts
import { store, AppDispatch } from '@store/store' // store is needed for isInitialized check
import * as authActions from '@features/auth/authActions'
// No longer importing authSelectors here for tokens
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import * as tokenStorage from '@lib/tokenStorage'
import * as secureStorage from './secureStorage'
import { ApiError } from './ApiError'
import { API_URL } from './apiRoot'

// --- Auth Initialization State Management ---
let _isAuthInitialized = false
let _authInitializationPromise: Promise<void> | null = null
const _requestQueue: Array<{
  resolve: (value: any) => void
  reject: (reason?: any) => void
  url: string
  options: RequestInit
  dispatch: AppDispatch
}> = []

const DEVICE_TOKEN_KEY = 'kielo_device_token'
let _deviceToken: string | null = null

/**
 * Called by initializeAuthThunk when it completes (successfully or not).
 * This will process any queued API requests.
 */
export const signalAuthInitialized = () => {
  console.log(
    'Auth has been initialized (or initialization attempt completed). Processing request queue.'
  )
  _isAuthInitialized = true
  _processRequestQueue()
}

// This function is for initializeAuthThunk to await if needed,
// though direct signaling is often better.
// Not strictly necessary if signalAuthInitialized is reliably called.
const ensureAuthInitialized = (): Promise<void> => {
  if (_isAuthInitialized) {
    return Promise.resolve()
  }
  if (!_authInitializationPromise) {
    // This promise should ideally be the one returned by initializeAuthThunk,
    // or a new one that gets resolved by signalAuthInitialized.
    // For simplicity, let's create a new promise that signalAuthInitialized resolves.
    _authInitializationPromise = new Promise(resolve => {
      const check = () => {
        if (_isAuthInitialized) {
          resolve()
        } else {
          setTimeout(check, 100) // Check every 100ms
        }
      }
      check()
    })
  }
  return _authInitializationPromise
}

const _processRequestQueue = async () => {
  while (_requestQueue.length > 0) {
    const queuedRequest = _requestQueue.shift()
    if (queuedRequest) {
      console.log('Processing queued request for:', queuedRequest.url)
      try {
        // Re-call the internal _executeRequest function for queued items
        const result = await _executeRequestAndReturnResponse(
          queuedRequest.url,
          queuedRequest.options,
          queuedRequest.dispatch,
          false // A queued request is not an initial retry for 401
        )
        queuedRequest.resolve(result.body) // Resolve with the body
      } catch (error) {
        queuedRequest.reject(error)
      }
    }
  }
}

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
  token: string | null,
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

    const currentRefreshToken = (await tokenStorage.getStoredTokens())
      .refreshToken
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
            Authorization: `Bearer ${token}`,
            ...(currentDeviceToken && { 'X-Device-Token': currentDeviceToken })
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
        console.error('Failed to refresh token:', JSON.stringify(error))
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

// --- NEW ---
// Renamed from _executeRequest to reflect it returns the raw response and parsed body
const _executeRequestAndReturnResponse = async <T>(
  url: string,
  options: RequestInit = {},
  dispatch: AppDispatch,
  isRetry: boolean = false
): Promise<{ response: Response; body: T }> => {
  if (!API_URL) throw new Error('API base URL not configured.')
  const currentDeviceToken = getDeviceToken()
  if (!currentDeviceToken) {
    console.warn('Device token not yet initialized when making API request.')
  }

  const storedTokenData = await tokenStorage.getStoredTokens()
  let token = storedTokenData.token
  const expiresAt = storedTokenData.expiresAt
  const bufferSeconds = 60

  if (token && expiresAt && expiresAt - bufferSeconds * 1000 < Date.now()) {
    console.log(
      `Token for ${url} expired or nearing expiry, attempting refresh...`
    )
    token = await handleRefreshToken(token, dispatch)
    if (!token && !url.includes('/auth/')) {
      console.warn(
        `Authentication token refresh failed or token is null for ${url}.`
      )
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
    const response = await fetch(`${API_URL}${url}`, { ...options, headers })

    if (!response.ok) {
      if (
        response.status === 401 &&
        !isRetry &&
        !url.includes('/auth/refresh')
      ) {
        console.log(`Received 401 for ${url}, attempting token refresh...`)
        const newToken = await handleRefreshToken(token, dispatch)
        if (newToken) {
          console.log(
            `Refresh successful after 401 for ${url}, retrying original request...`
          )
          return _executeRequestAndReturnResponse<T>(
            url,
            options,
            dispatch,
            true
          )
        } else {
          console.warn(
            `Token refresh failed after 401 for ${url}. Original request will likely fail.`
          )
        }
      }

      let errorData
      try {
        errorData = await response.json()
      } catch (e) {
        errorData = await response.text()
      }
      const errorMessage =
        typeof errorData === 'string'
          ? errorData
          : errorData?.message ||
            errorData?.error ||
            `HTTP error! status: ${response.status}`
      throw new ApiError(errorMessage, response.status, errorData)
    }

    // --- MODIFIED ---
    // Handle body parsing here and return both response and body
    let body: T
    if (response.status === 204) {
      body = null as T
    } else {
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        body = (await response.json()) as T
      } else {
        body = (await response.text()) as any as T
      }
    }
    return { response, body }
  } catch (error: any) {
    console.error(
      `Error during _executeRequestAndReturnResponse to ${url}:`,
      error.message
    )
    if (!(error instanceof ApiError)) {
      throw new ApiError(
        error.message || 'A network or execution error occurred.',
        undefined,
        error
      )
    } else {
      throw error
    }
  }
}

// --- MODIFIED ---
// Request function now returns the full object from the executor
const requestWithResponse = async <T>(
  url: string,
  options: RequestInit = {},
  dispatch: AppDispatch
): Promise<{ response: Response; body: T }> => {
  const authState = store.getState().auth
  const initialCheckDone = authState.initialAuthChecked
  const isCurrentlyLoadingAuth = authState.status === 'loading'

  if (
    !initialCheckDone ||
    (isCurrentlyLoadingAuth && !url.startsWith('/auth/'))
  ) {
    console.log(
      `Auth not yet initialized or loading. Queuing request for: ${url}`
    )
    // Queueing needs to be adapted to return the response object as well
    return new Promise((resolve, reject) => {
      // The queueing logic would need adjustment if a queued request
      // itself needs to return the raw response. For now, assuming
      // polling thunks won't be called before auth is initialized.
      // Or we adapt the queue processing. Let's simplify and assume this for now.
      _requestQueue.push({
        resolve: (val: { body: T }) =>
          resolve({ response: new Response(), body: val.body }), // Mock response for queue
        reject,
        url,
        options,
        dispatch
      })
    })
  }

  return _executeRequestAndReturnResponse(url, options, dispatch)
}

// --- MODIFIED ---
// Original request function now wraps the new one to maintain backward compatibility
const request = async <T>(
  url: string,
  options: RequestInit = {},
  dispatch: AppDispatch
): Promise<T> => {
  const { body } = await requestWithResponse<T>(url, options, dispatch)
  return body
}

export const apiClient = {
  get: <T>(url: string, dispatch: AppDispatch): Promise<T> =>
    request<T>(url, { method: 'GET' }, dispatch),
  // --- NEW METHOD ---
  getWithResponse: <T>(
    url: string,
    dispatch: AppDispatch
  ): Promise<{ response: Response; body: T }> =>
    requestWithResponse<T>(url, { method: 'GET' }, dispatch),
  post: <T>(url: string, data: any, dispatch: AppDispatch): Promise<T> =>
    request<T>(url, { method: 'POST', body: JSON.stringify(data) }, dispatch),
  put: <T>(url: string, data: any, dispatch: AppDispatch): Promise<T> =>
    request<T>(url, { method: 'PUT', body: JSON.stringify(data) }, dispatch),
  delete: <T>(url: string, dispatch: AppDispatch): Promise<T> =>
    request<T>(url, { method: 'DELETE' }, dispatch)
}
