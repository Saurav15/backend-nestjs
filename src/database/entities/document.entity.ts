/**
 * Entity representing a document uploaded by a user.
 * Includes title, S3 key, summary, status, owner, and ingestion logs.
 */
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity'; // Assume a User entity exists
import { BaseEntity } from './base.entity';
import { IngestionLog } from './ingestion-logs.entity';
import { IngestionStatus } from '../../common/enums/ingestion-status.enum';
import { IsEnum, IsString, IsUrl, IsOptional } from 'class-validator';

// Document Entity
@Entity('documents')
export class Document extends BaseEntity {
  /** Title of the document */
  @Column()
  @IsString()
  title: string;

  /** S3 key for the document file */
  @Column()
  @IsUrl()
  s3Key: string; // URL to the raw document in S3

  /** AI-generated summary of the document (optional) */
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  summary: string; // Large summary text

  /** Owner of the document (user) */
  @Index('idx_document_user_id')
  @ManyToOne(() => User, (user) => user.documents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** Ingestion status of the document */
  @Column({
    type: 'enum',
    enum: IngestionStatus,
    default: IngestionStatus.PENDING,
  })
  @IsEnum(IngestionStatus)
  status: IngestionStatus;

  /** Ingestion logs for the document */
  @OneToMany(() => IngestionLog, (logs) => logs.document, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  ingestionLogs: IngestionLog[];
}
