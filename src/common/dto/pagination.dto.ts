/**
 * DTO for pagination query parameters.
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  /**
   * Page number (1-based)
   */
  @ApiProperty({
    description: 'Page number (1-based)',
    default: 1,
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  /**
   * Number of items per page
   */
  @ApiProperty({
    description: 'Number of items per page',
    default: 10,
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}
