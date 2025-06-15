import { ApiResponse } from '../interfaces/api-response.interface';

export class ResponseBuilder {
  static success<T>(
    data: T,
    message?: string,
    statusCode: number = 200,
  ): ApiResponse<T> {
    return {
      status: 'success',
      statusCode,
      message: message || 'Operation successful',
      data,
    };
  }
}
