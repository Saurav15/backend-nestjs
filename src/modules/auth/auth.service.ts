/**
 * Service for authentication logic: user registration and login.
 * Handles password hashing, user creation, and JWT token generation.
 */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { BcryptUtil } from 'src/common/utils/bcrypt.util';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registers a new user, hashes password, and returns JWT token.
   * Throws ConflictException if user already exists.
   * @param registerDto Registration data
   * @returns Auth response with JWT token
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, fullName } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await BcryptUtil.hashPassword(password);

    // Create new user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      fullName,
    });

    // Save user to database
    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const payload = {
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    };
    const token = this.jwtService.sign(payload);

    return AuthResponseDto.create(savedUser, token);
  }

  /**
   * Authenticates a user and returns JWT token.
   * Throws UnauthorizedException if credentials are invalid.
   * @param loginDto Login credentials
   * @returns Auth response with JWT token
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await BcryptUtil.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return AuthResponseDto.create(user, token);
  }
}
