import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesome } from "@expo/vector-icons";
import { maybeCompleteAuthSession } from "expo-web-browser";
import { useAuthRequest } from "expo-auth-session/providers/google";

import {
  loginUserThunk,
  loginWithSocialThunk,
  clearAuthError,
} from "@features/auth/authActions";
import {
  selectAuthStatus,
  selectAuthError,
} from "@features/auth/authSelectors";
import { AppDispatch } from "@store/store";
import { Colors } from "@constants/Colors";

// Required for expo-auth-session web redirects
maybeCompleteAuthSession();

const LoginView = () => {
  const dispatch = useDispatch<AppDispatch>();

  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isLoading = status === "loading";

  const [googleRequest, googleResponse, promptAsyncGoogle] = useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (
      googleResponse?.type === "success" &&
      googleResponse.authentication?.accessToken
    ) {
      dispatch(
        loginWithSocialThunk({
          provider: "google",
          access_token: googleResponse.authentication.accessToken,
        })
      );
    } else if (googleResponse?.type === "error") {
      console.error("Google Auth Error:", googleResponse.error);
      Alert.alert(
        "Login Error",
        "Google authentication failed. Please try again."
      );
    }
  }, [googleResponse, dispatch]);

  useEffect(() => {
    if (!error) return;
    dispatch(clearAuthError());
  }, [email, password, dispatch]);

  const handleLoginSubmit = useCallback(() => {
    if (!email || !password) {
      Alert.alert("Validation Error", "Please enter both email and password.");
      return;
    }
    dispatch(loginUserThunk({ email, password }));
  }, [email, password, dispatch]);

  const handleGoogleLoginPress = useCallback(() => {
    if (googleRequest) {
      promptAsyncGoogle();
    }
  }, [googleRequest, promptAsyncGoogle]);

  const handleAppleLoginPress = useCallback(() => {
    Alert.alert("Not Implemented", "Apple login needs implementation.");
  }, []);

  const handleTwitterLoginPress = useCallback(() => {
    Alert.alert("Not Implemented", "X/Twitter login needs implementation.");
  }, []);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
  }, []);

  const renderSocialButton = useCallback(
    (
      provider: "google" | "apple" | "twitter",
      label: string,
      onPress: () => void,
      disabled: boolean = false
    ) => {
      const iconName = provider === "twitter" ? "twitter" : provider;
      const buttonStyle = styles[`${provider}Button` as keyof typeof styles];
      const pressedStyle =
        provider === "google" ? styles.buttonPressedGoogle : undefined;

      return (
        <Pressable
          style={({ pressed }) => [
            styles.socialButton,
            buttonStyle,
            disabled && styles.buttonDisabled,
            pressed && !disabled && pressedStyle,
          ]}
          onPress={onPress}
          disabled={disabled}
        >
          <FontAwesome
            name={iconName as any}
            size={20}
            color="white"
            style={styles.socialIcon}
          />
          <Text style={styles.socialButtonText}>{label}</Text>
        </Pressable>
      );
    },
    []
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Kielo!</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput
        style={[styles.input, isLoading && styles.inputDisabled]}
        placeholder="Email"
        value={email}
        onChangeText={handleEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#888"
        editable={!isLoading}
      />
      <TextInput
        style={[styles.input, isLoading && styles.inputDisabled]}
        placeholder="Password"
        value={password}
        onChangeText={handlePasswordChange}
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

      {renderSocialButton(
        "google",
        "Sign in with Google",
        handleGoogleLoginPress,
        !googleRequest || isLoading
      )}

      {renderSocialButton(
        "apple",
        "Sign in with Apple",
        handleAppleLoginPress,
        isLoading
      )}

      {renderSocialButton(
        "twitter",
        "Sign in with X",
        handleTwitterLoginPress,
        isLoading
      )}
    </View>
  );
};

export default LoginView;

const styles = StyleSheet.create({
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

