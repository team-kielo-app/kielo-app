import React, { useEffect, useCallback } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import { Provider, useSelector, useDispatch } from 'react-redux'
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Text,
  Platform
} from 'react-native'
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter'

// Import store, actions, selectors
import { store } from '@store/store'
import { initializeAuthThunk } from '@features/auth/authActions'
import {
  selectIsAuthenticated,
  selectAuthStatus
} from '@features/auth/authSelectors'
import { initializeDeviceToken } from '@lib/api'
import { Colors } from '@constants/Colors'

import { getDeviceTypeAsync, DeviceType } from 'expo-device'
import { lockAsync, OrientationLock } from 'expo-screen-orientation'

// --- SplashScreen and useDeviceOrientation (Keep as is) ---
const SplashScreen = React.memo(() => (
  <View style={styles.splashContainer}>
    <ActivityIndicator size="large" color={Colors.light.tint} />
    <Text style={styles.splashText}>Loading Kielo...</Text>
  </View>
))
const useDeviceOrientation = () => {
  // Renamed to avoid conflict
  useEffect(() => {
    const lockOrientationForTablet = async () => {
      if (Platform.OS !== 'ios' && Platform.OS !== 'android') return
      try {
        const deviceType = await getDeviceTypeAsync()
        if (deviceType === DeviceType.TABLET) {
          await lockAsync(OrientationLock.LANDSCAPE)
        } else {
          await lockAsync(OrientationLock.PORTRAIT_UP)
        }
      } catch (error) {
        console.error('Failed to set screen orientation:', error)
      }
    }
    lockOrientationForTablet()
  }, [])
}
// ----------------------------------------------------------

// Updated RootLayoutView with corrected redirection logic
const RootLayoutView = () => {
  const router = useRouter()
  const segments = useSegments()
  const dispatch = useDispatch()

  const isAuthenticated = useSelector(selectIsAuthenticated)
  const authStatus = useSelector(selectAuthStatus)

  useDeviceOrientation()

  // Initialize Auth
  useEffect(() => {
    initializeDeviceToken()
    if (authStatus === 'idle') {
      dispatch(initializeAuthThunk())
    }
  }, [dispatch, authStatus])

  // Handle navigation logic AFTER auth status is determined
  const handleNavigation = useCallback(() => {
    // Wait until auth check is definitively finished
    if (authStatus !== 'succeeded' && authStatus !== 'failed') {
      return
    }

    const isAtRoot = segments.length === 0
    const isInAuthGroup = segments.length > 0 && segments[0] === '(auth)'
    const defaultMainPath = '/(main)/(tabs)/' // Define default target

    // *** Scenario 1: User IS Authenticated ***
    if (isAuthenticated) {
      // If authenticated and on root or auth screen, redirect to main
      if (isAtRoot || isInAuthGroup) {
        console.log(
          'RootLayout: Authenticated user on root/auth route -> Redirecting to main'
        )
        router.replace(defaultMainPath)
      }
      // If authenticated and already in main, do nothing.
    }
    // *** Scenario 2: User IS NOT Authenticated ***
    else {
      // If NOT authenticated and specifically on the ROOT ('/'),
      // redirect them to the default main screen to prevent getting stuck on AppEntry.
      if (isAtRoot) {
        console.log(
          "RootLayout: Unauthenticated user on root ('/') -> Redirecting to main entry"
        )
        router.replace(defaultMainPath)
      }
      // If NOT authenticated and anywhere else (e.g., /auth/login, /main/...),
      // do nothing here. Let navigation proceed naturally or be handled by hooks.
    }
  }, [isAuthenticated, authStatus, router, segments]) // segments is the key dependency here

  // Run navigation logic whenever auth state or route potentially changes AFTER initial load settles.
  useEffect(() => {
    handleNavigation()
  }, [handleNavigation, authStatus]) // authStatus ensures it runs after load

  const showSplash = authStatus === 'idle' || authStatus === 'loading'

  return (
    <View style={{ flex: 1 }}>{showSplash ? <SplashScreen /> : <Slot />}</View>
  )
}

export default function RootLayout() {
  // Load fonts needed for the main application
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold
  })

  // Rely on root layout's splash screen while fonts load
  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <Provider store={store}>
      <RootLayoutView />
    </Provider>
  )
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF' // Or your splash background color
  },
  splashText: {
    marginTop: 15,
    fontSize: 16,
    color: Colors.light.text,
    fontFamily: 'Inter-Regular' // Assuming font exists
  }
})
