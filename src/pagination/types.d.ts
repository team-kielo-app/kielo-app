export interface PaginatedData<DataType = any> {
  data: DataType[]
  pagination: {
    currentPage: number
    pageSize: number
    totalCount: number
    totalPages: number
    isLoading: boolean
    hasFetched: boolean
    hasMore: boolean
    error: string | null
    lastSuccessfulFetchAt?: number | null
  }
}

export interface PaginationMeta {
  paginationKey: string
  pageFetched: 'first' | 'next' | 'prev'
  pageSize: number
  reset?: boolean
  fetchPolicy?: FetchPolicy
}

export interface EntityMeta {
  itemId?: string | string[]
  entityName?: string
}

import { DEFAULT_PAGINATION_STATE } from './constants'
export type PaginationStateType = typeof DEFAULT_PAGINATION_STATE & {
  lastSuccessfulFetchAt?: number | null
}

// Define Fetch Policies
export type FetchPolicy =
  | 'cache-first'
  | 'cache-and-network'
  | 'network-only'
  | 'cache-only'
