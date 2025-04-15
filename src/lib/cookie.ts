import Cookies from "js-cookie";
import { Platform } from "react-native";
// Consider expo-secure-store for native refresh tokens later

const ACCESS_TOKEN_KEY = "kielo_access_token";
const REFRESH_TOKEN_KEY = "kielo_refresh_token";
const EXPIRY_AT_KEY = "kielo_token_expires_at";

// --- Web Implementation (using js-cookie) ---

export const setTokensCookie = (
  accessToken: string,
  refreshToken: string,
  expiresAt: number
): void => {
  if (Platform.OS === "web") {
    const expiryDate = new Date(expiresAt);
    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 30); // Set refresh token cookie expiry (e.g., 30 days)

    Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
      expires: expiryDate,
      sameSite: "strict",
    }); // Expires based on token TTL
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      expires: refreshExpiry,
      sameSite: "strict",
    }); // Longer expiry for refresh token
    Cookies.set(EXPIRY_AT_KEY, expiresAt.toString(), {
      expires: expiryDate,
      sameSite: "strict",
    });
    console.log("Cookies set:", {
      accessToken: "...",
      refreshToken: "...",
      expiresAt,
    });
  }
  // TODO: Handle native storage (SecureStore for refresh token)
};

export const getTokenCookie = (): string | null => {
  if (Platform.OS === "web") {
    return Cookies.get(ACCESS_TOKEN_KEY) || null;
  }
  return null; // TODO: Handle native storage
};

export const getRefreshTokenCookie = (): string | null => {
  if (Platform.OS === "web") {
    return Cookies.get(REFRESH_TOKEN_KEY) || null;
  }
  return null; // TODO: Handle native storage
};

export const getExpiryCookie = (): number | null => {
  if (Platform.OS === "web") {
    const expiryStr = Cookies.get(EXPIRY_AT_KEY);
    return expiryStr ? parseInt(expiryStr, 10) : null;
  }
  return null; // TODO: Handle native storage
};

export const removeTokensCookie = (): void => {
  if (Platform.OS === "web") {
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    Cookies.remove(EXPIRY_AT_KEY);
    console.log("Cookies removed");
  }
  // TODO: Handle native storage
};

// --- Consider adding native implementations using expo-secure-store ---
// export const setTokensNative = async (accessToken: string, refreshToken: string, expiresAt: number): Promise<void> => { ... }
// export const getTokensNative = async (): Promise<{ accessToken: string | null, refreshToken: string | null, expiresAt: number | null }> => { ... }
// export const removeTokensNative = async (): Promise<void> => { ... }
