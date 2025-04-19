import { Tabs } from "expo-router";
import { StyleSheet, Platform } from "react-native";
import { Home, Book, User, BicepsFlexed } from "lucide-react-native";
import { Colors } from "@constants/Colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reader"
        options={{
          title: "Reader",
          tabBarIcon: ({ color, size }) => <Book size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: "Practice",
          tabBarIcon: ({ color, size }) => (
            <BicepsFlexed size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 7,
    paddingBottom: 8,
    height: Platform.OS === "ios" ? 78 : 65,
  },
  tabBarLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
  },
});

