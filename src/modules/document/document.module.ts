/**
 * DocumentModule provides endpoints and logic for document upload, retrieval, and listing.
 * Integrates with AWS S3 for storage and supports user-based access control.
 *
 * Dependencies:
 * - TypeOrmModule: Provides access to User and Document entities for database operations.
 * - AwsModule: Provides S3Service for file storage and retrieval in AWS S3.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { AwsModule } from '../aws/aws.module';
import { Document } from 'src/database/entities/document.entity';
import { User } from 'src/database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Document]), AwsModule],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
