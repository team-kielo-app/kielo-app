// app/index.tsx (Assuming this is the file for the '/' route)
import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native"; // Optional: show loading
import { useRouter } from "expo-router";
import { Colors } from "@constants/Colors"; // If using for loading indicator

export default function StartPage() {
  const router = useRouter();

  useEffect(() => {
    // Use replace to avoid adding the root '/' page to the history stack.
    // The user effectively lands directly on /article.
    console.log("Redirecting from / to /article...");
    router.replace("/article");
  }, [router]); // Dependency array ensures this runs once on mount

  // Return null or a loading indicator while the redirect happens.
  // It should be almost instantaneous.
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.light.background,
      }}
    >
      <ActivityIndicator size="large" color={Colors.light.tint} />
      {/* Optional: <Text>Loading...</Text> */}
    </View>
  );
  // Or simply: return null;
}
