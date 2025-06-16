import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { IngestionStatus } from 'src/common/enums/ingestion-status.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class ListDocumentsDto extends PaginationDto {
  @ApiProperty({
    description: 'Filter by document status',
    enum: IngestionStatus,
    required: false,
  })
  @IsEnum(IngestionStatus)
  @IsOptional()
  status?: IngestionStatus;

  @ApiProperty({
    description: 'Sort by status',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    required: false,
  })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  orderBy?: 'ASC' | 'DESC';
}
