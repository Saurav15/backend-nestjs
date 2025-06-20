/**
 * Service for document ingestion workflows: starting ingestion, retrieving logs, and updating ingestion status.
 * Handles DB operations, S3 integration, and RabbitMQ event publishing.
 */
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
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { RabbitMQClientService } from '../rabbitmq-client/rabbitmq-client.service';

@Injectable()
export class IngestionService {
  constructor(
    @InjectRepository(IngestionLog)
    private readonly ingestionLogRepository: Repository<IngestionLog>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly s3Service: S3Service,
    private readonly rabbitMQService: RabbitMQClientService,
  ) {}

  /**
   * Starts the ingestion process for a document.
   * Verifies ownership, document status, and prevents duplicate ingestion.
   * Publishes an event to RabbitMQ to trigger async processing.
   * @param documentId Document ID
   * @param userId Authenticated user ID
   * @returns Ingestion log entry for the started process
   */
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
    if (
      document.status === IngestionStatus.COMPLETED
    ) {
      throw new BadRequestException(
        `Document is in ${document.status} status. Only documents with PENDING or FAILED status can start ingestion.`,
      );
    }

    if (document.status === IngestionStatus.STARTED) {
      throw new BadRequestException(
        'Document ingestion is already in progress',
      );
    }

    // Use updateIngestionLog method to start ingestion
    const ingestionLog = await this.updateIngestionLog(
      documentId,
      IngestionStatus.STARTED,
      'Document ingestion process started',
    );

    // Publish event to RabbitMQ after successful DB transaction
    await this.rabbitMQService.publishDocumentIngestionEvent({
      documentId,
      userId,
      attemptId: ingestionLog.attemptId,
      s3Key: document.s3Key,
    });

    return ingestionLog;
  }

  /**
   * Retrieves paginated ingestion logs and document status for a document.
   * Verifies ownership and access.
   * @param documentId Document ID
   * @param userId Authenticated user ID
   * @param page Page number
   * @param limit Page size
   * @returns Paginated ingestion logs and document status
   */
  async getIngestionData(
    documentId: string,
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponseDto<IngestionDataResponseDto>> {
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

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get total count of ingestion logs for the document
    const total = await this.ingestionLogRepository.count({
      where: { document: { id: documentId } },
    });

    // Get paginated ingestion logs for the document
    const ingestionLogs = await this.ingestionLogRepository.find({
      where: { document: { id: documentId } },
      order: {
        attemptId: 'DESC',
        createdAt: 'DESC',
      },
      skip,
      take: limit,
    });

    // Generate presigned URL for the document
    const presignedUrl = await this.s3Service.getPresignedUrl(document.s3Key);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);

    // Create the ingestion data response
    const ingestionData = new IngestionDataResponseDto(
      { ...document, s3Url: presignedUrl },
      ingestionLogs,
    );

    // Return paginated response
    return {
      data: [ingestionData],
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Updates the ingestion log and document status for a document.
   * Handles transaction, attempt tracking, and summary updates.
   * @param documentId Document ID
   * @param status New ingestion status
   * @param details Optional details
   * @param summary Optional summary (for COMPLETED status)
   * @returns Updated ingestion log entry
   */
  async updateIngestionLog(
    documentId: string,
    status: IngestionStatus,
    details?: string,
    summary?: any,
  ): Promise<IngestionResponseDto> {
    // Find the document
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Start transaction to create a new ingestion log for every event
    const queryRunner =
      this.documentRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Only update document summary if status is COMPLETED and result has a summary
      const updateDoc: any = { status };
      if (
        status === IngestionStatus.COMPLETED &&
        summary &&
        typeof summary === 'string'
      ) {
        updateDoc.summary = summary;
      }
      await queryRunner.manager.update(Document, documentId, updateDoc);

      // Find the latest log for this document
      const lastLog = await this.ingestionLogRepository.findOne({
        where: { document: { id: documentId } },
        order: { attemptId: 'DESC', createdAt: 'DESC' },
      });
      let attemptId = 1;
      if (lastLog) {
        // If last log is COMPLETED or FAILED, increment attemptId for new STARTED
        if (
          status === IngestionStatus.STARTED &&
          (lastLog.status === IngestionStatus.COMPLETED ||
            lastLog.status === IngestionStatus.FAILED)
        ) {
          attemptId = lastLog.attemptId + 1;
        } else {
          // For all other cases, use the latest attemptId
          attemptId = lastLog.attemptId;
        }
      }
      // If no log exists, attemptId remains 1

      // Always create a new log entry for each event
      const ingestionLog = queryRunner.manager.create(IngestionLog, {
        document: { id: documentId },
        attemptId,
        status,
        details: details || `Document status updated to ${status}`,
      });
      const savedIngestionLog = await queryRunner.manager.save(ingestionLog);

      await queryRunner.commitTransaction();

      // Return the response DTO using constructor
      return new IngestionResponseDto(savedIngestionLog);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Failed to update ingestion log');
    } finally {
      await queryRunner.release();
    }
  }
}
