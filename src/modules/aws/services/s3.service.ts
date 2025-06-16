import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { IS3Service } from '../interfaces/s3.interface';
import { EnvironmentVariables } from 'src/config/config.validation';
@Injectable()
export class S3Service implements IS3Service {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly logger = new Logger(S3Service.name);

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION')!,
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY')!,
      },
    });
    this.bucket = this.configService.get('AWS_S3_BUCKET')!;
  }

  async uploadFile(
    file: Buffer | Readable,
    key: string,
    contentType: string,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
      });

      await this.s3Client.send(command);
      return this.getFileUrl(key);
    } catch (error) {
      this.logger.error(
        `Failed to upload file to S3: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  async getFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      const stream = response.Body as Readable;

      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });
    } catch (error) {
      this.logger.error(
        `Failed to get file from S3: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to get file from S3: ${error.message}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      this.logger.error(
        `Failed to delete file from S3: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      this.logger.error(
        `Failed to check if file exists in S3: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to check if file exists in S3: ${error.message}`);
    }
  }

  private getFileUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`;
  }
}
