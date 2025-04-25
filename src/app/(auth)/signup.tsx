import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import { Colors } from '@constants/Colors'
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native'
import { FontAwesome } from '@expo/vector-icons'
import { authStyles } from './_styles/authStyles'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@store/store'
import {
  registerUserThunk,
  clearAuthError,
  loginWithSocialThunk
} from '@features/auth/authActions'
import {
  selectAuthStatus,
  selectAuthError,
  selectIsAuthenticated
} from '@features/auth/authSelectors'
import { useAuthRequest } from 'expo-auth-session/providers/google'

export default function SignupScreen() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const authStatus = useSelector(selectAuthStatus)
  const authError = useSelector(selectAuthError)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const passwordInputRef = useRef<TextInput>(null)
  const confirmPasswordInputRef = useRef<TextInput>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const isLoading = authStatus === 'loading'
  const displayError = authError || localError

  const [googleRequest, googleResponse, promptAsyncGoogle] = useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  })

  useEffect(() => {
    if (authStatus === 'succeeded' && isAuthenticated) {
      console.log('Auth success (Signup), redirecting to main app...')
      router.replace('/(main)/(tabs)/')
    }
  }, [authStatus, isAuthenticated, router])

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (displayError) {
      if (localError) setLocalError(null)
      timer = setTimeout(() => {
        if (authError) dispatch(clearAuthError())
      }, 5000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [displayError, authError, localError, dispatch])

  useEffect(() => {
    setLocalError(null)
  }, [email, password, confirmPassword])

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
      ).catch(err => {
        console.error('Social Login Thunk Error (Signup):', err)
      })
    } else if (googleResponse?.type === 'error') {
      console.error('Google Auth Error (Signup):', googleResponse.error)
      dispatch(clearAuthError())
      setLocalError('Google sign-in failed. Please try again.')
    }
  }, [googleResponse, dispatch])

  const handleRegister = useCallback(async () => {
    if (isLoading) return

    setLocalError(null)
    if (authError) dispatch(clearAuthError())

    if (!email.trim() || !password || !confirmPassword) {
      return
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setLocalError('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.')
      return
    }

    try {
      await dispatch(
        registerUserThunk({ email: email.trim(), password: password })
      )
    } catch (err: any) {
      console.error('Registration thunk failed:', err)
    }
  }, [email, password, confirmPassword, authError, dispatch])

  const handleGoogleLoginPress = useCallback(() => {
    dispatch(clearAuthError())
    setLocalError(null)
    if (googleRequest) {
      promptAsyncGoogle()
    } else {
      setLocalError('Google Sign-In is not available right now.')
    }
  }, [googleRequest, promptAsyncGoogle, dispatch])

  const handleAppleLoginPress = useCallback(() => {
    dispatch(clearAuthError())
    setLocalError('Apple Sign-In is not yet implemented.')
  }, [dispatch])

  const handleFacebookLoginPress = useCallback(() => {
    dispatch(clearAuthError())
    setLocalError('Facebook Sign-In is not yet implemented.')
  }, [dispatch])

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/(auth)/login')
    }
  }
  const togglePasswordVisibility = () => setIsPasswordVisible(prev => !prev)
  const toggleConfirmPasswordVisibility = () =>
    setIsConfirmPasswordVisible(prev => !prev)

  const renderSocialButton = useCallback(
    (
      provider: 'google' | 'apple' | 'facebook',
      onPress: () => void,
      disabled: boolean = false
    ) => {
      const iconName = provider === 'facebook' ? 'facebook-f' : provider
      const brandColors = {
        google: '#DB4437',
        apple: '#000000',
        facebook: '#1877F2'
      }
      const pressedColors = {
        google: '#c33d2e',
        apple: '#333333',
        facebook: '#166fe5'
      }
      return (
        <Pressable
          style={({ pressed }) => [
            styles.socialButton,
            (disabled || isLoading) && authStyles.buttonDisabled,
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
      contentContainerStyle={authStyles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={authStyles.innerContainer}>
        <View style={authStyles.headerContainer}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={authStyles.backButton}
          >
            <ChevronLeft size={28} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        <View style={authStyles.titleContainer}>
          <Text style={authStyles.title}>Create Account</Text>
          <Text style={authStyles.subtitle}>
            Join us and start your journey!
          </Text>
        </View>

        <View style={authStyles.messageContainer}>
          {displayError && (
            <Text style={authStyles.errorText}>{displayError}</Text>
          )}
        </View>

        <View style={authStyles.formContainer}>
          <View style={authStyles.inputGroup}>
            <Text style={authStyles.label}>Email</Text>
            <TextInput
              style={[authStyles.input, isLoading && authStyles.inputDisabled]}
              placeholder="Enter Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              placeholderTextColor={Colors.light.textTertiary}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>
          <View style={authStyles.inputGroup}>
            <Text style={authStyles.label}>Password</Text>
            <View
              style={[
                authStyles.passwordInputWrapper,
                isLoading && styles.inputWrapperDisabled
              ]}
            >
              <TextInput
                ref={passwordInputRef}
                style={[
                  authStyles.input,
                  authStyles.passwordInputOnly,
                  isLoading && authStyles.inputDisabled
                ]}
                placeholder="Enter Password (min. 6 chars)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                editable={!isLoading}
                placeholderTextColor={Colors.light.textTertiary}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={authStyles.passwordVisibilityButton}
                disabled={isLoading}
              >
                {isPasswordVisible ? (
                  <EyeOff size={20} color={Colors.light.textSecondary} />
                ) : (
                  <Eye size={20} color={Colors.light.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View style={authStyles.inputGroup}>
            <Text style={authStyles.label}>Confirm Password</Text>
            <View
              style={[
                authStyles.passwordInputWrapper,
                isLoading && styles.inputWrapperDisabled
              ]}
            >
              <TextInput
                ref={confirmPasswordInputRef}
                style={[
                  authStyles.input,
                  authStyles.passwordInputOnly,
                  isLoading && authStyles.inputDisabled
                ]}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!isConfirmPasswordVisible}
                editable={!isLoading}
                placeholderTextColor={Colors.light.textTertiary}
                onSubmitEditing={handleRegister}
                returnKeyType="go"
              />
              <TouchableOpacity
                onPress={toggleConfirmPasswordVisibility}
                style={authStyles.passwordVisibilityButton}
                disabled={isLoading}
              >
                {isConfirmPasswordVisible ? (
                  <EyeOff size={20} color={Colors.light.textSecondary} />
                ) : (
                  <Eye size={20} color={Colors.light.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
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
              !googleRequest || isLoading
            )}
            {renderSocialButton('apple', handleAppleLoginPress, isLoading)}
            {renderSocialButton(
              'facebook',
              handleFacebookLoginPress,
              isLoading
            )}
          </View>
        </View>

        <View
          style={[authStyles.footerContainer, styles.signupFooterContainer]}
        >
          <Pressable
            style={({ pressed }) => [
              authStyles.actionButton,
              isLoading && authStyles.buttonDisabled,
              pressed && !isLoading && authStyles.actionButtonPressed
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.light.white} />
            ) : (
              <Text style={authStyles.actionButtonText}>Register</Text>
            )}
          </Pressable>
          <View style={styles.loginLinkContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable disabled={isLoading}>
                <Text
                  style={[
                    authStyles.linkTextBold,
                    isLoading && authStyles.linkDisabled
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

const styles = StyleSheet.create({
  signupFooterContainer: { gap: 20 },
  loginLinkContainer: { flexDirection: 'row', alignItems: 'center' },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary
  },
  inputWrapperDisabled: {},
  socialLoginsSection: { gap: 20, marginTop: 10 },
  orSeparatorContainer: { flexDirection: 'row', alignItems: 'center' },
  orSeparatorLine: { flex: 1, height: 1, backgroundColor: Colors.light.border },
  orSeparatorText: {
    marginHorizontal: 12,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.light.textSecondary
  },
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
  }
})
