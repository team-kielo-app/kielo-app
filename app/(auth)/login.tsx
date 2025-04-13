import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Pressable,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUser,
  selectAuthStatus,
  selectAuthError,
  clearAuthError,
} from "../../src/features/auth/authSlice";
import { AppDispatch } from "../../src/store/store";
import Colors from "../../src/constants/Colors";

export default function LoginScreen() {
  const [email, setEmail] = useState("test@kielo.app"); // Pre-fill for mock testing
  const [password, setPassword] = useState("password"); // Mock password
  const dispatch = useDispatch<AppDispatch>();
  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);

  // Clear error when component mounts or email/password changes
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch, email, password]);

  const handleLogin = () => {
    // Basic validation
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }
    dispatch(loginUser({ email, password }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kielo Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email (use test@kielo.app)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Password (any)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />

      {authStatus === "loading" && (
        <ActivityIndicator
          size="small"
          color={Colors.light.tint}
          style={styles.loader}
        />
      )}

      {authError && <Text style={styles.errorText}>{authError}</Text>}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          authStatus === "loading" && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleLogin}
        disabled={authStatus === "loading"}
      >
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>

      {/* Add Register link/button later */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.light.background,
    width: "100%", // Ensure it takes width within its layout
    maxWidth: 400, // Max width for larger screens
    alignSelf: "center", // Center the container itself on larger screens
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: Colors.light.text,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: Colors.light.tabIconDefault,
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#fff", // Ensure input is visible
    color: Colors.light.text,
  },
  button: {
    width: "100%",
    paddingVertical: 15,
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonPressed: {
    backgroundColor: "#0056b3", // Darker shade when pressed
  },
  buttonDisabled: {
    backgroundColor: Colors.light.tabIconDefault,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loader: {
    marginVertical: 10,
  },
  errorText: {
    color: Colors.light.error,
    marginTop: 10,
    marginBottom: 5,
    textAlign: "center",
  },
});
