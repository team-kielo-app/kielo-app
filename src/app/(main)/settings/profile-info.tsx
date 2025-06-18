import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import { useProtectedRoute } from '@hooks/useProtectedRoute'
import { selectUser } from '@features/auth/authSelectors'
import { AppDispatch, RootState } from '@store/store'
import { Colors } from '@constants/Colors'
import { ScreenHeader } from '@components/common/ScreenHeader'
import { showPlatformAlert } from '@lib/platformAlert'

const mockUpdateProfile = (data: {
  name: string
  bio: string
}): Promise<{ message: string }> => {
  console.log('Mock updating profile with:', data)
  return new Promise(resolve =>
    setTimeout(
      () => resolve({ message: 'Profile updated successfully!' }),
      1000
    )
  )
}

export default function ProfileInfoScreen(): React.ReactElement | null {
  const { isLoading: isAuthLoading, isAuthenticated } = useProtectedRoute()
  const user = useSelector((state: RootState) => selectUser(state))
  const dispatch = useDispatch<AppDispatch>()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setName(user.displayName || user.name || '')
      setEmail(user.email || '')
      setBio((user as any).bio || '')
    }
  }, [user])

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

  const handleSaveChanges = async () => {
    setError(null)
    setSuccessMessage(null)
    if (!name.trim()) {
      setError('Name cannot be empty.')
      return
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters long.')
      return
    }
    if (bio.length > 200) {
      setError('Bio cannot exceed 200 characters.')
      return
    }

    setIsLoading(true)
    try {
      const result = await mockUpdateProfile({
        name: name.trim(),
        bio: bio.trim()
      })
      setSuccessMessage(result.message)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthLoading || !isAuthenticated) {
    return (
      <View style={styles.fullScreenLoader}>
        <ScreenHeader
          title="Profile Information"
          fallbackPath="/(main)/settings/"
        />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </View>
    )
  }
  if (!user) return null

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Profile Information"
        fallbackPath="/(main)/settings/"
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {error && <Text style={styles.errorText}>{error}</Text>}
        {successMessage && (
          <Text style={styles.successText}>{successMessage}</Text>
        )}

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={[styles.input, isLoading && styles.inputDisabled]}
            value={name}
            onChangeText={setName}
            editable={!isLoading}
            placeholder="Enter your full name"
            placeholderTextColor={Colors.light.textPlaceholder}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={email}
            editable={false}
            placeholderTextColor={Colors.light.textPlaceholder}
          />
          <Text style={styles.noteText}>Email cannot be changed here.</Text>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Bio / About Me (Optional)</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              isLoading && styles.inputDisabled
            ]}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            maxLength={200}
            editable={!isLoading}
            placeholder="Tell us a little about yourself..."
            placeholderTextColor={Colors.light.textPlaceholder}
            textAlignVertical="top"
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            isLoading && styles.buttonDisabled,
            pressed && !isLoading && styles.buttonPressed
          ]}
          onPress={handleSaveChanges}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.light.primaryContent} />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  )
}

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
    width: '100%',
    minHeight: 50,
    backgroundColor: Colors.light.inputBackground,
    borderColor: Colors.light.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.light.text
  },
  inputDisabled: {
    backgroundColor: Colors.light.backgroundSecondary,
    color: Colors.light.textTertiary,
    borderColor: Colors.light.borderSubtle
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top'
  },
  noteText: {
    fontSize: 12,
    color: Colors.light.textTertiary,
    marginTop: 6,
    fontFamily: 'Inter-Regular'
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
