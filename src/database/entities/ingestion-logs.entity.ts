import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Document } from './document.entity';
import { IngestionStatus } from '../../common/enums/ingestion-status.enum';
import { IsEnum, IsString, IsOptional, IsNumber, Min } from 'class-validator';

@Entity('ingestion_logs')
export class IngestionLog extends BaseEntity {
  @Index('idx_ingestion_log_document_id')
  @ManyToOne(() => Document, (document) => document.ingestionLogs)
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @Index('idx_ingestion_log_attempt_id')
  @Column({ name: 'attempt_id', type: 'int' })
  @IsNumber({}, { message: 'Attempt ID must be a number' })
  @Min(1, { message: 'Attempt ID must be at least 1' })
  attemptId: number;

  @Column({
    type: 'enum',
    enum: IngestionStatus,
  })
  @IsEnum(IngestionStatus)
  status: IngestionStatus;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  details: string;
}
