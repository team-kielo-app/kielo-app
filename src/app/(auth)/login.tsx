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
  const rawError = useSelector(selectAuthError)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const isLoading = status === 'loading'
  const displayError = rawError || localError

  const [googleRequest, googleResponse, promptAsyncGoogle] = useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  })

  useEffect(() => {
    if (status === 'succeeded' && isAuthenticated) {
      const defaultRedirect = '/(main)/(tabs)/'
      const redirectPath =
        params.redirect && params.redirect.startsWith('/(main)/')
          ? params.redirect
          : defaultRedirect

      console.log('Login successful, redirecting to:', redirectPath)
      router.replace(redirectPath)
    }
  }, [status, isAuthenticated, router, params.redirect])

  useEffect(() => {
    if (
      googleResponse?.type === 'success' &&
      googleResponse.authentication?.accessToken
    ) {
      dispatch(clearAuthError())
      setLocalError(null)
      dispatch(
        loginWithSocialThunk({
          provider: 'google',
          access_token: googleResponse.authentication.accessToken
        })
      )
    } else if (googleResponse?.type === 'error') {
      console.error('Google Auth Error:', googleResponse.error)
      setLocalError('Google sign-in failed. Please try again.')
    }
  }, [googleResponse, dispatch])

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null
    if (rawError || localError) {
      timerId = setTimeout(() => {
        if (rawError) dispatch(clearAuthError())
        if (localError) setLocalError(null)
      }, 5000)
    }
    return () => {
      if (timerId) clearTimeout(timerId)
    }
  }, [rawError, localError, dispatch])

  const handleLoginSubmit = useCallback(() => {
    dispatch(clearAuthError())
    setLocalError(null)

    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.')
      return
    }
    dispatch(loginUserThunk({ email: email.trim(), password }))
  }, [email, password, dispatch])

  const handleGoogleLoginPress = useCallback(() => {
    dispatch(clearAuthError())
    setLocalError(null)
    if (googleRequest) promptAsyncGoogle()
  }, [googleRequest, promptAsyncGoogle, dispatch])

  const handleAppleLoginPress = useCallback(() => {
    setLocalError('Apple login is not yet implemented.')
  }, [])
  const handleTwitterLoginPress = useCallback(() => {
    setLocalError('X/Twitter login is not yet implemented.')
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
    if (router.canGoBack()) {
      router.back()
    } else {
      const defaultRedirect = '/(main)/(tabs)/'
      const redirectPath =
        params.redirect && !params.redirect.startsWith('/(auth)/')
          ? params.redirect
          : defaultRedirect

      router.replace(redirectPath)
    }
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
            (disabled || isLoading) && styles.buttonDisabled,
            pressed &&
              !(disabled || isLoading) && {
                backgroundColor: pressedColors[provider] || Colors.light.border
              },
            !pressed && {
              backgroundColor:
                brandColors[provider] || Colors.light.cardBackground
            }
          ]}
          onPress={onPress}
          disabled={disabled || isLoading}
        >
          <FontAwesome name={iconName as any} size={20} color="white" />
        </Pressable>
      )
    },
    [isLoading]
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

        <View style={styles.messageContainer}>
          {displayError && <Text style={styles.errorText}>{displayError}</Text>}
        </View>

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
            <View
              style={[
                styles.passwordInputWrapper,
                isLoading && styles.inputDisabled
              ]}
            >
              <TextInput
                style={[styles.input, styles.passwordInputOnly]}
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
                disabled={isLoading}
              >
                {isPasswordVisible ? (
                  <EyeOff size={20} color={Colors.light.textSecondary} />
                ) : (
                  <Eye size={20} color={Colors.light.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            <Link href="/(auth)/forgot-password" asChild>
              <Pressable
                style={styles.forgotPasswordButton}
                disabled={isLoading}
              >
                <Text
                  style={[styles.linkText, isLoading && styles.linkDisabled]}
                >
                  Forgot Password?
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <View style={styles.socialLoginsSection}>
          <View style={styles.orSeparatorContainer}>
            <View style={styles.orSeparatorLine} />
            <Text style={styles.orSeparatorText}>or continue with</Text>
            <View style={styles.orSeparatorLine} />
          </View>
          <View style={styles.socialLoginContainer}>
            {renderSocialButton(
              'google',
              handleGoogleLoginPress,
              !googleRequest
            )}
            {renderSocialButton('apple', handleAppleLoginPress)}
            {renderSocialButton('twitter', handleTwitterLoginPress)}
          </View>
        </View>

        <View style={styles.footerContainer}>
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
              <ActivityIndicator color={Colors.light.white} />
            ) : (
              <Text style={styles.actionButtonText}>Login</Text>
            )}
          </Pressable>

          <View style={styles.registerLinkContainer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <Pressable disabled={isLoading}>
                <Text
                  style={[
                    styles.linkTextBold,
                    isLoading && styles.linkDisabled
                  ]}
                >
                  Register
                </Text>
              </Pressable>
            </Link>
          </View>
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
    justifyContent: 'center',
    backgroundColor: Colors.light.background
  },
  innerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: 20 // Consistent gap between sections
  },
  // --- Header ---
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40
  },
  backButton: {
    padding: 8,
    marginLeft: -8
  },
  // --- Title ---
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
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.white
    // Apply disabled style to wrapper
    // This helps disable the background and border consistently
  },
  passwordInputOnly: {
    flex: 1,
    borderWidth: 0,
    height: 50,
    backgroundColor: 'transparent'
  },
  passwordVisibilityButton: {
    padding: 14
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 4
  },
  // --- Links ---
  linkText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontFamily: 'Inter-Medium'
  },
  linkTextBold: {
    color: Colors.light.primary,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold'
  },
  linkDisabled: {
    opacity: 0.6 // Visually indicate disabled link
  },
  // --- Social Logins Section ---
  socialLoginsSection: {
    gap: 20, // Space between separator and buttons
    marginTop: 10 // Add some margin top
  },
  // --- Separator ---
  orSeparatorContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  orSeparatorLine: { flex: 1, height: 1, backgroundColor: Colors.light.border },
  orSeparatorText: {
    marginHorizontal: 12,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.light.textSecondary
  },
  // --- Social Buttons ---
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border
  },
  // --- Footer ---
  footerContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20, // Space between button and register link
    marginTop: 10 // Add some margin top
  },
  registerLinkContainer: {
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
