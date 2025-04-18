export const FETCH_ARTICLES_REQUEST = "articles/FETCH_LIST_REQUEST";
export const FETCH_ARTICLES_SUCCESS = "articles/FETCH_LIST_SUCCESS";
export const FETCH_ARTICLES_FAILURE = "articles/FETCH_LIST_FAILURE";

// --- Action Types for Adding/Removing from Lists (Optional, can reuse FETCH_SUCCESS with meta) ---
// Let's stick to FETCH_SUCCESS and handle removal logic in the reducer based on meta/options for now.
// If adding/removing involved *separate* API calls resulting in a single item, we'd add types like:
// export const ADD_ARTICLE_SUCCESS = 'articles/ADD_SINGLE_SUCCESS';
// export const REMOVE_ARTICLE_SUCCESS = 'articles/REMOVE_SINGLE_SUCCESS'; // This signals removal *after* API success

// --- Action Types for SINGLE Article Retrieval ---
export const FETCH_SINGLE_ARTICLE_REQUEST = "articles/FETCH_SINGLE_REQUEST";
export const FETCH_SINGLE_ARTICLE_SUCCESS = "articles/FETCH_SINGLE_SUCCESS";
export const FETCH_SINGLE_ARTICLE_FAILURE = "articles/FETCH_SINGLE_FAILURE";

// --- Action Shape Interfaces ---
import { Article } from "./types";

interface FetchArticlesFailurePayload {
  message: string;
  status?: number;
}
interface FetchArticleByIdFailurePayload {
  message: string;
  status?: number;
}

export interface FetchArticlesRequestAction {
  type: typeof FETCH_ARTICLES_REQUEST;
}
export interface FetchArticlesSuccessAction {
  type: typeof FETCH_ARTICLES_SUCCESS;
  payload: Article[];
}
export interface FetchArticlesFailureAction {
  type: typeof FETCH_ARTICLES_FAILURE;
  payload: FetchArticlesFailurePayload;
}

export interface FetchArticleByIdRequestAction {
  type: typeof FETCH_ARTICLE_BY_ID_REQUEST;
}
export interface FetchArticleByIdSuccessAction {
  type: typeof FETCH_ARTICLE_BY_ID_SUCCESS;
  payload: Article;
} // Single article
export interface FetchArticleByIdFailureAction {
  type: typeof FETCH_ARTICLE_BY_ID_FAILURE;
  payload: FetchArticleByIdFailurePayload;
}

export interface ClearArticlesErrorAction {
  type: typeof CLEAR_ARTICLES_ERROR;
}

// Union type
export type ArticlesAction =
  | FetchArticlesRequestAction
  | FetchArticlesSuccessAction
  | FetchArticlesFailureAction
  | FetchArticleByIdRequestAction
  | FetchArticleByIdSuccessAction
  | FetchArticleByIdFailureAction
  | ClearArticlesErrorAction;

