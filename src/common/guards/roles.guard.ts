/**
 * Guard to enforce role-based access control on routes.
 * Checks if the authenticated user has the required role(s).
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enums';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Determines if the user has one of the required roles for the route.
   * @param context Execution context
   * @returns True if access is granted
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // No roles required
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new UnauthorizedException(
        `User does not have required role. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
