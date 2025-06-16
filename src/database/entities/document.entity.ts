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
  @Column()
  @IsString()
  title: string;

  @Column()
  @IsUrl()
  s3Url: string; // URL to the raw document in S3

  @Column({ nullable: true })
  @IsUrl()
  @IsOptional()
  processedDataUrl: string; // S3 URL to processed data (post-ingestion)

  @Index('idx_document_user_id')
  @ManyToOne(() => User, (user) => user.documents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: IngestionStatus,
    default: IngestionStatus.PENDING,
  })
  @IsEnum(IngestionStatus)
  status: IngestionStatus;

  @OneToMany(() => IngestionLog, (logs) => logs.document, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  ingestionLogs: IngestionLog[];
}
