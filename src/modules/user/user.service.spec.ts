import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../database/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { UserResponseDto } from './dto/user-response.dto';
import {
  NotFoundException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { Repository } from 'typeorm';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 'user-uuid',
    email: 'user@example.com',
    fullName: 'Test User',
    role: UserRole.Viewer,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  } as User;

  const mockRepository = {
    findAndCount: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User)) as jest.Mocked<
      Repository<User>
    >;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const paginationDto: PaginationDto = { page: 1, limit: 10 };
    const paginatedResponse: PaginatedResponseDto<UserResponseDto> = {
      data: [new UserResponseDto(mockUser)],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };

    it('should return paginated users', async () => {
      userRepository.findAndCount.mockResolvedValue([[mockUser], 1]);
      const result = await service.findAll(paginationDto);
      expect(userRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(paginatedResponse);
    });

    it('should throw error if repository throws', async () => {
      userRepository.findAndCount.mockRejectedValue(
        new Error('Failed to fetch users'),
      );
      await expect(service.findAll(paginationDto)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      userRepository.findOneBy.mockResolvedValue(mockUser);
      const result = await service.findById('user-uuid');
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        id: 'user-uuid',
      });
      expect(result).toEqual(new UserResponseDto(mockUser));
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findById('user-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateRole', () => {
    const updateRoleDto: UpdateRoleDto = { role: UserRole.Admin };

    it('should update user role', async () => {
      userRepository.findOneBy.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue({
        ...mockUser,
        role: UserRole.Admin,
      });
      const result = await service.updateRole('user-uuid', updateRoleDto);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        id: 'user-uuid',
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        role: UserRole.Admin,
      });
      expect(result).toEqual(
        new UserResponseDto({ ...mockUser, role: UserRole.Admin }),
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOneBy.mockResolvedValue(null);
      await expect(
        service.updateRole('user-uuid', updateRoleDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if trying to change admin role', async () => {
      userRepository.findOneBy.mockResolvedValue({
        ...mockUser,
        role: UserRole.Admin,
      });
      await expect(
        service.updateRole('user-uuid', { role: UserRole.Viewer }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw HttpException if user already has the role', async () => {
      userRepository.findOneBy.mockResolvedValue(mockUser);
      await expect(
        service.updateRole('user-uuid', { role: UserRole.Viewer }),
      ).rejects.toThrow(HttpException);
    });
  });
});
