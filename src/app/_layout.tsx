import React, { useEffect, useCallback, useMemo } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { Provider, useSelector, useDispatch } from "react-redux";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Text,
  Platform,
} from "react-native";

// Import store, actions, selectors
import { store } from "@store/store";
import { initializeAuthThunk } from "@features/auth/authActions";
import {
  selectIsAuthenticated,
  selectAuthStatus,
} from "@features/auth/authSelectors";
import { initializeDeviceToken } from "@lib/api";
import { Colors } from "@constants/Colors";

import { getDeviceTypeAsync, DeviceType } from "expo-device";
import { lockAsync, OrientationLock } from "expo-screen-orientation";

// Extracted for reusability and to avoid recreation on each render
const SplashScreen = React.memo(() => (
  <View style={styles.splashContainer}>
    <ActivityIndicator size="large" color={Colors.light.tint} />
    <Text style={styles.splashText}>Loading Kielo...</Text>
  </View>
));

// Extracted orientation logic into a separate hook
const useDeviceOrientation = () => {
  useEffect(() => {
    const lockOrientationForTablet = async () => {
      // Only apply on native platforms
      if (Platform.OS !== "ios" && Platform.OS !== "android") return;

      try {
        const deviceType = await getDeviceTypeAsync();

        if (deviceType === DeviceType.TABLET) {
          await lockAsync(OrientationLock.LANDSCAPE);
        } else {
          await lockAsync(OrientationLock.PORTRAIT_UP);
        }
      } catch (error) {
        console.error("Failed to set screen orientation:", error);
      }
    };

    lockOrientationForTablet();
  }, []);
};

// The main layout component with hooks instead of connect HOC
const RootLayoutView = () => {
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useDispatch();

  // Selectors with useSelector for better performance
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authStatus = useSelector(selectAuthStatus);

  // Handle device orientation
  useDeviceOrientation();

  // Initialize auth only once
  useEffect(() => {
    initializeDeviceToken();
    dispatch(initializeAuthThunk());
  }, [dispatch]);

  // Memoized check for auth group to prevent recalculations
  const inAuthGroup = useMemo(() => segments[0] === "(auth)", [segments]);

  // Handle navigation logic - memoize the function
  const handleNavigation = useCallback(() => {
    // Only check redirection after loading is complete
    if (authStatus !== "succeeded" && authStatus !== "failed") return;

    if (isAuthenticated && inAuthGroup) {
      router.replace("/(app)");
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, authStatus, inAuthGroup, router]);

  // Call navigation logic when dependencies change
  useEffect(() => {
    handleNavigation();
  }, [handleNavigation]);

  return (
    <View style={{ flex: 1 }}>
      <Slot />
      {(authStatus === "idle" || authStatus === "loading") && (
        <View style={StyleSheet.absoluteFill}>
          <SplashScreen />
        </View>
      )}
    </View>
  );
};

// Final export component with Redux Provider
export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutView />
    </Provider>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  splashText: {
    marginTop: 15,
    fontSize: 16,
    color: Colors.light.text,
  },
});

