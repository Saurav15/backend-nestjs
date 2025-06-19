/**
 * Application entry point for the NestJS backend.
 *
 * Security Features:
 * - CORS enabled for cross-origin requests
 * - Helmet for setting secure HTTP headers
 * - Compression for response payloads
 * - API versioning for future-proofing endpoints
 * - Swagger for API documentation (with persisted authorization)
 * - Microservice integration for RabbitMQ event handling
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { swaggerConfig } from './config/swagger.config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get config service
  const configService = app.get(ConfigService);
  const rabbitmqUrl = configService.get<string>(
    'RABBITMQ_URL',
    'amqp://localhost:5672',
  );
  const documentStatusQueue = configService.get<string>(
    'DOCUMENT_STATUS_QUEUE',
    'document_status_queue',
  );

  // Enable API versioning (security: future-proofing endpoints)
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  // Enable CORS (security: cross-origin resource sharing)
  app.enableCors();

  // Enable Helmet for secure HTTP headers
  app.use(helmet());

  // Enable compression for response payloads
  app.use(compression());

  // Setup Swagger (security: persisted authorization for API docs)
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Start the RabbitMQ microservice for listening to document status updates
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: documentStatusQueue,
      queueOptions: { durable: true },
      prefetchCount: 1,
      noAck: false,
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
