import { IsString, IsOptional } from 'class-validator';

export class DocumentStatusUpdateDto {
  @IsString()
  documentId: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  details?: string;
}
