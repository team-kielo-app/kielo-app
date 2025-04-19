// src/features/articles/articles.selectors.ts
import { createSelector } from "@reduxjs/toolkit"; // Or import from 'reselect'
import type { RootState } from "@store/store"; // Your root state type
import { DEFAULT_PAGINATION_STATE } from "./constants"; // Import default state
import type { PaginationState, PaginatedData } from "./types";
import type { Entities } from "@entities/types"; // Import the core Article type

// Base selectors
const selectEntitiesSlice = (state: RootState) => state.entities;
const selectPaginationSlice = (state: RootState) => state.pagination;

/**
 * Selects a specific entity type from the entities state
 */
export const selectEntityCollection = (entityName: string) =>
  createSelector(
    [selectEntitiesSlice],
    (entities: { [entityName]: Entities }) => entities[entityName] || {}
  );

/**
 * Selects a specific pagination type from the pagination state
 */
export const selectPaginationType = (paginationType: string) =>
  createSelector(
    [selectPaginationSlice],
    (pagination: { [paginationType]: object }) =>
      pagination[paginationType] || {}
  );

/**
 * Converts an array of entity IDs to their corresponding entity objects
 */
export const mapIdsToEntities = <T>(
  ids: string[],
  entities: Record<string, T>
): T[] => {
  return ids.map((id) => entities[id]).filter(Boolean);
};

/**
 * Determines if there are more pages based on page tokens
 */
export const hasMorePages = (
  nextPageToken: string | null,
  isAccumulated: boolean,
  prevPageToken?: string | null
): boolean => {
  if (isAccumulated) {
    return Boolean(nextPageToken);
  }
  return Boolean(nextPageToken) || Boolean(prevPageToken);
};

/**
 * Creates a paginated data object from pagination state and entities
 */
export const createPaginatedData = <T>(
  paginationState: Partial<PaginationState>,
  entities: Record<string, T>,
  isAccumulated: boolean
): PaginatedData => {
  // Apply defaults for missing values
  const {
    ids = [],
    currentIds = [],
    currentPage = 1,
    pageSize = DEFAULT_PAGINATION_STATE.pageSize,
    totalCount = 0,
    isLoading = false,
    hasFetched = false,
    nextPageToken = null,
    prevPageToken = null,
    error = null,
  } = paginationState;

  let data: T[] = [];

  if (isAccumulated && ids.length > 0 && currentPage >= 1) {
    // Calculate current page slice for accumulated data
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageIds = ids.slice(startIndex, endIndex);
    data = mapIdsToEntities(pageIds, entities);
  } else {
    // Use all relevant IDs for non-accumulated data
    data = mapIdsToEntities(ids, entities);
  }

  // Calculate pagination metadata
  const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0;
  const hasMore = hasMorePages(nextPageToken, isAccumulated, prevPageToken);

  return {
    data,
    pagination: {
      currentPage,
      pageSize,
      totalCount,
      totalPages,
      isLoading,
      hasMore,
      hasFetched,
      error,
    },
  };
};

/**
 * Error response for invalid selector parameters
 */
const createErrorResponse = (errorMessage: string): PaginatedData => ({
  data: [],
  pagination: {
    currentPage: 0,
    pageSize: DEFAULT_PAGINATION_STATE.pageSize,
    totalCount: 0,
    totalPages: 0,
    isLoading: false,
    hasMore: false,
    hasFetched: false,
    error: errorMessage,
  },
});

/**
 * Selects paginated data for a collection of entities
 */
export const selectPaginatedData = <T>(
  entityName: string,
  paginationType: string,
  paginationKey: string,
  isAccumulated: boolean = false
) =>
  createSelector(
    [selectEntityCollection(entityName), selectPaginationType(paginationType)],
    (entityCollection, paginationByType): PaginatedData => {
      // Validate required parameters
      if (!entityName || !paginationType || !paginationKey) {
        return createErrorResponse("Missing required parameters");
      }

      console.log(entityCollection, paginationByType[paginationKey]);

      // Get pagination state for the requested key
      const paginationState: PaginationState =
        paginationByType[paginationKey] || DEFAULT_PAGINATION_STATE;

      return createPaginatedData<T>(
        paginationState,
        entityCollection as Record<string, T>,
        isAccumulated
      );
    }
  );

/**
 * Selects a single entity by ID
 */
export const selectEntityById = <T>(entityName: string, entityId: string) =>
  createSelector(
    [selectEntityCollection(entityName)],
    (entityCollection): T | null => {
      if (!entityName || !entityId) {
        return null;
      }

      return (entityCollection[entityId] as T) || null;
    }
  );

