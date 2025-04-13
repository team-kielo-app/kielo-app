import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Article, ArticlesState } from "./types";
import { apiClient } from "../../lib/api"; // Import the API client
import { RootState } from "../../store/store";

const NEWS_API_URL = process.env.EXPO_PUBLIC_NEWS_API_URL;
if (!NEWS_API_URL) {
  console.error(
    "ERROR: EXPO_PUBLIC_NEWS_API_URL is not defined in environment variables!"
  );
}

// --- Async Thunks ---
export const fetchArticles = createAsyncThunk<
  Article[], // Return type when fulfilled
  void, // Argument type (none for fetching all)
  { rejectValue: string } // Type for rejectWithValue
>("articles/fetchArticles", async (_, { rejectWithValue }) => {
  if (!NEWS_API_URL) return rejectWithValue("News API URL not configured");
  try {
    const url = `${NEWS_API_URL}/articles`; // Use the environment variable
    console.log(`Fetching articles from: ${url}`);
    // Use the generic API client - it will add auth header if available
    const data = await apiClient.get<Article[]>(url);
    console.log(`Fetched ${data.length} articles.`);
    // Optional: Data transformation here if needed (e.g., string to Date)
    return data;
  } catch (error: any) {
    console.error("Failed to fetch articles:", error);
    return rejectWithValue(error.message || "Failed to fetch articles");
  }
});

// --- Slice Definition ---
const initialState: ArticlesState = {
  items: [],
  status: "idle",
  error: null,
};

const articlesSlice = createSlice({
  name: "articles",
  initialState,
  reducers: {
    // Can add reducers for specific actions like adding/removing single articles if needed
    clearArticlesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchArticles.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchArticles.fulfilled,
        (state, action: PayloadAction<Article[]>) => {
          state.status = "succeeded";
          state.items = action.payload; // Replace current articles
          state.error = null;
        }
      )
      .addCase(fetchArticles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Unknown error"; // Use the rejected value
      });
  },
});

export const { clearArticlesError } = articlesSlice.actions;

// --- Selectors ---
export const selectAllArticles = (state: RootState): Article[] =>
  state.articles?.items;
export const selectArticleById = (
  state: RootState,
  articleId: string
): Article | undefined =>
  state.articles?.items?.find((article) => article.id === articleId);
export const selectArticlesStatus = (
  state: RootState
): ArticlesState["status"] => state.articles?.status;
export const selectArticlesError = (state: RootState): string | null =>
  state.articles?.error;

export default articlesSlice.reducer;

