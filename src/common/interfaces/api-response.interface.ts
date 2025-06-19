/**
 * Standardized API response interface for all endpoints.
 * @template T Type of the response data
 */
export interface ApiResponseInterface<T = any> {
  /** Status of the response: 'success' or 'error' */
  status: 'success' | 'error';
  /** HTTP status code */
  statusCode: number;
  /** Human-readable message */
  message: string;
  /** Response data (if any) */
  data?: T;
  /** Error details (if any) */
  error?: { details?: any } | null;
}
