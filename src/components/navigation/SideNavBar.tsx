import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator
} from 'react-native'
import { Link, useSegments, useRouter } from 'expo-router'
import {
  Home,
  Book,
  User,
  BicepsFlexed,
  Settings,
  LogIn,
  LogOut
} from 'lucide-react-native' // Added icons
import { useSelector, useDispatch } from 'react-redux' // Added useDispatch
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Colors } from '@constants/Colors'
import {
  selectIsAuthenticated,
  selectAuthStatus
} from '@features/auth/authSelectors' // Added selectAuthStatus
import { logoutUser } from '@features/auth/authActions' // Added logout action
import { useRequireAuthAction } from '@hooks/useRequireAuthAction'
import { navItems } from '@/constants/navigation' // Import shared data
import { AppDispatch } from '@store/store' // Import AppDispatch type

export function SideNavBar() {
  const router = useRouter()
  const segments = useSegments()
  const insets = useSafeAreaInsets()
  const dispatch = useDispatch<AppDispatch>() // Typed dispatch

  const isAuthenticated = useSelector(selectIsAuthenticated)
  const authStatus = useSelector(selectAuthStatus) // Get status for logout button

  // Determine active segment considering nested structure
  let activeSegmentKey: string | null = null
  if (segments.length > 0 && segments[0] === '(main)') {
    if (segments.length > 1 && segments[1] === '(tabs)') {
      activeSegmentKey = segments[2] || 'index' // Handle '/(main)/(tabs)/' -> index
    } else if (segments.length > 1) {
      // Handle direct children like settings: check segments[1] possibly combined with segments[2]
      activeSegmentKey = segments.slice(1).join('/') // e.g., 'settings/index'
    }
  }

  // Guarded navigation actions (can be reused or specific)
  const navigateToProtected = useRequireAuthAction((path: string) => {
    router.push(path as any)
  }, 'Login required.')

  const handleLogout = () => {
    dispatch(logoutUser())
    // No need to manually redirect, RootLayout will handle it
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }
      ]}
    >
      <Text style={styles.logo}>Kielo</Text>

      <View style={styles.navItemsContainer}>
        {navItems.map(item => {
          const isActive = activeSegmentKey === item.targetSegment
          const Icon = item.icon

          const handlePress = () => {
            if (item.protected) {
              navigateToProtected(item.path) // Use generic guarded action
            } else {
              router.push(item.path as any)
            }
          }

          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={handlePress}
              // Disable visually if protected and not logged in? Optional.
              // style={[styles.navItem, isActive && styles.navItemActive, item.protected && !isAuthenticated && styles.navItemDisabled]}
            >
              <Icon
                size={22}
                color={
                  isActive ? Colors.light.primary : Colors.light.textSecondary
                }
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Text
                style={[styles.navLabel, isActive && styles.navLabelActive]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* --- Bottom Login/Logout Action --- */}
      <View style={styles.bottomActions}>
        {authStatus === 'loading' ? (
          <ActivityIndicator color={Colors.light.primary} />
        ) : isAuthenticated ? (
          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <LogOut size={20} color={Colors.light.error} />
            <Text style={[styles.actionLabel, { color: Colors.light.error }]}>
              Logout
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <LogIn size={20} color={Colors.light.primary} />
            <Text style={[styles.actionLabel, { color: Colors.light.primary }]}>
              Login
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {/* ------------------------------------ */}
    </View>
  )
}

const SIDEBAR_WIDTH = 240

const styles = StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: Colors.light.background,
    borderRightWidth: 1,
    borderRightColor: Colors.light.border,
    paddingHorizontal: 16,
    // paddingBottom handled by inset
    display: 'flex',
    flexDirection: 'column'
  },
  logo: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.light.primary,
    marginBottom: 30,
    paddingLeft: 12
  },
  navItemsContainer: {
    flex: 1,
    gap: 8
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 14
  },
  navItemActive: {
    backgroundColor: Colors.light.primaryLight
  },
  navItemDisabled: {
    // Optional style for disabled items
    opacity: 0.5
  },
  navLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.textSecondary
  },
  navLabelActive: {
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.primary
  },
  bottomActions: {
    marginTop: 'auto', // Push to bottom
    paddingTop: 20, // Add space above actions
    borderTopWidth: 1,
    borderTopColor: Colors.light.border
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 14
  },
  actionLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16
  }
})
