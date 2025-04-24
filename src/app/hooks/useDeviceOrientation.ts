import { useEffect } from 'react'
import { Platform } from 'react-native'
import { getDeviceTypeAsync, DeviceType } from 'expo-device'
import { lockAsync, OrientationLock } from 'expo-screen-orientation'

/**
 * Locks the screen orientation based on the device type (Tablet: Landscape, Phone: Portrait).
 * Runs only once on component mount.
 */
export const useDeviceOrientation = () => {
  useEffect(() => {
    const lockOrientation = async () => {
      if (Platform.OS !== 'ios' && Platform.OS !== 'android') return

      try {
        const deviceType = await getDeviceTypeAsync()
        if (deviceType === DeviceType.TABLET) {
          await lockAsync(OrientationLock.LANDSCAPE)
          console.log('Orientation locked to LANDSCAPE for Tablet')
        } else {
          await lockAsync(OrientationLock.PORTRAIT_UP)
          console.log('Orientation locked to PORTRAIT_UP for Phone')
        }
      } catch (error) {
        console.error('Failed to set screen orientation:', error)
      }
    }

    lockOrientation()
  }, [])
}
