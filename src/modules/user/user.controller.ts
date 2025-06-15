import { Controller, Get, Param, UseGuards, Version } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { User } from '../../common/decorators/user.decorator';
import { IdParamDto } from '../../common/dto/id-param.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @Version('1')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieves the profile of the currently authenticated user',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  async getProfile(@User() user: UserResponseDto) {
    return user;
  }

  @Get(':id')
  @Version('1')
  @Roles(UserRole.Admin)
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
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  async getUserById(@Param() { id }: IdParamDto) {
    return this.userService.findById(id);
  }
}
