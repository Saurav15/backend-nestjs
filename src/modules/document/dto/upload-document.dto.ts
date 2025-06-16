import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty({
    description: 'Title of the document',
    example: 'Project Proposal',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Document file to upload',
  })
  file: Express.Multer.File;
}
