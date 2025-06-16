import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Document } from './document.entity';
import { IngestionStatus } from '../../common/enums/ingestion-status.enum';
import { IsEnum, IsString, IsOptional } from 'class-validator';

@Entity('ingestion_logs')
export class IngestionLog extends BaseEntity {
  @Index('idx_ingestion_log_document_id')
  @ManyToOne(() => Document, (document) => document.ingestionLogs)
  @JoinColumn({ name: 'document_id' })
  document: Document;

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

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  error: string;
}
