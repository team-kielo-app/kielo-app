import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
  ScrollView
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
import { authStyles } from './_styles/authStyles'

maybeCompleteAuthSession()

const LoginView = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const params = useLocalSearchParams<{ redirect?: string }>()

  const status = useSelector(selectAuthStatus)
  const rawError = useSelector(selectAuthError)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const passwordInputRef = useRef<TextInput>(null)

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
      console.log('Auth success, redirecting to:', redirectPath)
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
      ).catch(err => {
        console.error('Social Login Thunk Error (Login):', err)
      })
    } else if (googleResponse?.type === 'error') {
      console.error('Google Auth Error (Login):', googleResponse.error)
      dispatch(clearAuthError())
      setLocalError('Google sign-in failed. Please try again.')
    }
  }, [googleResponse, dispatch])

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null
    if (displayError) {
      if (localError) setLocalError(null)
      timerId = setTimeout(() => {
        if (rawError) dispatch(clearAuthError())
      }, 5000)
    }
    return () => {
      if (timerId) clearTimeout(timerId)
    }
  }, [displayError, rawError, localError, dispatch])

  useEffect(() => {
    setLocalError(null)
  }, [email, password])

  const handleLoginSubmit = useCallback(async () => {
    if (isLoading) return

    dispatch(clearAuthError())
    setLocalError(null)

    if (!email.trim() || !password) {
      return
    }
    try {
      await dispatch(loginUserThunk({ email: email.trim(), password }))
    } catch (error) {
      console.error('Login thunk failed:', error)
    }
  }, [email, password, dispatch])

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
          <Text style={authStyles.title}>Let's Sign you in.</Text>
          <Text style={authStyles.subtitle}>Welcome back</Text>
          <Text style={authStyles.subtitle}>You've been missed!</Text>
        </View>

        <View style={authStyles.messageContainer}>
          {displayError && (
            <Text style={authStyles.errorText}>{displayError}</Text>
          )}
        </View>

        <View style={authStyles.formContainer}>
          <View style={authStyles.inputGroup}>
            <Text style={authStyles.label}>Username or Email</Text>
            <TextInput
              style={[authStyles.input, isLoading && authStyles.inputDisabled]}
              placeholder="Enter Username or Email"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.light.textTertiary}
              editable={!isLoading}
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
                placeholder="Enter Password"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!isPasswordVisible}
                placeholderTextColor={Colors.light.textTertiary}
                editable={!isLoading}
                onSubmitEditing={handleLoginSubmit}
                returnKeyType="go"
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
            <Link href="/(auth)/forgot-password" asChild>
              <Pressable
                style={styles.forgotPasswordButton}
                disabled={isLoading}
              >
                <Text
                  style={[
                    authStyles.linkText,
                    isLoading && authStyles.linkDisabled
                  ]}
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

        <View style={[authStyles.footerContainer, styles.loginFooterContainer]}>
          <Pressable
            style={({ pressed }) => [
              authStyles.actionButton,
              isLoading && authStyles.buttonDisabled,
              pressed && !isLoading && authStyles.actionButtonPressed
            ]}
            onPress={handleLoginSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.light.white} />
            ) : (
              <Text style={authStyles.actionButtonText}>Login</Text>
            )}
          </Pressable>
          <View style={styles.registerLinkContainer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <Pressable disabled={isLoading}>
                <Text
                  style={[
                    authStyles.linkTextBold,
                    isLoading && authStyles.linkDisabled
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

const styles = StyleSheet.create({
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 4
  },
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
  },
  loginFooterContainer: { gap: 20 },
  registerLinkContainer: { flexDirection: 'row', alignItems: 'center' },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary
  },
  inputWrapperDisabled: { borderColor: Colors.light.border, opacity: 0.7 }
})
