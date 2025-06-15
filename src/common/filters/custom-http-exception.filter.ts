import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch()
export class CustomHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CustomHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Get status code and message based on exception type
    const { statusCode, message, details } = this.getErrorDetails(exception);

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${statusCode} - ${message}`,
      exception instanceof Error ? exception.stack : 'Unknown error',
    );

    // Send response
    const errorResponse: ApiResponse = {
      status: 'error',
      statusCode,
      message,
      error: details ? { details } : null,
    };

    response.status(statusCode).json(errorResponse);
  }

  private getErrorDetails(exception: unknown): {
    statusCode: number;
    message: string;
    details?: any;
  } {
    // Handle HttpException
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const response = exception.getResponse();

      // Handle validation errors from class-validator
      if (exception instanceof BadRequestException) {
        if (Array.isArray(response)) {
          return {
            statusCode,
            message: 'Validation failed',
            details: {
              errors: response,
            },
          };
        }

        // Handle object response from class-validator
        if (typeof response === 'object' && response !== null) {
          const validationResponse = response as any;
          if (
            validationResponse.message &&
            Array.isArray(validationResponse.message)
          ) {
            return {
              statusCode,
              message: 'Validation failed',
              details: {
                errors: validationResponse.message,
              },
            };
          }
        }
      }

      // Extract message and details from the response
      const message =
        typeof response === 'string'
          ? response
          : (response as any).message || exception.message;
      const details =
        typeof response === 'object' ? (response as any).details : undefined;

      return {
        statusCode,
        message,
        details,
      };
    }

    // Handle TypeORM errors
    if (exception instanceof Error) {
      if (exception.message.includes('duplicate key')) {
        // Extract the field name from the error message
        const fieldMatch = exception.message.match(/Key \(([^)]+)\)/);
        const field = fieldMatch ? fieldMatch[1] : 'unknown';

        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'Resource already exists',
          details: { field },
        };
      }

      if (exception.message.includes('violates foreign key constraint')) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid reference data',
        };
      }
    }

    // Handle unknown errors
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? exception : undefined,
    };
  }
}
