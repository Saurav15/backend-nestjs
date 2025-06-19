/**
 * Metadata for paginated API responses.
 */
export interface PaginationMeta {
  /** Total number of items */
  total: number;
  /** Current page number */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of pages */
  totalPages: number;
}

/**
 * Standardized paginated response interface.
 * @template T Type of the response data
 */
export interface PaginatedResponse<T> {
  /** Array of items */
  data: T[];
  /** Pagination metadata */
  meta: PaginationMeta;
}
