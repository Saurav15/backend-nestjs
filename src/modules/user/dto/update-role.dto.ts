import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRole } from '../../../common/enums';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'The new role to assign to the user',
    enum: UserRole,
    example: UserRole.Admin,
  })
  @IsEnum(UserRole, { message: 'Invalid role' })
  role: UserRole;
}
