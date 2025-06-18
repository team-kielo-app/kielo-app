import React from 'react'
import { Stack } from 'expo-router'
import { StyleSheet } from 'react-native'
import { Colors } from '@constants/Colors'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function AuthLayout(): React.ReactElement {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
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
