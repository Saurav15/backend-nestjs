import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as UserEntity } from '../../database/entities/user.entity';

/**
 * Decorator to extract the authenticated user from the request
 * @param data - Optional key to extract specific property from user
 * @param ctx - Execution context
 * @returns User object or specific user property
 */
export const User = createParamDecorator(
  (data: keyof UserEntity | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
