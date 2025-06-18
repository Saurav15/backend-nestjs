import { IsString, IsNumber, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { Environment } from 'src/common/enums';

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  PORT: number;

  // Database
  @IsString()
  DB_HOST: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;

  // JWT
  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN: string;

  // AWS
  @IsString()
  AWS_REGION: string;

  @IsString()
  AWS_ACCESS_KEY_ID: string;

  @IsString()
  AWS_SECRET_ACCESS_KEY: string;

  @IsString()
  AWS_S3_BUCKET: string;

  @IsString()
  RABBITMQ_URL: string;

  @IsString()
  DOCUMENT_INGESTION_QUEUE: string;

  @IsString()
  DOCUMENT_STATUS_UPDATE_QUEUE: string;

  @IsString()
  DOCUMENT_STATUS_UPDATE_DLQ: string;
}
