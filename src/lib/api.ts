import { store, AppDispatch } from '@store/store'
import * as authActions from '@features/auth/authActions'
import * as authSelectors from '@features/auth/authSelectors'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import * as tokenStorage from '@lib/tokenStorage'
import * as secureStorage from './secureStorage'
import { API_URL } from './apiRoot'

const DEVICE_TOKEN_KEY = 'kielo_device_token'
let deviceToken: string | null = null

export const initializeDeviceToken = async (): Promise<string | null> => {
  if (deviceToken) return deviceToken

  try {
    const storedToken = await secureStorage.getSecureItem(DEVICE_TOKEN_KEY)
    if (storedToken) {
      deviceToken = storedToken
      console.log('Device Token Initialized from Storage:', deviceToken)
      return deviceToken
    }

    if (Platform.OS === 'web') {
      deviceToken =
        'web-' +
        Date.now().toString(36) +
        Math.random().toString(36).substring(2)
    } else {
      const identifier =
        Device.osInternalBuildId ||
        Device.osInstallationId ||
        Device.deviceName ||
        `native-${Date.now()}`
      deviceToken = identifier.replace(/[^a-zA-Z0-9_-]/g, '')
    }

    await secureStorage.setSecureItem(DEVICE_TOKEN_KEY, deviceToken)
    console.log('Generated and Stored New Device Token:', deviceToken)
    return deviceToken
  } catch (error) {
    console.error('Error initializing device token:', error)
    deviceToken = 'error-fallback-' + Math.random().toString(36).substring(2)
    return deviceToken
  }
}

let isRefreshing = false
let failedRefresh = false
let refreshPromise: Promise<string | null> | null = null

const handleRefreshToken = async (
  dispatch: AppDispatch
): Promise<string | null> => {
  if (failedRefresh) {
    return null
  }
  if (!isRefreshing) {
    isRefreshing = true
    failedRefresh = false
    const currentRefreshToken =
      authSelectors.selectRefreshToken(store.getState()) ||
      (await tokenStorage.getStoredTokens()).refreshToken
    if (!currentRefreshToken) {
      return null
    }
    console.log('Attempting to refresh token...')
    refreshPromise = (async () => {
      try {
        const dt = deviceToken || (await initializeDeviceToken()) || 'missing'
        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Device-Token': dt },
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
        isRefreshing = false
        refreshPromise = null
        return newAccessToken
      } catch (error) {
        console.error('Failed to refresh token:', error)
        isRefreshing = false
        failedRefresh = true
        refreshPromise = null
        dispatch(authActions.logoutUser())
        return null
      }
    })()
    return refreshPromise
  } else {
    console.log('Refresh already in progress, waiting...')
    return refreshPromise
  }
}

const request = async <T>(
  url: string,
  options: RequestInit = {},
  dispatch: AppDispatch,
  isRetry: boolean = false
): Promise<T> => {
  if (!API_URL) throw new Error('API base URL not configured.')
  const dt = deviceToken || (await initializeDeviceToken()) || 'missing'

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
    'X-Device-Token': dt
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
          throw new Error(
            `Authentication failed after refresh attempt. Status: ${response.status}`
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
      const error = new Error(`HTTP error! status: ${response.status}`) as any
      error.status = response.status
      error.data = errorData
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
    throw error
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
