export const DEFAULT_PAGINATION_STATE = {
  ids: [] as (string | Record<string, any>)[], // Combined IDs from all fetched pages for this key
  currentPage: 0, // The last successfully fetched page number (1-based)
  pageSize: 20, // Default page size, updated on first successful fetch
  nextPageKey: null as string | null, // Token/cursor/ID for the next page from API
  prevPageKey: null as string | null, // Token/cursor/ID for the previous page (if supported by API)
  totalCount: 0, // Total number of items if known
  hasReachedEnd: false, // Flag if the API indicated no more next pages
  isLoading: false, // Is a request currently in progress?
  // hasFetched: false, // Redundant - can be inferred from currentPage > 0 or ids.length > 0
  // pageDirection: 'idle', // Overly complex - isLoading + pageFetched meta is enough
  error: null as string | null, // Store specific pagination errors
  lastSuccessfulFetchAt: null
}
