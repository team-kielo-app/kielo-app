import React, { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store, AppDispatch, RootState } from "../src/store/store";
import {
  initializeAuth,
  selectIsAuthenticated,
  selectAuthStatus,
} from "../src/features/auth/authSlice";
import { ActivityIndicator, View, StyleSheet, Platform } from "react-native";

// Main layout component wrapped with Redux Provider
function RootLayoutNav() {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authStatus = useSelector(selectAuthStatus);
  const segments = useSegments(); // Gets the current route segments
  const router = useRouter();

  useEffect(() => {
    // Initialize auth state from cookie/storage on initial load
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    // Wait until initialization attempt is complete ('idle', 'succeeded', 'failed')
    // before redirecting. Avoid redirecting during 'loading' or initial 'idle'.
    if (authStatus === "idle" && !isAuthenticated) {
      // Still initializing or initialization determined no valid token
      // Redirect to login if not already in auth group
      if (!inAuthGroup) {
        console.log("RootLayout: Not authenticated, redirecting to login");
        router.replace("/(auth)/login");
      }
      return; // Don't proceed further while potentially initializing or if correctly in auth group
    }

    if (authStatus === "loading") {
      // Still checking token/loading user data
      console.log("RootLayout: Auth status is loading...");
      return; // Don't redirect while loading
    }

    // --- Redirect logic after initialization attempt ---

    if (isAuthenticated && inAuthGroup) {
      // User is authenticated but somehow ended up in the auth flow (e.g. pressed back)
      console.log("RootLayout: Authenticated, redirecting to app index");
      router.replace("/(app)"); // Redirect to the main app screen
    } else if (!isAuthenticated && !inAuthGroup && authStatus !== "loading") {
      // User is not authenticated and not in the auth flow
      console.log("RootLayout: Not authenticated, redirecting to login");
      router.replace("/(auth)/login"); // Redirect to login
    } else {
      console.log("RootLayout: Auth state checked, no redirect needed.", {
        isAuthenticated,
        authStatus,
        inAuthGroup,
      });
    }
  }, [isAuthenticated, authStatus, segments, router]);

  // Show loading indicator while auth state is being determined initially
  if (authStatus === "loading") {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Render the current route using Slot
  return <Slot />;
}

// Export the component wrapped in the Redux Provider
export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
