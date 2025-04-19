// app/_layout.tsx

import React, { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { Provider, connect } from "react-redux"; // Import connect
import { bindActionCreators } from "redux";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Text,
  Platform,
} from "react-native";

// Import store, actions, selectors
import { store, AppDispatch, RootState } from "@store/store";
import * as authActions from "@features/auth/authActions";
import * as authSelectors from "@features/auth/authSelectors";
import { AuthState } from "@features/auth/types";
import { initializeDeviceToken } from "@lib/api";
import { Colors } from "@constants/Colors";

import * as Device from "expo-device";
import * as ScreenOrientation from "expo-screen-orientation";

const SplashScreen = () => (
  <View style={styles.splashContainer}>
    <ActivityIndicator size="large" color={Colors.light.tint} />
    <Text style={styles.splashText}>Loading Kielo...</Text>
  </View>
);

// --- Presentational Component (RootLayoutView) ---
interface RootLayoutViewProps {
  isAuthenticated: boolean;
  authStatus: AuthState["status"];
  actions: {
    // Bound actions
    initializeAuthThunk: typeof authActions.initializeAuthThunk;
    // No need for logout action here, it's handled by the button in (app)/_layout.tsx usually
  };
}

const RootLayoutView: React.FC<RootLayoutViewProps> = ({
  isAuthenticated,
  authStatus,
  actions,
}) => {
  const segments = useSegments();
  const router = useRouter();

  // Effect for initialization (remains the same)
  useEffect(() => {
    initializeDeviceToken();
    actions.initializeAuthThunk();
  }, [actions]);

  useEffect(() => {
    const lockOrientationForTablet = async () => {
      // Only apply this logic on native platforms (iOS/Android)
      if (Platform.OS === "ios" || Platform.OS === "android") {
        try {
          const deviceType = await Device.getDeviceTypeAsync();

          if (deviceType === Device.DeviceType.TABLET) {
            console.log("Device is a Tablet, locking to landscape.");
            // Lock to landscape (allows both left and right)
            await ScreenOrientation.lockAsync(
              ScreenOrientation.OrientationLock.LANDSCAPE
            );
            // Or lock to ALL landscape modes including upside-down if desired:
            // await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.ALL_BUT_UPSIDE_DOWN);
            // Or specific landscape:
            // await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
          } else {
            console.log(
              "Device is not a Tablet, allowing default orientation (likely portrait)."
            );
            // Optional: Explicitly lock phones to portrait if "default" isn't reliable enough
            // await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);

            // Or just ensure it's unlocked if previously locked (less likely needed here)
            // await ScreenOrientation.unlockAsync();
          }
        } catch (error) {
          console.error("Failed to set screen orientation:", error);
        }
      }
    };

    lockOrientationForTablet();

    // Optional: Cleanup function if needed (not strictly necessary for a one-time lock)
    // return () => {
    //   if (Platform.OS === 'ios' || Platform.OS === 'android') {
    //      ScreenOrientation.unlockAsync().catch(e => console.error("Failed to unlock orientation", e));
    //   }
    // };
  }, []);

  // Effect for redirection logic (UPDATED)
  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    // --- IMPORTANT: Only check redirection AFTER loading/initialization is complete ---
    // The component will re-render when status changes, ensuring <Slot /> is mounted by then.
    if (authStatus === "succeeded" || authStatus === "failed") {
      console.log(
        `RootLayout: Init complete. Checking redirection. Status: ${authStatus}, Auth: ${isAuthenticated}, InAuthGroup: ${inAuthGroup}`
      );

      // Scenario 1: User is authenticated, but in the auth flow (e.g., pressed back) -> redirect to app
      if (isAuthenticated && inAuthGroup) {
        // isAuthenticated can only be true if status is 'succeeded'
        console.log("RootLayout: --> Redirecting to /app");
        router.replace("/(app)");
      }
      // Scenario 2: User is NOT authenticated, and NOT in the auth flow -> redirect to login
      else if (!isAuthenticated && !inAuthGroup) {
        // Covers both failed init and init success with no session
        console.log("RootLayout: --> Redirecting to /login");
        router.replace("/(auth)/login");
      } else {
        console.log("RootLayout: No redirect needed based on current state.");
      }
    } else {
      // Still initializing ('idle' or 'loading') - Splash screen is shown, do nothing here.
      console.log(
        `RootLayout: Still initializing or idle. Status: ${authStatus}`
      );
    }
  }, [isAuthenticated, authStatus, segments, router]); // Dependencies remain the same

  // --- RENDER LOGIC ---
  // Show splash screen if status is initial 'idle' or 'loading'
  if (authStatus === "idle" || authStatus === "loading") {
    console.log("RootLayout: Rendering SplashScreen");
    return <SplashScreen />;
  }

  // Once loading is done ('succeeded' or 'failed'), render the actual route content via Slot
  console.log("RootLayout: Rendering Slot");
  return <Slot />;
};

// --- Container Component (RootLayoutNav - Remains the same) ---
const mapStateToProps = (state: RootState) => ({
  isAuthenticated: authSelectors.selectIsAuthenticated(state),
  authStatus: authSelectors.selectAuthStatus(state),
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  actions: bindActionCreators(
    { initializeAuthThunk: authActions.initializeAuthThunk },
    dispatch
  ),
});

const RootLayoutNav = connect(
  mapStateToProps,
  mapDispatchToProps
)(RootLayoutView);

// --- Final Export (Remains the same) ---
export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}

// Updated styles to include splash screen styling
const styles = StyleSheet.create({
  splashContainer: {
    // Renamed from loadingContainer
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF", // Or your app's background
  },
  splashText: {
    marginTop: 15,
    fontSize: 16,
    color: Colors.light.text, // Use theme color
  },
});

