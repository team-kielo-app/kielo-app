// app/_layout.tsx

import React, { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { Provider, connect } from "react-redux"; // Import connect
import { bindActionCreators } from "redux";
import { ActivityIndicator, View, StyleSheet, Text } from "react-native";

// Import store, actions, selectors
import { store, AppDispatch, RootState } from "@store/store";
import * as authActions from "@features/auth/authActions";
import * as authSelectors from "@features/auth/authSelectors";
import { AuthState } from "@features/auth/types";
import { initializeDeviceToken } from "@lib/api";
import { Colors } from "@constants/Colors";

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

