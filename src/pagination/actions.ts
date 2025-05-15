import { AppDispatch, RootState } from '@store/store'
import { makeQueryString } from '@utils/url'
import { assertInvariant } from '@utils/assert'
import { DEFAULT_PAGINATION_STATE } from './constants'
import type { PaginationMeta, EntityMeta, PaginationStateType } from './types'
import { ThunkAction } from '@reduxjs/toolkit'

/**
 * Describes a thunk creator that is configured for a specific API request (endpoint, verb, schema).
 * It takes parameters relevant to the request execution (like query string, body, and metadata for Redux actions)
 * and returns a ThunkAction.
 */
type ApiRequestThunkCreator = (params: {
  queryString?: string
  body?: Record<string, unknown> | unknown[] | undefined
  meta: PaginationMeta | EntityMeta
}) => ThunkAction<Promise<any>, RootState, unknown, any>

/**
 * Higher-order function to wrap API calls with pagination logic for LISTING data.
 */
export function withPaginationList<S extends RootState>({
  apiRequestFunction,
  getStatePaginationData,
  paginationKey,
  pageSize = 20,
  fetchPolicy = 'fetchIfNeeded',
  additionalQueryParams = {}
}: {
  apiRequestFunction: ApiRequestThunkCreator
  getStatePaginationData: (state: S) => Record<string, PaginationStateType>
  paginationKey: string
  pageSize?: number
  fetchPolicy?: 'fetchIfNeeded' | 'forceFetch'
  additionalQueryParams?: Record<string, any>
}) {
  return (
      options: {
        reset?: boolean
        fetchNext?: boolean
        fetchPrevious?: boolean
      } = {}
    ) =>
    (dispatch: AppDispatch, getState: () => S) => {
      const {
        reset = false,
        fetchNext = false,
        fetchPrevious = false
      } = options

      const state = getState()
      const paginationStateMap = getStatePaginationData(state)
      const currentPagination =
        paginationStateMap[paginationKey] || DEFAULT_PAGINATION_STATE

      const { isLoading, nextPageKey, prevPageKey, ids, currentPage } =
        currentPagination

      let pageToFetch: 'first' | 'next' | 'prev' = 'first'
      let cursor: string | null = null

      if (!reset) {
        if (fetchNext && nextPageKey) {
          pageToFetch = 'next'
          cursor = nextPageKey
        } else if (fetchPrevious && prevPageKey) {
          pageToFetch = 'prev'
          cursor = prevPageKey
        } else if (fetchNext && !nextPageKey && !isLoading) {
          console.log(
            `Pagination [${paginationKey}]: Already at end or fetching.`
          )
          return Promise.resolve()
        } else if (
          !fetchNext &&
          !fetchPrevious &&
          currentPage > 0 &&
          fetchPolicy === 'fetchIfNeeded'
        ) {
          console.log(
            `Pagination [${paginationKey}]: Already fetched, use fetchPolicy='forceFetch' or reset=true to refetch.`
          )
          return Promise.resolve()
        }
      }

      if (isLoading && !(reset && fetchPolicy === 'forceFetch')) {
        console.log(`Pagination [${paginationKey}]: Fetch already in progress.`)
        return Promise.resolve()
      }

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
        pageFetched: reset ? 'first' : pageToFetch,
        pageSize,
        reset
      }

      return dispatch(
        apiRequestFunction({
          queryString,
          meta
        })
      )
    }
}

/**
 * Higher-order function to wrap API calls for single entity actions (DELETE, PATCH)
 * that might affect pagination lists.
 */
export function withPaginationEntityAction<S extends RootState>({
  apiRequestFunction,
  getStatePaginationData,
  paginationKey,
  entityName,
  itemId,
  verb
}: {
  apiRequestFunction: ApiRequestThunkCreator
  getStatePaginationData?: (state: S) => Record<string, PaginationStateType>
  paginationKey?: string
  entityName: string
  itemId: string | string[]
  verb: 'DELETE' | 'PUT' | 'PATCH'
}) {
  assertInvariant(apiRequestFunction, 'apiRequestFunction is required')
  assertInvariant(entityName, 'entityName is required')
  assertInvariant(itemId, 'itemId is required')

  return (body?: any) => (dispatch: AppDispatch, getState: () => S) => {
    const meta: EntityMeta = {
      entityName,
      itemId,
      ...(paginationKey && { paginationKey })
    }

    return dispatch(
      apiRequestFunction({
        body,
        meta
      })
    )
  }
}
