import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@store/store'
import { initializeAuthThunk } from '@features/auth/authActions'
import type { ApiStatusType } from '@lib/api.d'
import { initializeDeviceToken } from '@lib/api'

/**
 * Hook to handle initial application setup tasks like
 * initializing push notification token and dispatching the auth check.
 * @param authStatus Current authentication status ('idle', 'loading', 'succeeded', 'failed')
 */
export const useAppInitialization = (authStatus: ApiStatusType) => {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    initializeDeviceToken()
    console.log('Device token initialization triggered.')

    if (authStatus === 'idle') {
      console.log('Auth status is idle, dispatching initializeAuthThunk...')
      dispatch(initializeAuthThunk())
    }
  }, [dispatch, authStatus])
}
