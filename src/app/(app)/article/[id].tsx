// app/(app)/article/[id].tsx

import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Pressable,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router"; // Keep router hooks
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

// Import actions, selectors, types
import * as articlesActions from "@features/articles/articlesActions";
import * as articlesSelectors from "@features/articles/articlesSelectors";
import { Article, ArticlesState } from "@features/articles/types";
import { AppDispatch, RootState } from "@store/store";
import { Colors } from "@constants/Colors";
import { useResponsiveDimensions } from "@hooks/useResponsiveDimensions";

// --- Presentational Component (ArticleDetailView) ---
interface ArticleDetailViewProps {
  article: Article | undefined; // Article might be undefined initially
  status: ArticlesState["status"];
  error: string | null;
  actions: {
    // Bound actions
    fetchArticleByIdThunk: (id: string) => void; // Thunks don't return promises here necessarily
    clearArticlesError: typeof articlesActions.clearArticlesError;
  };
  articleId: string | undefined; // Pass ID down
  // Add router if needed, though hooks are fine here
}

const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
  article,
  status,
  error,
  actions,
  articleId,
}) => {
  const router = useRouter(); // Use router hook inside functional component
  const { isMobile } = useResponsiveDimensions(); // Use responsive hook
  const isLoading = status === "loading";

  // Effect to fetch article if missing
  useEffect(() => {
    if (articleId && !article && status !== "loading") {
      // Fetch only if needed and not already loading
      console.log(`Article ${articleId} not in cache/state, fetching...`);
      actions.clearArticlesError();
      actions.fetchArticleByIdThunk(articleId);
    }
  }, [articleId, article, status, actions]); // Re-run if id changes or article appears/disappears

  // Effect to clear error on unmount
  useEffect(() => {
    return () => {
      actions.clearArticlesError();
    };
  }, [actions]);

  // --- Retry Handler ---
  const handleRetry = () => {
    if (articleId) {
      actions.clearArticlesError();
      actions.fetchArticleByIdThunk(articleId);
    }
  };

  // --- Render Logic ---
  if (isLoading && !article) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Loading Article...</Text>
      </View>
    );
  }

  if (error && !article) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error Loading Article:</Text>
        <Text style={styles.errorDetailText}>{error}</Text>
        <Pressable onPress={handleRetry} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={{ marginTop: 15 }}>
          <Text style={{ color: Colors.light.tint }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (!article) {
    // Fallback if no article found after load/error states
    return (
      <View style={styles.centered}>
        <Text>Article not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 15 }}>
          <Text style={{ color: Colors.light.tint }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // Display Article
  return (
    <>
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
        {/* TODO: Make URL pressable */}
        <Text style={styles.sourceUrl}>Source: {article.url}</Text>
        <Text
          style={[
            styles.content,
            isMobile ? styles.contentMobile : styles.contentDesktop,
          ]}
        >
          {article.content || "Content not available."}
        </Text>
      </ScrollView>
    </>
  );
};

// --- Container Component (ArticleDetailScreen - Default Export) ---

// Define OwnProps for the container to receive route params
// Note: Expo Router's useLocalSearchParams is a hook, best used in the *functional* container itself.
// mapStateToProps doesn't easily get hook results. So, we'll use the hook in the container wrapper.

// Define props for the container component itself, including route params
interface ArticleDetailContainerProps {
  // Props from connect (mapStateToProps)
  article: Article | undefined;
  status: ArticlesState["status"];
  error: string | null;
  // Props from connect (mapDispatchToProps)
  actions: {
    fetchArticleByIdThunk: (id: string) => void;
    clearArticlesError: typeof articlesActions.clearArticlesError;
  };
  // Props from route (obtained via hook)
  articleId: string | undefined;
}

// Functional container component allows using hooks like useLocalSearchParams
const ArticleDetailContainer: React.FC<ArticleDetailContainerProps> = ({
  article,
  status,
  error,
  actions,
  articleId,
}) => {
  // Render the presentational component, passing all props down
  return (
    <ArticleDetailView
      article={article}
      status={status}
      error={error}
      actions={actions}
      articleId={articleId}
    />
  );
};

// mapStateToProps needs the ID, which isn't in state or easily passed as ownProps with hooks.
// A common pattern is to select based on ID *inside* the container wrapper component.
const mapStateToProps = (
  state: RootState,
  ownProps: { articleId: string | undefined }
) => {
  // Get the specific article using the ID passed via ownProps
  const article = ownProps.articleId
    ? articlesSelectors.selectArticleById(state, ownProps.articleId)
    : undefined;

  return {
    article: article,
    status: articlesSelectors.selectArticlesStatus(state),
    error: articlesSelectors.selectArticlesError(state),
    // We don't pass articleId from state, it comes from the wrapper
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  actions: bindActionCreators(
    {
      fetchArticleByIdThunk: articlesActions.fetchArticleByIdThunk,
      clearArticlesError: articlesActions.clearArticlesError,
    },
    dispatch
  ),
});

// Wrapper component to handle hooks (like useLocalSearchParams) and pass data to connect
const ArticleDetailScreenWrapper = () => {
  const { id } = useLocalSearchParams<{ id: string }>(); // Get ID using hook

  // Create the connected component, but pass the ID explicitly as a prop
  // Need to tell TypeScript connect expects `articleId` in ownProps
  const ConnectedContainer = connect(
    // Need to cast mapStateToProps slightly if relying on ownProps structure
    mapStateToProps as (
      state: RootState,
      ownProps: { articleId: string | undefined }
    ) => any, // Adjust typing as needed
    mapDispatchToProps
  )(ArticleDetailContainer);

  return <ConnectedContainer articleId={id} />; // Pass id obtained from hook
};

// Default export is the wrapper that uses the hook
export default ArticleDetailScreenWrapper;

// Styles remain the same...
const styles = StyleSheet.create({
  // ... Paste existing styles from previous ArticleDetailScreen here ...
  container: { flex: 1, backgroundColor: Colors.light.background },
  contentContainer: {
    padding: Platform.OS === "web" ? 40 : 20,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 15,
    color: Colors.light.text,
    textAlign: "center",
  },
  titleMobile: { fontSize: 22 },
  titleDesktop: { fontSize: 28 },
  date: { fontSize: 14, color: "#666", marginBottom: 10, textAlign: "center" },
  sourceUrl: {
    fontSize: 12,
    color: Colors.light.tint,
    marginBottom: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
  content: { lineHeight: 24, color: "#333" },
  contentMobile: { fontSize: 16 },
  contentDesktop: { fontSize: 17 },
  loadingText: { marginTop: 10, color: Colors.light.text },
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
  retryButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

