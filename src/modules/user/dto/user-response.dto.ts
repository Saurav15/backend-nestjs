import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums';

export class UserResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe',
  })
  fullName: string;

  @ApiProperty({
    description: 'The role of the user',
    enum: UserRole,
    example: UserRole.Viewer,
  })
  role: UserRole;

  @ApiProperty({
    description: 'The date when the user was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date when the user was last updated',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
