import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  Moon,
  Globe,
  VolumeX,
  Eye,
  LogOut,
  ChevronRight,
  User,
  Shield,
  CircleHelp as HelpCircle,
  ChevronLeft,
} from "lucide-react-native";
import { Colors } from "@constants/Colors";
import { useResponsiveDimensions } from "@/hooks/useResponsiveDimensions";
import { useRouter } from "expo-router";
import { AppDispatch } from "@store/store";
import { useDispatch } from "react-redux";
import { logoutUser } from "@features/auth/authActions";
import Constants from "expo-constants";

type SettingSectionProps = {
  title: string;
  children: React.ReactNode;
};

const SettingSection: React.FC<SettingSectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

type SettingItemProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
};

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  description,
  rightElement,
  showChevron = false,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.settingItem}
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={styles.settingItemLeft}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
    </View>
    <View style={styles.settingItemRight}>
      {rightElement}
      {showChevron && (
        <ChevronRight size={18} color={Colors.light.textSecondary} />
      )}
    </View>
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const { isDesktop } = useResponsiveDimensions();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const [fontSizeIndex, setFontSizeIndex] = useState(1);

  const fontSizes = ["Small", "Medium", "Large"];

  const languages = [
    { id: "fi", name: "Finnish" },
    { id: "sv", name: "Swedish" },
    { id: "no", name: "Norwegian" },
    { id: "da", name: "Danish" },
    { id: "de", name: "German" },
  ];

  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(app)/(tabs)/profile");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          isDesktop && styles.wideScreenContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <SettingSection title="Account">
          <SettingItem
            icon={<User size={20} color={Colors.light.primary} />}
            title="Profile Information"
            description="Edit your personal information"
            showChevron
            onPress={() => {}}
          />
          <SettingItem
            icon={<Shield size={20} color={Colors.light.primary} />}
            title="Privacy Settings"
            description="Manage your data privacy preferences"
            showChevron
            onPress={() => {}}
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
                  true: Colors.light.primary,
                }}
                thumbColor={Colors.light.white}
              />
            }
          />
          <SettingItem
            icon={<Moon size={20} color={Colors.light.textSecondary} />}
            title="Dark Mode"
            description="Switch between light and dark themes"
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{
                  false: Colors.light.border,
                  true: Colors.light.primary,
                }}
                thumbColor={Colors.light.white}
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
                  true: Colors.light.primary,
                }}
                thumbColor={Colors.light.white}
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
            onPress={() => {}}
          />
          <SettingItem
            icon={<Eye size={20} color={Colors.light.accent} />}
            title="Font Size"
            description="Adjust text size for reading"
            rightElement={
              <View style={styles.fontSizeSelector}>
                {fontSizes.map((size, index) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.fontSizeButton,
                      fontSizeIndex === index && styles.fontSizeButtonActive,
                    ]}
                    onPress={() => setFontSizeIndex(index)}
                  >
                    <Text
                      style={[
                        styles.fontSizeButtonText,
                        fontSizeIndex === index &&
                          styles.fontSizeButtonTextActive,
                      ]}
                    >
                      {size}
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
            onPress={() => {}}
          />
          <SettingItem
            icon={<LogOut size={20} color={Colors.light.error} />}
            title="Sign Out"
            onPress={() => dispatch(logoutUser())}
          />
        </SettingSection>

        <View style={styles.footer}>
          <Text style={styles.versionText}>
            Kielo.app v{Constants.expoConfig?.version}
          </Text>
          <Text style={styles.copyrightText}>© 2025. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 16,
  },
  backButton: {
    padding: 8,
    zIndex: 1,
  },
  headerTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 24,
    color: Colors.light.text,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  wideScreenContent: {
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: Colors.light.text,
  },
  settingDescription: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  fontSizeSelector: {
    flexDirection: "row",
    backgroundColor: Colors.light.backgroundLight,
    borderRadius: 8,
    padding: 2,
  },
  fontSizeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  fontSizeButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  fontSizeButtonText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  fontSizeButtonTextActive: {
    color: Colors.light.white,
  },
  footer: {
    alignItems: "center",
    marginTop: 30,
  },
  versionText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  copyrightText: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: Colors.light.textTertiary,
  },
});

