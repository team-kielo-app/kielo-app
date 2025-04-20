import { Link, Stack } from "expo-router";
import { StyleSheet } from "react-native";

import { ThemedText } from "@components/ThemedText"; // Assuming these exist
import { ThemedView } from "@components/ThemedView"; // Assuming these exist
import { Colors } from "@constants/Colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">This screen doesn't exist.</ThemedText>
        {/* Link back to the main tabs screen */}
        <Link href="/(main)/(tabs)/" style={styles.link}>
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: Colors.light.background, // Use your theme color
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  // Define styles for ThemedText if not globally available
  titleText: {
    // Example
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  linkText: {
    // Example
    fontSize: 16,
    color: Colors.light.primary,
  },
});

