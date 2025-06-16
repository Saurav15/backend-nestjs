import { ApiProperty } from '@nestjs/swagger';
import { IngestionStatus } from '../../../common/enums/ingestion-status.enum';
import { DocumentResponseDto } from './document-response.dto';

export class IngestionLogResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the ingestion log',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The document associated with this ingestion log',
    type: DocumentResponseDto,
  })
  document: DocumentResponseDto;

  @ApiProperty({
    description: 'Current status of the ingestion process',
    enum: IngestionStatus,
    example: IngestionStatus.STARTED,
  })
  status: IngestionStatus;

  @ApiProperty({
    description: 'Additional details about the ingestion process',
    example: 'Processing page 5 of 10',
    required: false,
  })
  details: string;

  @ApiProperty({
    description: 'Error message if ingestion failed',
    example: 'Failed to process PDF: Invalid format',
    required: false,
  })
  error: string;

  @ApiProperty({
    description: 'The date when the ingestion log was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date when the ingestion log was last updated',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
