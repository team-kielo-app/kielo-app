import React from 'react'
import { Stack } from 'expo-router'
import { StyleSheet } from 'react-native'
import { Colors } from '@constants/Colors'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function AuthLayout() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background
  }
})
