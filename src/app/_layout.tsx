import React, { useEffect } from 'react'
import { Slot, SplashScreen } from 'expo-router'
import { Provider, useSelector } from 'react-redux'
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native'
import Toast from 'react-native-toast-message'
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

import { DashboardSkeletonDesktop } from '@components/skeletons/DashboardSkeletonDesktop'
import { DashboardSkeletonMobile } from '@components/skeletons/DashboardSkeletonMobile'

import { useResponsiveDimensions } from '@hooks/useResponsiveDimensions'
import useDeviceOrientation from './_hooks/useDeviceOrientation'
import useAppInitialization from './_hooks/useAppInitialization'
import useAuthRedirect from './_hooks/useAuthRedirect'

SplashScreen.preventAutoHideAsync()

const CustomSplashScreen = React.memo(() => {
  const { isDesktop } = useResponsiveDimensions()
  return isDesktop ? <DashboardSkeletonDesktop /> : <DashboardSkeletonMobile />
})

function RootLayoutNav() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const authStatus = useSelector(selectAuthStatus)
  const isLoadingAuth = authStatus === 'idle' || authStatus === 'loading'

  useDeviceOrientation()
  useAppInitialization(authStatus)
  useAuthRedirect(isAuthenticated, isLoadingAuth)

  useEffect(() => {
    if (!isLoadingAuth) {
      SplashScreen.hideAsync()
    }
  }, [isLoadingAuth])

  if (isLoadingAuth) {
    return <CustomSplashScreen />
  }

  return (
    <View style={styles.container}>
      <Slot />
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
    return null
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
      <Toast />
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
