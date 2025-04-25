import { store } from '@store/store'
import { AppDispatch } from '@store/store'

import * as authActions from '@features/auth/authActions'
import * as authSelectors from '@features/auth/authSelectors'

import * as Device from 'expo-device'
import { Platform } from 'react-native'
import * as tokenStorage from '@lib/tokenStorage'
import { API_URL } from './apiRoot'

let deviceToken: string | null = null
export const initializeDeviceToken = async () => {
  if (deviceToken) return deviceToken
  if (Platform.OS === 'web') {
    const storedToken = localStorage.getItem('deviceToken')
    if (storedToken) {
      deviceToken = storedToken
    } else {
      deviceToken =
        'web-' +
        Date.now().toString(36) +
        Math.random().toString(36).substring(2)
      localStorage.setItem('deviceToken', deviceToken)
    }
  } else {
    deviceToken =
      Device.osInternalBuildId || Device.deviceName || 'unknown-native-device'
  }
  console.log('Device Token Initialized:', deviceToken)
  return deviceToken
}

let isRefreshing = false
let failedRefresh = false
let refreshPromise: Promise<string | null> | null = null

const handleRefreshToken = async (
  dispatch: AppDispatch
): Promise<string | null> => {
  if (failedRefresh) {
    console.log('Refresh previously failed, forcing logout.')
    dispatch(authActions.logoutUser())
    return null
  }
  if (!isRefreshing) {
    isRefreshing = true
    failedRefresh = false

    const currentRefreshToken =
      authSelectors.selectRefreshToken(store.getState()) ||
      (await tokenStorage.getStoredTokens())

    if (!currentRefreshToken) {
      console.log('No refresh token available, logging out.')
      isRefreshing = false
      dispatch(authActions.logoutUser())
      return null
    }

    console.log('Attempting to refresh token...')
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Device-Token': deviceToken || 'missing'
          },
          body: JSON.stringify({ refresh_token: currentRefreshToken })
        })

        if (!response.ok) {
          throw new Error(`Refresh failed with status: ${response.status}`)
        }

        const data: {
          access_token: string
          refresh_token?: string
          expires_in: number
        } = await response.json()
        const newAccessToken = data.access_token
        const newRefreshToken = data.refresh_token
        const newExpiresAt = Date.now() + data.expires_in * 1000

        dispatch(
          authActions.setRefreshedTokens({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken || currentRefreshToken,
            expiresAt: newExpiresAt
          })
        )
        await tokenStorage.setStoredTokens(
          newAccessToken,
          newRefreshToken || currentRefreshToken,
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
  if (!API_URL) throw new Error('API base URL is not configured.')
  if (!deviceToken) await initializeDeviceToken()

  const state = store.getState()
  let token = authSelectors.selectAuthToken(state)
  const expiresAt = authSelectors.selectTokenExpiresAt(state)

  const bufferSeconds = 60

  if (token && expiresAt && expiresAt - bufferSeconds * 1000 < Date.now()) {
    console.log('Token expired or nearing expiry, attempting refresh...')
    token = await handleRefreshToken(dispatch)
    if (!token) {
      throw new Error('Authentication required or refresh failed.')
    }
  }

  const headers: HeadersInit = {
    ...options.headers,
    'Content-Type': 'application/json',
    'X-Device-Token': deviceToken || 'missing'
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
      if (response.status === 401 && !isRetry) {
        if (url.includes('/auth/')) {
          throw new Error('Authentication failed.')
        }

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
    return response.json() as Promise<T>
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
