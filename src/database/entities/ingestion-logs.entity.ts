/**
 * Entity representing a log entry for a document ingestion attempt.
 * Includes document reference, attempt ID, status, and details.
 */
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Document } from './document.entity';
import { IngestionStatus } from '../../common/enums/ingestion-status.enum';
import { IsEnum, IsString, IsOptional, IsNumber, Min } from 'class-validator';

@Entity('ingestion_logs')
export class IngestionLog extends BaseEntity {
  /** Reference to the document being ingested */
  @Index('idx_ingestion_log_document_id')
  @ManyToOne(() => Document, (document) => document.ingestionLogs)
  @JoinColumn({ name: 'document_id' })
  document: Document;

  /** Attempt number for this ingestion (starts at 1) */
  @Index('idx_ingestion_log_attempt_id')
  @Column({ name: 'attempt_id', type: 'int' })
  @IsNumber({}, { message: 'Attempt ID must be a number' })
  @Min(1, { message: 'Attempt ID must be at least 1' })
  attemptId: number;

  /** Status of the ingestion attempt */
  @Column({
    type: 'enum',
    enum: IngestionStatus,
  })
  @IsEnum(IngestionStatus)
  status: IngestionStatus;

  /** Additional details or error messages (optional) */
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  details: string;
}
