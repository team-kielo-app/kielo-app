import React from 'react'
import { Slot } from 'expo-router'
import { Provider, useSelector } from 'react-redux'
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native'
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter'

import { store } from '@store/store'
import {
  selectIsAuthenticated,
  selectAuthStatus
} from '@features/auth/authSelectors'
import { Colors } from '@constants/Colors'

import { useDeviceOrientation } from './hooks/useDeviceOrientation'
import { useAppInitialization } from './hooks/useAppInitialization'
import { useAuthRedirect } from './hooks/useAuthRedirect'

const CustomSplashScreen = React.memo(() => (
  <View style={styles.splashContainer}>
    <ActivityIndicator size="large" color={Colors.light.primary} />
    <Text style={styles.splashText}>Loading Kielo...</Text>
  </View>
))

function RootLayoutNav() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const authStatus = useSelector(selectAuthStatus)
  const isAuthCheckComplete =
    authStatus === 'succeeded' || authStatus === 'failed'
  const isLoading = authStatus === 'idle' || authStatus === 'loading'

  useDeviceOrientation()
  useAppInitialization(authStatus)
  useAuthRedirect(isAuthenticated, isAuthCheckComplete)

  const showSplash = isLoading

  return (
    <View style={styles.container}>
      <Slot />
      {showSplash && (
        <View style={[StyleSheet.absoluteFill, styles.splashOverlay]}>
          <CustomSplashScreen />
        </View>
      )}
    </View>
  )
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold
  })

  if (!fontsLoaded && !fontError) {
    return <CustomSplashScreen />
  }

  if (fontError) {
    console.error('Font Loading Error:', fontError)
    return (
      <View style={styles.errorContainer}>
        <Text>Error loading fonts. Please restart the app.</Text>
      </View>
    )
  }

  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  splashOverlay: {
    zIndex: 10,
    backgroundColor: Colors.light.background
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background
  },
  splashText: {
    marginTop: 15,
    fontSize: 16,
    color: Colors.light.text,
    fontFamily: 'Inter-Regular'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  }
})
