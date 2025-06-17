import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { ListDocumentsDto } from './dto/list-documents.dto';
import { DocumentResponseDto } from './dto/document-response.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { IngestionStatus } from 'src/common/enums/ingestion-status.enum';
import { UserRole } from 'src/common/enums/user-role.enum';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import {
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

const mockUser = {
  id: 'user-uuid',
  email: 'user@example.com',
  fullName: 'Test User',
  role: UserRole.Viewer,
};

const mockDocument = {
  id: 'doc-uuid',
  title: 'Project Proposal',
  s3Url: 'https://example.com/presigned-url',
  processedDataUrl: 'https://example.com/processed-data',
  status: IngestionStatus.PENDING,
  createdAt: new Date('2024-03-20T10:00:00Z'),
  updatedAt: new Date('2024-03-20T10:00:00Z'),
};

describe('DocumentController', () => {
  let controller: DocumentController;
  let documentService: jest.Mocked<DocumentService>;

  const mockDocumentService = {
    uploadDocument: jest.fn(),
    listDocuments: jest.fn(),
    getDocumentById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [{ provide: DocumentService, useValue: mockDocumentService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<DocumentController>(DocumentController);
    documentService = module.get(
      DocumentService,
    ) as jest.Mocked<DocumentService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

    it('should upload a document and return response', async () => {
      documentService.uploadDocument.mockResolvedValue(mockDocument as any);
      const result = await controller.uploadDocument(
        file,
        uploadDto,
        mockUser as any,
      );
      expect(documentService.uploadDocument).toHaveBeenCalledWith(
        file,
        uploadDto,
        mockUser,
      );
      expect(result).toEqual(
        ResponseBuilder.success(
          mockDocument,
          'Document uploaded successfully',
          HttpStatus.CREATED,
        ),
      );
    });

    it('should throw error if service throws', async () => {
      documentService.uploadDocument.mockRejectedValue(
        new BadRequestException('No file uploaded'),
      );
      await expect(
        controller.uploadDocument(file, uploadDto, mockUser as any),
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
    const paginatedResponse: PaginatedResponseDto<DocumentResponseDto> = {
      data: [mockDocument as any],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };

    it('should return paginated documents', async () => {
      documentService.listDocuments.mockResolvedValue(paginatedResponse as any);
      const result = await controller.listDocuments(listDto, mockUser as any);
      expect(documentService.listDocuments).toHaveBeenCalledWith(
        mockUser,
        listDto,
      );
      expect(result).toEqual(
        ResponseBuilder.success(
          paginatedResponse,
          'Documents retrieved successfully',
        ),
      );
    });

    it('should throw error if service throws', async () => {
      documentService.listDocuments.mockRejectedValue(
        new BadRequestException('Failed to list documents'),
      );
      await expect(
        controller.listDocuments(listDto, mockUser as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getDocumentById', () => {
    it('should return a document by id', async () => {
      documentService.getDocumentById.mockResolvedValue(mockDocument as any);
      const result = await controller.getDocumentById(
        'doc-uuid',
        mockUser as any,
      );
      expect(documentService.getDocumentById).toHaveBeenCalledWith(
        'doc-uuid',
        mockUser,
      );
      expect(result).toEqual(
        ResponseBuilder.success(
          mockDocument,
          'Document retrieved successfully',
        ),
      );
    });

    it('should throw error if service throws', async () => {
      documentService.getDocumentById.mockRejectedValue(
        new NotFoundException('Document not found'),
      );
      await expect(
        controller.getDocumentById('doc-uuid', mockUser as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
