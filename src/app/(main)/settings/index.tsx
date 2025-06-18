import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  User,
  ShieldCheck,
  LogOut,
  Bell,
  Moon,
  Volume2,
  Globe2,
  Eye,
  HelpCircle,
  ChevronRight,
  Lock
} from 'lucide-react-native'
import { Colors } from '@constants/Colors'
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions'
import { useRouter } from 'expo-router'
import { AppDispatch, RootState } from '@store/store'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '@features/auth/authActions'
import Constants from 'expo-constants'
import { useProtectedRoute } from '@hooks/useProtectedRoute'
import { ScreenHeader } from '@components/common/ScreenHeader'

interface SettingSectionProps {
  title: string
  children: React.ReactNode
}
const SettingSection: React.FC<SettingSectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
)

interface SettingItemProps {
  icon: React.ReactNode
  title: string
  description?: string
  rightElement?: React.ReactNode
  showChevron?: boolean
  onPress?: () => void
  itemTextColor?: string
}
const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  description,
  rightElement,
  showChevron = false,
  onPress,
  itemTextColor
}) => (
  <TouchableOpacity
    style={styles.settingItem}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={styles.settingItemLeft}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.settingTextContainer}>
        <Text
          style={[
            styles.settingTitle,
            itemTextColor ? { color: itemTextColor } : {}
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {description && (
          <Text style={styles.settingDescription} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>
    </View>
    {(rightElement || showChevron) && (
      <View style={styles.settingItemRight}>
        {rightElement}
        {showChevron && !rightElement && (
          <ChevronRight size={18} color={Colors.light.textTertiary} />
        )}
      </View>
    )}
  </TouchableOpacity>
)

export default function SettingsScreen(): React.ReactElement | null {
  const { isLoading: isAuthLoading, isAuthenticated } = useProtectedRoute()
  const { isDesktop } = useResponsiveDimensions()
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [soundEffects, setSoundEffects] = useState(true)

  const fontSizes = ['Small', 'Medium', 'Large']
  const [fontSizeIndex, setFontSizeIndex] = useState(1)

  const languages = [
    { id: 'fi', name: 'Finnish' },
    { id: 'en', name: 'English' }
  ]
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0])

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => dispatch(logoutUser())
      }
    ])
  }

  if (isAuthLoading) {
    return (
      <View style={styles.fullScreenLoader}>
        <ScreenHeader title="Settings" fallbackPath="/(main)/(tabs)/profile" />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </View>
    )
  }
  if (!isAuthenticated) return null

  return (
    <View style={styles.container}>
      <ScreenHeader title="Settings" fallbackPath="/(main)/(tabs)/profile" />
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          isDesktop && styles.wideScreenContent,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <SettingSection title="Account">
          <SettingItem
            icon={<User size={20} color={Colors.light.primary} />}
            title="Profile Information"
            description="Edit your personal details"
            showChevron
            onPress={() => router.push('/(main)/settings/profile-info')}
          />
          <SettingItem
            icon={<ShieldCheck size={20} color={Colors.light.accentGreen} />}
            title="Change Password"
            description="Update your account password"
            showChevron
            onPress={() => router.push('/(main)/settings/change-password')}
          />
          <SettingItem
            icon={<Lock size={20} color={Colors.light.textSecondary} />}
            title="Privacy Settings"
            description="Manage your data preferences"
            showChevron
            onPress={() => {
              Alert.alert('Navigate', 'Privacy Settings (Not Implemented)')
            }}
          />
        </SettingSection>

        <SettingSection title="Preferences">
          <SettingItem
            icon={<Bell size={20} color={Colors.light.warning} />}
            title="Notifications"
            description="Reminders and achievements"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{
                  false: Colors.light.border,
                  true: Colors.light.primary
                }}
                thumbColor={
                  notifications
                    ? Colors.light.primaryLight
                    : Colors.light.borderSubtle
                }
                ios_backgroundColor={Colors.light.border}
              />
            }
          />
          <SettingItem
            icon={<Moon size={20} color={Colors.light.textSecondary} />}
            title="Dark Mode"
            description="Toggle theme (not implemented)"
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{
                  false: Colors.light.border,
                  true: Colors.light.primary
                }}
                thumbColor={
                  darkMode
                    ? Colors.light.primaryLight
                    : Colors.light.borderSubtle
                }
                ios_backgroundColor={Colors.light.border}
              />
            }
          />
          <SettingItem
            icon={<Volume2 size={20} color={Colors.light.accentOrange} />}
            title="Sound Effects"
            description="Toggle in-app sounds"
            rightElement={
              <Switch
                value={soundEffects}
                onValueChange={setSoundEffects}
                trackColor={{
                  false: Colors.light.border,
                  true: Colors.light.primary
                }}
                thumbColor={
                  soundEffects
                    ? Colors.light.primaryLight
                    : Colors.light.borderSubtle
                }
                ios_backgroundColor={Colors.light.border}
              />
            }
          />
        </SettingSection>

        <SettingSection title="Content & Display">
          <SettingItem
            icon={<Globe2 size={20} color={Colors.light.accentGreen} />}
            title="App Language"
            description={selectedLanguage.name}
            showChevron
            onPress={() => {
              Alert.alert(
                'Select Language',
                'Language selection (Not Implemented)'
              )
            }}
          />
          <SettingItem
            icon={<Eye size={20} color={Colors.light.secondary} />}
            title="Font Size"
            description={fontSizes[fontSizeIndex]}
            showChevron
            onPress={() => {
              Alert.alert(
                'Adjust Font Size',
                'Font size adjustment (Not Implemented)'
              )
            }}
          />
        </SettingSection>

        <SettingSection title="Support & Info">
          <SettingItem
            icon={<HelpCircle size={20} color={Colors.light.info} />}
            title="Help Center"
            description="FAQs and support"
            showChevron
            onPress={() => {
              Alert.alert('Navigate', 'Help Center (Not Implemented)')
            }}
          />
          <SettingItem
            icon={<LogOut size={20} color={Colors.light.error} />}
            title="Sign Out"
            onPress={handleLogout}
            itemTextColor={Colors.light.error}
          />
        </SettingSection>

        <View style={styles.footer}>
          <Text style={styles.versionText}>
            Kielo.app v{Constants.expoConfig?.version || '1.0.0'}
          </Text>
          <Text style={styles.copyrightText}>
            © {new Date().getFullYear()}. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.backgroundSecondary },
  fullScreenLoader: { flex: 1, backgroundColor: Colors.light.background },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contentContainer: {
    padding: 20
  },
  wideScreenContent: {
    maxWidth: 640,
    alignSelf: 'center',
    width: '100%'
  },
  section: {
    marginBottom: 28
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: Colors.light.textSecondary,
    marginBottom: 10,
    paddingHorizontal: 8,
    textTransform: 'uppercase'
  },
  sectionContent: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.cardBackground,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.borderSubtle
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  settingTextContainer: {
    flex: 1
  },
  settingTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.light.text
  },
  settingDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingBottom: 10
  },
  versionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: Colors.light.textTertiary,
    marginBottom: 4
  },
  copyrightText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.light.textTertiary
  }
})
