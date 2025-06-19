/**
 * DTO for route parameters containing a resource ID.
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class IdParamDto {
  /**
   * The unique identifier of the resource
   */
  @ApiProperty({
    description: 'The unique identifier of the resource',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Invalid ID format' })
  id: string;
}
