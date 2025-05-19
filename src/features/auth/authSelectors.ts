import { RootState } from '@store/store'
import { User, AuthState } from './types'

export const selectIsAuthenticated = (state: RootState): boolean => {
  return !!state.auth.userId && state.auth.status === 'succeeded'
}
export const selectAuthenticatedUserId = (state: RootState): string | null =>
  state.auth.userId

export const selectUser = (state: RootState): User | null => {
  const userId = state.auth.userId
  if (userId && state.entities.users) {
    return state.entities.users[userId] || null
  }
  return null
}
export const selectAuthStatus = (state: RootState): AuthState['status'] =>
  state.auth.status
export const selectAuthError = (state: RootState): string | null =>
  state.auth.error
export const selectInitialAuthChecked = (state: RootState): boolean =>
  state.auth.initialAuthChecked
