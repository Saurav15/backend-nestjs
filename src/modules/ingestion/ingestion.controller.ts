import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { User } from '../../common/decorators/user.decorator';
import { ResponseBuilder } from '../../common/utils/response-builder';
import { IngestionService } from './ingestion.service';
import { IngestionResponseDto, IngestionDataResponseDto } from './dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiResponseInterface } from '../../common/interfaces/api-response.interface';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

/**
 * Controller for document ingestion endpoints (start ingestion, get logs).
 * Secured by JWT and role-based guards. Handles async document processing and log retrieval.
 */
@ApiTags('Ingestion')
@Controller({
  path: 'ingestion',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  /**
   * Initiates the asynchronous ingestion process for a document.
   * Only Editors and Admins can start ingestion.
   * @param documentId Document ID
   * @param userId Authenticated user ID
   * @returns Ingestion log entry for the started process
   */
  @Post('start/:id')
  @HttpCode(HttpStatus.OK)
  @Roles([UserRole.Editor, UserRole.Admin])
  @ApiOperation({
    summary: 'Start document ingestion process',
    description:
      'Initiates the asynchronous processing of a document. Updates both document status and creates an ingestion log entry.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the document to start ingestion for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Ingestion process started successfully',
    type: IngestionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - Document not found, invalid status, or already in progress',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async startIngestion(
    @Param('id') documentId: string,
    @User('id') userId: string,
  ): Promise<ApiResponseInterface<IngestionResponseDto>> {
    // Throws if document not found, invalid status, or already in progress (handled in service)
    const result = await this.ingestionService.startIngestion(
      documentId,
      userId,
    );
    return ResponseBuilder.success(
      result,
      'Ingestion process started successfully',
      200,
    );
  }

  /**
   * Retrieves paginated ingestion logs and document status for a document.
   * Only Editors and Admins can access. Only the document owner can view logs.
   * @param documentId Document ID
   * @param userId Authenticated user ID
   * @param paginationDto Pagination options
   * @returns Paginated ingestion logs and document status
   */
  @Get('logs/:documentId')
  @Roles([UserRole.Editor, UserRole.Admin])
  @ApiOperation({
    summary: 'Get paginated ingestion logs and document status for a document',
    description:
      'Retrieves paginated ingestion log entries and current document status for a specific document. Logs are ordered by attempt ID (descending) and creation time (descending). Only accessible by the document owner.',
  })
  @ApiParam({
    name: 'documentId',
    description: 'The ID of the document to get ingestion data for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Ingestion data retrieved successfully',
    type: IngestionDataResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - User does not own the document',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async getIngestionData(
    @Param('documentId') documentId: string,
    @User('id') userId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<
    ApiResponseInterface<PaginatedResponseDto<IngestionDataResponseDto>>
  > {
    // Throws if document not found or user does not own document (handled in service)
    const result = await this.ingestionService.getIngestionData(
      documentId,
      userId,
      paginationDto.page || 1,
      paginationDto.limit || 10,
    );
    return ResponseBuilder.success(
      result,
      'Ingestion data retrieved successfully',
      200,
    );
  }
}
