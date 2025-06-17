import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { HttpStatus } from '@nestjs/common';
import { ResponseBuilder } from '../../common/utils/response-builder';
import { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto';
import { UserRole } from '../../common/enums';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    fullName: 'Test User',
  };

  const mockAuthResponse = AuthResponseDto.create(mockUser, 'mock-jwt-token');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const validRegisterDto: RegisterDto = {
      email: 'test@example.com',
      password: 'Password123!',
      fullName: 'Test User',
    };

    it('should successfully register a new user', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(validRegisterDto);

      expect(authService.register).toHaveBeenCalledWith(validRegisterDto);
      expect(result).toEqual(
        ResponseBuilder.success(
          mockAuthResponse,
          'User registered successfully',
          HttpStatus.CREATED,
        ),
      );
    });

    it('should handle registration with existing email', async () => {
      const error = new Error('User with this email already exists');
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(validRegisterDto)).rejects.toThrow(
        'User with this email already exists',
      );
      expect(authService.register).toHaveBeenCalledWith(validRegisterDto);
    });
  });

  describe('login', () => {
    const validLoginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should successfully login a user', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(validLoginDto);

      expect(authService.login).toHaveBeenCalledWith(validLoginDto);
      expect(result).toEqual(
        ResponseBuilder.success(
          mockAuthResponse,
          'Login successful',
          HttpStatus.OK,
        ),
      );
    });

    it('should handle login with invalid credentials', async () => {
      const error = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(validLoginDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(authService.login).toHaveBeenCalledWith(validLoginDto);
    });
  });
});
