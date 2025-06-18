import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionLog } from '../../database/entities/ingestion-logs.entity';
import { Document } from '../../database/entities/document.entity';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { User } from 'src/database/entities/user.entity';
import { AwsModule } from '../aws/aws.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IngestionLog, Document, User]),
    AwsModule,
  ],
  controllers: [IngestionController],
  providers: [IngestionService],
  exports: [IngestionService],
})
export class IngestionModule {}
