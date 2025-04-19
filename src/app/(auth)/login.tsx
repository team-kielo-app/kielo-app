// app/(auth)/login.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { FontAwesome } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

// Import actions, selectors, types from the refactored structure
import * as authActions from "@features/auth/authActions";
import * as authSelectors from "@features/auth/authSelectors";
import { AuthState } from "@features/auth/types"; // Assuming Status is part of AuthState now
import { AppDispatch, RootState } from "@store/store";
import { Colors } from "@constants/Colors";

// Required if using expo-auth-session for web redirects
WebBrowser.maybeCompleteAuthSession();

// --- Presentational Component (LoginView) ---
interface LoginViewProps {
  status: AuthState["status"];
  error: string | null;
  actions: {
    // Bound actions
    loginUserThunk: typeof authActions.loginUserThunk;
    loginWithSocialThunk: typeof authActions.loginWithSocialThunk;
    clearAuthError: typeof authActions.clearAuthError;
  };
  // Add any other props needed from container or router
}

const LoginView: React.FC<LoginViewProps> = ({ status, error, actions }) => {
  const [email, setEmail] = useState("test@kielo.app"); // Local state for form
  const [password, setPassword] = useState("password"); // Local state for form
  const isLoading = status === "loading";

  // --- Google Sign-In Hook ---
  const [googleRequest, googleResponse, promptAsyncGoogle] =
    Google.useAuthRequest({
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });

  // Effect to handle Google sign-in response
  useEffect(() => {
    if (googleResponse?.type === "success") {
      const { authentication } = googleResponse;
      console.log(googleResponse);
      if (authentication?.accessToken) {
        console.log("Google Login Success, dispatching action...");
        console.log(authentication);
        actions.loginWithSocialThunk({
          provider: "google",
          access_token: authentication.accessToken,
        });
      } else {
        console.error("Google Auth Success but no accessToken", googleResponse);
        Alert.alert(
          "Login Error",
          "Could not get authentication details from Google."
        );
      }
    } else if (googleResponse?.type === "error") {
      console.error("Google Auth Error:", googleResponse.error);
      Alert.alert(
        "Login Error",
        "Google authentication failed. Please try again."
      );
    }
  }, [googleResponse, actions]); // Depend on actions object

  // Effect to clear error on mount or when inputs change
  useEffect(() => {
    actions.clearAuthError();
  }, [actions, email, password]); // Depend on actions object

  // --- Event Handlers ---
  const handleLoginSubmit = () => {
    if (!email || !password) {
      Alert.alert("Validation Error", "Please enter both email and password.");
      return;
    }
    // Call bound action directly
    actions.loginUserThunk({ email, password });
  };

  const handleGoogleLoginPress = () => {
    if (!isLoading && googleRequest) {
      promptAsyncGoogle();
    }
  };

  const handleAppleLoginPress = () => {
    Alert.alert("Not Implemented", "Apple login needs implementation.");
    // Add native Apple login logic here if needed, calling actions.loginWithSocialThunk
  };

  const handleTwitterLoginPress = () => {
    Alert.alert("Not Implemented", "X/Twitter login needs implementation.");
    // Add Twitter login logic here if needed, calling actions.loginWithSocialThunk
  };

  // --- Render ---
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kielo Login</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput
        style={[styles.input, isLoading && styles.inputDisabled]}
        placeholder="Email (use test@kielo.app)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#888"
        editable={!isLoading}
      />
      <TextInput
        style={[styles.input, isLoading && styles.inputDisabled]}
        placeholder="Password (any for mock)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
        editable={!isLoading}
      />

      <Pressable
        style={({ pressed }) => [
          styles.button,
          isLoading && styles.buttonDisabled,
          pressed && !isLoading && styles.buttonPressed,
        ]}
        onPress={handleLoginSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </Pressable>

      <Text style={styles.orText}>OR</Text>

      {/* Social Buttons */}
      <Pressable
        style={({ pressed }) => [
          styles.socialButton,
          styles.googleButton,
          (!googleRequest || isLoading) && styles.buttonDisabled,
          pressed && !isLoading && styles.buttonPressedGoogle,
        ]}
        onPress={handleGoogleLoginPress}
        disabled={!googleRequest || isLoading}
      >
        <FontAwesome
          name="google"
          size={20}
          color="white"
          style={styles.socialIcon}
        />
        <Text style={styles.socialButtonText}>Sign in with Google</Text>
      </Pressable>

      <Pressable
        style={[
          styles.socialButton,
          styles.appleButton,
          isLoading && styles.buttonDisabled,
        ]}
        onPress={handleAppleLoginPress}
        disabled={isLoading}
      >
        <FontAwesome
          name="apple"
          size={20}
          color="white"
          style={styles.socialIcon}
        />
        <Text style={styles.socialButtonText}>Sign in with Apple</Text>
      </Pressable>

      <Pressable
        style={[
          styles.socialButton,
          styles.twitterButton,
          isLoading && styles.buttonDisabled,
        ]}
        onPress={handleTwitterLoginPress}
        disabled={isLoading}
      >
        <FontAwesome
          name="twitter"
          size={20}
          color="white"
          style={styles.socialIcon}
        />
        <Text style={styles.socialButtonText}>Sign in with X</Text>
      </Pressable>

      {/* Register Link Placeholder */}
    </View>
  );
};

// --- Container Component (LoginScreen - Default Export) ---

const mapStateToProps = (state: RootState) => ({
  status: authSelectors.selectAuthStatus(state),
  error: authSelectors.selectAuthError(state),
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  actions: bindActionCreators(
    {
      // Actions needed by LoginView
      loginUserThunk: authActions.loginUserThunk,
      loginWithSocialThunk: authActions.loginWithSocialThunk,
      clearAuthError: authActions.clearAuthError,
    },
    dispatch
  ),
});

// Connect the LoginView component
export default connect(mapStateToProps, mapDispatchToProps)(LoginView);

// Styles remain the same...
const styles = StyleSheet.create({
  // ... Paste existing styles from previous LoginScreen here ...
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.light.background,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: Colors.light.text,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: Colors.light.border,
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#fff",
    color: Colors.light.text,
  },
  inputDisabled: { backgroundColor: "#eee" },
  button: {
    width: "100%",
    height: 50,
    paddingVertical: 15,
    backgroundColor: Colors.light.textTertiary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonPressed: { backgroundColor: "#0056b3" },
  buttonDisabled: {
    backgroundColor: Colors.light.border,
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: Colors.light.error,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
  },
  orText: { marginVertical: 20, color: "#888", fontWeight: "bold" },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
    height: 50,
  },
  socialIcon: { marginRight: 10 },
  socialButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  googleButton: { backgroundColor: "#DB4437" },
  buttonPressedGoogle: { backgroundColor: "#c33d2e" },
  appleButton: { backgroundColor: "#000000" },
  twitterButton: { backgroundColor: "#1DA1F2" },
});

