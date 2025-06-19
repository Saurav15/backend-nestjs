import { ApiProperty } from '@nestjs/swagger';
import { IngestionStatus } from 'src/common/enums/ingestion-status.enum';
import { Document } from 'src/database/entities/document.entity';

export class DocumentResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the document',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Title of the document',
    example: 'Project Proposal',
  })
  title: string;

  @ApiProperty({
    description: 'URL to the raw document in S3',
    example: 'https://example.com/presigned-url',
    required: false,
  })
  s3Url: string;

  @ApiProperty({
    description: 'Summary of the document (if available)',
    example: 'This is a summary of the document.',
    required: false,
    type: String,
  })
  summary?: string;

  @ApiProperty({
    description: 'Current status of the document ingestion',
    enum: IngestionStatus,
    example: IngestionStatus.PENDING,
  })
  status: IngestionStatus;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-03-20T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-03-20T10:00:00Z',
  })
  updatedAt: Date;

  constructor(document: Document & { s3Url: string }) {
    if (!document) return;

    this.id = document.id;
    this.title = document.title;
    this.s3Url = document.s3Url;
    this.summary = document.summary;
    this.status = document.status;
    this.createdAt = document.createdAt;
    this.updatedAt = document.updatedAt;
  }
}
