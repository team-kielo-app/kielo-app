import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { selectArticleById } from "../../../src/features/articles/articlesSlice";
import { RootState } from "../../../src/store/store";
import Colors from "../../../src/constants/Colors";
import { useResponsiveDimensions } from "../../../src/hooks/useResponsiveDimensions";

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // Get ID from route params
  const article = useSelector((state: RootState) =>
    selectArticleById(state, id ?? "")
  );
  const router = useRouter();
  const { isMobile } = useResponsiveDimensions();

  // Optionally set the header title dynamically
  useEffect(() => {
    if (article) {
      // Update header options if needed, though Stack.Screen in layout might be enough
    } else if (!article) {
      // Handle case where article isn't found (e.g., after refresh if state cleared)
      // Maybe navigate back or show 'not found'
      console.warn(`Article with ID ${id} not found in Redux state.`);
      // Consider fetching single article here if an endpoint exists
      // For now, just show loading/not found message
    }
  }, [article, id, router]);

  if (!article) {
    // Handle case where article is not found in the store
    // This might happen if the user navigates directly via URL or refreshes
    // A real app would ideally fetch the single article here using the ID
    // Or show a more specific loading/not found state
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading article...</Text>
        {/* Or <Text>Article not found.</Text> */}
      </View>
    );
  }

  return (
    <>
      {/* Set screen title dynamically */}
      <Stack.Screen
        options={{ title: article.title.substring(0, 30) + "..." }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <Text
          style={[
            styles.title,
            isMobile ? styles.titleMobile : styles.titleDesktop,
          ]}
        >
          {article.title}
        </Text>
        <Text style={styles.date}>
          {new Date(article.date).toLocaleString("fi-FI")}
        </Text>
        {/* TODO: Add a link to the original article */}
        <Text style={styles.sourceUrl}>Source: {article.url}</Text>

        {/* Render the content. Needs proper formatting/parsing later */}
        {/* Simple rendering for now */}
        <Text
          style={[
            styles.content,
            isMobile ? styles.contentMobile : styles.contentDesktop,
          ]}
        >
          {article.content || "Content not available."}
        </Text>

        {/* Add word highlighting/translation features here later */}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    padding: Platform.OS === "web" ? 40 : 20, // More padding on web
    maxWidth: 800, // Max width for readability on large screens
    width: "100%",
    alignSelf: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 15,
    color: Colors.light.text,
    textAlign: "center",
  },
  titleMobile: {
    fontSize: 22,
  },
  titleDesktop: {
    fontSize: 28,
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
  sourceUrl: {
    fontSize: 12,
    color: Colors.light.tint,
    marginBottom: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
  content: {
    lineHeight: 24, // Improve readability
    color: "#333", // Slightly off-black for text
    // Consider using Markdown rendering library if content is markdown
  },
  contentMobile: {
    fontSize: 16,
  },
  contentDesktop: {
    fontSize: 17,
  },
});

