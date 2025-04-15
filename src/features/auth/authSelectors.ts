import { RootState } from "@store/store";
import { User, AuthState } from "./types";

export const selectIsAuthenticated = (state: RootState): boolean =>
  !!state.auth.token;
export const selectUser = (state: RootState): User | null => state.auth.user;
export const selectAuthToken = (state: RootState): string | null =>
  state.auth.token;
export const selectRefreshToken = (state: RootState): string | null =>
  state.auth.refreshToken;
export const selectAuthStatus = (state: RootState): AuthState["status"] =>
  state.auth.status;
export const selectAuthError = (state: RootState): string | null =>
  state.auth.error;
export const selectTokenExpiresAt = (state: RootState): number | null =>
  state.auth.expiresAt;

