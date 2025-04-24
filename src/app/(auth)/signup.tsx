import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import { Colors } from '@constants/Colors'
import { ChevronLeft } from 'lucide-react-native'

// Mock API call (replace with actual implementation)
const mockRegister = (data: {
  name: string
  email: string
  pass: string
}): Promise<void> => {
  console.log('Registering user:', data.email)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate success or failure (e.g., email already exists)
      if (data.email.includes('exists')) {
        reject(new Error('EMAIL_EXISTS')) // Simulate specific error code
      } else if (data.pass.length < 6) {
        reject(new Error('WEAK_PASSWORD'))
      } else {
        resolve()
      }
    }, 1500)
  })
}

export default function SignupScreen() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-clear errors after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 5000) // Clear after 5 seconds
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleRegister = async () => {
    setError(null) // Clear previous errors

    // Validation
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setIsLoading(true)
    try {
      await mockRegister({
        name: name.trim(),
        email: email.trim(),
        pass: password
      })
      // Show success alert and redirect to login
      Alert.alert(
        'Registration Successful',
        'Your account has been created. Please log in.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }] // Redirect on OK
      )
      // No need to clear fields as we navigate away
    } catch (err: any) {
      console.error('Registration failed:', err)
      // Handle specific known errors or show generic message
      if (err.message === 'EMAIL_EXISTS') {
        setError('An account with this email already exists.')
      } else if (err.message === 'WEAK_PASSWORD') {
        setError('Password is too weak. Please use at least 6 characters.')
      } else {
        setError('Could not create account. Please try again later.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    // Navigate back if possible, otherwise go to login
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us and start your journey!</Text>
        </View>

        {/* Message Area */}
        <View style={styles.messageContainer}>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {/* Form Area */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, isLoading && styles.inputDisabled]}
              placeholder="Enter Full Name"
              value={name}
              onChangeText={setName}
              editable={!isLoading}
              placeholderTextColor={Colors.light.textTertiary}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, isLoading && styles.inputDisabled]}
              placeholder="Enter Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              placeholderTextColor={Colors.light.textTertiary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, isLoading && styles.inputDisabled]}
              placeholder="Enter Password (min. 6 chars)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
              placeholderTextColor={Colors.light.textTertiary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[styles.input, isLoading && styles.inputDisabled]}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!isLoading}
              placeholderTextColor={Colors.light.textTertiary}
            />
          </View>
        </View>

        {/* Footer Area */}
        <View style={styles.footerContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              isLoading && styles.buttonDisabled,
              pressed && !isLoading && styles.actionButtonPressed
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.light.white} />
            ) : (
              <Text style={styles.actionButtonText}>Register</Text>
            )}
          </Pressable>
          <View style={styles.loginLinkContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable disabled={isLoading}>
                <Text
                  style={[
                    styles.linkTextBold,
                    isLoading && styles.linkDisabled
                  ]}
                >
                  Log In
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

// Styles similar to other auth screens
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
    gap: 15 // Slightly smaller gap between inputs
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
  // --- Links ---
  linkTextBold: {
    color: Colors.light.primary,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold'
  },
  linkDisabled: {
    opacity: 0.6
  },
  // --- Footer ---
  footerContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20, // Space between button and login link
    marginTop: 10 // Add margin top
  },
  loginLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary
  },
  // --- Action Button ---
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
