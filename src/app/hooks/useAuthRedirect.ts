import { useEffect, useRef } from 'react'
import {
  useLocalSearchParams,
  usePathname,
  useRouter,
  useSegments
} from 'expo-router'
import { useSelector } from 'react-redux'
import { selectAuthStatus } from '@/features/auth/authSelectors'

/**
 * Hook to handle redirection based on authentication status, closely mirroring
 * the original logic including initial redirect handling.
 * @param isAuthenticated - Whether the user is currently authenticated.
 * @param isAuthCheckComplete - Whether the initial authentication check has finished.
 */
export const useAuthRedirect = (
  isAuthenticated: boolean,
  isAuthCheckComplete: boolean
) => {
  const router = useRouter()
  const segments = useSegments()
  const pathname = usePathname()
  const params = useLocalSearchParams<{ redirect?: string }>()

  // Ref to track if the first redirect logic pass has occurred after auth check completed.
  const hasRedirected = useRef(false)
  const authStatus = useSelector(selectAuthStatus)

  useEffect(() => {
    const isAuthCheckComplete =
      authStatus === 'succeeded' || authStatus === 'failed'
    if (!isAuthCheckComplete) return

    const isAuthRoute = segments[0] === '(auth)'
    const isLoginRoute = segments[0] === '(auth)' && segments[1] === 'login'
    const isRootRoute = segments.length === 0

    if (isAuthenticated) {
      if (isRootRoute || isAuthRoute) {
        router.replace('/(main)/(tabs)/')
      }
    } else {
      // Initial redirect
      if (!hasRedirected?.current) {
        hasRedirected.current = true
        if (isRootRoute) {
          router.replace('/(auth)/login')
        } else if (!isAuthRoute) {
          console.log(pathname)
          router.replace({
            pathname: '/(auth)/login',
            params: { redirect: pathname }
          })
        }
      } else if (!isLoginRoute) {
        if (isRootRoute) {
          router.replace('/(main)/(tabs)/')
        }
      }
    }
  }, [isAuthenticated, authStatus, router, segments])
}
