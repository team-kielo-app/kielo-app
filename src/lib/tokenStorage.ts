import * as secureStorage from './secureStorage'

const ACCESS_TOKEN_KEY = 'kielo_access_token'
const REFRESH_TOKEN_KEY = 'kielo_refresh_token'
const EXPIRY_KEY = 'kielo_token_expiry'

export interface StoredTokenInfo {
  token: string | null
  refreshToken: string | null
  expiresAt: number | null
}

/**
 * Retrieves authentication tokens using the secure storage utility.
 */
export const getStoredTokens = async (): Promise<StoredTokenInfo> => {
  try {
    const [token, refreshToken, expiresAtStr] = await Promise.all([
      secureStorage.getSecureItem(ACCESS_TOKEN_KEY),
      secureStorage.getSecureItem(REFRESH_TOKEN_KEY),
      secureStorage.getSecureItem(EXPIRY_KEY)
    ])
    const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : null
    return {
      token,
      refreshToken,
      expiresAt: expiresAt && !isNaN(expiresAt) ? expiresAt : null
    }
  } catch (error) {
    console.error('Error processing stored tokens:', error)
    return { token: null, refreshToken: null, expiresAt: null }
  }
}

/**
 * Stores authentication tokens using the secure storage utility.
 * @param token Access Token
 * @param refreshToken Refresh Token
 * @param expiresAt Unix timestamp (milliseconds) for access token expiry
 */
export const setStoredTokens = async (
  token: string,
  refreshToken: string,
  expiresAt: number
): Promise<void> => {
  try {
    await Promise.all([
      secureStorage.setSecureItem(ACCESS_TOKEN_KEY, token),
      secureStorage.setSecureItem(REFRESH_TOKEN_KEY, refreshToken),
      secureStorage.setSecureItem(EXPIRY_KEY, expiresAt.toString())
    ])
  } catch (error) {
    console.error('Error saving tokens via secureStorage:', error)
  }
}

/**
 * Removes authentication tokens using the secure storage utility.
 */
export const removeStoredTokens = async (): Promise<void> => {
  try {
    await Promise.all([
      secureStorage.deleteSecureItem(ACCESS_TOKEN_KEY),
      secureStorage.deleteSecureItem(REFRESH_TOKEN_KEY),
      secureStorage.deleteSecureItem(EXPIRY_KEY)
    ])
  } catch (error) {
    console.error('Error removing tokens via secureStorage:', error)
  }
}
