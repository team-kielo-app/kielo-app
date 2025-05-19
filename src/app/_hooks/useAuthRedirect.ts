import { useEffect } from 'react'
import { useRouter, useSegments } from 'expo-router'
import {
  selectAuthStatus,
  selectInitialAuthChecked
} from '@features/auth/authSelectors'
import { useSelector } from 'react-redux'

const useAuthRedirect = (isAuthenticated: boolean) => {
  // isLoadingAuth could be !initialAuthChecked || authStatus === 'loading'
  const router = useRouter()
  const segments = useSegments()
  const initialAuthChecked = useSelector(selectInitialAuthChecked) // Get this
  const authStatus = useSelector(selectAuthStatus)

  useEffect(() => {
    // Wait for the initial check to complete and not be in an intermediate loading state
    if (!initialAuthChecked || authStatus === 'loading') {
      return
    }

    const isAuthRoute = segments[0] === '(auth)'
    const isEffectivelyRoot = segments.filter(Boolean).length === 0

    if (isAuthenticated) {
      // User is properly authenticated and session is valid
      if (isAuthRoute || isEffectivelyRoot) {
        router.replace('/(main)/(tabs)/')
      }
    } else {
      if (isEffectivelyRoot) {
        // If truly at root and not due to a failed session revalidation, go to login
        router.replace('/(auth)/login')
      }
    }
  }, [isAuthenticated, authStatus, initialAuthChecked, segments, router])
}

export default useAuthRedirect
