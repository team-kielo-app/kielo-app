import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@store/store'
import { initializeAuthThunk } from '@features/auth/authActions'
import type { ApiStatusType } from '@lib/api.d'
import { initializeDeviceToken } from '@lib/api'
import * as appStorage from '@lib/appStorage'
import { HAS_OPENED_BEFORE_KEY } from '@constants/appStorage'

/**
 * Hook to handle initial application setup tasks like
 * initializing push notification token, dispatching the auth check,
 * and determining if this is the first app open.
 * @param authStatus Current authentication status
 * @returns {boolean | null} `true` if login should be forced, `false` otherwise, `null` while checking.
 */
export const useAppInitialization = (
  authStatus: ApiStatusType
): boolean | null => {
  const dispatch = useDispatch<AppDispatch>()
  const [shouldForceLogin, setShouldForceLogin] = useState<boolean | null>(null)

  useEffect(() => {
    const checkFirstOpen = async () => {
      const hasOpened = await appStorage.getAppItem(HAS_OPENED_BEFORE_KEY)
      if (!hasOpened) {
        console.log('First time opening or first open after logout.')
        setShouldForceLogin(true)
        await appStorage.setAppItem(HAS_OPENED_BEFORE_KEY, 'true')
      } else {
        console.log('App has been opened before.')
        setShouldForceLogin(false)
      }
    }

    initializeDeviceToken()
    console.log('Device token initialization triggered.')

    checkFirstOpen()

    if (authStatus === 'idle') {
      console.log('Auth status is idle, dispatching initializeAuthThunk...')
      dispatch(initializeAuthThunk())
    }
  }, [dispatch])

  return shouldForceLogin
}

export default useAppInitialization
