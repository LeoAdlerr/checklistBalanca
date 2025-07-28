import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, Logger, NotFoundException } from '@nestjs/common';
import { InspectionController } from 'src/api/controllers/inspection.controller';

// Imports de Use Cases
import { CreateInspectionUseCase } from 'src/domain/use-cases/create-inspection.use-case';
import { UpdateInspectionChecklistItemUseCase } from 'src/domain/use-cases/update-inspection-checklist-item.use-case';
import { UploadEvidenceUseCase } from '@domain/use-cases/upload-evidence.use-case';
import { FinalizeInspectionUseCase } from '@domain/use-cases/finalize-inspection.use-case';
import { FindAllInspectionsUseCase } from '@domain/use-cases/find-all-inspections.use-case';
import { FindInspectionByIdUseCase } from '@domain/use-cases/find-inspection-by-id.use-case';
import { GenerateInspectionReportUseCase } from '@domain/use-cases/generate-inspection-report.use-case';
import { CheckForExistingInspectionUseCase } from '@domain/use-cases/check-for-existing-inspection.use-case';
import { UpdateInspectionUseCase } from 'src/domain/use-cases/update-inspection.use-case';
import { DeleteInspectionUseCase } from 'src/domain/use-cases/delete-inspection.use-case';
import { DeleteEvidenceUseCase } from 'src/domain/use-cases/delete-evidence.use-case';


// Imports de DTOs e Modelos
import { CreateInspectionDto } from 'src/api/dtos/create-inspection.dto';
import { UpdateInspectionDto } from 'src/api/dtos/update-inspection.dto';
import { Inspection } from 'src/domain/models/inspection.model';
import { ItemEvidence } from 'src/domain/models/item-evidence.model';
import { UpdateInspectionChecklistItemDto } from 'src/api/dtos/update-inspection-checklist-item.dto';
import { DeleteEvidenceDto } from 'src/api/dtos/delete-evidence.dto';

// Factory para criar mocks de use cases de forma limpa
const createMockUseCase = () => ({ execute: jest.fn() });

