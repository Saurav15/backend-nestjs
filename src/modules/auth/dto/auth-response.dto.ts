import { User } from 'src/database/entities/user.entity';
import { UserRole } from 'src/common/enums';

export class UserResponseDto {
  id: string;

  email: string;

  fullName: string;

  role: UserRole;

  constructor(partialUser: Partial<User>) {
    if (partialUser.id) this.id = partialUser.id;
    if (partialUser.email) this.email = partialUser.email;
    if (partialUser.fullName) this.fullName = partialUser.fullName;
    if (partialUser.role) this.role = partialUser.role;
  }
}

export class AuthResponseDto {
  user: UserResponseDto;

  token: string;

  constructor(user: Partial<User>, token: string) {
    this.user = new UserResponseDto(user);
    this.token = token;
  }

  static create(user: Partial<User>, token: string): AuthResponseDto {
    return new AuthResponseDto(user, token);
  }
}
