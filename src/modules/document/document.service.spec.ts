import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Document } from 'src/database/entities/document.entity';
import { S3Service } from '../aws/services/s3.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { ListDocumentsDto } from './dto/list-documents.dto';
import { DocumentResponseDto } from './dto/document-response.dto';
import { IngestionStatus } from 'src/common/enums/ingestion-status.enum';
import { UserRole } from 'src/common/enums/user-role.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

const mockUser = {
  id: 'user-uuid',
  email: 'user@example.com',
  fullName: 'Test User',
  role: UserRole.Viewer,
};

const mockDocument = {
  id: 'doc-uuid',
  title: 'Project Proposal',
  s3Key: 'users/user-uuid/documents/doc-uuid.pdf',
  summary: 'This is a summary of the document.',
  status: IngestionStatus.PENDING,
  createdAt: new Date('2024-03-20T10:00:00Z'),
  updatedAt: new Date('2024-03-20T10:00:00Z'),
};

describe('DocumentService', () => {
  let service: DocumentService;
  let documentRepository: any;
  let s3Service: any;

  // Replace the mockDocumentRepository and queryBuilder definitions:
  const queryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    getMany: jest.fn(),
  };

  const mockDocumentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => queryBuilder),
    findOne: jest.fn(),
  } as any;

  const mockS3Service = {
    uploadFile: jest.fn().mockResolvedValue(undefined),
    getPresignedUrl: jest
      .fn()
      .mockResolvedValue('https://example.com/presigned-url'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocumentRepository,
        },
        { provide: S3Service, useValue: mockS3Service },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    documentRepository = module.get(getRepositoryToken(Document));
    s3Service = module.get(S3Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadDocument', () => {
    const uploadDto: UploadDocumentDto = {
      title: 'Project Proposal',
      file: undefined as any,
    };
    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'proposal.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('test'),
      stream: undefined as any,
      destination: '',
      filename: '',
      path: '',
    };

    it('should upload a document and return DocumentResponseDto', async () => {
      const s3Key = `users/${mockUser.id}/documents/${uuidv4()}.pdf`;
      mockDocumentRepository.create.mockReturnValue(mockDocument);
      mockDocumentRepository.save.mockResolvedValue(mockDocument);
      mockS3Service.uploadFile.mockResolvedValue(undefined);
      mockS3Service.getPresignedUrl.mockResolvedValue(
        'https://example.com/presigned-url',
      );

      const result = await service.uploadDocument(
        file,
        uploadDto,
        mockUser as any,
      );

      expect(mockS3Service.uploadFile).toHaveBeenCalled();
      expect(mockDocumentRepository.create).toHaveBeenCalledWith({
        title: uploadDto.title,
        s3Key: expect.any(String),
        user: mockUser,
        status: IngestionStatus.PENDING,
      });
      expect(mockDocumentRepository.save).toHaveBeenCalled();
      expect(mockS3Service.getPresignedUrl).toHaveBeenCalledWith(
        mockDocument.s3Key,
      );
      expect(result).toBeInstanceOf(DocumentResponseDto);
    });

    it('should throw BadRequestException if no file is uploaded', async () => {
      await expect(
        service.uploadDocument(undefined as any, uploadDto, mockUser as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if upload fails', async () => {
      mockS3Service.uploadFile.mockRejectedValue(new Error('Upload failed'));
      await expect(
        service.uploadDocument(file, uploadDto, mockUser as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('listDocuments', () => {
    const listDto: ListDocumentsDto = {
      page: 1,
      limit: 10,
      status: IngestionStatus.PENDING,
      orderBy: 'DESC',
    };

    it('should return paginated documents', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([mockDocument]),
      };
      mockDocumentRepository.createQueryBuilder.mockReturnValue(queryBuilder);
      mockS3Service.getPresignedUrl.mockResolvedValue(
        'https://example.com/presigned-url',
      );

      const result = await service.listDocuments(mockUser as any, listDto);

      expect(mockDocumentRepository.createQueryBuilder).toHaveBeenCalled();
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'document.user.id = :userId',
        { userId: mockUser.id },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'document.status = :status',
        { status: listDto.status },
      );
      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'document.created_at',
        listDto.orderBy,
      );
      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should throw BadRequestException if listing fails', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockRejectedValue(new Error('Listing failed')),
        getMany: jest.fn(),
      };
      mockDocumentRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await expect(
        service.listDocuments(mockUser as any, listDto),
      ).rejects.toThrow(BadRequestException);
      expect(queryBuilder.getCount).toHaveBeenCalled();
      expect(queryBuilder.skip).not.toHaveBeenCalled();
      expect(queryBuilder.take).not.toHaveBeenCalled();
      expect(queryBuilder.getMany).not.toHaveBeenCalled();
    });
  });

  describe('getDocumentById', () => {
    it('should return a document by id', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);
      mockS3Service.getPresignedUrl.mockResolvedValue(
        'https://example.com/presigned-url',
      );

      const result = await service.getDocumentById('doc-uuid', mockUser as any);

      expect(mockDocumentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'doc-uuid', user: { id: mockUser.id } },
      });
      expect(mockS3Service.getPresignedUrl).toHaveBeenCalledWith(
        mockDocument.s3Key,
      );
      expect(result).toBeInstanceOf(DocumentResponseDto);
    });

    it('should throw NotFoundException if document not found', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(null);
      await expect(
        service.getDocumentById('doc-uuid', mockUser as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if retrieval fails', async () => {
      mockDocumentRepository.findOne.mockRejectedValue(
        new Error('Retrieval failed'),
      );
      await expect(
        service.getDocumentById('doc-uuid', mockUser as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
