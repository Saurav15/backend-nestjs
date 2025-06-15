export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  statusCode: number;
  message: string;
  data?: T;
  error?: { details?: any } | null;
}
