import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Version,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { ResponseBuilder } from '../../common/utils/response-builder';
import { ApiResponseInterface } from 'src/common/interfaces/api-response.interface';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('Authentication')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    const data = await this.authService.register(registerDto);

    return ResponseBuilder.success(
      data,
      'User registered successfully',
      HttpStatus.CREATED,
    );
  }

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
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<ApiResponseInterface<AuthResponseDto>> {
    const data = await this.authService.login(loginDto);

    return ResponseBuilder.success(data, 'Login successful', HttpStatus.OK);
  }

  // @Post('admin-only')
  // @Roles(UserRole.Admin)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @ApiOperation({
  //   summary: 'Admin only endpoint',
  //   description: 'This endpoint can only be accessed by users with Admin role.',
  // })
  // @SwaggerApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'Successfully accessed admin endpoint',
  // })
  // @SwaggerApiResponse({
  //   status: HttpStatus.UNAUTHORIZED,
  //   description: 'User does not have required role',
  // })
  // async adminOnly() {
  //   return ResponseBuilder.success(null, 'Admin access granted', HttpStatus.OK);
  // }
}
