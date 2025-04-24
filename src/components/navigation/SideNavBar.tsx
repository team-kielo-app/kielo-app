import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native'
import { useSegments, useRouter } from 'expo-router'
import { LogIn, LogOut } from 'lucide-react-native'
import { useSelector, useDispatch } from 'react-redux'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Colors } from '@constants/Colors'
import {
  selectIsAuthenticated,
  selectAuthStatus
} from '@features/auth/authSelectors'
import { logoutUser } from '@features/auth/authActions'
import { useRequireAuthAction } from '@hooks/useRequireAuthAction'
import { navItems } from '@/constants/navigation'
import { AppDispatch } from '@store/store'

export function SideNavBar() {
  const router = useRouter()
  const segments = useSegments()
  const insets = useSafeAreaInsets()
  const dispatch = useDispatch<AppDispatch>()

  const isAuthenticated = useSelector(selectIsAuthenticated)
  const authStatus = useSelector(selectAuthStatus)

  let activeSegmentKey: string | null = null
  if (segments.length > 0 && segments[0] === '(main)') {
    if (segments.length > 1 && segments[1] === '(tabs)') {
      activeSegmentKey = segments[2] || 'index'
    } else if (segments.length > 1) {
      activeSegmentKey = segments.slice(1).join('/')
    }
  }

  const navigateToProtected = useRequireAuthAction((path: string) => {
    router.push(path as any)
  }, 'Login required.')

  const handleLogout = () => {
    dispatch(logoutUser())
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
              navigateToProtected(item.path)
            } else {
              router.push(item.path as any)
            }
          }

          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={handlePress}
              style={[
                styles.navItem,
                isActive && styles.navItemActive,
                item.protected && !isAuthenticated && styles.navItemDisabled
              ]}
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
    marginTop: 'auto',
    paddingTop: 20,
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
