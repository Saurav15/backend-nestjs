import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/config.validation';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
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
