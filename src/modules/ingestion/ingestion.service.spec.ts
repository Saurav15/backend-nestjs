import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestionLog } from '../../database/entities/ingestion-logs.entity';
import { Document } from '../../database/entities/document.entity';
import { IngestionStatus } from '../../common/enums/ingestion-status.enum';
import { IngestionResponseDto, IngestionDataResponseDto } from './dto';
import { S3Service } from '../aws/services/s3.service';

describe('IngestionService', () => {
  let service: IngestionService;
  let ingestionLogRepository: Repository<IngestionLog>;
  let documentRepository: Repository<Document>;
  let s3Service: S3Service;

  const mockIngestionLogRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    manager: {
      connection: {
        createQueryRunner: jest.fn(),
      },
    },
  };

  const mockDocumentRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    manager: {
      connection: {
        createQueryRunner: jest.fn(),
      },
    },
  };

  const mockS3Service = {
    getPresignedUrl: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      update: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: getRepositoryToken(IngestionLog),
          useValue: mockIngestionLogRepository,
        },
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocumentRepository,
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    ingestionLogRepository = module.get<Repository<IngestionLog>>(
      getRepositoryToken(IngestionLog),
    );
    documentRepository = module.get<Repository<Document>>(
      getRepositoryToken(Document),
    );
    s3Service = module.get<S3Service>(S3Service);

    // Reset mocks
    jest.clearAllMocks();
    mockDocumentRepository.manager.connection.createQueryRunner.mockReturnValue(
      mockQueryRunner,
    );
  });

  describe('startIngestion', () => {
    const documentId = 'document-id';
    const mockDocument = {
      id: 'document-id',
      status: IngestionStatus.PENDING,
      user: { id: 'user-id' },
    };

    const mockIngestionLog = {
      id: 'log-id',
      document: { id: 'document-id' },
      status: IngestionStatus.STARTED,
      details: 'Document ingestion process started',
      error: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should start ingestion successfully', async () => {
      // Arrange
      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);
      mockIngestionLogRepository.findOne.mockResolvedValue(null);
      mockQueryRunner.manager.save.mockResolvedValue(mockIngestionLog);

      // Act
      const result = await service.startIngestion(documentId, 'user-id');

      // Assert
      expect(result).toBeInstanceOf(IngestionResponseDto);
      expect(result.id).toBe(mockIngestionLog.id);
      expect(result.documentId).toBe(mockIngestionLog.document.id);
      expect(result.status).toBe(mockIngestionLog.status);
      expect(mockQueryRunner.manager.update).toHaveBeenCalledWith(
        Document,
        'document-id',
        { status: IngestionStatus.STARTED },
      );
    });

    it('should throw NotFoundException when document not found', async () => {
      // Arrange
      mockDocumentRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.startIngestion(documentId, 'user-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when user does not own document', async () => {
      // Arrange
      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);

      // Act & Assert
      await expect(
        service.startIngestion(documentId, 'different-user-id'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when document status is not PENDING', async () => {
      // Arrange
      const documentWithWrongStatus = {
        ...mockDocument,
        status: IngestionStatus.COMPLETED,
      };
      mockDocumentRepository.findOne.mockResolvedValue(documentWithWrongStatus);

      // Act & Assert
      await expect(
        service.startIngestion(documentId, 'user-id'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when ingestion is already in progress', async () => {
      // Arrange
      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);
      mockIngestionLogRepository.findOne.mockResolvedValue({
        id: 'existing-log',
        status: IngestionStatus.STARTED,
      });

      // Act & Assert
      await expect(
        service.startIngestion(documentId, 'user-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getIngestionData', () => {
    const mockDocument = {
      id: 'document-id',
      title: 'Test Document',
      status: IngestionStatus.STARTED,
      user: { id: 'user-id' },
      createdAt: new Date(),
      updatedAt: new Date(),
      s3Key: 'test-s3-key',
    };

    const mockLogs = [
      {
        id: 'log-1',
        document: { id: 'document-id' },
        status: IngestionStatus.STARTED,
        details: 'Started',
        error: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return ingestion data with document and logs', async () => {
      // Arrange
      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);
      mockIngestionLogRepository.find.mockResolvedValue(mockLogs);
      mockS3Service.getPresignedUrl.mockResolvedValue(
        'https://example.com/presigned-url',
      );

      // Act
      const result = await service.getIngestionData('document-id', 'user-id');

      // Assert
      expect(result).toBeInstanceOf(IngestionDataResponseDto);
      expect(result.document.id).toBe(mockDocument.id);
      expect(result.document.title).toBe(mockDocument.title);
      expect(result.ingestionLogs).toHaveLength(1);
      expect(result.ingestionLogs[0]).toBeInstanceOf(IngestionResponseDto);
      expect(result.ingestionLogs[0].id).toBe(mockLogs[0].id);
      expect(mockS3Service.getPresignedUrl).toHaveBeenCalledWith(
        mockDocument.s3Key,
      );
    });

    it('should throw NotFoundException when document not found', async () => {
      // Arrange
      mockDocumentRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getIngestionData('document-id', 'user-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when user does not own document', async () => {
      // Arrange
      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);

      // Act & Assert
      await expect(
        service.getIngestionData('document-id', 'different-user-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
