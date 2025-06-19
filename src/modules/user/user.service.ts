/**
 * Service for user management logic, including listing, retrieval, and role updates.
 */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { UserRole } from '../../common/enums';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Returns a paginated list of users.
   * @param paginationDto Pagination options
   * @returns Paginated list of users
   */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: users.map((user) => new UserResponseDto(user)),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Returns a user by their unique ID.
   * Throws NotFoundException if user does not exist.
   * @param id User ID
   * @returns UserResponseDto
   */
  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOneBy({ id });

    // Throw if user not found
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return new UserResponseDto(user);
  }

  /**
   * Updates the role of a user.
   * Throws NotFoundException if user does not exist.
   * Throws ForbiddenException if trying to demote an admin.
   * Throws HttpException if user already has the role.
   * @param userId User ID
   * @param updateRoleDto New role
   * @returns Updated user
   */
  async updateRole(
    userId: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOneBy({ id: userId });

    // Throw if user not found
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Prevent changing role of another admin
    if (user.role === UserRole.Admin && updateRoleDto.role !== UserRole.Admin) {
      throw new ForbiddenException('Cannot change role of an admin user');
    }

    // Prevent setting the same role
    if (user.role === updateRoleDto.role) {
      throw new HttpException(
        'User already has this role',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update the role
    user.role = updateRoleDto.role;
    const updatedUser = await this.userRepository.save(user);
    return new UserResponseDto(updatedUser);
  }
}
