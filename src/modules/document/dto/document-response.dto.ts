import { ApiProperty } from '@nestjs/swagger';
import { IngestionStatus } from '../../../common/enums/ingestion-status.enum';
import { UserResponseDto } from '../../user/dto/user-response.dto';

export class DocumentResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the document',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Title of the document',
    example: 'Annual Report 2023',
  })
  title: string;

  @ApiProperty({
    description: 'URL to the raw document in S3',
    example: 'https://s3.amazonaws.com/bucket/path/to/document.pdf',
  })
  s3Url: string;

  @ApiProperty({
    description: 'URL to processed data in S3 (post-ingestion)',
    example: 'https://s3.amazonaws.com/bucket/path/to/processed-data.json',
    required: false,
  })
  processedDataUrl: string;

  @ApiProperty({
    description: 'The user who uploaded the document',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Current status of the document ingestion',
    enum: IngestionStatus,
    example: IngestionStatus.PENDING,
  })
  status: IngestionStatus;

  @ApiProperty({
    description: 'The date when the document was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date when the document was last updated',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
