import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { LogIn } from 'lucide-react-native'
import { Colors } from '@constants/Colors'
import { User } from '@features/auth/types' // Assuming User type from auth
import { nameParser } from '@utils/string'

interface HomeHeaderProps {
  isAuthenticated: boolean
  user: User | null
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  isAuthenticated,
  user
}) => {
  const router = useRouter()

  return (
    <View style={styles.profileSection}>
      <View style={styles.headerTextContainer}>
        {isAuthenticated && user ? (
          <>
            <Text style={styles.headerTitle}>
              Hei{' '}
              {nameParser(user.displayName || 'Kielo User', { ellipsis: '' })}!
              👋
            </Text>
            <Text style={styles.headerSubtitle}>
              Let's learn some Finnish today
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.headerTitle}>Tervetuloa! 👋</Text>
            <Text style={styles.headerSubtitle}>
              Login to track your progress
            </Text>
          </>
        )}
      </View>
      {isAuthenticated && user ? (
        <TouchableOpacity
          onPress={() => router.push('/(main)/(tabs)/profile')}
          accessibilityLabel="View your profile"
          accessibilityRole="button"
        >
          <Image
            source={{
              uri:
                user.avatarUrl || `https://picsum.photos/seed/${user.id}/80/80` // Use avatarUrl if available
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          style={styles.loginButton}
          accessibilityLabel="Login to your account"
          accessibilityRole="button"
        >
          <LogIn size={20} color={Colors.light.primary} />
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

// Styles copied from HomeScreen
const styles = StyleSheet.create({
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  headerTextContainer: { flex: 1, marginRight: 16 },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: Colors.light.text,
    marginBottom: 4
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.textSecondary
  },
  profileImage: { width: 50, height: 50, borderRadius: 25 },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border
  },
  loginButtonText: {
    marginLeft: 6,
    color: Colors.light.primary,
    fontWeight: '500', // Corresponds to Inter-Medium
    fontFamily: 'Inter-Medium'
  }
})
