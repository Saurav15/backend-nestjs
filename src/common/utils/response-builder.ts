/**
 * Utility class for building standardized API success responses.
 */
import { ApiResponseInterface } from '../interfaces/api-response.interface';

export class ResponseBuilder {
  /**
   * Build a standardized success response.
   * @param data Response data
   * @param message Optional message
   * @param statusCode HTTP status code (default: 200)
   * @returns Standardized API response
   */
  static success<T>(
    data: T,
    message?: string,
    statusCode: number = 200,
  ): ApiResponseInterface<T> {
    return {
      status: 'success',
      statusCode,
      message: message || 'Operation successful',
      data,
    };
  }
}
