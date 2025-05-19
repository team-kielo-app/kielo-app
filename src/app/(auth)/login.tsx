import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Platform
} from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import { FontAwesome } from '@expo/vector-icons'
import {
  GoogleSignin,
  statusCodes
} from '@react-native-google-signin/google-signin'
import {
  loginUserThunk,
  loginWithSocialThunk,
  clearAuthError
} from '@features/auth/authActions'
import { selectAuthStatus, selectAuthError } from '@features/auth/authSelectors'
import { AppDispatch } from '@store/store'
import { Colors } from '@constants/Colors'
import authStyles from './_styles/authStyles'
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native'
import {
  Link,
  useLocalSearchParams,
  useRouter,
  useSegments,
  usePathname
} from 'expo-router'

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  offlineAccess: false
})

const LoginView = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const params = useLocalSearchParams<{ redirect?: string }>()

  const status = useSelector(selectAuthStatus)
  const rawError = useSelector(selectAuthError)

  const passwordInputRef = useRef<TextInput>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const isLoading = status === 'loading'
  const displayError = rawError || localError

  // Email/password login
  const handleLoginSubmit = useCallback(async () => {
    if (isLoading) return
    dispatch(clearAuthError())
    setLocalError(null)
    if (!email.trim() || !password) return
    try {
      await dispatch(loginUserThunk({ email: email.trim(), password }))
    } catch (error) {
      console.error('Login thunk failed:', error)
    }
  }, [email, password, dispatch, isLoading])

  // Google Sign-In
  const handleGoogleLoginPress = useCallback(async () => {
    dispatch(clearAuthError())
    setLocalError(null)
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
      const response = await GoogleSignin.signIn()
      if (response.type === 'cancelled') return

      const { idToken, accessToken } = await GoogleSignin.getTokens()
      if (idToken || accessToken) {
        await dispatch(
          loginWithSocialThunk({
            provider: 'google',
            access_token: accessToken || idToken
          })
        )
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setLocalError('Google Play Services not available or outdated')
      } else {
        setLocalError('Google sign-in failed. Please try again.')
      }
    }
  }, [dispatch])

  // Other social placeholders
  const handleAppleLoginPress = useCallback(() => {
    dispatch(clearAuthError())
    setLocalError(null)
    setLocalError('Apple Sign-In is not yet implemented.')
  }, [dispatch])

  const handleFacebookLoginPress = useCallback(() => {
    dispatch(clearAuthError())
    setLocalError(null)
    setLocalError('Facebook Sign-In is not yet implemented.')
  }, [dispatch])

  // Clear errors on input
  useEffect(() => {
    setLocalError(null)
  }, [email, password])

  // Clear remote errors after timeout
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (displayError) {
      timer = setTimeout(() => {
        dispatch(clearAuthError())
        setLocalError(null)
      }, 5000)
    }
    return () => clearTimeout(timer)
  }, [displayError, dispatch])

  const togglePasswordVisibility = useCallback(
    () => setIsPasswordVisible(v => !v),
    []
  )

  const handleGoBack = () => {
    const defaultRedirect = '/(main)/(tabs)/'
    const redirectParams =
      params.redirect && decodeURIComponent(params.redirect)
    const redirectPath =
      redirectParams && !redirectParams.startsWith('/(auth)/')
        ? redirectParams
        : defaultRedirect
    router.replace(redirectPath)
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
        apple: '#000',
        facebook: '#1877F2'
      }
      const pressedColors = {
        google: '#c33d2e',
        apple: '#333',
        facebook: '#166fe5'
      }
      return (
        <Pressable
          style={({ pressed }) => [
            styles.socialButton,
            (disabled || isLoading) && authStyles.buttonDisabled,
            pressed &&
              !(disabled || isLoading) && {
                backgroundColor: pressedColors[provider]
              },
            !pressed && { backgroundColor: brandColors[provider] }
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
        {/* Header */}
        <View style={authStyles.headerContainer}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={authStyles.backButton}
          >
            <ChevronLeft size={28} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        {/* Titles */}
        <View style={authStyles.titleContainer}>
          <Text style={authStyles.title}>Let's Sign you in.</Text>
          <Text style={authStyles.subtitle}>Welcome back</Text>
        </View>

        {/* Error Message */}
        <Text style={authStyles.errorText}>{displayError}</Text>

        {/* Form */}
        <View style={authStyles.formContainer}>
          <View style={authStyles.inputGroup}>
            <Text style={authStyles.label}>Username or Email</Text>
            <TextInput
              style={[authStyles.input, isLoading && authStyles.inputDisabled]}
              placeholder="Enter Username or Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              placeholderTextColor={Colors.light.textTertiary}
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
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                editable={!isLoading}
                returnKeyType="go"
                onSubmitEditing={handleLoginSubmit}
                placeholderTextColor={Colors.light.textTertiary}
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                disabled={isLoading}
                style={authStyles.passwordVisibilityButton}
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
                disabled={isLoading}
                style={styles.forgotPasswordButton}
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

        {/* Social Logins */}
        <View style={styles.socialLoginsSection}>
          <View style={styles.orSeparatorContainer}>
            <View style={styles.orSeparatorLine} />
            <Text style={styles.orSeparatorText}>or continue with</Text>
            <View style={styles.orSeparatorLine} />
          </View>
          <View style={styles.socialLoginContainer}>
            {renderSocialButton('google', handleGoogleLoginPress, isLoading)}
            {renderSocialButton('apple', handleAppleLoginPress, isLoading)}
            {renderSocialButton(
              'facebook',
              handleFacebookLoginPress,
              isLoading
            )}
          </View>
        </View>

        {/* Actions */}
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
    justifyContent: 'center'
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
