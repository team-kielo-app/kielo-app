// Action type constants for articles

export const FETCH_ARTICLES_REQUEST = "articles/FETCH_ARTICLES_REQUEST";
export const FETCH_ARTICLES_SUCCESS = "articles/FETCH_ARTICLES_SUCCESS";
export const FETCH_ARTICLES_FAILURE = "articles/FETCH_ARTICLES_FAILURE";

export const FETCH_ARTICLE_BY_ID_REQUEST =
  "articles/FETCH_ARTICLE_BY_ID_REQUEST";
export const FETCH_ARTICLE_BY_ID_SUCCESS =
  "articles/FETCH_ARTICLE_BY_ID_SUCCESS";
export const FETCH_ARTICLE_BY_ID_FAILURE =
  "articles/FETCH_ARTICLE_BY_ID_FAILURE";

export const CLEAR_ARTICLES_ERROR = "articles/CLEAR_ARTICLES_ERROR";

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
