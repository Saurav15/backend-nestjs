import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  EVENT_DOCUMENT_INGESTION,
  EVENT_DOCUMENT_STATUS_UPDATE_DLQ,
} from '../../common/constants/event.constants';

@Injectable()
export class RabbitMQClientService implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQClientService.name);

  constructor(
    @Inject('DOCUMENT_INGESTION_QUEUE') private readonly client: ClientProxy,
    @Inject('DOCUMENT_STATUS_UPDATE_DLQ')
    private readonly dlqClient: ClientProxy,
  ) {}

  onModuleInit() {
    // Loggin the connection success or failure of rabbitmq
    this.client
      .connect()
      .then(() => {
        console.log('Connected to RabbitMQ');
      })
      .catch((err) => {
        console.error('Failed to connect to RabbitMQ:', err);
      });
  }

  async publishDocumentIngestionEvent(documentPayload: any) {
    this.logger.log(
      `Publishing event to document_ingestion_queue: ${JSON.stringify(documentPayload)}`,
    );
    // You can use emit for fire-and-forget events
    await this.client
      .emit(EVENT_DOCUMENT_INGESTION, documentPayload)
      .toPromise();
  }

  async sendToDLQ(data: any, event: string) {
    this.logger.warn(
      `Publishing invalid event to DLQ: ${JSON.stringify({ event, data })}`,
    );
    // You may want to use a separate DLQ queue or exchange
    await this.dlqClient
      .emit(EVENT_DOCUMENT_STATUS_UPDATE_DLQ, { event, data })
      .toPromise();
  }
}
