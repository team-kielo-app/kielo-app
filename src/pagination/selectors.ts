// src/features/articles/articles.selectors.ts
import { createSelector } from '@reduxjs/toolkit' // Or import from 'reselect'
import type { RootState } from '@store/store' // Your root state type
import { DEFAULT_PAGINATION_STATE } from './constants' // Import default state
import type { PaginationStateType, PaginatedData } from './types'
import type { EntitiesType } from '@entities/types' // Import the core Article type

// Base selectors
const selectEntitiesSlice = (state: RootState) => state.entities
const selectPaginationSlice = (state: RootState) => state.pagination

/**
 * Selects a specific entity type from the entities state
 */
export const selectEntityCollection = (entityName: string) =>
  createSelector(
    [selectEntitiesSlice],
    (entities: { [entityName]: EntitiesType }) => entities[entityName] || {}
  )

/**
 * Selects a specific pagination type from the pagination state
 */
export const selectPaginationType = (paginationType: string) =>
  createSelector(
    [selectPaginationSlice],
    (pagination: { [paginationType]: object }) =>
      pagination[paginationType] || {}
  )

/**
 * Converts an array of entity IDs to their corresponding entity objects
 */
export const mapIdsToEntities = <T>(
  ids: string[],
  entities: Record<string, T>
): T[] => {
  return ids.map(id => entities[id]).filter(Boolean)
}

/**
 * Determines if there are more pages based on page tokens
 */
export const hasMorePages = (
  nextPageToken: string | null,
  isAccumulated: boolean,
  prevPageToken?: string | null
): boolean => {
  if (isAccumulated) {
    return Boolean(nextPageToken)
  }
  return Boolean(nextPageToken) || Boolean(prevPageToken)
}

/**
 * Creates a paginated data object from pagination state and entities
 */
export const createPaginatedData = <T>(
  paginationState: Partial<PaginationStateType>,
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
    lastSuccessfulFetchAt = null
  } = paginationState

  let data: T[] = []

  if (isAccumulated && ids.length > 0 && currentPage >= 1) {
    // Calculate current page slice for accumulated data
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const pageIds = ids.slice(startIndex, endIndex)
    data = mapIdsToEntities(pageIds, entities)
  } else {
    // Use all relevant IDs for non-accumulated data
    data = mapIdsToEntities(ids, entities)
  }

  // Calculate pagination metadata
  const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0
  const hasMore = hasMorePages(nextPageToken, isAccumulated, prevPageToken)

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
      lastSuccessfulFetchAt
    }
  }
}

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
    error: errorMessage
  }
})

/**
 * Selects paginated data for a collection of entities
 */
export const selectPaginatedData = <T extends { _lastFetchedAt?: number }>( // T now has _lastFetchedAt
  entityName: string, // e.g., 'articles'
  paginationType: string, // e.g., 'articlePagination'
  paginationKey: string,
  isAccumulated: boolean = false // Keep this for flexibility
) =>
  createSelector(
    [
      (state: RootState) => state.entities[entityName as string] || {}, // Entity collection
      (state: RootState) =>
        state.pagination[paginationType]?.[paginationKey] ||
        DEFAULT_PAGINATION_STATE
    ],
    (
      entityCollection: Record<string, T>,
      paginationState: PaginationStateType
    ): PaginatedData<T> => {
      // Ensure return type matches generic
      // console.log(`Selector for ${entityName} - ${paginationKey} recomputing. PS LastFetch: ${paginationState.lastSuccessfulFetchAt}`);

      const {
        ids = [],
        currentPage = 1,
        pageSize = DEFAULT_PAGINATION_STATE.pageSize,
        totalCount = 0,
        isLoading = false,
        // hasFetched removed, will derive
        nextPageKey = null, // Renamed from nextPageToken for consistency with pagination state
        prevPageKey = null, // Renamed from prevPageToken
        error = null,
        lastSuccessfulFetchAt = null
      } = paginationState

      let resolvedData: T[] = []
      const idArrayToProcess = ids || [] // Ensure ids is an array

      if (isAccumulated && idArrayToProcess.length > 0 && currentPage >= 1) {
        const startIndex = (currentPage - 1) * pageSize
        const endIndex = startIndex + pageSize
        const pageIds = idArrayToProcess.slice(startIndex, endIndex)
        resolvedData = pageIds
          .map(
            id => entityCollection[typeof id === 'object' ? (id as any).id : id]
          ) // Handle if IDs are objects
          .filter(Boolean) as T[]
      } else {
        resolvedData = idArrayToProcess
          .map(
            id => entityCollection[typeof id === 'object' ? (id as any).id : id]
          )
          .filter(Boolean) as T[]
      }

      const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0
      // hasMorePages function might need to use nextPageKey/prevPageKey from paginationState
      const hasMore = !!nextPageKey // Simpler, based on next cursor
      const hasFetched = currentPage > 0 || idArrayToProcess.length > 0

      return {
        data: resolvedData,
        pagination: {
          currentPage,
          pageSize,
          totalCount,
          totalPages,
          isLoading,
          hasMore,
          hasFetched,
          error,
          lastSuccessfulFetchAt // Include this
          // prevPageKey, // Optionally include if UI needs it
          // nextPageKey, // Optionally include if UI needs it
        }
      }
    }
  )

/**
 * Selects a single entity by ID
 */
export const selectEntityById = <T>(entityName: string, entityId: string) =>
  createSelector(
    [selectEntityCollection(entityName)],
    (entityCollection): T | object => {
      if (!entityName || !entityId) {
        return {}
      }

      return (entityCollection[entityId] as T) || {}
    }
  )
