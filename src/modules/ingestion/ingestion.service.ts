import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IngestionLog } from '../../database/entities/ingestion-logs.entity';
import { Document } from '../../database/entities/document.entity';
import { IngestionStatus } from '../../common/enums/ingestion-status.enum';
import { IngestionResponseDto, IngestionDataResponseDto } from './dto';
import { S3Service } from '../aws/services/s3.service';

@Injectable()
export class IngestionService {
  constructor(
    @InjectRepository(IngestionLog)
    private readonly ingestionLogRepository: Repository<IngestionLog>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly s3Service: S3Service,
  ) {}

  async startIngestion(
    documentId: string,
    userId: string,
  ): Promise<IngestionResponseDto> {
    // Find the document and verify ownership
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['user'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Check if user owns the document or has admin/editor role
    if (document.user.id !== userId) {
      throw new BadRequestException(
        'You can only start ingestion for your own documents',
      );
    }

    // Check if document is in a valid state to start ingestion
    if (document.status !== IngestionStatus.PENDING) {
      throw new BadRequestException(
        `Document is in ${document.status} status. Only documents with PENDING status can start ingestion.`,
      );
    }

    // Check if there's already an active ingestion process
    const existingActiveLog = await this.ingestionLogRepository.findOne({
      where: {
        document: { id: documentId },
        status: IngestionStatus.STARTED,
      },
    });

    if (existingActiveLog) {
      throw new BadRequestException(
        'Document ingestion is already in progress',
      );
    }

    // Start transaction to update both document and create ingestion log
    const queryRunner =
      this.documentRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update document status to STARTED
      await queryRunner.manager.update(Document, documentId, {
        status: IngestionStatus.STARTED,
      });

      // Create ingestion log entry
      const ingestionLog = queryRunner.manager.create(IngestionLog, {
        document: { id: documentId },
        status: IngestionStatus.STARTED,
        details: 'Document ingestion process started',
      });

      const savedIngestionLog = await queryRunner.manager.save(ingestionLog);

      await queryRunner.commitTransaction();

      // Return the response DTO using constructor
      return new IngestionResponseDto(savedIngestionLog);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Failed to start ingestion process');
    } finally {
      await queryRunner.release();
    }
  }

  async getIngestionData(
    documentId: string,
    userId: string,
  ): Promise<IngestionDataResponseDto> {
    // Verify document exists and user has access
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['user'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.user.id !== userId) {
      throw new BadRequestException(
        'You can only view ingestion data for your own documents',
      );
    }

    // Get all ingestion logs for the document
    const ingestionLogs = await this.ingestionLogRepository.find({
      where: { document: { id: documentId } },
      order: { createdAt: 'DESC' },
    });

    // Generate presigned URL for the document
    const presignedUrl = await this.s3Service.getPresignedUrl(document.s3Key);

    // Return the response DTO using constructor
    return new IngestionDataResponseDto(
      { ...document, s3Url: presignedUrl },
      ingestionLogs,
    );
  }
}
