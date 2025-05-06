import { useEffect } from 'react'
import { useRouter, useSegments } from 'expo-router'

/**
 * Hook to handle redirection based on authentication status and first open/post-logout state.
 * @param isAuthenticated - Whether the user is currently authenticated.
 * @param isLoadingAuth - Whether the initial authentication check has finished.
 */
const useAuthRedirect = (isAuthenticated: boolean, isLoadingAuth: boolean) => {
  const router = useRouter()
  const segments = useSegments()

  console.log('noice', segments)

  useEffect(() => {
    if (isLoadingAuth) return

    const isAuthRoute = segments[0] === '(auth)'
    const isRootRoute = segments.filter(Boolean).length === 0

    if (isAuthenticated) {
      if (isRootRoute || isAuthRoute) {
        router.replace('/(main)/(tabs)/')
      }
    } else if (isRootRoute) {
      router.replace('/(auth)/login')
    }
  }, [isAuthenticated, isLoadingAuth])
}

export default useAuthRedirect
