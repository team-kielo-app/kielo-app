import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TextInputKeyPressEventData,
  Platform
} from 'react-native'
import { useRouter } from 'expo-router'
import { Colors } from '@constants/Colors'
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native'
import { authStyles } from './_styles/authStyles'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@store/store'
import {
  verifyResetTokenThunk,
  executePasswordResetThunk
} from '@features/auth/authActions'
import { showPlatformAlert } from '@lib/platformAlert'

const OTP_LENGTH = 6

export default function ResetPasswordScreen() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  const otpInputs = useRef<Array<TextInput | null>>([])
  const confirmPasswordInputRef = useRef<TextInput>(null)

  const [step, setStep] = useState<'verify' | 'reset'>('verify')
  const [otpDigits, setOtpDigits] = useState<string[]>(
    Array(OTP_LENGTH).fill('')
  )
  const [verificationCode, setVerificationCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedDigits = value.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH)
      const newOtpState = Array(OTP_LENGTH).fill('')
      let lastFilledIndex = -1

      for (let i = 0; i < pastedDigits.length; i++) {
        newOtpState[i] = pastedDigits[i]
        lastFilledIndex = i
      }

      setOtpDigits(newOtpState)
      setVerificationCode(pastedDigits)

      const focusIndex =
        lastFilledIndex < OTP_LENGTH - 1 ? lastFilledIndex + 1 : lastFilledIndex
      if (otpInputs.current[focusIndex]) {
        if (Platform.OS === 'android') {
          setTimeout(() => otpInputs.current[focusIndex]?.focus(), 50)
        } else {
          otpInputs.current[focusIndex]?.focus()
        }
      }
      if (lastFilledIndex === OTP_LENGTH - 1) {
        Keyboard.dismiss()
      }
      return
    }

    const digit = value.replace(/[^0-9]/g, '')
    const newOtpDigits = [...otpDigits]
    newOtpDigits[index] = digit

    if (otpDigits[index] !== digit) {
      setOtpDigits(newOtpDigits)
      const fullCode = newOtpDigits.join('')
      setVerificationCode(fullCode)

      if (digit && index < OTP_LENGTH - 1) {
        otpInputs.current[index + 1]?.focus()
      }

      if (digit && index === OTP_LENGTH - 1) {
        Keyboard.dismiss()
      }
    }
  }

  const handleOtpKeyPress = (
    index: number,
    event: TextInputKeyPressEventData
  ) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputs.current[index - 1]?.focus()
    }
  }

  const handleVerifyTokenPress = async () => {
    setError(null)
    Keyboard.dismiss()

    if (
      verificationCode.length !== OTP_LENGTH ||
      !/^\d{6}$/.test(verificationCode)
    ) {
      setError('Verification code must be 6 digits.')
      return
    }

    setIsLoading(true)
    try {
      await dispatch(verifyResetTokenThunk({ token: verificationCode }))
      setStep('reset')
      setError(null)
    } catch (err: any) {
      console.error('Token verification failed:', err)
      const errorMessage =
        err?.message ||
        err?.data?.error ||
        err?.data?.message ||
        'Invalid or expired verification code.'
      setError(errorMessage)
      setOtpDigits(Array(OTP_LENGTH).fill(''))
      setVerificationCode('')
      otpInputs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async () => {
    setError(null)

    if (step !== 'reset' || !verificationCode) {
      console.error('Attempted password reset without verified token.')
      setError('Please verify the code first.')
      setStep('verify')
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
      setError('Password must be at least 6 characters long.')
      return
    }

    setIsLoading(true)
    try {
      const result = await dispatch(
        executePasswordResetThunk({
          token: verificationCode,
          new_password: password
        })
      )

      showPlatformAlert(
        'Password Reset Successful',
        result.message || 'Your password has been updated. You can now log in.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      )
    } catch (err: any) {
      console.error('Password Reset submission failed:', err)
      const errorMessage =
        err?.message ||
        err?.data?.error ||
        err?.data?.message ||
        'Could not reset password. Please try again later.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (error) {
      timer = setTimeout(() => setError(null), 5000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [error])

  const handleGoBack = () => {
    router.replace('/(auth)/login')
  }
  const togglePasswordVisibility = () => setIsPasswordVisible(prev => !prev)
  const toggleConfirmPasswordVisibility = () =>
    setIsConfirmPasswordVisible(prev => !prev)

  const isFormDisabled = isLoading
  const isVerifyButtonDisabled =
    isLoading || verificationCode.length !== OTP_LENGTH

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
          <Text style={authStyles.title}>
            {step === 'verify' ? 'Verify Code' : 'Set New Password'}
          </Text>
          <Text style={authStyles.subtitle}>
            {step === 'verify'
              ? 'Enter the 6-digit code sent to your email.'
              : 'Enter and confirm your new password.'}
          </Text>
        </View>

        <View style={authStyles.messageContainer}>
          {error && <Text style={authStyles.errorText}>{error}</Text>}
        </View>

        {step === 'verify' && (
          <View style={styles.otpContainer}>
            {otpDigits.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => {
                  otpInputs.current[index] = ref
                }}
                style={[
                  authStyles.input,
                  styles.otpInput,
                  isFormDisabled && authStyles.inputDisabled
                ]}
                value={digit}
                onChangeText={value => handleOtpChange(index, value)}
                onKeyPress={({ nativeEvent }) =>
                  handleOtpKeyPress(index, nativeEvent)
                }
                keyboardType="number-pad"
                editable={!isFormDisabled}
                placeholderTextColor={Colors.light.textTertiary}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>
        )}

        {step === 'reset' && (
          <View style={[authStyles.formContainer, { gap: 20 }]}>
            <View style={authStyles.inputGroup}>
              <Text style={authStyles.label}>New Password</Text>
              <View
                style={[
                  authStyles.passwordInputWrapper,
                  isFormDisabled && styles.inputWrapperDisabled
                ]}
              >
                <TextInput
                  style={[
                    authStyles.input,
                    authStyles.passwordInputOnly,
                    isFormDisabled && authStyles.inputDisabled
                  ]}
                  placeholder="Enter New Password (min. 6 chars)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  editable={!isFormDisabled}
                  placeholderTextColor={Colors.light.textTertiary}
                  returnKeyType="next"
                  onSubmitEditing={() =>
                    confirmPasswordInputRef.current?.focus()
                  }
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  style={authStyles.passwordVisibilityButton}
                  disabled={isFormDisabled}
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
              <Text style={authStyles.label}>Confirm New Password</Text>
              <View
                style={[
                  authStyles.passwordInputWrapper,
                  isFormDisabled && styles.inputWrapperDisabled
                ]}
              >
                <TextInput
                  ref={confirmPasswordInputRef}
                  style={[
                    authStyles.input,
                    authStyles.passwordInputOnly,
                    isFormDisabled && authStyles.inputDisabled
                  ]}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!isConfirmPasswordVisible}
                  editable={!isFormDisabled}
                  placeholderTextColor={Colors.light.textTertiary}
                  onSubmitEditing={handlePasswordSubmit}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  onPress={toggleConfirmPasswordVisibility}
                  style={authStyles.passwordVisibilityButton}
                  disabled={isFormDisabled}
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
        )}

        <View style={authStyles.footerContainer}>
          {step === 'verify' && (
            <Pressable
              style={({ pressed }) => [
                authStyles.actionButton,
                isVerifyButtonDisabled && authStyles.buttonDisabled,
                pressed &&
                  !isVerifyButtonDisabled &&
                  authStyles.actionButtonPressed
              ]}
              onPress={handleVerifyTokenPress}
              disabled={isVerifyButtonDisabled}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.light.white} />
              ) : (
                <Text style={authStyles.actionButtonText}>Verify Code</Text>
              )}
            </Pressable>
          )}
          {step === 'reset' && (
            <Pressable
              style={({ pressed }) => [
                authStyles.actionButton,
                isFormDisabled && authStyles.buttonDisabled,
                pressed && !isFormDisabled && authStyles.actionButtonPressed
              ]}
              onPress={handlePasswordSubmit}
              disabled={isFormDisabled}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.light.white} />
              ) : (
                <Text style={authStyles.actionButtonText}>Reset Password</Text>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  inputWrapperDisabled: {},
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 5,
    marginBottom: 20
  },
  otpInput: {
    width: 48,
    height: 52,
    textAlign: 'center',
    fontSize: 20,
    paddingHorizontal: 0
  }
})
