import { RootState } from "@store/store";
import { createSelector } from "@reduxjs/toolkit"; // Or use reselect
import { DEFAULT_PAGINATION_STATE } from "@/pagination/constants";

// Select the entire pagination slice from the root state
const selectPaginationSlice = (state: RootState) => state.pagination;

// Select the specific pagination state for articles
export const selectArticlePagination = createSelector(
  [selectPaginationSlice],
  (pagination) => pagination.articlePagination // Matches the key in rootReducer
);

// Select pagination state for a specific key (e.g., ownerId)
export const selectArticlesByOwnerPagination = (ownerId: string) =>
  createSelector(
    [selectArticlePagination],
    (articlePaginationState) =>
      articlePaginationState?.[ownerId] || DEFAULT_PAGINATION_STATE
  );

// Select the entities slice
const selectEntitiesSlice = (state: RootState) => state.entities;

// Select the articles entity map
export const selectArticleEntities = createSelector(
  [selectEntitiesSlice],
  (entities) => entities.articles
);

// Selector to get paginated article *data* for a specific owner
export const selectPaginatedArticlesByOwner = (ownerId: string) =>
  createSelector(
    [selectArticlesByOwnerPagination(ownerId), selectArticleEntities],
    (paginationState, articleEntities) => {
      const articleIds = paginationState.ids || [];
      return articleIds.map((id) => articleEntities[id]).filter(Boolean); // Map IDs to actual article objects
    }
  );

// Selector to get a single article by ID
export const selectArticleById = (articleId: string) =>
  createSelector(
    [selectArticleEntities],
    (articleEntities) => articleEntities[articleId] || null
  );

