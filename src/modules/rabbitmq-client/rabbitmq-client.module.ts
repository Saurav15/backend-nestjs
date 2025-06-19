/**
 * RabbitMQClientModule provides configuration and registration for RabbitMQ queues used in the application.
 *
 * - Uses ClientsModule.registerAsync to dynamically configure RabbitMQ client proxies at runtime.
 *   This allows queue names and connection URLs to be injected from environment variables or config files.
 *   Each client proxy is registered with a unique name for injection elsewhere in the app.
 *
 * Dependencies:
 * - ConfigModule: Supplies environment-based configuration for RabbitMQ connection and queue names.
 * - ClientsModule: Registers and configures RabbitMQ client proxies for event publishing and DLQ handling.
 */
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/config.validation';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      // Main queue for document ingestion events
      {
        name: 'DOCUMENT_INGESTION_QUEUE',
        imports: [ConfigModule],
        useFactory: async (
          configService: ConfigService<EnvironmentVariables>,
        ) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>(
                'RABBITMQ_URL',
                'amqp://localhost:5672',
              ),
            ],
            queue: configService.get<string>(
              'DOCUMENT_INGESTION_QUEUE',
              'document_ingestion_queue',
            ),
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
      },
      // Dead letter queue for failed or invalid document status update events
      {
        name: 'DOCUMENT_STATUS_UPDATE_DLQ',
        imports: [ConfigModule],
        useFactory: async (
          configService: ConfigService<EnvironmentVariables>,
        ) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>(
                'RABBITMQ_URL',
                'amqp://localhost:5672',
              ),
            ],
            queue: configService.get(
              'DOCUMENT_STATUS_UPDATE_DLQ',
              'document_status_dlq',
            ),
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitMQClientModule {}
