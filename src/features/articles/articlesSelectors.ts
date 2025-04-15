import { RootState } from "@store/store";
import { Article, ArticlesState } from "./types";

export const selectAllArticles = (state: RootState): Article[] =>
  state.articles.items;
export const selectArticleById = (
  state: RootState,
  articleId: string
): Article | undefined =>
  state.articles.items.find((article) => article.id === articleId);
export const selectArticlesStatus = (
  state: RootState
): ArticlesState["status"] => state.articles.status;
export const selectArticlesError = (state: RootState): string | null =>
  state.articles.error;
export const selectArticlesLastFetched = (state: RootState): number | null =>
  state.articles.lastFetched;

