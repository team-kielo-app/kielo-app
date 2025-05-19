import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@store/store'
import { initializeAuthThunk } from '@features/auth/authActions'
import type { ApiStatusType } from '@lib/api.d'
import { initializeDeviceToken, getDeviceToken } from '@lib/api'

export const useAppInitialization = (
  authStatus: ApiStatusType | 'sessionInvalid'
): void => {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    let isMounted = true

    const initApp = async () => {
      try {
        const token = await initializeDeviceToken()
        if (!isMounted) return
        console.log(
          'Device token initialization completed from useAppInitialization. Token:',
          token
        )

        if (authStatus === 'idle') {
          dispatch(initializeAuthThunk())
        }
      } catch (err) {
        console.error('Error during app initialization sequence:', err)
      }
    }

    if (!getDeviceToken() || authStatus === 'idle') {
      initApp()
    }

    return () => {
      isMounted = false
    }
  }, [dispatch, authStatus])
}

export default useAppInitialization
