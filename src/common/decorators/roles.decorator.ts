import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required role for a route
 * @param role - The role required to access the route
 * @returns Decorator function
 * @example
 * ```typescript
 * @Roles(UserRole.Admin)
 * @UseGuards(RolesGuard)
 * async adminOnly() {}
 * ```
 */
export const Roles = (role: UserRole) => SetMetadata(ROLES_KEY, role); 