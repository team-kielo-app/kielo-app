// src/app/(app)/index.tsx
import React, { useEffect, useCallback, useMemo } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useSelector, useDispatch } from "react-redux";

// New pagination actions and selectors
import { fetchArticles } from "@features/articles/articlesActions";
import {
  selectArticlesByOwnerPagination,
  selectPaginatedArticlesByOwner,
} from "@features/articles/articlesSelectors";
import { AppDispatch, RootState } from "@store/store";
import { ArticleList } from "@components/ArticleList"; // Import the presentation component
import { Colors } from "@constants/Colors";

const PAGINATION_KEY = "main_feed";

export default function NewsFeedScreen() {
  const dispatch = useDispatch<AppDispatch>();

  // Select pagination state and data for the specific key
  const paginationState = useSelector((state: RootState) =>
    selectArticlesByOwnerPagination(PAGINATION_KEY)(state)
  );
  const articles = useSelector((state: RootState) =>
    selectPaginatedArticlesByOwner(PAGINATION_KEY)(state)
  );

  // Memoize derived states to prevent unnecessary re-renders
  const {
    isLoading,
    error,
    nextPageKey, // Use nextPageKey to check if more can be loaded
    hasReachedEnd,
    ids, // Use ids.length to check if any data has ever been loaded
  } = paginationState;

  const hasLoadedOnce = ids && ids.length > 0;
  const isInitialLoading = isLoading && !hasLoadedOnce;

  // --- Action Dispatchers ---

  // Load the first page or refresh the list
  const loadInitialOrRefresh = useCallback(() => {
    // Optionally clear previous error before fetching
    // dispatch(articlesActions.clearArticlesError(PAGINATION_KEY)); // Need an action to clear error per key
    console.log(`Fetching articles for key: ${PAGINATION_KEY}, Reset: true`);
    dispatch(fetchArticles(PAGINATION_KEY, { reset: true }));
  }, [dispatch]);

  // Load the next page
  const loadMore = useCallback(() => {
    // Prevent fetching more if already loading, at the end, or no next key
    if (isLoading || hasReachedEnd || !nextPageKey) {
      console.log(
        `Load more skipped: isLoading=${isLoading}, hasReachedEnd=${hasReachedEnd}, nextPageKey=${nextPageKey}`
      );
      return;
    }
    console.log(
      `Fetching articles for key: ${PAGINATION_KEY}, FetchNext: true`
    );
    dispatch(fetchArticles(PAGINATION_KEY, { fetchNext: true }));
  }, [dispatch, isLoading, hasReachedEnd, nextPageKey]);

  // --- Effects ---

  // Load initial data on mount if list is empty
  useEffect(() => {
    if (!hasLoadedOnce && !isLoading && !error) {
      // Only fetch if truly empty, not loading, and no prior error
      console.log("Initial fetch triggered.");
      loadInitialOrRefresh();
    }
  }, []); // Depend on load function and state

  // --- Render Helpers ---

  // Footer component for the FlatList
  const renderListFooter = useMemo(() => {
    if (isLoading && hasLoadedOnce) {
      // Show loading indicator only when loading *more*
      return (
        <View style={styles.footerLoadingContainer}>
          <ActivityIndicator size="small" color={Colors.light.tint} />
        </View>
      );
    }
    if (hasReachedEnd && hasLoadedOnce) {
      // Show end message only if loaded something and reached end
      return <Text style={styles.footerText}>No more articles</Text>;
    }
    return null; // No footer otherwise
  }, [isLoading, hasReachedEnd, hasLoadedOnce]);

  // --- Render Screen ---
  return (
    <ArticleList
      articles={articles}
      isLoading={isLoading}
      isInitialLoading={isInitialLoading}
      error={error}
      onRefresh={loadInitialOrRefresh} // Pull-to-refresh triggers a reset fetch
      onEndReached={loadMore} // Infinite scroll triggers fetchNext
      ListFooterComponent={renderListFooter}
      retryLoad={loadInitialOrRefresh} // Retry button triggers a reset fetch
    />
  );
}

// Styles specific to the footer, others are in ArticleList
const styles = StyleSheet.create({
  footerLoadingContainer: {
    paddingVertical: 20,
  },
  footerText: {
    textAlign: "center",
    color: Colors.light.textMuted,
    paddingVertical: 20,
  },
});

