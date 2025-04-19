export interface PaginatedData {
  data: object[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    isLoading: boolean;
    hasFetched: boolean;
    hasMore: boolean;
    error: string | null;
  };
}

export interface PaginationMeta {
  paginationKey: string;
  pageFetched: "first" | "next" | "prev";
  pageSize: number;
  reset?: boolean;
}

export interface EntityMeta {
  itemId?: string | string[];
  entityName?: string;
}

import { DEFAULT_PAGINATION_STATE } from "./constants";
export type PaginationState = typeof DEFAULT_PAGINATION_STATE;