describe('InspectionController', () => {
  let controller: InspectionController;

  // Mocks para cada Use Case injetado
  const mockCreateInspectionUseCase = createMockUseCase();
  const mockUpdateItemUseCase = createMockUseCase();
  const mockUploadEvidenceUseCase = createMockUseCase();
  const mockFinalizeInspectionUseCase = createMockUseCase();
  const mockFindAllInspectionsUseCase = createMockUseCase();
  const mockFindByIdUseCase = createMockUseCase();
  const mockGenerateReportUseCase = createMockUseCase();
  const mockCheckForExistingUseCase = createMockUseCase();
  const mockUpdateInspectionUseCase = createMockUseCase();
  const mockDeleteInspectionUseCase = createMockUseCase();
  const mockDeleteEvidenceUseCase = createMockUseCase();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InspectionController],
      providers: [
        { provide: CreateInspectionUseCase, useValue: mockCreateInspectionUseCase },
        { provide: UpdateInspectionChecklistItemUseCase, useValue: mockUpdateItemUseCase },
        { provide: UploadEvidenceUseCase, useValue: mockUploadEvidenceUseCase },
        { provide: FinalizeInspectionUseCase, useValue: mockFinalizeInspectionUseCase },
        { provide: FindAllInspectionsUseCase, useValue: mockFindAllInspectionsUseCase },
        { provide: FindInspectionByIdUseCase, useValue: mockFindByIdUseCase },
        { provide: GenerateInspectionReportUseCase, useValue: mockGenerateReportUseCase },
        { provide: CheckForExistingInspectionUseCase, useValue: mockCheckForExistingUseCase },
        { provide: UpdateInspectionUseCase, useValue: mockUpdateInspectionUseCase },
        { provide: DeleteInspectionUseCase, useValue: mockDeleteInspectionUseCase },
        { provide: DeleteEvidenceUseCase, useValue: mockDeleteEvidenceUseCase },
      ],
    }).compile();

    controller = module.get<InspectionController>(InspectionController);

    // Silencia os logs e limpa os mocks
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => { });
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar o CreateInspectionUseCase e retornar a inspeção criada', async () => {
      const createDto: CreateInspectionDto = { inspectorName: 'Teste' } as any;
      const expectedResult = { id: 1, ...createDto } as Inspection;
      mockCreateInspectionUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(mockCreateInspectionUseCase.execute).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateItem', () => {
    it('deve chamar o UpdateInspectionChecklistItemUseCase com os parâmetros corretos', async () => {
      const updateDto: UpdateInspectionChecklistItemDto = { statusId: 2 };
      mockUpdateItemUseCase.execute.mockResolvedValue({ id: 1, statusId: 2 } as any);

      const result = await controller.updateItem(1, 5, updateDto);

      expect(mockUpdateItemUseCase.execute).toHaveBeenCalledWith(1, 5, updateDto);
      expect(result).toBeDefined();
    });
  });

  describe('uploadEvidence', () => {
    it('deve chamar o UploadEvidenceUseCase quando um ficheiro válido é enviado', async () => {
      const mockFile: Express.Multer.File = { originalname: 'test.jpg' } as any;
      await controller.uploadEvidence(1, 5, mockFile);
      expect(mockUploadEvidenceUseCase.execute).toHaveBeenCalledWith(1, 5, mockFile);
    });

    it('deve lançar uma HttpException se nenhum ficheiro for enviado', async () => {
      // Usamos uma só chamada e asserção para clareza
      await expect(
        controller.uploadEvidence(1, 5, undefined as any)
      ).rejects.toThrow('Arquivo não enviado ou o tipo não é suportado (apenas imagens).');

      // A asserção agora deve passar pois o mock é limpo a cada 'beforeEach'
      expect(mockUploadEvidenceUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('finalize', () => {
    it('deve chamar o FinalizeInspectionUseCase', async () => {
      const expectedResult = { id: 1, statusId: 2 } as Inspection;
      mockFinalizeInspectionUseCase.execute.mockResolvedValue(expectedResult);

      await controller.finalize(1);

      expect(mockFinalizeInspectionUseCase.execute).toHaveBeenCalledWith(1);
    });
  });

  describe('findAll', () => {
    it('deve chamar o FindAllInspectionsUseCase e retornar uma lista', async () => {
      const expectedResult: Inspection[] = [{ id: 1 } as Inspection];
      mockFindAllInspectionsUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(mockFindAllInspectionsUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findById', () => {
    it('deve chamar o FindInspectionByIdUseCase e retornar a inspeção', async () => {
      const expectedResult = { id: 1 } as Inspection;
      mockFindByIdUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.findById(1);

      expect(mockFindByIdUseCase.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });

    it('deve lançar NotFoundException se o caso de uso não encontrar a inspeção', async () => {
      mockFindByIdUseCase.execute.mockRejectedValue(new NotFoundException());
      await expect(controller.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateReport', () => {
    it('deve chamar o GenerateInspectionReportUseCase e configurar a resposta', async () => {
      const mockPdfBuffer = Buffer.from('pdf-content');
      const mockResponse = { setHeader: jest.fn(), send: jest.fn() };
      mockGenerateReportUseCase.execute.mockResolvedValue(mockPdfBuffer);

      await controller.generateReport(1, mockResponse as any);

      expect(mockGenerateReportUseCase.execute).toHaveBeenCalledWith(1);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockResponse.send).toHaveBeenCalledWith(mockPdfBuffer);
    });
  });

  describe('checkExisting', () => {
    it('deve retornar a inspeção se uma duplicata for encontrada', async () => {
      const dto = { inspectorName: 'Teste' } as CreateInspectionDto;
      const expectedResult = { id: 123 } as Inspection;
      mockCheckForExistingUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.checkExisting(dto);

      expect(mockCheckForExistingUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });

    it('deve lançar NotFoundException se nenhuma duplicata for encontrada', async () => {
      mockCheckForExistingUseCase.execute.mockResolvedValue(null);
      await expect(controller.checkExisting({} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve chamar o UpdateInspectionUseCase com os parâmetros corretos', async () => {
      const inspectionId = 1;
      const dto: UpdateInspectionDto = { driverName: 'Novo Motorista' };
      mockUpdateInspectionUseCase.execute.mockResolvedValue(undefined);

      await controller.update(inspectionId, dto);

      expect(mockUpdateInspectionUseCase.execute).toHaveBeenCalledWith(inspectionId, dto);
    });
  });

  describe('delete', () => {
    it('deve chamar o DeleteInspectionUseCase com o ID correto', async () => {
      const inspectionId = 1;
      mockDeleteInspectionUseCase.execute.mockResolvedValue(undefined);

      await controller.delete(inspectionId);

      expect(mockDeleteInspectionUseCase.execute).toHaveBeenCalledWith(inspectionId);
    });
  });

  // Dentro do seu ficheiro: inspection.controller.spec.ts

  describe('deleteEvidence', () => {
    it('deve chamar o DeleteEvidenceUseCase com os parâmetros corretos', async () => {
      // Arrange
      const inspectionId = 1;
      const pointNumber = 5;
      const dto: DeleteEvidenceDto = { fileName: 'evidence.png' };
      
      mockDeleteEvidenceUseCase.execute.mockResolvedValue({ message: 'sucesso' } as any);

      // Act
      await controller.deleteEvidence(inspectionId, pointNumber, dto);

      // Assert
      expect(mockDeleteEvidenceUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockDeleteEvidenceUseCase.execute).toHaveBeenCalledWith(
        inspectionId,
        pointNumber,
        dto.fileName,
      );
    });
  });
});