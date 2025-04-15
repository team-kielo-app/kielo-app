import React, { useEffect, useCallback, Component } from "react"; // Import Component for class structure
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
import { connect } from "react-redux"; // Import connect HOC
import { bindActionCreators } from "redux"; // Import bindActionCreators
import { Link } from "expo-router"; // Keep router imports

// Import actions, selectors, types
import * as articlesActions from "@features/articles/articlesActions";
import * as articlesSelectors from "@features/articles/articlesSelectors";
import { Article } from "@features/articles/types";
import { AppDispatch, RootState } from "@store/store";
import { Colors } from "@constants/Colors";
import { useResponsiveDimensions } from "@hooks/useResponsiveDimensions"; // Hooks can still be used for non-redux logic

// Stale time constant
const STALE_TIME_MS = 5 * 60 * 1000;

// --- Define Props combining Redux state, actions, and own props ---
interface NewsFeedProps {
  // State from mapStateToProps
  articles: Article[];
  status: ReturnType<typeof articlesSelectors.selectArticlesStatus>;
  error: ReturnType<typeof articlesSelectors.selectArticlesError>;
  lastFetched: ReturnType<typeof articlesSelectors.selectArticlesLastFetched>;
  // Actions from mapDispatchToProps (bound)
  actions: {
    fetchArticlesThunk: typeof articlesActions.fetchArticlesThunk;
    clearArticlesError: typeof articlesActions.clearArticlesError;
  };
  // Own props (if any) passed from parent or router
  // Example: navigation props if not using Expo Router hooks directly
}

// --- Create the component (Using Class component for classic connect example, but functional works too) ---
class NewsFeedScreen extends Component<NewsFeedProps> {
  // Use isDataStale logic within methods or render
  isDataStale = () => {
    const { lastFetched } = this.props;
    return !lastFetched || Date.now() - lastFetched > STALE_TIME_MS;
  };

  loadArticles = (forceRefresh = false) => {
    const { articles, actions } = this.props;
    if (articles.length === 0 || this.isDataStale() || forceRefresh) {
      console.log(
        `Fetching articles. Force: ${forceRefresh}, Stale: ${this.isDataStale()}, Empty: ${
          articles.length === 0
        }`
      );
      actions.clearArticlesError(); // Call bound action directly
      actions.fetchArticlesThunk(); // Call bound action directly
    } else {
      console.log("Using cached articles, data is fresh.");
    }
  };

  componentDidMount() {
    this.loadArticles();
  }

  componentWillUnmount() {
    // Clear error on unmount if desired
    this.props.actions.clearArticlesError();
  }

  // Optional: Handle updates if needed (e.g., re-fetch if props change in specific ways)
  // componentDidUpdate(prevProps: Readonly<NewsFeedProps>) { ... }

  onRefresh = () => {
    this.loadArticles(true); // Force refresh
  };

  renderArticleItem = ({ item }: { item: Article }) => {
    // Access props via this.props if needed inside helpers
    // Use isMobile from hook (need to wrap class component or use HOC for hooks)
    // For simplicity, let's assume isMobile logic is handled differently or passed as prop
    return (
      <Link
        href={{ pathname: "/(app)/article/[id]", params: { id: item.id } }}
        asChild
      >
        <Pressable style={styles.itemContainer}>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle /* Add responsive style */}>
              {item.title}
            </Text>
            <Text style={styles.itemDate}>
              {new Date(item.date).toLocaleDateString("fi-FI")}
            </Text>
          </View>
        </Pressable>
      </Link>
    );
  };

  render() {
    const { articles, status, error } = this.props;

    // Derived states
    const isInitialLoading = status === "loading" && articles.length === 0;
    const isRefreshing = status === "loading" && articles.length > 0;

    // --- Render Logic (using this.props) ---
    if (isInitialLoading) {
      // ... loading indicator ...
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Loading News...</Text>
        </View>
      );
    }

    if (error && articles.length === 0) {
      // ... error display with retry button calling this.onRefresh ...
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error loading news:</Text>
          <Text style={styles.errorDetailText}>{error}</Text>
          <Pressable onPress={this.onRefresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {error && articles.length > 0 && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>
              Refresh failed: {error}. Showing cached data.
            </Text>
          </View>
        )}
        <FlatList
          data={articles}
          renderItem={this.renderArticleItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={this.onRefresh}
              tintColor={Colors.light.tint}
              colors={[Colors.light.tint]}
            />
          }
          ListEmptyComponent={
            !isInitialLoading && !error ? (
              <View style={styles.centered}>
                <Text>No articles found.</Text>
              </View>
            ) : null
          }
        />
      </View>
    );
  }
}

// --- mapStateToProps: Map Redux state to component props ---
const mapStateToProps = (state: RootState) => ({
  articles: articlesSelectors.selectAllArticles(state),
  status: articlesSelectors.selectArticlesStatus(state),
  error: articlesSelectors.selectArticlesError(state),
  lastFetched: articlesSelectors.selectArticlesLastFetched(state),
});

// --- mapDispatchToProps: Map action creators to component props ---
const mapDispatchToProps = (dispatch: AppDispatch) => ({
  actions: bindActionCreators(
    {
      // Pass an object with the actions to bind
      fetchArticlesThunk: articlesActions.fetchArticlesThunk,
      clearArticlesError: articlesActions.clearArticlesError,
    },
    dispatch
  ),
});

// --- Connect the component to Redux ---
// Note: If using hooks like useResponsiveDimensions in a class component,
// you might need a wrapper HOC or convert back to functional component.
// Let's ignore the hook usage within the class for this structural example.
export default connect(mapStateToProps, mapDispatchToProps)(NewsFeedScreen);

// Styles remain the same...
const styles = StyleSheet.create({
  // ... existing styles ...
  container: { flex: 1, backgroundColor: Colors.light.background },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  listContentContainer: {
    paddingVertical: Platform.OS === "web" ? 20 : 10,
    paddingHorizontal: Platform.OS === "web" ? "10%" : 10,
  },
  itemContainer: {
    backgroundColor: "#fff",
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  itemContent: { padding: 15 },
  itemTitle: {
    fontWeight: "bold",
    marginBottom: 5,
    color: Colors.light.text,
    fontSize: 17 /* Example size */,
  },
  // itemTitleMobile: { fontSize: 16 }, // Remove if hook not used here
  // itemTitleDesktop: { fontSize: 18 }, // Remove if hook not used here
  itemDate: { fontSize: 12, color: "#666", marginBottom: 5 },
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
  errorBanner: {
    backgroundColor: Colors.light.error,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  errorBannerText: { color: "#fff", textAlign: "center", fontSize: 13 },
});

