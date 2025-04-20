import React from 'react'
import { Stack, Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View, StyleSheet } from 'react-native'

import { SideNavBar } from '@/components/navigation/SideNavBar'
import { Colors } from '@/constants/Colors'
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions'

export default function MainAppLayout() {
  const { isDesktop } = useResponsiveDimensions()

  if (isDesktop) {
    return (
      <>
        <View style={styles.desktopContainer}>
          <SideNavBar />
          <View style={styles.desktopContentContainer}>
            <Slot />
          </View>
        </View>
        <StatusBar style="auto" />
      </>
    )
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="article/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="settings/index" options={{ headerShown: false }} />
        <Stack.Screen
          name="settings/profile-info"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="settings/change-password"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="progress-details"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="saved-articles" options={{ headerShown: false }} />
        <Stack.Screen name="vocabulary" options={{ headerShown: false }} />
        <Stack.Screen name="achievements" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  )
}

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.light.background
  },
  desktopContentContainer: { flex: 1, height: '100%', overflow: 'hidden' }
})
