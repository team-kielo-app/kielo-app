// src/components/ArticleList.tsx
import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Pressable,
  ListRenderItemInfo,
} from "react-native";
import { Article } from "@features/articles/types";
import { Colors } from "@constants/Colors";
import { ArticleListItem } from "./ArticleListItem"; // Import the item component

interface ArticleListProps {
  articles: Article[];
  isLoading: boolean; // Combined loading state (initial or loading more)
  isInitialLoading: boolean; // Specifically for initial load screen
  error: string | null;
  onRefresh: () => void; // Callback for pull-to-refresh
  onEndReached: () => void; // Callback for reaching end
  ListFooterComponent: React.ReactElement | null; // Component to show at the bottom (loading indicator/end message)
  retryLoad: () => void; // Callback to retry loading on initial error
}

export const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  isLoading,
  isInitialLoading,
  error,
  onRefresh,
  onEndReached,
  ListFooterComponent,
  retryLoad,
}) => {
  const isRefreshing = isLoading && !isInitialLoading; // Loading state while data exists is considered refreshing

  // --- Render Logic ---

  // 1. Initial Loading State
  if (isInitialLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.infoText}>Loading News...</Text>
      </View>
    );
  }

  // 2. Initial Load Error State
  if (error && articles.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading news:</Text>
        <Text style={styles.errorDetailText}>{error}</Text>
        <Pressable onPress={retryLoad} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  // 3. Render the List (or empty state)
  const renderItem = ({ item }: ListRenderItemInfo<Article>) => (
    <ArticleListItem article={item} />
  );

  return (
    <View style={styles.container}>
      {/* Optional: Error banner for refresh failures */}
      {error && articles.length > 0 && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>
            Update failed: {error}. Showing cached data.
          </Text>
        </View>
      )}

      <FlatList
        data={articles}
        renderItem={renderItem}
        keyExtractor={(item) => item.id} // Ensure articles have unique IDs
        contentContainerStyle={styles.listContentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.tint}
            colors={[Colors.light.tint]} // for Android
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5} // Adjust as needed
        ListFooterComponent={ListFooterComponent} // Show loading/end indicator
        ListEmptyComponent={
          !isLoading && !error ? ( // Show only if not loading and no error
            <View style={styles.centered}>
              <Text style={styles.infoText}>No articles found.</Text>
            </View>
          ) : null
        }
        // Performance settings (optional but recommended)
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={11}
      />
    </View>
  );
};

// Styles for ArticleList container and states
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 200, // Ensure empty/error states have some height
  },
  listContentContainer: {
    paddingVertical: Platform.OS === "web" ? 20 : 10,
    // Responsive horizontal padding using percentages for web
    paddingHorizontal: Platform.OS === "web" ? "10%" : 15,
  },
  infoText: {
    marginTop: 10,
    color: Colors.light.text,
    fontSize: 16,
  },
  errorText: {
    color: Colors.light.error,
    textAlign: "center",
    marginBottom: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
  errorDetailText: {
    color: Colors.light.error,
    textAlign: "center",
    marginBottom: 15,
    fontSize: 14,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: Colors.light.tint,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorBanner: {
    backgroundColor: Colors.light.errorBackground, // Use a background color
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  errorBannerText: {
    color: Colors.light.error, // Text color matching the theme error color
    textAlign: "center",
    fontSize: 13,
  },
  footerLoadingContainer: {
    paddingVertical: 20,
  },
  footerText: {
    textAlign: "center",
    color: Colors.light.textMuted,
    paddingVertical: 20,
  },
});
