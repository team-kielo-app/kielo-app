import Cookies from "js-cookie";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "kielo_access_token";
const REFRESH_TOKEN_KEY = "kielo_refresh_token";
const EXPIRY_AT_KEY = "kielo_token_expires_at";

export const setTokensCookie = (
  accessToken: string,
  refreshToken: string,
  expiresAt: number
): void => {
  if (Platform.OS === "web") {
    const expiryDate = new Date(expiresAt);
    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 30);

    Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
      expires: expiryDate,
      sameSite: "strict",
    });
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      expires: refreshExpiry,
      sameSite: "strict",
    });
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
};

export const getTokenCookie = (): string | null => {
  if (Platform.OS === "web") {
    return Cookies.get(ACCESS_TOKEN_KEY) || null;
  }
  return null;
};

export const getRefreshTokenCookie = (): string | null => {
  if (Platform.OS === "web") {
    return Cookies.get(REFRESH_TOKEN_KEY) || null;
  }
  return null;
};

export const getExpiryCookie = (): number | null => {
  if (Platform.OS === "web") {
    const expiryStr = Cookies.get(EXPIRY_AT_KEY);
    return expiryStr ? parseInt(expiryStr, 10) : null;
  }
  return null;
};

export const removeTokensCookie = (): void => {
  if (Platform.OS === "web") {
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    Cookies.remove(EXPIRY_AT_KEY);
    console.log("Cookies removed");
  }
};

