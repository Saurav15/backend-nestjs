export interface ApiResponseInterface<T = any> {
  status: 'success' | 'error';
  statusCode: number;
  message: string;
  data?: T;
  error?: { details?: any } | null;
}
