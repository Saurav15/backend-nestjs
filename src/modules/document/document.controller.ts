import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseFilePipe,
  Query,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums';
import { DocumentService } from './document.service';
import { ApiResponseInterface } from 'src/common/interfaces/api-response.interface';
import { DocumentResponseDto } from './dto/document-response.dto';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import { User } from 'src/common/decorators/user.decorator';
import { User as UserEntity } from 'src/database/entities/user.entity';
import { ListDocumentsDto } from './dto/list-documents.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { Throttle } from '@nestjs/throttler';

/**
 * Controller for document management endpoints (upload, list, retrieve by ID).
 * Secured by JWT and role-based guards. Integrates with S3 for file storage.
 */
@ApiTags('Documents')
@Controller({
  path: 'documents',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  /**
   * Upload a PDF document to S3 and save its metadata.
   * Only Admins and Editors can upload.
   * @param file PDF file
   * @param uploadDocumentDto Document metadata
   * @param user Authenticated user
   * @returns Uploaded document details
   */
  @Post('upload')
  @Roles([UserRole.Admin, UserRole.Editor])
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload a document',
    description:
      'Upload a PDF document (max 25MB) to S3 and save its metadata in the database',
  })
  @ApiBody({
    type: UploadDocumentDto,
    description: 'Document metadata and file to upload',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Document uploaded successfully',
    type: DocumentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or file type/size',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Insufficient permissions',
  })
  async uploadDocument(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 25 * 1024 * 1024 }), // 25MB
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() uploadDocumentDto: UploadDocumentDto,
    @User() user: UserEntity,
  ): Promise<ApiResponseInterface<DocumentResponseDto>> {
    // Throws if file is missing or upload fails (handled in service)
    const document = await this.documentService.uploadDocument(
      file,
      uploadDocumentDto,
      user,
    );
    return ResponseBuilder.success(
      document,
      'Document uploaded successfully',
      HttpStatus.CREATED,
    );
  }

  /**
   * List paginated documents for the authenticated user.
   * Supports filtering by status and ordering.
   * Only Admins and Editors can list documents.
   * @param query List options
   * @param user Authenticated user
   * @returns Paginated list of documents
   */
  @Get()
  @Roles([UserRole.Admin, UserRole.Editor])
  @ApiOperation({
    summary: 'List user documents',
    description:
      'Get a paginated list of user documents with optional status filtering and ordering',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Documents retrieved successfully',
    type: PaginatedResponseDto<DocumentResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Insufficient permissions',
  })
  async listDocuments(
    @Query() query: ListDocumentsDto,
    @User() user: UserEntity,
  ): Promise<ApiResponseInterface<PaginatedResponseDto<DocumentResponseDto>>> {
    const documents = await this.documentService.listDocuments(user, query);
    return ResponseBuilder.success(
      documents,
      'Documents retrieved successfully',
    );
  }

  /**
   * Get a document by its ID for the authenticated user.
   * Only Admins and Editors can access.
   * @param id Document ID
   * @param user Authenticated user
   * @returns Document details
   */
  @Get(':id')
  @Roles([UserRole.Admin, UserRole.Editor])
  @ApiParam({
    name: 'id',
    description: 'Document ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document retrieved successfully',
    type: DocumentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Document not found',
  })
  async getDocumentById(
    @Param('id') id: string,
    @User() user: UserEntity,
  ): Promise<ApiResponseInterface<DocumentResponseDto>> {
    // Throws if document not found or retrieval fails (handled in service)
    const document = await this.documentService.getDocumentById(id, user);
    return ResponseBuilder.success(document, 'Document retrieved successfully');
  }
}
