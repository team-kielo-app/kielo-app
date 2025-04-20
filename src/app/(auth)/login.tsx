import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
  TouchableOpacity,
  ScrollView,
  Platform
} from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import { FontAwesome } from '@expo/vector-icons'
import { maybeCompleteAuthSession } from 'expo-web-browser'
import { useAuthRequest } from 'expo-auth-session/providers/google'
import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native'

import {
  loginUserThunk,
  loginWithSocialThunk,
  clearAuthError
} from '@features/auth/authActions'
import {
  selectAuthStatus,
  selectAuthError,
  selectIsAuthenticated
} from '@features/auth/authSelectors'
import { AppDispatch } from '@store/store'
import { Colors } from '@constants/Colors'

maybeCompleteAuthSession()

const LoginView = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const params = useLocalSearchParams<{ redirect?: string }>()

  const status = useSelector(selectAuthStatus)
  const error = useSelector(selectAuthError)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const isLoading = status === 'loading'

  const [googleRequest, googleResponse, promptAsyncGoogle] = useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  })

  useEffect(() => {
    if (status === 'succeeded' && isAuthenticated) {
      const defaultRedirect = '/(main)/(tabs)/'
      let redirectPath = params.redirect || defaultRedirect
      if (!redirectPath.startsWith('/(main)/')) {
        console.warn(
          `Login: Redirect path "${redirectPath}" is not within /(main)/. Using default: ${defaultRedirect}`
        )
        redirectPath = defaultRedirect
      }
      console.log('Login successful, redirecting to:', redirectPath)
      router.replace(redirectPath)
    }
  }, [status, isAuthenticated, router, params.redirect])

  useEffect(() => {
    if (
      googleResponse?.type === 'success' &&
      googleResponse.authentication?.accessToken
    ) {
      dispatch(
        loginWithSocialThunk({
          provider: 'google',
          access_token: googleResponse.authentication.accessToken
        })
      )
    } else if (googleResponse?.type === 'error') {
      console.error('Google Auth Error:', googleResponse.error)
      Alert.alert(
        'Login Error',
        'Google authentication failed. Please try again.'
      )
    }
  }, [googleResponse, dispatch])

  useEffect(() => {
    if (!error) return
    const timeoutId = setTimeout(() => {
      if (email !== '' || password !== '') {
        dispatch(clearAuthError())
      }
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [email, password, dispatch, error])

  const handleLoginSubmit = useCallback(() => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password.')
      return
    }
    dispatch(loginUserThunk({ email, password }))
  }, [email, password, dispatch])

  const handleGoogleLoginPress = useCallback(() => {
    if (googleRequest) promptAsyncGoogle()
  }, [googleRequest, promptAsyncGoogle])
  const handleAppleLoginPress = useCallback(() => {
    Alert.alert('Not Implemented', 'Apple login needs implementation.')
  }, [])
  const handleTwitterLoginPress = useCallback(() => {
    Alert.alert('Not Implemented', 'X/Twitter login needs implementation.')
  }, [])
  const handleEmailChange = useCallback((text: string) => setEmail(text), [])
  const handlePasswordChange = useCallback(
    (text: string) => setPassword(text),
    []
  )
  const togglePasswordVisibility = useCallback(
    () => setIsPasswordVisible(prev => !prev),
    []
  )

  const handleGoBack = () => {
    router.replace('/(main)/(tabs)/')
  }

  const renderSocialButton = useCallback(
    (
      provider: 'google' | 'apple' | 'twitter',
      onPress: () => void,
      disabled: boolean = false
    ) => {
      const iconName = provider === 'twitter' ? 'twitter' : provider
      const brandColors = {
        google: '#DB4437',
        apple: '#000000',
        twitter: '#1DA1F2'
      }
      const pressedColors = {
        google: '#c33d2e',
        apple: '#333333',
        twitter: '#1a91da'
      }

      return (
        <Pressable
          style={({ pressed }) => [
            styles.socialButton,
            disabled && styles.buttonDisabled,
            pressed &&
              !disabled && {
                backgroundColor: pressedColors[provider] || Colors.light.border
              },
            !pressed && {
              backgroundColor:
                brandColors[provider] || Colors.light.cardBackground
            }
          ]}
          onPress={onPress}
          disabled={disabled}
        >
          <FontAwesome name={iconName as any} size={20} color="white" />
        </Pressable>
      )
    },
    []
  )

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
          <Text style={styles.title}>Let's Sign you in.</Text>
          <Text style={styles.subtitle}>Welcome back</Text>
          <Text style={styles.subtitle}>You've been missed!</Text>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username or Email</Text>
            <TextInput
              style={[styles.input, isLoading && styles.inputDisabled]}
              placeholder="Enter Username or Email"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.light.textTertiary}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInputOnly,
                  isLoading && styles.inputDisabled
                ]}
                placeholder="Enter Password"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!isPasswordVisible}
                placeholderTextColor={Colors.light.textTertiary}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={styles.passwordVisibilityButton}
              >
                {isPasswordVisible ? (
                  <EyeOff size={20} color={Colors.light.textSecondary} />
                ) : (
                  <Eye size={20} color={Colors.light.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            <Link href="/(auth)/forgot-password" asChild>
              <Pressable style={styles.forgotPasswordButton}>
                <Text style={styles.linkText}>Forgot Password?</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <View style={styles.orSeparatorContainer}>
          <View style={styles.orSeparatorLine} />
          <Text style={styles.orSeparatorText}>or</Text>
          <View style={styles.orSeparatorLine} />
        </View>

        <View style={styles.socialLoginContainer}>
          {renderSocialButton(
            'google',
            handleGoogleLoginPress,
            !googleRequest || isLoading
          )}
          {renderSocialButton('apple', handleAppleLoginPress, isLoading)}
          {renderSocialButton('twitter', handleTwitterLoginPress, isLoading)}
        </View>

        <View style={styles.footerContainer}>
          <View style={styles.registerLinkContainer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <Pressable>
                <Text style={styles.linkTextBold}>Register</Text>
              </Pressable>
            </Link>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              isLoading && styles.buttonDisabled,
              pressed && !isLoading && styles.actionButtonPressed
            ]}
            onPress={handleLoginSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>Login</Text>
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}

export default LoginView

// --- Styles (Consolidated & Refined) ---
const styles = StyleSheet.create({
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
  passwordInputWrapper: {
    // Wrapper specific for password field + icon
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.white // Background for the wrapper
  },
  passwordInputOnly: {
    // Input style when inside the wrapper
    flex: 1,
    borderWidth: 0, // Remove individual border
    height: 50, // Match wrapper height minus border
    backgroundColor: 'transparent' // Use wrapper background
  },
  passwordVisibilityButton: {
    padding: 14 // Consistent hit area
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 4 // Add vertical padding for touch area
  },
  // --- Links ---
  linkText: {
    // Style for general links like Forgot Password
    color: Colors.light.primary,
    fontSize: 14,
    fontFamily: 'Inter-Medium'
  },
  linkTextBold: {
    // Style for more prominent links like Register/Login in footer
    color: Colors.light.primary,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold' // Bolder
  },
  // --- Separator ---
  orSeparatorContainer: {
    flexDirection: 'row',
    alignItems: 'center'
    // Rely on innerContainer gap
  },
  orSeparatorLine: { flex: 1, height: 1, backgroundColor: Colors.light.border },
  orSeparatorText: {
    marginHorizontal: 12,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.light.textSecondary
  },
  // --- Social ---
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20
    // Rely on innerContainer gap
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 12, // Slightly less round
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border // Add border
    // Background colors set dynamically inline
  },
  buttonDisabled: { opacity: 0.6 }, // Generic disabled state for all buttons
  // --- Footer ---
  footerContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20 // Space between register link and button
    // Rely on innerContainer gap for space above
  },
  registerLinkContainer: { flexDirection: 'row', alignItems: 'center' },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary
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
