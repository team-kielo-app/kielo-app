import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";
import * as actionTypes from "./articlesActionTypes";
import { Article } from "./types";
import { apiClient } from "@lib/api";
import { RootState, AppDispatch } from "@store/store";

type ArticlesThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;

// --- Sync Action Creators ---
export const fetchArticlesRequest =
  (): actionTypes.FetchArticlesRequestAction => ({
    type: actionTypes.FETCH_ARTICLES_REQUEST,
  });
export const fetchArticlesSuccess = (
  articles: Article[]
): actionTypes.FetchArticlesSuccessAction => ({
  type: actionTypes.FETCH_ARTICLES_SUCCESS,
  payload: articles,
});
export const fetchArticlesFailure = (
  error: actionTypes.FetchArticlesFailureAction["payload"]
): actionTypes.FetchArticlesFailureAction => ({
  type: actionTypes.FETCH_ARTICLES_FAILURE,
  payload: error,
});

export const fetchArticleByIdRequest =
  (): actionTypes.FetchArticleByIdRequestAction => ({
    type: actionTypes.FETCH_ARTICLE_BY_ID_REQUEST,
  });
export const fetchArticleByIdSuccess = (
  article: Article
): actionTypes.FetchArticleByIdSuccessAction => ({
  type: actionTypes.FETCH_ARTICLE_BY_ID_SUCCESS,
  payload: article,
});
export const fetchArticleByIdFailure = (
  error: actionTypes.FetchArticleByIdFailureAction["payload"]
): actionTypes.FetchArticleByIdFailureAction => ({
  type: actionTypes.FETCH_ARTICLE_BY_ID_FAILURE,
  payload: error,
});

export const clearArticlesError = (): actionTypes.ClearArticlesErrorAction => ({
  type: actionTypes.CLEAR_ARTICLES_ERROR,
});

// --- Async Thunk Action Creators ---
export const fetchArticlesThunk =
  (): ArticlesThunk<Promise<void>> => async (dispatch: AppDispatch) => {
    dispatch(fetchArticlesRequest());
    try {
      const data = await apiClient.get<Article[]>("/news/articles", dispatch);
      dispatch(fetchArticlesSuccess(data));
    } catch (error: any) {
      const message =
        error?.data?.error || error.message || "Failed to fetch articles";
      const status = error?.status;
      dispatch(fetchArticlesFailure({ message, status }));
    }
  };

export const fetchArticleByIdThunk =
  (articleId: string): ArticlesThunk<Promise<void>> =>
  async (dispatch: AppDispatch) => {
    dispatch(fetchArticleByIdRequest());
    try {
      const data = await apiClient.get<Article>(
        `/news/articles/${articleId}`,
        dispatch
      );
      dispatch(fetchArticleByIdSuccess(data));
    } catch (error: any) {
      const message =
        error?.data?.error ||
        error.message ||
        `Failed to fetch article ${articleId}`;
      const status = error?.status;
      dispatch(fetchArticleByIdFailure({ message, status }));
    }
  };
