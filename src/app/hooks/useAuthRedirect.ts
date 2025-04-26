import { useEffect } from 'react'
import { useRouter, useSegments, usePathname } from 'expo-router'
import { useSelector } from 'react-redux'
import { selectAuthStatus } from '@/features/auth/authSelectors'

/**
 * Hook to handle redirection based on authentication status and first open/post-logout state.
 * @param isAuthenticated - Whether the user is currently authenticated.
 * @param isAuthCheckComplete - Whether the initial authentication check has finished.
 * @param shouldForceLogin - Whether to force redirect to login (first open or post-logout), null if check is pending.
 */
const useAuthRedirect = (
  isAuthenticated: boolean,
  isAuthCheckComplete: boolean,
  shouldForceLogin: boolean | null
) => {
  const router = useRouter()
  const segments = useSegments()
  const pathname = usePathname()
  const authStatus = useSelector(selectAuthStatus)

  console.log('useAuthRedirect RUNNING:', {
    isAuthenticated,
    isAuthCheckComplete,
    authStatus,
    shouldForceLogin,
    pathname,
    segments: segments.join('/')
  })

  useEffect(() => {
    if (
      !isAuthCheckComplete ||
      shouldForceLogin === null ||
      authStatus === 'loading' ||
      authStatus === 'idle'
    ) {
      console.log(
        'useAuthRedirect EFFECT: Waiting for auth and first open checks to complete.'
      )
      return
    }

    const isAuthRoute = segments[0] === '(auth)'
    const isRootRoute =
      segments.length === 0 || (segments.length === 1 && segments[0] === '')

    console.log('useAuthRedirect EFFECT:', {
      isAuthenticated,
      authStatus,
      shouldForceLogin,
      pathname,
      segments: segments.join('/'),
      isAuthRoute,
      isRootRoute
    })

    if (isAuthenticated) {
      if (isRootRoute || isAuthRoute) {
        console.log(
          `useAuthRedirect EFFECT: Auth OK, at [${segments.join(
            '/'
          )}]. Redirecting to /main...`
        )
        router.replace('/(main)/(tabs)/')
      } else {
        console.log(
          `useAuthRedirect EFFECT: Auth OK, already outside auth/root [${segments.join(
            '/'
          )}]. OK.`
        )
      }
    } else {
      if (shouldForceLogin) {
        if (!isAuthRoute) {
          console.log(
            `useAuthRedirect EFFECT: Auth Fail, SHOULD FORCE LOGIN, NOT in Auth group [${segments.join(
              '/'
            )}]. Redirecting to /login...`
          )
          router.replace('/(auth)/login')
        } else {
          console.log(
            `useAuthRedirect EFFECT: Auth Fail, SHOULD FORCE LOGIN, but already in Auth group [${segments.join(
              '/'
            )}]. OK.`
          )
        }
      } else {
        if (isRootRoute) {
          console.log(
            `useAuthRedirect EFFECT: Auth Fail, NOT forcing login, BUT at root [${segments.join(
              '/'
            )}]. Redirecting to /login to escape root.`
          )
          router.replace('/(auth)/login')
        } else if (isAuthRoute) {
          console.log(
            `useAuthRedirect EFFECT: Auth Fail, NOT forcing login, already in Auth group [${segments.join(
              '/'
            )}]. OK.`
          )
        } else {
          console.log(
            `useAuthRedirect EFFECT: Auth Fail, NOT forcing login, NOT in Auth/Root [${segments.join(
              '/'
            )}]. Allowing exploration.`
          )
        }
      }
    }
  }, [
    isAuthenticated,
    isAuthCheckComplete,
    authStatus,
    shouldForceLogin,
    router,
    segments,
    pathname
  ])
}

export default useAuthRedirect
