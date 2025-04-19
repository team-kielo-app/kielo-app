import { RootState } from "@store/store";
import { createSelector } from "@reduxjs/toolkit";
import { DEFAULT_PAGINATION_STATE } from "@/pagination/constants";

const selectPaginationSlice = (state: RootState) => state.pagination;

export const selectArticlePagination = createSelector(
  [selectPaginationSlice],
  (pagination) => pagination.articlePagination
);

export const selectArticlesByOwnerPagination = (ownerId: string) =>
  createSelector(
    [selectArticlePagination],
    (articlePaginationState) =>
      articlePaginationState?.[ownerId] || DEFAULT_PAGINATION_STATE
  );

const selectEntitiesSlice = (state: RootState) => state.entities;

export const selectArticleEntities = createSelector(
  [selectEntitiesSlice],
  (entities) => entities.articles
);

export const selectPaginatedArticlesByOwner = (ownerId: string) =>
  createSelector(
    [selectArticlesByOwnerPagination(ownerId), selectArticleEntities],
    (paginationState, articleEntities) => {
      const articleIds = paginationState.ids || [];
      return articleIds.map((id) => articleEntities[id]).filter(Boolean);
    }
  );

export const selectArticleById = (articleId: string) =>
  createSelector(
    [selectArticleEntities],
    (articleEntities) => articleEntities[articleId] || null
  );

