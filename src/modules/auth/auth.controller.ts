import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Version,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { ResponseBuilder } from '../../common/utils/response-builder';
import { ApiResponseInterface } from 'src/common/interfaces/api-response.interface';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Throttle } from '@nestjs/throttler';

/**
 * Controller for authentication endpoints (register, login).
 * Handles user registration and JWT-based login.
 */
@ApiTags('Authentication')
@Controller({
  path: 'auth',
  version: '1',
})
@Throttle({ default: { limit: 5, ttl: 60000 } })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registers a new user with email, password, and full name.
   * @param registerDto Registration data
   * @returns Auth response with JWT token
   */
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account with email and password.',
  })
  @ApiBody({ description: 'User registration data', type: RegisterDto })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @SwaggerApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User with this email already exists',
  })
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ApiResponseInterface<AuthResponseDto>> {
    // Throws if user already exists or input is invalid (handled in service)
    const data = await this.authService.register(registerDto);

    return ResponseBuilder.success(
      data,
      'User registered successfully',
      HttpStatus.CREATED,
    );
  }

  /**
   * Authenticates a user and returns a JWT token.
   * @param loginDto Login credentials
   * @returns Auth response with JWT token
   */
  @Post('login')
  @Version('1')
  @ApiOperation({
    summary: 'Login user',
    description:
      'Authenticates a user with email and password and returns a JWT token.',
  })
  @ApiBody({
    description: 'User login credentials',
    type: LoginDto,
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials - Email or password is incorrect',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data - Email or password format is invalid',
  })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<ApiResponseInterface<AuthResponseDto>> {
    // Throws if credentials are invalid (handled in service)
    const data = await this.authService.login(loginDto);

    return ResponseBuilder.success(data, 'Login successful', HttpStatus.OK);
  }
}
