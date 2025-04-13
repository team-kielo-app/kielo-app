import Cookies from "js-cookie";
import { Platform } from "react-native";

const AUTH_TOKEN_KEY = "authToken";

export const getTokenCookie = (): string | null => {
  if (Platform.OS === "web") {
    return Cookies.get(AUTH_TOKEN_KEY) || null;
  }
  // Native platforms would use SecureStore or AsyncStorage here
  // For this web-native focus, we return null for non-web
  return null;
};

export const setTokenCookie = (token: string): void => {
  if (Platform.OS === "web") {
    // Set cookie attributes as needed (secure, httpOnly - if possible, domain, path, expires)
    // Note: httpOnly cannot be set from client-side JS.
    Cookies.set(AUTH_TOKEN_KEY, token, { expires: 7 }); // Example: expires in 7 days
  }
  // Handle native storage if needed
};

export const removeTokenCookie = (): void => {
  if (Platform.OS === "web") {
    Cookies.remove(AUTH_TOKEN_KEY);
  }
  // Handle native storage if needed
};
