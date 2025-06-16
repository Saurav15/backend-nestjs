import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from 'src/database/entities/document.entity';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { DocumentResponseDto } from './dto/document-response.dto';
import { S3Service } from '../aws/services/s3.service';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/database/entities/user.entity';
import { IngestionStatus } from 'src/common/enums/ingestion-status.enum';
import { ListDocumentsDto } from './dto/list-documents.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly s3Service: S3Service,
  ) {}

  async uploadDocument(
    file: Express.Multer.File,
    uploadDocumentDto: UploadDocumentDto,
    user: User,
  ): Promise<DocumentResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const { title } = uploadDocumentDto;

      // Generate a unique key for S3 with user ID for better organization
      const fileExtension = file.originalname.split('.').pop();
      const s3Key = `users/${user.id}/documents/${uuidv4()}.${fileExtension}`;

      // Upload to S3 and get the key
      await this.s3Service.uploadFile(file.buffer, s3Key, file.mimetype);

      // Create document entity
      const document = this.documentRepository.create({
        title,
        s3Key, // Store the S3 key
        user,
        status: IngestionStatus.PENDING,
      });

      // Save to database
      const savedDocument = await this.documentRepository.save(document);

      // Generate presigned URL for the response
      const presignedUrl = await this.s3Service.getPresignedUrl(
        savedDocument.s3Key,
      );
      return new DocumentResponseDto({ ...savedDocument, s3Url: presignedUrl });
    } catch (error) {
      this.logger.error(
        `Failed to upload document: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to upload document');
    }
  }

  async listDocuments(
    user: User,
    query: ListDocumentsDto,
  ): Promise<PaginatedResponseDto<DocumentResponseDto>> {
    try {
      const { page = 1, limit = 10, status, orderBy } = query;
      const skip = (page - 1) * limit;

      // Build query
      const queryBuilder = this.documentRepository
        .createQueryBuilder('document')
        .where('document.user.id = :userId', { userId: user.id });

      // Add status filter if provided
      if (status) {
        queryBuilder.andWhere('document.status = :status', { status });
      }

      // Add status ordering if provided
      if (orderBy) {
        queryBuilder.orderBy('document.created_at', orderBy);
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Get paginated results
      const documents = await queryBuilder.skip(skip).take(limit).getMany();

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);

      // Generate presigned URLs for all documents
      const documentsWithUrls = await Promise.all(
        documents.map(async (doc) => {
          try {
            const presignedUrl = await this.s3Service.getPresignedUrl(
              doc.s3Key,
            );
            return new DocumentResponseDto({ ...doc, s3Url: presignedUrl });
          } catch (error) {
            this.logger.error(
              `Failed to generate presigned URL for document ${doc.id}: ${error.message}`,
            );
            return null;
          }
        }),
      );

      // Filter out any null values from failed presigned URL generations
      const validDocuments = documentsWithUrls.filter((doc) => doc !== null);

      return {
        data: validDocuments,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to list documents: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to list documents');
    }
  }

  async getDocumentById(id: string, user: User): Promise<DocumentResponseDto> {
    try {
      const document = await this.documentRepository.findOne({
        where: { id, user: { id: user.id } },
      });

      if (!document) {
        throw new NotFoundException(`Document with ID ${id} not found`);
      }

      // Generate presigned URL for the response
      const presignedUrl = await this.s3Service.getPresignedUrl(document.s3Key);
      return new DocumentResponseDto({ ...document, s3Url: presignedUrl });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to get document: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to get document');
    }
  }
}
