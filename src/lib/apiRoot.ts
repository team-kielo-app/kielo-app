import Constants from 'expo-constants'
import { Platform } from 'react-native'

const BACKEND_PORT = 8080

/**
 * Gets the base URL for your API depending on the platform and environment.
 * - Web: Uses localhost.
 * - Native (Expo Go/Dev Build): Tries to use the developer machine's local IP.
 * - Native (Production Build): Falls back to localhost (requires separate config/env var setup for prod).
 */
const getDevApiUrl = (): string => {
  const localhost = `http://localhost:${BACKEND_PORT}/api/v1`

  if (Platform.OS === 'web') {
    return localhost
  }

  try {
    const debuggerHost = Constants.manifest2?.extra?.expoGo?.debuggerHost

    if (debuggerHost) {
      const ipAddress = debuggerHost.split(':')[0]
      return `http://${ipAddress}:${BACKEND_PORT}/api/v1`
    }
  } catch (error) {
    console.error('Error getting debugger host:', error)
  }

  console.warn(
    'Could not automatically determine local IP for native development. Falling back to localhost.' +
      ' This might not work on device/simulator unless reverse tunneling is set up.' +
      ' Ensure your backend port is correct and your device is on the same network.'
  )
  return localhost
}

const API_URL = __DEV__ ? getDevApiUrl() : process.env.EXPO_PUBLIC_API_BASE_URL

console.log(`Using API URL: ${API_URL} (__DEV__ = ${__DEV__})`)

export { API_URL }
