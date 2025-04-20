import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert
} from 'react-native'
import { useSelector } from 'react-redux'
import { useProtectedRoute } from '@hooks/useProtectedRoute'
import { selectUser } from '@features/auth/authSelectors'
import { RootState } from '@store/store'
import { Colors } from '@constants/Colors'
import { ScreenHeader } from '@components/common/ScreenHeader'

// Mock update action
const mockUpdateProfile = (data: any) =>
  new Promise(resolve => setTimeout(resolve, 1000))

export default function ProfileInfoScreen() {
  const { isLoading: isAuthLoading, isAuthenticated } = useProtectedRoute()
  const user = useSelector((state: RootState) => selectUser(state))

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setName(user.displayName || '')
      setEmail(user.email || '')
      setBio(user.bio || '')
    }
  }, [user])

  const handleSaveChanges = async () => {
    setError(null)
    if (!name) {
      setError('Name cannot be empty.')
      return
    }

    setIsLoading(true)
    try {
      await mockUpdateProfile({ name, bio })
      Alert.alert('Success', 'Profile updated successfully.')
      // TODO: Trigger refetch of user data
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthLoading) {
    /* ... loading state ... */
  }
  if (!isAuthenticated) return null

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Profile Information"
        fallbackPath="/(main)/settings/"
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            editable={!isLoading}
            placeholderTextColor="#888"
          />
        </View>
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={email}
            editable={false}
            placeholderTextColor="#888"
          />
          <Text style={styles.note}>Email cannot be changed here.</Text>
        </View>
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Bio / About Me</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            editable={!isLoading}
            placeholder="Tell us a little about yourself"
            placeholderTextColor="#888"
          />
        </View>
        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSaveChanges}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  )
}

// Styles adapted from settings screen
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  scrollContent: { padding: 20 },
  fieldContainer: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.light.textSecondary,
    marginBottom: 8
  },
  input: {
    width: '100%',
    minHeight: 50,
    borderColor: Colors.light.border,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    color: Colors.light.text,
    fontFamily: 'Inter-Regular'
  },
  inputDisabled: {
    backgroundColor: Colors.light.backgroundLight,
    color: Colors.light.textSecondary
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  note: {
    fontSize: 12,
    color: Colors.light.textTertiary,
    marginTop: 4,
    fontFamily: 'Inter-Regular'
  },
  button: {
    width: '100%',
    height: 50,
    paddingVertical: 15,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  buttonDisabled: { backgroundColor: Colors.light.border, opacity: 0.7 },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter-SemiBold'
  },
  errorText: {
    color: Colors.light.error,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'Inter-SemiBold'
  }
})
