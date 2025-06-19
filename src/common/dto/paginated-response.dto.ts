/**
 * DTO for pagination metadata in paginated API responses.
 */
import { ApiProperty } from '@nestjs/swagger';
import { PaginationMeta } from '../interfaces/pagination.interface';

export class PaginatedMetaDto implements PaginationMeta {
  /** Total number of items */
  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  total: number;

  /** Current page number */
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  /** Number of items per page */
  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  /** Total number of pages */
  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;
}

/**
 * DTO for paginated API responses.
 * @template T Type of the response data
 */
export class PaginatedResponseDto<T> {
  /** Array of items */
  @ApiProperty({
    description: 'Array of items',
    isArray: true,
  })
  data: T[];

  /** Pagination metadata */
  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginatedMetaDto,
  })
  meta: PaginatedMetaDto;
}
