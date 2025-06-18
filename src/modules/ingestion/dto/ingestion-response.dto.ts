import { ApiProperty } from '@nestjs/swagger';
import { IngestionStatus } from '../../../common/enums/ingestion-status.enum';
import { IngestionLog } from '../../../database/entities/ingestion-logs.entity';

export class IngestionResponseDto {
  @ApiProperty({
    description: 'The ID of the ingestion log entry',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The ID of the document being processed',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  documentId: string;

  @ApiProperty({
    description: 'The attempt ID for this ingestion process',
    example: 1,
  })
  attemptId: number;

  @ApiProperty({
    description: 'The current status of the ingestion process',
    enum: IngestionStatus,
    example: IngestionStatus.STARTED,
  })
  status: IngestionStatus;

  @ApiProperty({
    description: 'Additional details about the ingestion process',
    example: 'Document processing started successfully',
    required: false,
  })
  details?: string;

  @ApiProperty({
    description: 'Error message if ingestion failed',
    example: 'Failed to process document',
    required: false,
  })
  error?: string;

  @ApiProperty({
    description: 'Timestamp when the ingestion log was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the ingestion log was last updated',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  constructor(ingestionLog: IngestionLog) {
    if (!ingestionLog) return;

    this.id = ingestionLog.id;
    this.documentId = ingestionLog.document?.id;
    this.attemptId = ingestionLog.attemptId;
    this.status = ingestionLog.status;
    this.details = ingestionLog.details;
    this.createdAt = ingestionLog.createdAt;
    this.updatedAt = ingestionLog.updatedAt;
  }
}
