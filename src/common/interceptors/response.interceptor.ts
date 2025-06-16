import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseInterface } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponseInterface<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseInterface<T>> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();

    return next.handle().pipe(
      map((data) => {
        const statusCode = response.statusCode || HttpStatus.OK;
        const message = data?.message || 'Operation successful';
        const responseData = data?.data || data;

        const apiResponse: ApiResponseInterface<T> = {
          status: 'success',
          statusCode,
          message,
          data: responseData,
        };

        return apiResponse;
      }),
    );
  }
}
