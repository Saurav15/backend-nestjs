import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route
 * @param roles - The roles required to access the route
 * @returns Decorator function
 * @example
 * ```typescript
 * @Roles([UserRole.Admin])
 * @UseGuards(RolesGuard)
 * async adminOnly() {}
 * ```
 */
export const Roles = (roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
