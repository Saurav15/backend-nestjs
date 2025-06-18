import { ApiProperty } from '@nestjs/swagger';
import { DocumentResponseDto } from '../../document/dto/document-response.dto';
import { IngestionResponseDto } from './ingestion-response.dto';
import { Document } from '../../../database/entities/document.entity';
import { IngestionLog } from '../../../database/entities/ingestion-logs.entity';

export class IngestionDataResponseDto {
  @ApiProperty({
    description: 'Document information',
    type: DocumentResponseDto,
  })
  document: DocumentResponseDto;

  @ApiProperty({
    description: 'List of ingestion log entries',
    type: [IngestionResponseDto],
  })
  ingestionLogs: IngestionResponseDto[];

  constructor(
    document: Document & { s3Url: string },
    ingestionLogs: IngestionLog[],
  ) {
    if (!document) return;

    this.document = new DocumentResponseDto(document);
    this.ingestionLogs =
      ingestionLogs?.map((log) => new IngestionResponseDto(log)) || [];
  }
}
