// app/(app)/article/[id].tsx
import React, { useEffect, useState, useCallback } from "react";
import { useLocalSearchParams, Stack } from "expo-router";
import { useSelector, useDispatch } from "react-redux";

// Import the NEW action and selector
import { fetchSingleArticle } from "@features/articles/articlesActions";
import { selectArticleById } from "@features/articles/articlesSelectors";
import { AppDispatch, RootState } from "@store/store";
import { ArticleDetailView } from "@components/ArticleDetailView"; // Import presentational component

export default function ArticleDetailScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { id: articleId } = useLocalSearchParams<{ id?: string }>(); // Get ID, make optional for safety

  // --- Local State for Fetch Status ---
  // We manage loading/error locally for this specific fetch attempt
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Select Data from Redux Store ---
  // selectArticleById handles the case where articleId might be undefined
  const article = useSelector((state: RootState) =>
    articleId ? selectArticleById(articleId)(state) : null
  );

  // --- Fetching Logic ---
  const fetchData = useCallback(async () => {
    // Only fetch if we have an ID and the article isn't already loaded/being loaded
    if (!articleId || isLoading) {
      return;
    }

    console.log(`Fetching single article: ${articleId}`);
    setIsLoading(true);
    setError(null); // Clear previous error

    try {
      // Dispatch the thunk and await its completion (assuming it returns a promise)
      // The thunk should handle putting the article in the store on success
      await dispatch(fetchSingleArticle(articleId));
      // Success: Store is updated via reducer, selector will pick it up.
    } catch (fetchError: any) {
      console.error("Failed to fetch article:", fetchError);
      setError(fetchError.message || "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [articleId, dispatch, isLoading]); // Re-run if ID or loaded article changes

  // --- Effects ---
  // Trigger fetch when component mounts or articleId changes, if needed
  useEffect(() => {
    fetchData();
  }, []); // fetchData callback includes necessary dependencies

  // Update screen title when article data is available
  useEffect(() => {
    // Set title dynamically (implementation depends on Stack.Screen usage)
    // This might need adjustment based on how you manage Stack options in Expo Router vX
    // For now, we assume a mechanism exists to update the title.
    // If using Stack directly in layout:
    // navigation.setOptions({ title: article ? (article.title.substring(0,30) + '...') : 'Article' });
  }, [article]); // Update when article changes

  // --- Render ---
  return (
    <>
      {/* Configure Screen Title - Requires Stack component in layout */}
      <Stack.Screen
        options={{
          title: article
            ? article.title.substring(0, 30) + "..."
            : isLoading
            ? "Loading..."
            : "Article",
        }}
      />
      <ArticleDetailView
        article={article}
        isLoading={isLoading}
        error={error}
        onRetry={fetchData} // Pass the fetchData function as the retry handler
      />
    </>
  );
}

// No separate styles needed here if all UI is in ArticleDetailView

