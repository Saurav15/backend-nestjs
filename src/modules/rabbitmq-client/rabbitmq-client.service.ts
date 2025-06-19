/**
 * Service for publishing events to RabbitMQ queues and handling dead letter queue (DLQ) logic.
 * Provides methods for emitting document ingestion events and sending invalid events to DLQ.
 */
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

  /**
   * Called when the module is initialized. Logs RabbitMQ connection status.
   */
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

  /**
   * Publishes a document ingestion event to the ingestion queue.
   * @param documentPayload Event payload
   */
  async publishDocumentIngestionEvent(documentPayload: any) {
    this.logger.log(
      `Publishing event to document_ingestion_queue: ${JSON.stringify(documentPayload)}`,
    );
    // You can use emit for fire-and-forget events
    await this.client
      .emit(EVENT_DOCUMENT_INGESTION, documentPayload)
      .toPromise();
  }

  /**
   * Publishes an invalid event to the dead letter queue (DLQ).
   * @param data Event data
   * @param event Event name
   */
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
