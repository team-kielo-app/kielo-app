// src/pagination/actions.ts
import { seq } from "transducers.js";
import { AppDispatch, RootState } from "@store/store"; // Assuming types are defined
import { makeQueryString } from "@utils/url"; // Keep utility
import { assertInvariant } from "@utils/assert"; // Keep utility
import {
  PaginationMeta,
  EntityMeta,
  DEFAULT_PAGINATION_STATE,
} from "./constants"; // Import meta types

// Define the structure for the API request function passed to withPagination
type ApiRequestFunction<T = any> = (params: {
  queryString?: string;
  body?: any;
  meta: PaginationMeta | EntityMeta; // Pass structured metadata
  credentials?: any; // Keep credentials if needed by the API function
  endpoint: string; // Pass endpoint for flexibility
  verb: "GET" | "POST" | "PUT" | "DELETE";
}) => T; // Return type could be the thunk/action itself

/**
 * Higher-order function to wrap API calls with pagination logic for LISTING data.
 */
export function withPaginationList<S extends RootState>({
  apiRequestFunction,
  getStatePaginationData, // (state: S) => PaginationStateMap
  paginationKey,
  pageSize = 20,
  fetchPolicy = "fetchIfNeeded", // 'fetchIfNeeded', 'forceFetch'
  additionalQueryParams = {},
}: {
  apiRequestFunction: ApiRequestFunction;
  getStatePaginationData: (state: S) => Record<string, PaginationState>;
  paginationKey: string;
  pageSize?: number;
  fetchPolicy?: "fetchIfNeeded" | "forceFetch";
  additionalQueryParams?: Record<string, any>;
}) {
  return (
      options: {
        reset?: boolean;
        fetchNext?: boolean;
        fetchPrevious?: boolean;
      } = {}
    ) =>
    (dispatch: AppDispatch, getState: () => S) => {
      const {
        reset = false,
        fetchNext = false,
        fetchPrevious = false,
      } = options;

      const state = getState();
      const paginationStateMap = getStatePaginationData(state);
      const currentPagination =
        paginationStateMap[paginationKey] || DEFAULT_PAGINATION_STATE;

      const { isFetching, nextPageKey, prevPageKey, ids, currentPage } =
        currentPagination;

      // Determine which page to fetch
      let pageToFetch: "first" | "next" | "prev" = "first";
      let cursor: string | null = null;

      if (!reset) {
        if (fetchNext && nextPageKey) {
          pageToFetch = "next";
          cursor = nextPageKey;
        } else if (fetchPrevious && prevPageKey) {
          pageToFetch = "prev";
          cursor = prevPageKey;
        } else if (fetchNext && !nextPageKey && !isFetching) {
          // Already at the end or fetching last page
          console.log(
            `Pagination [${paginationKey}]: Already at end or fetching.`
          );
          return Promise.resolve(); // No-op
        } else if (
          !fetchNext &&
          !fetchPrevious &&
          currentPage > 0 &&
          fetchPolicy === "fetchIfNeeded"
        ) {
          console.log(
            `Pagination [${paginationKey}]: Already fetched, use fetchPolicy='forceFetch' or reset=true to refetch.`
          );
          return Promise.resolve(); // Already fetched something, don't fetch first page again unless forced/reset
        }
        // else: fall through to fetch 'first' page if nothing else matches and reset=false
      }

      // Prevent fetching if already in progress, unless it's a forced reset
      if (isFetching && !(reset && fetchPolicy === "forceFetch")) {
        console.log(
          `Pagination [${paginationKey}]: Fetch already in progress.`
        );
        return Promise.resolve(); // Or return the existing promise if tracked
      }

      // Construct Query String (adapt based on API: cursor, page number, offset...)
      const queryParams: Record<string, any> = {
        page_size: pageSize,
        ...additionalQueryParams,
      };
      if (cursor) {
        // Adapt param name based on API ('next', 'cursor', 'after', 'before' etc.)
        if (pageToFetch === "next") queryParams.next = cursor;
        if (pageToFetch === "prev") queryParams.prev = cursor; // Or 'before', etc.
      }
      const queryString = makeQueryString(queryParams);

      // Prepare metadata for the action
      const meta: PaginationMeta = {
        paginationKey,
        pageFetched: reset ? "first" : pageToFetch,
        pageSize,
        reset,
      };

      // Dispatch the actual API request thunk
      return dispatch(
        apiRequestFunction({
          // Assuming apiRequestFunction needs endpoint/verb passed here now
          endpoint: "", // Will be set in the specific action creator
          verb: "GET", // Default for listing
          queryString,
          meta,
          // credentials can be added here or handled by the apiRequestFunction internally
        })
      );
    };
}

/**
 * Higher-order function to wrap API calls for single entity actions (DELETE, PATCH)
 * that might affect pagination lists.
 */
export function withPaginationEntityAction<S extends RootState>({
  apiRequestFunction, // Needs endpoint, verb, body, meta
  getStatePaginationData, // Optional: only if action needs pagination state
  paginationKey, // Optional: if action affects a specific list
  entityName,
  itemId,
  verb,
}: {
  apiRequestFunction: ApiRequestFunction;
  getStatePaginationData?: (state: S) => Record<string, PaginationState>; // Only if needed
  paginationKey?: string; // Key of the list this item might belong to
  entityName: string; // e.g., 'articles'
  itemId: string | string[];
  verb: "DELETE" | "PUT" | "PATCH"; // Actions typically affecting entities
}) {
  assertInvariant(apiRequestFunction, "apiRequestFunction is required");
  assertInvariant(entityName, "entityName is required");
  assertInvariant(itemId, "itemId is required");

  return (
      body?: any // Allow passing a body for PUT/PATCH
    ) =>
    (dispatch: AppDispatch, getState: () => S) => {
      // Prepare metadata
      const meta: EntityMeta = {
        entityName,
        itemId,
        ...(paginationKey && { paginationKey }), // Include paginationKey if provided
      };

      // Dispatch the API request
      return dispatch(
        apiRequestFunction({
          endpoint: "", // Set in specific action creator
          verb,
          body,
          meta,
          // credentials etc.
        })
      );
    };
}
