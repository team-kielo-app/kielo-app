import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as CookieLib from "./cookie";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const EXPIRY_KEY = "tokenExpiry";

export interface StoredTokenInfo {
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

/**
 * Retrieves authentication tokens from the appropriate storage based on platform.
 */
export const getStoredTokens = async (): Promise<StoredTokenInfo> => {
  if (Platform.OS === "web") {
    const token = CookieLib.getTokenCookie();
    const refreshToken = CookieLib.getRefreshTokenCookie();
    const expiresAtStr = CookieLib.getExpiryCookie();
    const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : null;
    return {
      token,
      refreshToken,
      expiresAt: expiresAt && !isNaN(expiresAt) ? expiresAt : null,
    };
  } else {
    try {
      const [token, refreshToken, expiresAtStr] = await Promise.all([
        SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.getItemAsync(EXPIRY_KEY),
      ]);
      const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : null;
      return {
        token,
        refreshToken,
        expiresAt: expiresAt && !isNaN(expiresAt) ? expiresAt : null,
      };
    } catch (error) {
      console.error("SecureStore Error (getStoredTokens):", error);
      return { token: null, refreshToken: null, expiresAt: null };
    }
  }
};

/**
 * Stores authentication tokens in the appropriate storage based on platform.
 * @param token Access Token
 * @param refreshToken Refresh Token
 * @param expiresAt Unix timestamp (milliseconds) for access token expiry
 */
export const setStoredTokens = async (
  token: string,
  refreshToken: string,
  expiresAt: number
): Promise<void> => {
  if (Platform.OS === "web") {
    CookieLib.setTokensCookie(token, refreshToken, expiresAt);
  } else {
    try {
      await Promise.all([
        SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
        SecureStore.setItemAsync(EXPIRY_KEY, expiresAt.toString()),
      ]);
    } catch (error) {
      console.error("SecureStore Error (setStoredTokens):", error);
    }
  }
};

/**
 * Removes authentication tokens from the appropriate storage based on platform.
 */
export const removeStoredTokens = async (): Promise<void> => {
  if (Platform.OS === "web") {
    CookieLib.removeTokensCookie();
  } else {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.deleteItemAsync(EXPIRY_KEY),
      ]);
    } catch (error) {
      console.error("SecureStore Error (removeStoredTokens):", error);
    }
  }
};

