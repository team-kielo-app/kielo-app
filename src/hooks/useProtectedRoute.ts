import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter, usePathname } from 'expo-router'
import {
  selectIsAuthenticated,
  selectAuthStatus,
  selectInitialAuthChecked
} from '@features/auth/authSelectors'

/**
 * Hook to protect a route. If the user is not authenticated
 * (after the initial auth check is complete), it redirects
 * them to the login screen within the (auth) group,
 * including a redirect query parameter.
 */
export function useProtectedRoute() {
  const router = useRouter()
  const pathname = usePathname() // Get the current path (will be like /main/profile)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const authStatus = useSelector(selectAuthStatus)
  const initialAuthChecked = useSelector(selectInitialAuthChecked)

  useEffect(() => {
    if (!initialAuthChecked || authStatus === 'loading') {
      // Wait for init check or loading
      return
    }
    if (!isAuthenticated) {
      // If not authenticated after check
      router.replace(`/(auth)/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, authStatus, initialAuthChecked, router, pathname])

  return {
    isLoading: !initialAuthChecked || authStatus === 'loading',
    isAuthenticated: isAuthenticated
  }
}
