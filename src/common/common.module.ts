/**
 * CommonModule provides shared utilities, global interceptors, and filters for the application.
 *
 * Dependencies:
 * - TypeOrmModule: Provides access to the User entity for shared database operations.
 * - JwtModule: Handles JWT token creation and validation for authentication.
 * - ConfigModule: Supplies environment-based configuration for JWT secrets and options.
 *
 * Global Providers:
 * - ResponseInterceptor: Standardizes all API responses.
 * - CustomHttpExceptionFilter: Handles and formats all HTTP and system errors globally.
 * - ValidationPipe: Globally validates and transforms incoming requests.
 */
import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { CustomHttpExceptionFilter } from './filters/custom-http-exception.filter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: CustomHttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          whitelist: true,
          transform: true,
          forbidNonWhitelisted: true,
        }),
    },
  ],
  exports: [JwtModule],
})
export class CommonModule {}
