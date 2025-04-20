import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  User,
  Shield,
  LogOut,
  Bell,
  Moon,
  VolumeX,
  Globe,
  Eye,
  HelpCircle,
  ChevronRight
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

// --- Reusable Internal Components (Filled from original file) ---
type SettingSectionProps = { title: string; children: React.ReactNode }
const SettingSection: React.FC<SettingSectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
)

type SettingItemProps = {
  icon: React.ReactNode
  title: string
  description?: string
  rightElement?: React.ReactNode
  showChevron?: boolean
  onPress?: () => void
}
const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  description,
  rightElement,
  showChevron = false,
  onPress
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
        <Text style={styles.settingTitle} numberOfLines={1}>
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
        {showChevron && (
          <ChevronRight size={18} color={Colors.light.textSecondary} />
        )}
      </View>
    )}
  </TouchableOpacity>
)
// -------------------------------------------------------------------------

export default function SettingsScreen() {
  const { isLoading: isAuthLoading, isAuthenticated } = useProtectedRoute()
  const { isDesktop } = useResponsiveDimensions()
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [soundEffects, setSoundEffects] = useState(true)
  const [fontSizeIndex, setFontSizeIndex] = useState(1)
  const fontSizes = ['Small', 'Medium', 'Large']
  const languages = [
    { id: 'fi', name: 'Finnish' },
    { id: 'sv', name: 'Swedish' } /* ... more langs */
  ]
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0])

  const handleLogout = () => {
    dispatch(logoutUser())
  }

  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ScreenHeader title="Settings" />
        <ActivityIndicator
          style={{ flex: 1 }}
          size="large"
          color={Colors.light.primary}
        />
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
          isDesktop && styles.wideScreenContent
        ]}
        // showsVerticalScrollIndicator={false}
      >
        <SettingSection title="Account">
          <SettingItem
            icon={<User size={20} color={Colors.light.primary} />}
            title="Profile Information"
            description="Edit your personal information"
            showChevron
            onPress={() => router.push('/(main)/settings/profile-info')}
          />
          <SettingItem
            icon={<Shield size={20} color={Colors.light.success} />}
            title="Change Password"
            description="Update your account password"
            showChevron
            onPress={() => router.push('/(main)/settings/change-password')}
          />
          <SettingItem
            icon={<Shield size={20} color={Colors.light.primary} />}
            title="Privacy Settings"
            description="Manage your data privacy preferences"
            showChevron
            onPress={() => {
              alert('Navigate to Privacy (Not Implemented)')
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
                thumbColor={Colors.light.white}
                {...Platform.select({
                  web: { activeThumbColor: Colors.light.white }
                })}
              />
            }
          />
          <SettingItem
            icon={<Moon size={20} color={Colors.light.textSecondary} />}
            title="Dark Mode"
            description="Switch themes (not implemented)"
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{
                  false: Colors.light.border,
                  true: Colors.light.primary
                }}
                thumbColor={Colors.light.white}
                {...Platform.select({
                  web: { activeThumbColor: Colors.light.white }
                })}
              />
            }
          />
          <SettingItem
            icon={<VolumeX size={20} color={Colors.light.accent} />}
            title="Sound Effects"
            description="Toggle sound effects"
            rightElement={
              <Switch
                value={soundEffects}
                onValueChange={setSoundEffects}
                trackColor={{
                  false: Colors.light.border,
                  true: Colors.light.primary
                }}
                thumbColor={Colors.light.white}
                {...Platform.select({
                  web: { activeThumbColor: Colors.light.white }
                })}
              />
            }
          />
        </SettingSection>

        <SettingSection title="Content">
          <SettingItem
            icon={<Globe size={20} color={Colors.light.success} />}
            title="Target Language"
            description={selectedLanguage.name}
            showChevron
            onPress={() => {
              alert('Select Language (Not Implemented)')
            }}
          />
          <SettingItem
            icon={<Eye size={20} color={Colors.light.accent} />}
            title="Font Size"
            description="Adjust text size"
            rightElement={
              <View style={styles.fontSizeSelector}>
                {fontSizes.map((size, index) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.fontSizeButton,
                      fontSizeIndex === index && styles.fontSizeButtonActive
                    ]}
                    onPress={() => setFontSizeIndex(index)}
                  >
                    <Text
                      style={[
                        styles.fontSizeButtonText,
                        fontSizeIndex === index &&
                          styles.fontSizeButtonTextActive
                      ]}
                    >
                      {' '}
                      {size}{' '}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            }
          />
        </SettingSection>

        <SettingSection title="Support">
          <SettingItem
            icon={<HelpCircle size={20} color={Colors.light.info} />}
            title="Help Center"
            description="Frequently asked questions"
            showChevron
            onPress={() => {
              alert('Navigate to Help Center (Not Implemented)')
            }}
          />
          <SettingItem
            icon={<LogOut size={20} color={Colors.light.error} />}
            title="Sign Out"
            onPress={handleLogout}
          />
        </SettingSection>

        <View style={styles.footer}>
          <Text style={styles.versionText}>
            {' '}
            Kielo.app v{Constants.expoConfig?.version}
          </Text>
          <Text style={styles.copyrightText}>© 2025. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  )
}

// Styles filled from original file
const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: Colors.light.background },
  container: { flex: 1, backgroundColor: Colors.light.background },
  // header: { // Removed as ScreenHeader is used
  //   flexDirection: "row",
  //   alignItems: "center",
  //   paddingHorizontal: 16,
  //   paddingVertical: Platform.OS === "ios" ? 12 : 16,
  // },
  // backButton: { // Removed as ScreenHeader handles back
  //   padding: 8,
  //   zIndex: 1,
  // },
  // headerTitle: { // Removed as ScreenHeader handles title
  //   fontFamily: "Inter-Bold",
  //   fontSize: 24,
  //   color: Colors.light.text,
  // },
  contentContainer: {
    padding: 20,
    paddingBottom: 40
  },
  wideScreenContent: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%'
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 12,
    paddingHorizontal: 4 // Add slight horizontal padding for title
  },
  sectionContent: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    overflow: 'hidden', // Important for borderRadius on children
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: Platform.OS === 'android' ? 0 : 1, // Add subtle border on iOS/Web
    borderColor: Colors.light.border
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    width: '100%',
    backgroundColor: Colors.light.cardBackground // Ensure background color
    // Remove border from last item - handled via overflow: hidden on parent now
    // '&:last-child': {
    //     borderBottomWidth: 0,
    // }
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: 8
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  settingTextContainer: {
    flex: 1 // Allow text to take available space
  },
  settingTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: Colors.light.text
  },
  settingDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 3
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto', // Push to the right
    gap: 8 // Space between element and chevron
  },
  fontSizeSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.light.backgroundLight,
    borderRadius: 8,
    padding: 2,
    borderWidth: 1, // Add subtle border
    borderColor: Colors.light.border
  },
  fontSizeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6
  },
  fontSizeButtonActive: {
    backgroundColor: Colors.light.primary,
    shadowColor: Colors.light.primary, // Add shadow to active button
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2
  },
  fontSizeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.light.textSecondary
  },
  fontSizeButtonTextActive: {
    color: Colors.light.white
  },
  footer: {
    alignItems: 'center',
    marginTop: 30
  },
  versionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4
  },
  copyrightText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.light.textTertiary
  }
})
