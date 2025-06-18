import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { IngestionService } from './ingestion.service';
import { DocumentStatusUpdateDto } from './dto/document-status-update.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RabbitMQClientService } from '../rabbitmq-client/rabbitmq-client.service';
import { IngestionStatus } from '../../common/enums/ingestion-status.enum';
import { EVENT_DOCUMENT_STATUS_UPDATE } from '../../common/constants/event.constants';

@Controller()
export class IngestionEventsController {
  private readonly logger = new Logger(IngestionEventsController.name);

  constructor(
    private readonly ingestionService: IngestionService,
    private readonly rabbitMQClientService: RabbitMQClientService,
  ) {}

  @EventPattern(EVENT_DOCUMENT_STATUS_UPDATE)
  async handleDocumentStatusUpdate(@Payload() data: any) {
    this.logger.log(
      `Received document status update event: ${JSON.stringify(data)}`,
    );

    // Ensure data is a non-null object
    if (typeof data !== 'object' || data === null) {
      this.logger.warn(
        `Payload is not an object: ${JSON.stringify(data)}. Sending to DLQ.`,
      );
      await this.rabbitMQClientService.sendToDLQ(
        data,
        EVENT_DOCUMENT_STATUS_UPDATE,
      );
      return;
    }
    // Validate using DTO
    const dto = plainToInstance(DocumentStatusUpdateDto, data);
    const errors = await validate(dto);

    // If the input data is not as per the DTO, log it and send to DLQ
    if (errors.length > 0) {
      this.logger.warn(
        `Invalid event payload received: ${JSON.stringify(data)}. Sending to DLQ.`,
      );
      // Send to DLQ (dead letter queue)
      await this.rabbitMQClientService.sendToDLQ(
        data,
        EVENT_DOCUMENT_STATUS_UPDATE,
      );
      return;
    }

    // If validation passes, proceed with the update
    const { documentId, status, details } = dto;
    try {
      await this.ingestionService.updateIngestionLog(
        documentId,
        status as IngestionStatus,
        details,
      );
      this.logger.log(
        `Updated ingestion log for documentId=${documentId} with status=${status}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update ingestion log for documentId=${documentId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
