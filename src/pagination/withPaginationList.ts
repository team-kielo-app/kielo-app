// src/pagination/withPaginationList.ts
// --- NEW FILE: Extracted HOC ---
import { AppDispatch, RootState } from '@store/store'
import { makeQueryString } from '@utils/url'
import { assertInvariant } from '@utils/assert'
import { DEFAULT_PAGINATION_STATE } from './constants'
import type { PaginationMeta, PaginationStateType, FetchPolicy } from './types'
import { ThunkAction } from 'redux-thunk'

const LIST_STALE_THRESHOLD_MS = 5 * 60 * 1000

type ApiRequestThunkCreator = (params: {
  queryString?: string
  body?: Record<string, unknown> | unknown[] | undefined
  meta: PaginationMeta
}) => ThunkAction<Promise<any>, RootState, unknown, any>

interface WithPaginationListConfig<S extends RootState> {
  apiRequestFunction: ApiRequestThunkCreator // From previous refactor
  getStatePaginationData: (state: S) => Record<string, PaginationStateType>
  paginationKey: string
  pageSize?: number
  // fetchPolicy is now part of options passed to the returned thunk creator
  // fetchPolicy?: FetchPolicy; // REMOVE from HOC config if passed in options
  additionalQueryParams?: Record<string, any>
}

interface FetchListOptions {
  reset?: boolean
  fetchNext?: boolean
  fetchPrevious?: boolean
  fetchPolicy?: FetchPolicy // Add fetchPolicy here
  forceRefresh?: boolean // To explicitly bypass cache checks for this call
}

// Extracted HOC (~90 lines)
export function withPaginationList<S extends RootState>({
  apiRequestFunction,
  getStatePaginationData,
  paginationKey,
  pageSize = 20,
  additionalQueryParams = {}
}: WithPaginationListConfig<S>) {
  // --- Initial validation of HOC configuration ---
  assertInvariant(
    typeof apiRequestFunction === 'function',
    'apiRequestFunction must be a function.'
  )
  assertInvariant(
    typeof getStatePaginationData === 'function',
    'getStatePaginationData must be a function.'
  )
  assertInvariant(
    typeof paginationKey === 'string' && paginationKey.length > 0,
    'paginationKey must be a non-empty string.'
  )

  // Return the thunk action creator that takes fetch options
  return (
      options: FetchListOptions = {} // Options now include fetchPolicy
    ) =>
    (dispatch: AppDispatch, getState: () => S): Promise<any> => {
      const {
        reset = false,
        fetchNext = false,
        fetchPrevious = false,
        fetchPolicy = 'cache-first', // Default fetch policy for this specific call
        forceRefresh = false
      } = options

      const state = getState()
      const paginationStateMap = getStatePaginationData(state)
      const currentPagination =
        paginationStateMap[paginationKey] || DEFAULT_PAGINATION_STATE

      const {
        isLoading,
        nextPageKey,
        prevPageKey,
        currentPage,
        ids,
        lastSuccessfulFetchAt
      } = currentPagination

      let pageToFetch: 'first' | 'next' | 'prev' = 'first'
      let cursor: string | null = null
      let shouldProceedWithApiCall = true // Renamed from canFetch for clarity

      const isListStale =
        !lastSuccessfulFetchAt ||
        Date.now() - lastSuccessfulFetchAt > LIST_STALE_THRESHOLD_MS
      const listHasData = ids && ids.length > 0

      if (forceRefresh) {
        console.log(`Pagination [${paginationKey}]: Force refresh requested.`)
        // Proceed with API call, reset will handle 'first' page logic
      } else if (!reset) {
        // Not a reset, consider existing state and policy
        if (fetchNext) {
          if (nextPageKey) {
            pageToFetch = 'next'
            cursor = nextPageKey
          } else {
            // No next page key
            if (!isLoading)
              console.log(
                `Pagination [${paginationKey}]: Cannot fetch next, no nextPageKey.`
              )
            shouldProceedWithApiCall = false
          }
        } else if (fetchPrevious) {
          if (prevPageKey) {
            pageToFetch = 'prev'
            cursor = prevPageKey
          } else {
            // No prev page key
            if (!isLoading)
              console.log(
                `Pagination [${paginationKey}]: Cannot fetch previous, no prevPageKey.`
              )
            shouldProceedWithApiCall = false
          }
        } else {
          // Initial fetch for this key, or re-fetch current view (not next/prev)
          if (fetchPolicy === 'cache-only') {
            if (!listHasData || isListStale) {
              // Or just !listHasData if cache-only means "must exist"
              console.log(
                `Pagination [${paginationKey}]: Cache-only, but no fresh data. Not fetching.`
              )
              shouldProceedWithApiCall = false
            } else {
              console.log(
                `Pagination [${paginationKey}]: Cache-only, using existing data.`
              )
              shouldProceedWithApiCall = false // Data exists and is fresh enough, or policy is cache-only
            }
          } else if (fetchPolicy === 'cache-first') {
            if (listHasData && !isListStale) {
              console.log(
                `Pagination [${paginationKey}]: Cache-first, fresh data exists. Not fetching.`
              )
              shouldProceedWithApiCall = false
            } else {
              console.log(
                `Pagination [${paginationKey}]: Cache-first, data missing or stale. Fetching.`
              )
            }
          } else if (fetchPolicy === 'cache-and-network') {
            console.log(
              `Pagination [${paginationKey}]: Cache-and-network. Will use cache (if any) and fetch.`
            )
            // UI shows cached data, API call proceeds to update.
          } else if (fetchPolicy === 'network-only') {
            console.log(
              `Pagination [${paginationKey}]: Network-only. Fetching.`
            )
          }
        }
      } // End of !reset block. If reset=true, we generally proceed unless loading.

      // Guard Clauses
      if (isLoading && !forceRefresh) {
        // Allow forceRefresh to bypass isLoading if desired (e.g. to cancel and restart)
        // Though generally, you might want to prevent multiple fetches.
        // The original code had: !(reset && fetchPolicy === 'forceFetch')
        // Let's stick to a simpler: if loading and not forcing, don't start new.
        console.log(
          `Pagination [${paginationKey}]: Fetch blocked, already in progress.`
        )
        return Promise.resolve()
      }
      if (!shouldProceedWithApiCall && !forceRefresh) {
        // Added !forceRefresh here
        console.log(
          `Pagination [${paginationKey}]: Fetch conditions not met. Policy: ${fetchPolicy}, Reset: ${reset}`
        )
        return Promise.resolve()
      }

      // --- Prepare API Call ---
      const queryParams: Record<string, any> = {
        page_size: pageSize,
        ...additionalQueryParams
      }
      if (cursor) {
        if (pageToFetch === 'next') queryParams.next = cursor
        if (pageToFetch === 'prev') queryParams.prev = cursor
      }
      const queryString = makeQueryString(queryParams)

      const meta: PaginationMeta = {
        paginationKey,
        pageFetched: reset || forceRefresh ? 'first' : pageToFetch, // If forceRefresh, treat as fetching 'first' page of a new set
        pageSize,
        reset: reset || forceRefresh, // forceRefresh implies a reset of the current list view
        fetchPolicy: fetchPolicy // Pass policy for potential use in reducers/meta
      }

      console.log(
        `Pagination [${paginationKey}]: Dispatching API request. Query: ${queryString}, Meta:`,
        meta
      )
      return dispatch(apiRequestFunction({ queryString, meta }))
    }
}
