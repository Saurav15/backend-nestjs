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
    count: jest.fn(),
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
    it('should start ingestion successfully', async () => {
      const documentId = 'test-doc-id';
      const userId = 'test-user-id';
      const mockDocument = {
        id: documentId,
        status: IngestionStatus.PENDING,
        user: { id: userId },
      } as Document;

      const mockIngestionLog = {
        id: 'log-id',
        document: { id: documentId },
        attemptId: 1,
        status: IngestionStatus.STARTED,
        details: 'Document ingestion process started',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as IngestionLog;

      jest
        .spyOn(service['documentRepository'], 'findOne')
        .mockResolvedValue(mockDocument);
      jest
        .spyOn(service['ingestionLogRepository'], 'findOne')
        .mockResolvedValue(null);
      jest
        .spyOn(service['ingestionLogRepository'], 'count')
        .mockResolvedValue(0);
      jest
        .spyOn(
          service['documentRepository'].manager.connection,
          'createQueryRunner',
        )
        .mockReturnValue({
          connect: jest.fn(),
          startTransaction: jest.fn(),
          manager: {
            update: jest.fn(),
            create: jest.fn().mockReturnValue(mockIngestionLog),
            save: jest.fn().mockResolvedValue(mockIngestionLog),
          },
          commitTransaction: jest.fn(),
          rollbackTransaction: jest.fn(),
          release: jest.fn(),
        } as any);

      const result = await service.startIngestion(documentId, userId);

      expect(result).toBeInstanceOf(IngestionResponseDto);
      expect(result.id).toBe(mockIngestionLog.id);
      expect(result.attemptId).toBe(1);
      expect(result.status).toBe(IngestionStatus.STARTED);
    });

    it('should increment attempt ID for subsequent attempts', async () => {
      const documentId = 'test-doc-id';
      const userId = 'test-user-id';
      const mockDocument = {
        id: documentId,
        status: IngestionStatus.PENDING,
        user: { id: userId },
      } as Document;

      const mockIngestionLog = {
        id: 'log-id',
        document: { id: documentId },
        attemptId: 3,
        status: IngestionStatus.STARTED,
        details: 'Document ingestion process started',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as IngestionLog;

      jest
        .spyOn(service['documentRepository'], 'findOne')
        .mockResolvedValue(mockDocument);
      jest
        .spyOn(service['ingestionLogRepository'], 'findOne')
        .mockResolvedValue(null);
      jest
        .spyOn(service['ingestionLogRepository'], 'count')
        .mockResolvedValue(2);
      jest
        .spyOn(
          service['documentRepository'].manager.connection,
          'createQueryRunner',
        )
        .mockReturnValue({
          connect: jest.fn(),
          startTransaction: jest.fn(),
          manager: {
            update: jest.fn(),
            create: jest.fn().mockReturnValue(mockIngestionLog),
            save: jest.fn().mockResolvedValue(mockIngestionLog),
          },
          commitTransaction: jest.fn(),
          rollbackTransaction: jest.fn(),
          release: jest.fn(),
        } as any);

      const result = await service.startIngestion(documentId, userId);

      expect(result.attemptId).toBe(3);
    });

    it('should throw NotFoundException when document not found', async () => {
      // Arrange
      mockDocumentRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.startIngestion('document-id', 'user-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when user does not own document', async () => {
      // Arrange
      mockDocumentRepository.findOne.mockResolvedValue({
        id: 'document-id',
        status: IngestionStatus.PENDING,
        user: { id: 'different-user-id' },
      });

      // Act & Assert
      await expect(
        service.startIngestion('document-id', 'different-user-id'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when document status is not PENDING', async () => {
      // Arrange
      const documentWithWrongStatus = {
        id: 'document-id',
        status: IngestionStatus.COMPLETED,
        user: { id: 'user-id' },
      };
      mockDocumentRepository.findOne.mockResolvedValue(documentWithWrongStatus);

      // Act & Assert
      await expect(
        service.startIngestion('document-id', 'user-id'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when ingestion is already in progress', async () => {
      // Arrange
      mockDocumentRepository.findOne.mockResolvedValue({
        id: 'document-id',
        status: IngestionStatus.STARTED,
        user: { id: 'user-id' },
      });
      mockIngestionLogRepository.findOne.mockResolvedValue({
        id: 'existing-log',
        status: IngestionStatus.STARTED,
      });

      // Act & Assert
      await expect(
        service.startIngestion('document-id', 'user-id'),
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
      mockIngestionLogRepository.count.mockResolvedValue(1);
      mockS3Service.getPresignedUrl.mockResolvedValue(
        'https://example.com/presigned-url',
      );

      // Act
      const result = await service.getIngestionData('document-id', 'user-id');

      // Assert
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(IngestionDataResponseDto);
      expect(result.data[0].document.id).toBe(mockDocument.id);
      expect(result.data[0].document.title).toBe(mockDocument.title);
      expect(result.data[0].ingestionLogs).toHaveLength(1);
      expect(result.data[0].ingestionLogs[0]).toBeInstanceOf(
        IngestionResponseDto,
      );
      expect(result.data[0].ingestionLogs[0].id).toBe(mockLogs[0].id);
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

  describe('updateIngestionLog', () => {
    it('should update ingestion log successfully', async () => {
      const documentId = 'test-doc-id';
      const status = IngestionStatus.COMPLETED;
      const details = 'Document processed successfully';

      const mockDocument = {
        id: documentId,
      } as Document;

      const mockIngestionLog = {
        id: 'log-id',
        document: { id: documentId },
        attemptId: 2,
        status,
        details,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as IngestionLog;

      jest
        .spyOn(service['documentRepository'], 'findOne')
        .mockResolvedValue(mockDocument);
      jest
        .spyOn(service['ingestionLogRepository'], 'count')
        .mockResolvedValue(1);
      jest
        .spyOn(
          service['documentRepository'].manager.connection,
          'createQueryRunner',
        )
        .mockReturnValue({
          connect: jest.fn(),
          startTransaction: jest.fn(),
          manager: {
            update: jest.fn(),
            create: jest.fn().mockReturnValue(mockIngestionLog),
            save: jest.fn().mockResolvedValue(mockIngestionLog),
          },
          commitTransaction: jest.fn(),
          rollbackTransaction: jest.fn(),
          release: jest.fn(),
        } as any);

      const result = await service.updateIngestionLog(
        documentId,
        status,
        details,
      );

      expect(result).toBeInstanceOf(IngestionResponseDto);
      expect(result.id).toBe(mockIngestionLog.id);
      expect(result.attemptId).toBe(2);
      expect(result.status).toBe(status);
      expect(result.details).toBe(details);
    });
  });
});
