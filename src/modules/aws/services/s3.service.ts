/**
 * Service for AWS S3 file storage and retrieval.
 * Handles upload, download, deletion, existence checks, and presigned URL generation for S3 objects.
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListBucketsCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { IS3Service } from '../interfaces/s3.interface';
import { EnvironmentVariables } from 'src/config/config.validation';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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

  /**
   * Uploads a file to S3.
   * @param file File buffer or stream
   * @param key S3 object key
   * @param contentType MIME type
   * @returns S3 key of the uploaded file
   */
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
      return key;
    } catch (error) {
      this.logger.error(
        `Failed to upload file to S3: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Downloads a file from S3 as a buffer.
   * @param key S3 object key
   * @returns File buffer
   */
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

  /**
   * Deletes a file from S3.
   * @param key S3 object key
   */
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

  /**
   * Checks if a file exists in S3.
   * @param key S3 object key
   * @returns True if file exists, false otherwise
   */
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

  /**
   * Generates a presigned URL for downloading a file from S3.
   * @param key S3 object key
   * @param expiresIn Expiry time in seconds (default: 300)
   * @returns Presigned URL
   */
  async getPresignedUrl(key: string, expiresIn: number = 300): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error(
        `Failed to generate presigned URL: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Lists all S3 buckets (for diagnostics).
   */
  async listBuckets(): Promise<void> {
    try {
      const command = new ListBucketsCommand({});
      await this.s3Client.send(command);
    } catch (error) {
      this.logger.error(
        `Failed to list S3 buckets: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
