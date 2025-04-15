import React from "react";
import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";

export default function AuthLayout() {
  // Simple layout for auth screens, maybe centered content
  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    // Add background or other styling for the auth section
  },
});
