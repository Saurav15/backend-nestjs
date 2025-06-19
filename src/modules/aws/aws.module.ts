/**
 * AwsModule provides AWS S3 integration for file storage and retrieval.
 *
 * Dependencies:
 * - ConfigModule: Supplies environment-based configuration for AWS credentials and bucket info.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3Service } from './services/s3.service';

@Module({
  imports: [ConfigModule],
  providers: [S3Service],
  exports: [S3Service],
})
export class AwsModule {}
