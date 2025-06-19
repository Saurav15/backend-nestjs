/**
 * Guard to protect routes using JWT authentication.
 * Validates JWT token and attaches user to the request object.
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/config.validation';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}

  /**
   * Determines if the request has a valid JWT and user.
   * @param context Execution context
   * @returns True if access is granted
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Verify and decode the token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Get user from database
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        select: ['id', 'email', 'fullName', 'role'], // Only select necessary fields
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Attach user to request object
      request.user = user;
      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }

  /**
   * Extracts the JWT token from the Authorization header.
   * @param request Express request
   * @returns JWT token or undefined
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
