export interface PaginationMeta {
  paginationKey: string;
  pageFetched: "first" | "next" | "prev"; // Indicates which page relative to current state
  pageSize: number;
  reset?: boolean; // Indicates if this fetch should replace existing IDs
}

// Type definition for action meta related to entity manipulation
export interface EntityMeta {
  itemId?: string | string[]; // ID of item(s) being acted upon (e.g., for deletion)
  entityName?: string; // e.g., 'articles'
}

// --- Refined Default Pagination State ---
export const DEFAULT_PAGINATION_STATE = {
  ids: [] as (string | Record<string, any>)[], // Combined IDs from all fetched pages for this key
  currentPage: 0, // The last successfully fetched page number (1-based)
  pageSize: 20, // Default page size, updated on first successful fetch
  nextPageKey: null as string | null, // Token/cursor/ID for the next page from API
  prevPageKey: null as string | null, // Token/cursor/ID for the previous page (if supported by API)
  totalCount: 0, // Total number of items if known
  hasReachedEnd: false, // Flag if the API indicated no more next pages
  isFetching: false, // Is a request currently in progress?
  // hasFetched: false, // Redundant - can be inferred from currentPage > 0 or ids.length > 0
  // pageDirection: 'idle', // Overly complex - isFetching + pageFetched meta is enough
  error: null as string | null, // Store specific pagination errors
};
export type PaginationState = typeof DEFAULT_PAGINATION_STATE;
