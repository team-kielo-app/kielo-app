import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import { useRouter } from 'expo-router'
import { Colors } from '@constants/Colors'
import { ChevronLeft } from 'lucide-react-native'

// Mock API call (replace with actual implementation)
const mockRequestReset = (email: string): Promise<void> => {
  console.log(`Requesting password reset for: ${email}`)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate success or failure
      if (email.includes('fail')) {
        reject(new Error('Simulated network error'))
      } else {
        resolve()
      }
    }, 1500)
  })
}

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Auto-clear messages after a delay
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000) // Clear after 5 seconds
      return () => clearTimeout(timer)
    }
  }, [error, success])

  const handleResetRequest = async () => {
    setError(null) // Clear previous messages
    setSuccess(null)

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    // Basic email format check (optional but recommended)
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setIsLoading(true)
    try {
      await mockRequestReset(email)
      setSuccess('If an account exists, a password reset link has been sent.')
      setEmail('') // Clear email field on success
    } catch (err: any) {
      console.error('Password reset request failed:', err)
      // Generic user-facing error
      setError(
        'Could not send reset link. Please check the email or try again later.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    // Navigate back to login if user came from there, or default otherwise
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/(auth)/login')
    }
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

        {/* Message Area - minimal layout shift */}
        <View style={styles.messageContainer}>
          {error && <Text style={styles.errorText}>{error}</Text>}
          {success && <Text style={styles.successText}>{success}</Text>}
        </View>

        {/* Form Area */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[
                styles.input,
                // Disable input slightly differently visually when success message is shown
                (isLoading || !!success) && styles.inputDisabled
              ]}
              placeholder="Enter your Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading && !success} // Disable field when loading or successful
              placeholderTextColor={Colors.light.textTertiary}
            />
          </View>
        </View>

        {/* Footer Area */}
        <View style={styles.footerContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              // Disable button when loading or successful
              (isLoading || !!success) && styles.buttonDisabled,
              pressed && !isLoading && !success && styles.actionButtonPressed
            ]}
            onPress={handleResetRequest}
            disabled={isLoading || !!success} // Disable button when loading or successful
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.light.white} />
            ) : (
              <Text style={styles.actionButtonText}>Send Reset Link</Text>
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}

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
    minHeight: 20, // Reserve space to reduce layout shift
    justifyContent: 'center',
    alignItems: 'center'
    // No extra margin needed, rely on innerContainer gap
  },
  errorText: {
    color: Colors.light.error,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    paddingHorizontal: 10 // Add some padding if text wraps
  },
  successText: {
    color: Colors.light.success,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    paddingHorizontal: 10 // Add some padding if text wraps
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
    borderColor: Colors.light.border // Keep border visible
  },
  // --- Footer ---
  footerContainer: {
    width: '100%',
    alignItems: 'center'
    // gap handled by innerContainer
  },
  actionButton: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.light.text,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10 // Add some margin top
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
