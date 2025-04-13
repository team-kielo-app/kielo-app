import React from "react";
import { Stack, useRouter } from "expo-router";
import {
  Button,
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
} from "react-native";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../src/store/store";
import { logoutUser } from "../../src/features/auth/authSlice";
import Colors from "../../src/constants/Colors"; // Assuming you have Colors defined

export default function AppLayout() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logoutUser());
    // Root layout redirection logic will handle moving to login
    // Optionally force redirect if needed: router.replace('/(auth)/login');
  };

  return (
    <Stack>
      <Stack.Screen
        name="index" // Corresponds to (app)/index.tsx
        options={{
          title: "Kielo News Feed",
          headerRight: () => (
            <Pressable onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          ),
          headerStyle: { backgroundColor: Colors.light.tint }, // Example color
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="article/[id]" // Corresponds to (app)/article/[id].tsx
        options={{
          title: "Article", // Title can be set dynamically later
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: Colors.light.tint },
          headerTintColor: "#fff",
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: Colors.light.tabIconDefault, // Example color
    borderRadius: 5,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

// Define Colors in src/constants/Colors.ts
// Example:
// const tintColorLight = '#2f95dc';
// export default {
//   light: {
//     text: '#000',
//     background: '#fff',
//     tint: tintColorLight,
//     tabIconDefault: '#ccc',
//     tabIconSelected: tintColorLight,
//   },
//   // Add dark mode colors if needed
// };
