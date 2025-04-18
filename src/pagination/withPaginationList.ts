// src/pagination/withPaginationList.ts
// --- NEW FILE: Extracted HOC ---
import { AppDispatch, RootState } from "@store/store";
import { makeQueryString } from "@utils/url";
import { assertInvariant } from "@utils/assert";
import {
  PaginationMeta,
  DEFAULT_PAGINATION_STATE,
  PaginationState,
} from "./constants";
import { ThunkAction } from "redux-thunk";

// Type for the API request function expected by this HOC
type ListApiRequestFunction = (params: {
  queryString?: string;
  meta: PaginationMeta;
  // endpoint/verb might be needed if not baked into the function itself
}) => ThunkAction<Promise<any>, RootState, unknown, any>;

interface WithPaginationListConfig<S extends RootState> {
  apiRequestFunction: ListApiRequestFunction;
  getStatePaginationData: (state: S) => Record<string, PaginationState>;
  paginationKey: string;
  pageSize?: number;
  fetchPolicy?: "fetchIfNeeded" | "forceFetch";
  additionalQueryParams?: Record<string, any>;
}

interface FetchOptions {
  reset?: boolean;
  fetchNext?: boolean;
  fetchPrevious?: boolean;
}

// Extracted HOC (~90 lines)
export function withPaginationList<S extends RootState>({
  apiRequestFunction,
  getStatePaginationData,
  paginationKey,
  pageSize = 20,
  fetchPolicy = "fetchIfNeeded",
  additionalQueryParams = {},
}: WithPaginationListConfig<S>) {
  // --- Initial validation of HOC configuration ---
  assertInvariant(
    typeof apiRequestFunction === "function",
    "apiRequestFunction must be a function."
  );
  assertInvariant(
    typeof getStatePaginationData === "function",
    "getStatePaginationData must be a function."
  );
  assertInvariant(
    typeof paginationKey === "string" && paginationKey.length > 0,
    "paginationKey must be a non-empty string."
  );

  // Return the thunk action creator that takes fetch options
  return (options: FetchOptions = {}) =>
    (dispatch: AppDispatch, getState: () => S): Promise<any> => {
      // Explicitly return Promise
      const {
        reset = false,
        fetchNext = false,
        fetchPrevious = false,
      } = options;

      const state = getState();
      const paginationStateMap = getStatePaginationData(state);
      // Ensure default state is used if key doesn't exist yet
      const currentPagination =
        paginationStateMap[paginationKey] || DEFAULT_PAGINATION_STATE;

      const { isLoading, nextPageKey, prevPageKey, currentPage } =
        currentPagination;

      // --- Determine fetch feasibility and parameters ---
      let pageToFetch: "first" | "next" | "prev" = "first";
      let cursor: string | null = null;
      let canFetch = true;

      if (!reset) {
        if (fetchNext) {
          if (nextPageKey) {
            pageToFetch = "next";
            cursor = nextPageKey;
          } else {
            // Cannot fetch next if no key exists (and not already loading)
            if (!isLoading) {
              console.log(
                `Pagination [${paginationKey}]: Cannot fetch next, no nextPageKey.`
              );
              canFetch = false;
            }
            // If loading, let it proceed, but don't start a *new* fetch for next
            else canFetch = false;
          }
        } else if (fetchPrevious) {
          if (prevPageKey) {
            pageToFetch = "prev";
            cursor = prevPageKey;
          } else {
            // Cannot fetch previous if no key exists (and not already loading)
            if (!isLoading) {
              console.log(
                `Pagination [${paginationKey}]: Cannot fetch previous, no prevPageKey.`
              );
              canFetch = false;
            } else canFetch = false;
          }
        } else if (currentPage > 0 && fetchPolicy === "fetchIfNeeded") {
          // Already fetched initial data, and not requesting next/prev/reset
          console.log(
            `Pagination [${paginationKey}]: Data already fetched, policy is 'fetchIfNeeded'.`
          );
          canFetch = false;
        }
        // else: No specific page requested, not reset, initial fetch needed. pageToFetch remains 'first'.
      }
      // else: Reset is true, pageToFetch remains 'first'.

      // --- Guard Clauses ---
      if (isLoading && !(reset && fetchPolicy === "forceFetch")) {
        console.log(
          `Pagination [${paginationKey}]: Fetch blocked, already in progress.`
        );
        return Promise.resolve(); // Resolve immediately, do nothing
      }
      if (!canFetch) {
        return Promise.resolve(); // Resolve immediately, do nothing
      }

      // --- Prepare API Call ---
      const queryParams: Record<string, any> = {
        page_size: pageSize,
        ...additionalQueryParams,
      };
      if (cursor) {
        // Adapt cursor param name based on API ('next', 'cursor', 'after', 'before'...)
        // Assuming 'next' for next page and 'prev' for previous page based on earlier code
        if (pageToFetch === "next") queryParams.next = cursor;
        if (pageToFetch === "prev") queryParams.prev = cursor;
      }
      const queryString = makeQueryString(queryParams);

      // Prepare metadata for the action
      const meta: PaginationMeta = {
        paginationKey,
        pageFetched: reset ? "first" : pageToFetch,
        pageSize,
        reset,
      };

      // Dispatch the actual API request thunk generated by the factory
      return dispatch(apiRequestFunction({ queryString, meta }));
    };
}

