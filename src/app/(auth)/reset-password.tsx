import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors } from '@constants/Colors'
import { ChevronLeft } from 'lucide-react-native'

// Mock API call (replace with actual implementation)
const mockExecuteReset = (token: string, pass: string): Promise<void> => {
  console.log(`Executing password reset with token: ${token} and new password.`)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate success or failure (e.g., based on token)
      if (token === 'invalid_token' || pass.length < 6) {
        reject(new Error('Invalid token or weak password'))
      } else {
        resolve()
      }
    }, 1500)
  })
}

export default function ResetPasswordScreen() {
  const router = useRouter()
  const { token } = useLocalSearchParams<{ token?: string }>()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError('Invalid or missing password reset link.')
      // Optionally redirect immediately if token is absolutely required
      // setTimeout(() => router.replace('/(auth)/login'), 3000);
    }
  }, [token, router])

  // Auto-clear errors after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 5000) // Clear after 5 seconds
      return () => clearTimeout(timer)
    }
  }, [error])

  const handlePasswordSubmit = async () => {
    setError(null) // Clear previous errors

    if (!token) {
      setError('Cannot reset password without a valid link.')
      return
    }
    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      // Example: Basic password strength check
      setError('Password must be at least 6 characters long.')
      return
    }

    setIsLoading(true)
    try {
      await mockExecuteReset(token, password)
      // Show success alert and then redirect to login
      Alert.alert(
        'Password Reset Successful',
        'Your password has been updated. You can now log in.',
        [
          { text: 'OK', onPress: () => router.replace('/(auth)/login') } // Redirect on OK
        ]
      )
      // No need to clear fields here as we are navigating away
    } catch (err: any) {
      console.error('Password reset execution failed:', err)
      // Generic user-facing error
      setError(
        'Could not reset password. The link may be invalid/expired or the password too weak.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    // Always go back to login from reset password screen
    router.replace('/(auth)/login')
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.innerContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ChevronLeft size={28} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Set New Password</Text>
          <Text style={styles.subtitle}>
            Enter and confirm your new password below.
          </Text>
        </View>

        {/* Message Area */}
        <View style={styles.messageContainer}>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {/* Form Area */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={[
                styles.input,
                (isLoading || !token) && styles.inputDisabled // Disable if loading or no token
              ]}
              placeholder="Enter New Password (min. 6 chars)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading && !!token} // Editable only if not loading and token exists
              placeholderTextColor={Colors.light.textTertiary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={[
                styles.input,
                (isLoading || !token) && styles.inputDisabled // Disable if loading or no token
              ]}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!isLoading && !!token} // Editable only if not loading and token exists
              placeholderTextColor={Colors.light.textTertiary}
            />
          </View>
        </View>

        {/* Footer Area */}
        <View style={styles.footerContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              (isLoading || !token) && styles.buttonDisabled, // Disable if loading or no token
              pressed && !isLoading && !!token && styles.actionButtonPressed
            ]}
            onPress={handlePasswordSubmit}
            disabled={isLoading || !token} // Disable if loading or no token
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.light.white} />
            ) : (
              <Text style={styles.actionButtonText}>Reset Password</Text>
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}

// Styles remain largely the same as forgot-password, reusing common elements
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: Colors.light.background
  },
  innerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: 20 // Consistent gap
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40
  },
  backButton: {
    padding: 8,
    marginLeft: -8
  },
  titleContainer: {
    marginBottom: 5 // Smaller gap before message area
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.light.text,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary,
    lineHeight: 24
  },
  // --- Message Area ---
  messageContainer: {
    minHeight: 20, // Reserve space
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    color: Colors.light.error,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    paddingHorizontal: 10
  },
  // --- Form ---
  formContainer: {
    gap: 20
  },
  inputGroup: {
    width: '100%'
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.light.textSecondary,
    marginBottom: 8
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: Colors.light.white,
    color: Colors.light.text,
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: Colors.light.border
  },
  inputDisabled: {
    backgroundColor: Colors.light.backgroundLight,
    color: Colors.light.textTertiary,
    borderColor: Colors.light.border
  },
  // --- Footer ---
  footerContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10 // Add margin top
  },
  actionButton: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.light.text,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionButtonPressed: {
    backgroundColor: '#333'
  },
  actionButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold'
  },
  buttonDisabled: {
    opacity: 0.6
  }
})
