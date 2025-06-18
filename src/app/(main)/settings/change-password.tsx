// src/app/(main)/settings/change-password.tsx
import React, { useState, useEffect, useRef } from 'react' // Added useEffect, useRef
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert, // For feedback
  TouchableOpacity, // For password visibility toggle
  Platform
} from 'react-native'
import { useProtectedRoute } from '@hooks/useProtectedRoute'
import { Colors } from '@constants/Colors'
import { ScreenHeader } from '@components/common/ScreenHeader'
import { showPlatformAlert } from '@lib/platformAlert'
import { Eye, EyeOff } from 'lucide-react-native' // Icons for password visibility
// import { changePasswordThunk } from '@features/auth/authActions'; // Assuming this thunk exists or will be created
// import { useDispatch } from 'react-redux';
// import { AppDispatch } from '@store/store';

// Mock update action (replace with actual thunk)
const mockChangePassword = (data: any): Promise<{ message: string }> => {
  console.log(
    'Mock changing password with:',
    data.currentPassword,
    data.newPassword
  )
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (data.currentPassword === 'password123') {
        resolve({ message: 'Password updated successfully.' })
      } else {
        reject(new Error('Incorrect current password.'))
      }
    }, 1000)
  })
}

export default function ChangePasswordScreen(): React.ReactElement | null {
  const { isLoading: isAuthLoading, isAuthenticated } = useProtectedRoute()
  // const dispatch = useDispatch<AppDispatch>();

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false)
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false)
  const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] =
    useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const newPasswordInputRef = useRef<TextInput>(null)
  const confirmNewPasswordInputRef = useRef<TextInput>(null)

  // Clear messages after a timeout
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (error || successMessage) {
      timer = setTimeout(() => {
        setError(null)
        setSuccessMessage(null)
      }, 4000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [error, successMessage])

  const handleUpdatePassword = async () => {
    setError(null)
    setSuccessMessage(null)

    if (
      !currentPassword.trim() ||
      !newPassword.trim() ||
      !confirmNewPassword.trim()
    ) {
      setError('Please fill in all password fields.')
      return
    }
    if (newPassword.length < 6) {
      // Example password policy
      setError('New password must be at least 6 characters long.')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.')
      return
    }
    if (newPassword === currentPassword) {
      setError('New password cannot be the same as the current password.')
      return
    }

    setIsLoading(true)
    try {
      // Replace with actual thunk:
      // await dispatch(changePasswordThunk({ current_password: currentPassword, new_password: newPassword })).unwrap();
      const result = await mockChangePassword({ currentPassword, newPassword })
      setSuccessMessage(result.message)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthLoading || !isAuthenticated) {
    return (
      <View style={styles.fullScreenLoader}>
        <ScreenHeader
          title="Change Password"
          fallbackPath="/(main)/settings/"
        />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </View>
    )
  }

  const renderPasswordInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    isVisible: boolean,
    toggleVisibility: () => void,
    onSubmitEditing?: () => void,
    inputRef?: React.RefObject<TextInput>
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.passwordInputWrapper,
          isLoading && styles.inputDisabledWrapper
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            styles.passwordInputOnly,
            isLoading && styles.inputDisabled
          ]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!isVisible}
          editable={!isLoading}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor={Colors.light.textPlaceholder}
          autoCapitalize="none"
          returnKeyType={onSubmitEditing ? 'next' : 'done'}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={!onSubmitEditing} // Only blur if it's the last input
        />
        <TouchableOpacity
          onPress={toggleVisibility}
          style={styles.passwordVisibilityButton}
          disabled={isLoading}
        >
          {isVisible ? (
            <EyeOff size={20} color={Colors.light.textSecondary} />
          ) : (
            <Eye size={20} color={Colors.light.textSecondary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <ScreenHeader title="Change Password" fallbackPath="/(main)/settings/" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {error && <Text style={styles.errorText}>{error}</Text>}
        {successMessage && (
          <Text style={styles.successText}>{successMessage}</Text>
        )}

        {renderPasswordInput(
          'Current Password',
          currentPassword,
          setCurrentPassword,
          isCurrentPasswordVisible,
          () => setIsCurrentPasswordVisible(v => !v),
          () => newPasswordInputRef.current?.focus()
        )}

        {renderPasswordInput(
          'New Password',
          newPassword,
          setNewPassword,
          isNewPasswordVisible,
          () => setIsNewPasswordVisible(v => !v),
          () => confirmNewPasswordInputRef.current?.focus(),
          newPasswordInputRef
        )}

        {renderPasswordInput(
          'Confirm New Password',
          confirmNewPassword,
          setConfirmNewPassword,
          isConfirmNewPasswordVisible,
          () => setIsConfirmNewPasswordVisible(v => !v),
          handleUpdatePassword, // Submit on final input
          confirmNewPasswordInputRef
        )}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            isLoading && styles.buttonDisabled,
            pressed && !isLoading && styles.buttonPressed
          ]}
          onPress={handleUpdatePassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.light.primaryContent} />
          ) : (
            <Text style={styles.buttonText}>Update Password</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  )
}

// Using similar styles to profile-info.tsx for consistency
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary
  },
  fullScreenLoader: { flex: 1, backgroundColor: Colors.light.background },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  fieldContainer: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.light.textSecondary,
    marginBottom: 8
  },
  input: {
    // Base style for text input part
    flex: 1, // Take available space within wrapper
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.light.text
  },
  passwordInputWrapper: {
    // Wrapper for password input + icon
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.inputBackground,
    borderColor: Colors.light.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    width: '100%'
  },
  passwordInputOnly: {
    // Style for the TextInput itself when inside a wrapper
    borderWidth: 0, // No border on the TextInput as wrapper has it
    paddingRight: 0 // Avoid double padding with icon button
  },
  passwordVisibilityButton: {
    padding: 14 // Make icon tappable
  },
  inputDisabled: {
    // For the TextInput when disabled
    color: Colors.light.textTertiary
  },
  inputDisabledWrapper: {
    // For the wrapper when disabled
    backgroundColor: Colors.light.backgroundSecondary,
    borderColor: Colors.light.borderSubtle
  },
  button: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  buttonPressed: {
    backgroundColor: Colors.light.primaryLight
  },
  buttonDisabled: {
    backgroundColor: Colors.light.buttonDisabledBackground,
    shadowOpacity: 0,
    elevation: 0
  },
  buttonText: {
    color: Colors.light.primaryContent,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold'
  },
  errorText: {
    color: Colors.light.error,
    backgroundColor: Colors.light.errorBackground,
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.light.error
  },
  successText: {
    color: Colors.light.success,
    backgroundColor: Colors.light.successBackground,
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.light.success
  }
})
