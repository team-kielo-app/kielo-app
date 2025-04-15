// app/(app)/_layout.tsx

import React from "react";
import { Stack, useRouter } from "expo-router"; // Keep router hooks
import { Text, StyleSheet, Pressable } from "react-native";
import { connect } from "react-redux"; // Import connect
import { bindActionCreators } from "redux";

// Import actions
import * as authActions from "@features/auth/authActions";
import { AppDispatch } from "@store/store"; // No state needed here
import { Colors } from "@constants/Colors";

// --- Presentational Component (AppLayoutView) ---
interface AppLayoutViewProps {
  actions: {
    // Bound actions
    logoutUser: typeof authActions.logoutUser;
  };
  // Router can be obtained via hook inside
}

const AppLayoutView: React.FC<AppLayoutViewProps> = ({ actions }) => {
  // Keep router hook inside the functional component
  const router = useRouter();

  const handleLogout = () => {
    // Call the bound logoutUser action directly
    actions.logoutUser();
    // No need to manually route, RootLayoutNav's effect will handle redirection
    // router.replace('/(auth)/login');
  };

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Kielo News Feed",
          headerRight: () => (
            <Pressable onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          ),
          headerStyle: { backgroundColor: Colors.light.tint },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="article/[id]"
        options={{
          title: "Article", // Dynamic title set in the screen component itself
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: Colors.light.tint },
          headerTintColor: "#fff",
        }}
      />
    </Stack>
  );
};

// --- Container Component (AppLayout - Default Export) ---

// No state needed from Redux for this layout
const mapStateToProps = null; // Or () => ({})

// Map only the logoutUser action
const mapDispatchToProps = (dispatch: AppDispatch) => ({
  actions: bindActionCreators(
    {
      logoutUser: authActions.logoutUser,
    },
    dispatch
  ),
});

// Connect the AppLayoutView
export default connect(mapStateToProps, mapDispatchToProps)(AppLayoutView);

// Styles remain the same...
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

