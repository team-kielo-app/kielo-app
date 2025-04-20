import React from 'react'
import { Stack } from 'expo-router'
import { StyleSheet } from 'react-native' // No need for View here
import { Colors } from '@constants/Colors'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function AuthLayout() {
  // SafeAreaView should take up the full screen and provide background color.
  // Stack should be the direct child filling the safe area.
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Stack navigator fills the SafeAreaView */}
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // Make SafeAreaView expand
    backgroundColor: Colors.light.background // Apply background color here
    // Centering should happen *inside* the screen components (e.g., login.tsx)
    // Remove justifyContent and alignItems from the layout wrapper
  }
  // No need for the intermediate container style here anymore
  // container: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
})
