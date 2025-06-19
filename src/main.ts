import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { swaggerConfig } from './config/swagger.config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

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

  // Enable API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  // Enable CORS
  app.enableCors();

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Setup Swagger
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
