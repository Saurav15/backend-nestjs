import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/enums/user-role.enum';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { IdParamDto } from '../../common/dto/id-param.dto';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  const mockUserService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    updateRole: jest.fn(),
  };

  const mockUser: UserResponseDto = {
    id: 'user-uuid',
    email: 'user@example.com',
    fullName: 'Test User',
    role: UserRole.Viewer,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService) as jest.Mocked<UserService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    const paginationDto: PaginationDto = { page: 1, limit: 10 };
    const paginatedResponse: PaginatedResponseDto<UserResponseDto> = {
      data: [mockUser],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };

    it('should return paginated users', async () => {
      userService.findAll.mockResolvedValue(paginatedResponse as any);
      const result = await controller.findAll(paginationDto);
      expect(userService.findAll).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(
        ResponseBuilder.success(
          paginatedResponse,
          'Users retrieved successfully',
          200,
        ),
      );
    });

    it('should throw error if service throws', async () => {
      userService.findAll.mockRejectedValue(new Error('Failed to fetch users'));
      await expect(controller.findAll(paginationDto)).rejects.toThrow();
    });
  });

  describe('getProfile', () => {
    it('should return the current user profile', async () => {
      const result = await controller.getProfile(mockUser);
      expect(result).toEqual(
        ResponseBuilder.success(
          mockUser,
          'User profile retrieved successfully',
          200,
        ),
      );
    });
  });

  describe('getUserById', () => {
    const idParam: IdParamDto = { id: 'user-uuid' };

    it('should return a user by id', async () => {
      userService.findById.mockResolvedValue(mockUser as any);
      const result = await controller.getUserById(idParam);
      expect(userService.findById).toHaveBeenCalledWith(idParam.id);
      expect(result).toEqual(
        ResponseBuilder.success(mockUser, 'User retrieved successfully', 200),
      );
    });

    it('should throw error if service throws', async () => {
      userService.findById.mockRejectedValue(
        new NotFoundException('User not found'),
      );
      await expect(controller.getUserById(idParam)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateRole', () => {
    const idParam: IdParamDto = { id: 'user-uuid' };
    const updateRoleDto: UpdateRoleDto = { role: UserRole.Admin };

    it('should update user role', async () => {
      userService.updateRole.mockResolvedValue({
        ...mockUser,
        role: UserRole.Admin,
      } as any);
      const result = await controller.updateRole(idParam, updateRoleDto);
      expect(userService.updateRole).toHaveBeenCalledWith(
        idParam.id,
        updateRoleDto,
      );
      expect(result).toEqual(
        ResponseBuilder.success(
          { ...mockUser, role: UserRole.Admin },
          'User role updated successfully',
          200,
        ),
      );
    });

    it('should throw error if service throws', async () => {
      userService.updateRole.mockRejectedValue(
        new NotFoundException('User not found'),
      );
      await expect(
        controller.updateRole(idParam, updateRoleDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
