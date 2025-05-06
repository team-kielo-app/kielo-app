import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import { useRouter } from 'expo-router'
import { Colors } from '@constants/Colors'
import { ChevronLeft } from 'lucide-react-native'
import authStyles from './_styles/authStyles'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@store/store'
import { requestPasswordResetThunk } from '@features/auth/authActions'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (error) {
      timer = setTimeout(() => {
        setError(null)
      }, 5000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [error])

  const handleResetRequest = async () => {
    setError(null)
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    setIsLoading(true)
    try {
      await dispatch(requestPasswordResetThunk({ email: email.trim() }))
      router.push(`/(auth)/reset-password?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      console.error('Forgot Password thunk failed:', err)
      const errorMessage =
        err?.message ||
        err?.data?.error ||
        err?.data?.message ||
        'Could not send reset instructions. Please try again later.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/(auth)/login')
    }
  }

  const isButtonDisabled = isLoading

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
          <Text style={authStyles.title}>Reset Password</Text>
          <Text style={authStyles.subtitle}>
            Enter your email. We'll send instructions if an account exists.
          </Text>
        </View>

        {/* Messages */}
        <View style={authStyles.messageContainer}>
          {error && <Text style={authStyles.errorText}>{error}</Text>}
        </View>

        {/* Form */}
        <View style={authStyles.formContainer}>
          <View style={authStyles.inputGroup}>
            <Text style={authStyles.label}>Email</Text>
            <TextInput
              style={[authStyles.input, isLoading && authStyles.inputDisabled]}
              placeholder="Enter your Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              placeholderTextColor={Colors.light.textTertiary}
              onSubmitEditing={handleResetRequest}
              returnKeyType="send"
            />
          </View>
        </View>

        {/* Footer */}
        <View style={authStyles.footerContainer}>
          <Pressable
            style={({ pressed }) => [
              authStyles.actionButton,
              isButtonDisabled && authStyles.buttonDisabled,
              pressed && !isButtonDisabled && authStyles.actionButtonPressed
            ]}
            onPress={handleResetRequest}
            disabled={isButtonDisabled}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.light.white} />
            ) : (
              <Text style={authStyles.actionButtonText}>Send Instructions</Text>
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}
