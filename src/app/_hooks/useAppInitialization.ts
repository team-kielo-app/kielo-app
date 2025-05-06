import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@store/store'
import { initializeAuthThunk } from '@features/auth/authActions'
import type { ApiStatusType } from '@lib/api.d'
import { initializeDeviceToken } from '@lib/api'

/**
 * @param authStatus Current authentication status
 * @returns {boolean | null} `true` if login should be forced, `false` otherwise, `null` while checking.
 */
export const useAppInitialization = (authStatus: ApiStatusType): void => {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    initializeDeviceToken()
    console.log('Device token initialization triggered.')

    if (authStatus === 'idle') {
      console.log('Auth status is idle, dispatching initializeAuthThunk...')
      dispatch(initializeAuthThunk())
    }
  }, [dispatch])
}

export default useAppInitialization
