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
