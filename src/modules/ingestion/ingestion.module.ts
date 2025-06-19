/**
 * IngestionModule handles document ingestion workflows, including starting ingestion,
 * tracking ingestion logs, and processing status updates from the event queue.
 *
 * Dependencies:
 * - TypeOrmModule: Provides access to IngestionLog, Document, and User entities for database operations.
 * - AwsModule: Provides S3Service for presigned URL generation and S3 integration.
 * - RabbitMQClientModule: Enables publishing and consuming document ingestion events via RabbitMQ.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionLog } from '../../database/entities/ingestion-logs.entity';
import { Document } from '../../database/entities/document.entity';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { User } from 'src/database/entities/user.entity';
import { AwsModule } from '../aws/aws.module';
import { S3Service } from '../aws/services/s3.service';
import { RabbitMQClientModule } from '../rabbitmq-client/rabbitmq-client.module';
import { RabbitMQClientService } from '../rabbitmq-client/rabbitmq-client.service';
import { IngestionEventsController } from './ingestion-events.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([IngestionLog, Document, User]),
    AwsModule,
    RabbitMQClientModule,
  ],
  controllers: [IngestionController, IngestionEventsController],
  providers: [IngestionService, S3Service, RabbitMQClientService],
  exports: [IngestionService],
})
export class IngestionModule {}
