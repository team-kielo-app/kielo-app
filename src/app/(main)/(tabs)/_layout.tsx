import { Tabs, Slot, useRouter } from 'expo-router'
import {
  StyleSheet,
  Platform,
  View,
  Text,
  TouchableOpacity
} from 'react-native'
import { Colors } from '@constants/Colors'
import { navItems } from '@constants/navigation'
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '@/features/auth/authSelectors'
import { useRequireAuthAction } from '@/hooks/useRequireAuthAction'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function TabLayout(): React.ReactElement | null {
  const router = useRouter()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const { isDesktop } = useResponsiveDimensions()
  const insets = useSafeAreaInsets()

  if (isDesktop) {
    return <Slot />
  }

  const navigateToProtectedTab = useRequireAuthAction((path: string) => {
    router.push(path as any)
  }, 'Login to view this section.')

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: Colors.light.tabBarActive,
          tabBarInactiveTintColor: Colors.light.tabBarInactive,
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: [
            styles.tabBarStyleFloating,
            { bottom: Math.max(insets.bottom, TAB_BAR_MARGIN_FROM_SAFE_AREA) }
          ],
          tabBarButton: props => {
            const isFocused = props['aria-selected']
            const item = navItems.find(
              navItem => navItem.targetSegment === route.name
            )

            if (!item) return null

            const IconComponent = item.icon

            return (
              <TouchableOpacity
                {...props}
                style={[props.style, styles.tabBarButton]}
                accessibilityLabel={item.name}
              >
                <View
                  style={[
                    styles.tabIconContainer,
                    isFocused && styles.tabIconContainerActive
                  ]}
                >
                  {IconComponent && (
                    <IconComponent
                      size={22}
                      color={
                        isFocused
                          ? Colors.light.tabBarActive
                          : Colors.light.tabBarInactive
                      }
                      strokeWidth={isFocused ? 2.5 : 2}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.tabBarLabel,
                    isFocused && styles.tabBarLabelActive
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )
          }
        })}
      >
        {navItems
          .filter(item => item.isTabItem && item.targetSegment)
          .map(item => {
            return (
              <Tabs.Screen
                key={item.name}
                name={item.targetSegment!}
                options={{
                  title: item.name
                }}
                listeners={
                  item.protected
                    ? {
                        tabPress: e => {
                          if (!isAuthenticated) {
                            e.preventDefault()
                            navigateToProtectedTab(item.path)
                          }
                        }
                      }
                    : undefined
                }
              />
            )
          })}
      </Tabs>
    </View>
  )
}

const TAB_BAR_HEIGHT = 78
const TAB_BAR_MARGIN_FROM_SAFE_AREA = 15

const styles = StyleSheet.create({
  tabBarStyleFloating: {
    position: 'absolute',
    marginLeft: TAB_BAR_MARGIN_FROM_SAFE_AREA,
    marginRight: TAB_BAR_MARGIN_FROM_SAFE_AREA,
    borderRadius: 24,
    height: TAB_BAR_HEIGHT,
    backgroundColor: Colors.light.tabBarBackground,
    borderTopWidth: 0,
    shadowColor: Colors.light.shadowMedium,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.borderSubtle
  },
  tabBarButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14
  },
  tabIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.tabIconBackgroundInactive,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3
  },
  tabIconContainerActive: {
    backgroundColor: Colors.light.tabIconBackgroundActive
  },
  tabBarLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.light.tabBarInactive,
    textAlign: 'center'
  },
  tabBarLabelActive: {
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.tabBarActive
  }
})
