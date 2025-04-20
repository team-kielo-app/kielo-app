import React, { useState } from 'react'
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
import { Link, useRouter } from 'expo-router'
import { Colors } from '@constants/Colors'
import { ChevronLeft } from 'lucide-react-native'

const mockRequestReset = (email: string) =>
  new Promise(resolve => setTimeout(resolve, 1000))

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleResetRequest = async () => {
    setError(null)
    setSuccess(null)
    if (!email) {
      setError('Please enter your email address.')
      return
    }

    setIsLoading(true)
    try {
      await mockRequestReset(email)
      setSuccess('If an account exists, a password reset link has been sent.')
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
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
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email. We'll send a link to reset your password.
          </Text>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
        {success && <Text style={styles.successText}>{success}</Text>}

        {/* Form Area */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[
                styles.input,
                (isLoading || !!success) && styles.inputDisabled
              ]}
              placeholder="Enter your Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading && !success}
              placeholderTextColor={Colors.light.textTertiary}
            />
          </View>
        </View>

        {/* Footer Area */}
        <View style={styles.footerContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              (isLoading || !!success) && styles.buttonDisabled,
              pressed && !isLoading && !success && styles.actionButtonPressed
            ]}
            onPress={handleResetRequest}
            disabled={isLoading || !!success}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>Send Reset Link</Text>
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}

// Use similar styles, add subtitle, successText
const styles = StyleSheet.create({
  successText: {
    color: Colors.light.success,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center', // Center content vertically if needed
    backgroundColor: Colors.light.background // Apply background color here
  },
  innerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20, // Consistent vertical padding
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: 25 // Vertical gap between major sections
  },
  // --- Header ---
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Align back button vertically if other elements were here
    minHeight: 40 // Ensure space for back button even if titles are below
    // No marginBottom needed, rely on innerContainer gap
  },
  backButton: {
    padding: 8, // Increase touch target slightly
    marginLeft: -8 // Offset padding visually
  },
  titleContainer: {
    // Group titles, rely on innerContainer gap for spacing above/below
  },
  title: {
    fontSize: 28, // Slightly larger title
    fontFamily: 'Inter-Bold',
    color: Colors.light.text,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary,
    marginBottom: 4,
    lineHeight: 24 // Improve readability
  },
  // --- Error ---
  errorText: {
    color: Colors.light.error,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14
    // Rely on innerContainer gap, remove extra margins
  },
  // --- Form ---
  formContainer: {
    gap: 20 // Space between input groups
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
    // Base input style
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
    borderColor: Colors.light.border // Ensure border stays visible
  },
  buttonDisabled: { opacity: 0.6 }, // Generic disabled state for all buttons
  // --- Footer ---
  footerContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20 // Space between register link and button
    // Rely on innerContainer gap for space above
  },
  // --- Action Button (Login/Register/Reset etc.) ---
  actionButton: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.light.text, // Black background for primary action
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionButtonPressed: {
    backgroundColor: '#333' // Darker background on press
  },
  actionButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold'
  }
})
