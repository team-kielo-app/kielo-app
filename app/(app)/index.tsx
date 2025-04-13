import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Pressable,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Link, useRouter } from "expo-router";
import {
  fetchArticles,
  selectAllArticles,
  selectArticlesStatus,
  selectArticlesError,
  clearArticlesError,
} from "../../src/features/articles/articlesSlice";
import { Article } from "../../src/features/articles/types";
import { AppDispatch } from "../../src/store/store";
import Colors from "../../src/constants/Colors";
import { useResponsiveDimensions } from "../../src/hooks/useResponsiveDimensions"; // Import the hook

export default function NewsFeedScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const articles = useSelector(selectAllArticles);
  const status = useSelector(selectArticlesStatus);
  const error = useSelector(selectArticlesError);
  const router = useRouter();
  const { isMobile } = useResponsiveDimensions(); // Use the hook

  useEffect(() => {
    // Fetch articles only if they haven't been fetched yet or status is idle/failed
    if (status === "idle" || status === "failed") {
      dispatch(clearArticlesError()); // Clear previous error before fetching
      dispatch(fetchArticles());
    }
  }, [status, dispatch]);

  const onRefresh = () => {
    dispatch(clearArticlesError());
    dispatch(fetchArticles());
  };

  const renderArticleItem = ({ item }: { item: Article }) => (
    <Link
      href={{ pathname: "/(app)/article/[id]", params: { id: item.id } }}
      asChild
    >
      <Pressable style={styles.itemContainer}>
        <View style={styles.itemContent}>
          <Text
            style={[
              styles.itemTitle,
              isMobile ? styles.itemTitleMobile : styles.itemTitleDesktop,
            ]}
          >
            {item.title}
          </Text>
          <Text style={styles.itemDate}>
            {new Date(item.date).toLocaleDateString("fi-FI")}
          </Text>
          {/* Optionally show a snippet of content */}
          {/* <Text style={styles.itemSnippet} numberOfLines={2}>{item.content.substring(0, 100)}...</Text> */}
        </View>
      </Pressable>
    </Link>
  );

  if (status === "loading" && articles.length === 0) {
    // Show loader only on initial load
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  if (status === "failed" && articles.length === 0) {
    // Show error only if loading failed initially
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error fetching articles: {error}</Text>
        <Pressable onPress={onRefresh} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={articles}
        renderItem={renderArticleItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContentContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={status === "loading"} // Show refresh indicator while loading
            onRefresh={onRefresh}
            tintColor={Colors.light.tint} // iOS
            colors={[Colors.light.tint]} // Android
          />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            {status !== "loading" && <Text>No articles found.</Text>}
          </View>
        }
      />
      {/* Show loading indicator at bottom if refreshing */}
      {/* {status === 'loading' && articles.length > 0 && <ActivityIndicator style={{ padding: 10 }} size="small" />} */}
    </View>
  );
}

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
  },
  listContentContainer: {
    paddingVertical: Platform.OS === "web" ? 20 : 10, // More padding on web
    paddingHorizontal: Platform.OS === "web" ? "10%" : 10, // Use percentage on web for centering effect
  },
  itemContainer: {
    backgroundColor: "#fff",
    marginBottom: 10, // Add space between items instead of separator maybe
    borderRadius: 8,
    overflow: "hidden", // Ensure Pressable ripple effect stays within bounds if added
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000", // Basic shadow for web/iOS
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1, // Android shadow
  },
  itemContent: {
    padding: 15,
  },
  itemTitle: {
    fontWeight: "bold",
    marginBottom: 5,
    color: Colors.light.text,
  },
  itemTitleMobile: {
    fontSize: 16,
  },
  itemTitleDesktop: {
    fontSize: 18, // Larger font on desktop
  },
  itemDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  itemSnippet: {
    fontSize: 14,
    color: "#333",
  },
  separator: {
    // height: 1,
    // backgroundColor: '#e0e0e0',
    height: 10, // Use spacing instead of a line
  },
  errorText: {
    color: Colors.light.error,
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.light.tint,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

