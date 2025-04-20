import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert
} from 'react-native'
import { useProtectedRoute } from '@hooks/useProtectedRoute'
import { Colors } from '@constants/Colors'
import { ScreenHeader } from '@components/common/ScreenHeader'

// Mock update action
const mockChangePassword = (data: any) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (data.currentPassword === 'password123') {
        // Simulate checking current password
        resolve(true)
      } else {
        reject(new Error('Incorrect current password.'))
      }
    }, 1000)
  })

export default function ChangePasswordScreen() {
  const { isLoading: isAuthLoading, isAuthenticated } = useProtectedRoute()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpdatePassword = async () => {
    setError(null)
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError('Please fill in all fields.')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.')
      return
    }
    if (newPassword === currentPassword) {
      setError('New password cannot be the same as the current password.')
      return
    }
    // TODO: Add password strength validation

    setIsLoading(true)
    try {
      await mockChangePassword({ currentPassword, newPassword })
      Alert.alert('Success', 'Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err: any) {
      setError(err.message || 'Failed to update password.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthLoading) {
    /* ... loading state ... */
  }
  if (!isAuthenticated) return null

  return (
    <View style={styles.container}>
      <ScreenHeader title="Change Password" fallbackPath="/(main)/settings/" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Current Password</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            editable={!isLoading}
            placeholderTextColor="#888"
          />
        </View>
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            editable={!isLoading}
            placeholderTextColor="#888"
          />
        </View>
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            secureTextEntry
            editable={!isLoading}
            placeholderTextColor="#888"
          />
        </View>
        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleUpdatePassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Update Password</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  )
}

// Styles adapted from settings screen
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  scrollContent: { padding: 20 },
  fieldContainer: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.light.textSecondary,
    marginBottom: 8
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: Colors.light.border,
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    color: Colors.light.text,
    fontFamily: 'Inter-Regular'
  },
  button: {
    width: '100%',
    height: 50,
    paddingVertical: 15,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  buttonDisabled: { backgroundColor: Colors.light.border, opacity: 0.7 },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter-SemiBold'
  },
  errorText: {
    color: Colors.light.error,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'Inter-SemiBold'
  }
})
