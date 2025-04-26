import { Tabs, Slot, useRouter } from 'expo-router'
import { StyleSheet, Platform } from 'react-native'
import { Colors } from '@constants/Colors'
import { navItems } from '@constants/navigation'
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '@/features/auth/authSelectors'
import { useRequireAuthAction } from '@/hooks/useRequireAuthAction'

export default function TabLayout() {
  const router = useRouter()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const { isDesktop } = useResponsiveDimensions()

  if (isDesktop) {
    return <Slot />
  }

  const navigateToProfile = useRequireAuthAction(() => {
    router.push('/(main)/(tabs)/profile')
  }, 'Login to view your profile.')

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false
      }}
    >
      {navItems
        .map(item => {
          if (!item.targetSegment) return null
          if (!item.isTabItem) return null

          const Icon = item.icon
          return (
            <Tabs.Screen
              key={item.name}
              name={item.targetSegment}
              options={{
                title: item.name,
                tabBarIcon: ({ color, size }) => (
                  <Icon size={size} color={color} />
                )
              }}
              listeners={
                item.protected
                  ? {
                      tabPress: e => {
                        if (!isAuthenticated) {
                          e.preventDefault()
                          if (item.targetSegment === 'profile') {
                            navigateToProfile()
                          } else {
                            router.push(
                              `/(auth)/login?redirect=${encodeURIComponent(
                                item.path
                              )}`
                            )
                          }
                        }
                      }
                    }
                  : undefined
              }
            />
          )
        })
        .filter(Boolean)}
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 7,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    height: Platform.OS === 'ios' ? 88 : 65
  },
  tabBarLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    marginBottom: Platform.OS === 'android' ? 2 : 0
  }
})
