import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/database/entities/user.entity';
import { UserRole } from 'src/common/enums';

export class UserResponseDto {
  @ApiProperty({ example: 1, description: 'The unique identifier of the user' })
  id: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email address of the user',
  })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
  })
  fullName: string;

  @ApiProperty({
    example: 'viewer',
    enum: UserRole,
    description: 'The role of the user',
  })
  role: UserRole;

  constructor(partialUser: Partial<User>) {
    if (partialUser.id) this.id = partialUser.id;
    if (partialUser.email) this.email = partialUser.email;
    if (partialUser.fullName) this.fullName = partialUser.fullName;
    if (partialUser.role) this.role = partialUser.role;
  }
}

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto, description: 'The user data' })
  user: UserResponseDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  token: string;

  constructor(user: Partial<User>, token: string) {
    this.user = new UserResponseDto(user);
    this.token = token;
  }

  static create(user: Partial<User>, token: string): AuthResponseDto {
    return new AuthResponseDto(user, token);
  }
}
