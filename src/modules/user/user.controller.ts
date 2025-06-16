import {
  Controller,
  Get,
  Param,
  UseGuards,
  Version,
  Patch,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { User } from '../../common/decorators/user.decorator';
import { IdParamDto } from '../../common/dto/id-param.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import { ApiResponseInterface } from '../../common/interfaces/api-response.interface';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Version('1')
  @Roles([UserRole.Admin])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all users',
    description:
      'Retrieves a paginated list of all users. Only accessible by admin users.',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: () => PaginatedResponseDto<UserResponseDto>,
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<ApiResponseInterface<PaginatedResponseDto<UserResponseDto>>> {
    const data = await this.userService.findAll(paginationDto);
    return ResponseBuilder.success(data, 'Users retrieved successfully', 200);
  }

  @Get('profile')
  @Version('1')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieves the profile of the currently authenticated user',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  async getProfile(
    @User() user: UserResponseDto,
  ): Promise<ApiResponseInterface<UserResponseDto>> {
    return ResponseBuilder.success(
      user,
      'User profile retrieved successfully',
      200,
    );
  }

  @Get(':id')
  @Version('1')
  @Roles([UserRole.Admin])
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves a user profile by their unique identifier',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the user',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  async getUserById(
    @Param() { id }: IdParamDto,
  ): Promise<ApiResponseInterface<UserResponseDto>> {
    const data = await this.userService.findById(id);
    return ResponseBuilder.success(data, 'User retrieved successfully', 200);
  }

  @Patch(':id/role')
  @Version('1')
  @Roles([UserRole.Admin])
  @ApiOperation({
    summary: 'Update user role',
    description: 'Updates the role of a user. Only accessible by admin users.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the user',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'The new role to assign to the user',
    type: UpdateRoleDto,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'User role updated successfully',
    type: UserResponseDto,
  })
  async updateRole(
    @Param() { id }: IdParamDto,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<ApiResponseInterface<UserResponseDto>> {
    const data = await this.userService.updateRole(id, updateRoleDto);
    return ResponseBuilder.success(data, 'User role updated successfully', 200);
  }
}
