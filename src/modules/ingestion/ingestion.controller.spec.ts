import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { IngestionLog } from '../../database/entities/ingestion-logs.entity';
import { Document } from '../../database/entities/document.entity';
import { IngestionStatus } from '../../common/enums/ingestion-status.enum';
import { IngestionResponseDto, IngestionDataResponseDto } from './dto';
import { ResponseBuilder } from '../../common/utils/response-builder';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

describe('IngestionController', () => {
  let controller: IngestionController;
  let service: IngestionService;

  const mockIngestionService = {
    startIngestion: jest.fn(),
    getIngestionData: jest.fn(),
  };

  const mockIngestionLogRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockDocumentRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [
        {
          provide: IngestionService,
          useValue: mockIngestionService,
        },
        {
          provide: getRepositoryToken(IngestionLog),
          useValue: mockIngestionLogRepository,
        },
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocumentRepository,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<IngestionController>(IngestionController);
    service = module.get<IngestionService>(IngestionService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('startIngestion', () => {
    const documentId = 'document-id';
    const mockIngestionLog = {
      id: 'log-id',
      document: { id: 'document-id' },
      status: IngestionStatus.STARTED,
      details: 'Document ingestion process started',
      error: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    } as any;

    const mockIngestionResponse = new IngestionResponseDto(mockIngestionLog);

    const mockUser = { id: 'user-id' };

    it('should start ingestion and return success response', async () => {
      // Arrange
      mockIngestionService.startIngestion.mockResolvedValue(
        mockIngestionResponse,
      );

      // Act
      const result = await controller.startIngestion(documentId, mockUser.id);

      // Assert
      expect(service.startIngestion).toHaveBeenCalledWith(
        documentId,
        mockUser.id,
      );
      expect(result).toEqual(
        ResponseBuilder.success(
          mockIngestionResponse,
          'Ingestion process started successfully',
          200,
        ),
      );
    });

    it('should handle service errors properly', async () => {
      // Arrange
      const errorMessage = 'Document not found';
      mockIngestionService.startIngestion.mockRejectedValue(
        new Error(errorMessage),
      );

      // Act & Assert
      await expect(
        controller.startIngestion(documentId, mockUser.id),
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('getIngestionData', () => {
    const documentId = 'document-id';
    const mockUser = { id: 'user-id' };

    const mockDocument = {
      id: 'document-id',
      title: 'Test Document',
      status: IngestionStatus.STARTED,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      s3Key: 'test-s3-key',
      processedDataUrl: null,
      user: mockUser,
      ingestionLogs: [],
    } as any;

    const mockLogs = [
      {
        id: 'log-1',
        document: { id: 'document-id' },
        status: IngestionStatus.STARTED,
        details: 'Started',
        error: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as any,
    ];

    const mockIngestionDataResponse = new IngestionDataResponseDto(
      { ...mockDocument, s3Url: 'https://example.com/presigned-url' },
      mockLogs,
    );

    it('should return ingestion data with success response', async () => {
      // Arrange
      mockIngestionService.getIngestionData.mockResolvedValue(
        mockIngestionDataResponse,
      );

      // Act
      const result = await controller.getIngestionData(documentId, mockUser.id);

      // Assert
      expect(service.getIngestionData).toHaveBeenCalledWith(
        documentId,
        mockUser.id,
      );
      expect(result).toEqual(
        ResponseBuilder.success(
          mockIngestionDataResponse,
          'Ingestion data retrieved successfully',
          200,
        ),
      );
    });

    it('should handle service errors properly', async () => {
      // Arrange
      const errorMessage = 'Document not found';
      mockIngestionService.getIngestionData.mockRejectedValue(
        new Error(errorMessage),
      );

      // Act & Assert
      await expect(
        controller.getIngestionData(documentId, mockUser.id),
      ).rejects.toThrow(errorMessage);
    });
  });
});
