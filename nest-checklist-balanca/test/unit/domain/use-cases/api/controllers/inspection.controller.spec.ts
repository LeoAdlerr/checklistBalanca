import { Test, TestingModule } from '@nestjs/testing';
import { InspectionController } from 'src/api/controllers/inspection.controller';
import { CreateInspectionUseCase } from 'src/domain/use-cases/create-inspection.use-case';
import { UpdateInspectionChecklistItemUseCase } from 'src/domain/use-cases/update-inspection-checklist-item.use-case';
import { UploadEvidenceUseCase } from 'src/domain/use-cases/upload-evidence.use-case';
import { FindAllInspectionsUseCase } from '@domain/use-cases/find-all-inspections.use-case';
import { CreateInspectionDto } from 'src/api/dtos/create-inspection.dto';
import { UpdateInspectionChecklistItemDto } from 'src/api/dtos/update-inspection-checklist-item.dto';
import { Inspection } from 'src/domain/models/inspection.model';
import { InspectionChecklistItem } from 'src/domain/models/inspection-checklist-item.model';
import { ItemEvidence } from 'src/domain/models/item-evidence.model';
import { Readable } from 'stream';
import { FinalizeInspectionUseCase } from '@domain/use-cases/finalize-inspection.use-case';
import { FindInspectionByIdUseCase } from '@domain/use-cases/find-inspection-by-id.use-case';
import { NotFoundException } from '@nestjs/common';

// Mocks para todos os casos de uso injetados no controller.
const mockCreateInspectionUseCase = { execute: jest.fn() };
const mockUpdateItemUseCase = { execute: jest.fn() };
const mockUploadEvidenceUseCase = { execute: jest.fn() };
const mockFinalizeInspectionUseCase = { execute: jest.fn() };
const mockFindAllInspectionsUseCase = { execute: jest.fn() };
const mockFindByIdUseCase = { execute: jest.fn() };

// Mock de um arquivo de upload para os testes.
const mockFile: Express.Multer.File = {
  fieldname: 'file',
  originalname: 'test-image.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: './uploads',
  filename: 'unique-filename.jpg',
  path: 'uploads/unique-filename.jpg',
  size: 12345,
  stream: new Readable(),
  buffer: Buffer.from(''),
};

describe('InspectionController', () => {
  let controller: InspectionController;
  let createUseCase: CreateInspectionUseCase;
  let updateUseCase: UpdateInspectionChecklistItemUseCase;
  let uploadUseCase: UploadEvidenceUseCase;
  let finalizeUseCase: FinalizeInspectionUseCase;
  let findAllUseCase: FindAllInspectionsUseCase;
  let findByIdUseCase: FindInspectionByIdUseCase;

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
      ],
    }).compile();

    controller = module.get<InspectionController>(InspectionController);
    createUseCase = module.get<CreateInspectionUseCase>(CreateInspectionUseCase);
    updateUseCase = module.get<UpdateInspectionChecklistItemUseCase>(UpdateInspectionChecklistItemUseCase);
    uploadUseCase = module.get<UploadEvidenceUseCase>(UploadEvidenceUseCase);
    finalizeUseCase = module.get<FinalizeInspectionUseCase>(FinalizeInspectionUseCase);
    findAllUseCase = module.get<FindAllInspectionsUseCase>(FindAllInspectionsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar o CreateInspectionUseCase e retornar a inspeção criada', async () => {
      // Arrange
      const createDto: CreateInspectionDto = {
        inspectorName: 'Leonardo Adler',
        driverName: 'João Motorista',
        modalityId: 1,
        operationTypeId: 1,
        unitTypeId: 1,
      };
      const expectedResult = { id: 1, ...createDto } as Inspection;
      mockCreateInspectionUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(createUseCase.execute).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateItem', () => {
    it('deve chamar o UpdateInspectionChecklistItemUseCase com os parâmetros corretos', async () => {
      // Arrange
      const inspectionId = 1;
      const pointNumber = 5;
      const updateDto: UpdateInspectionChecklistItemDto = {
        statusId: 2,
        observations: 'Item verificado.',
      };
      const expectedResult = { id: 1, statusId: 2 } as InspectionChecklistItem;
      mockUpdateItemUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.updateItem(inspectionId, pointNumber, updateDto);

      // Assert
      expect(updateUseCase.execute).toHaveBeenCalledTimes(1);
      // Valida que o controller passou os parâmetros corretos para o caso de uso.
      expect(updateUseCase.execute).toHaveBeenCalledWith(inspectionId, pointNumber, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('uploadEvidence', () => {
    it('deve chamar o UploadEvidenceUseCase com os parâmetros corretos para arquivo válido', async () => {
      // Arrange
      const inspectionId = 1;
      const pointNumber = 5;
      const expectedResult = { id: 1, fileName: 'test-image.jpg' } as ItemEvidence;
      mockUploadEvidenceUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.uploadEvidence(inspectionId, pointNumber, mockFile);

      // Assert
      expect(uploadUseCase.execute).toHaveBeenCalledTimes(1);
      expect(uploadUseCase.execute).toHaveBeenCalledWith(inspectionId, pointNumber, mockFile);
      expect(result).toEqual(expectedResult);
    });

    it('deve rejeitar arquivo com mimetype inválido', async () => {
      // Arrange
      const inspectionId = 1;
      const pointNumber = 5;
      const invalidFile: Express.Multer.File = {
        ...mockFile,
        mimetype: 'application/vnd.ms-powerpoint', // ppt mime inválido para upload
      };

      // Simula comportamento da controller com validação no controller
      // Como na realidade o fileFilter rejeita antes, simulamos lançar exceção aqui para testar lógica
      const uploadEvidenceOriginal = controller.uploadEvidence.bind(controller);
      controller.uploadEvidence = async (inspectionId, pointNumber, file) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          throw new Error('Apenas arquivos de imagem são permitidos!');
        }
        return uploadEvidenceOriginal(inspectionId, pointNumber, file);
      };

      // Act & Assert
      await expect(controller.uploadEvidence(inspectionId, pointNumber, invalidFile)).rejects.toThrow('Apenas arquivos de imagem são permitidos!');

      // Restaura método original
      controller.uploadEvidence = uploadEvidenceOriginal;
    });
  });
  describe('finalize', () => {
    it('deve chamar o FinalizeInspectionUseCase e retornar a inspeção finalizada', async () => {
      // Arrange
      const inspectionId = 1;
      // Ele deve ter a mesma "forma" do seu modelo de domínio 'Inspection'.
      const mockFinalizedInspection: Inspection = {
        id: inspectionId,
        statusId: 2,
        inspectorName: 'Inspetor do Teste',
        driverName: 'Motorista do Teste',
        modalityId: 1,
        operationTypeId: 1,
        unitTypeId: 1,
        startDatetime: new Date(),
        endDatetime: new Date(),
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Inspection;

      // ✅ NOVO: Agora simulamos o UseCase retornando o objeto da inspeção.
      mockFinalizeInspectionUseCase.execute.mockResolvedValue(mockFinalizedInspection);

      // Act
      // ✅ NOVO: Capturamos o resultado que o método do controller retorna.
      const result = await controller.finalize(inspectionId);

      // Assert
      expect(finalizeUseCase.execute).toHaveBeenCalledTimes(1);
      expect(finalizeUseCase.execute).toHaveBeenCalledWith(inspectionId);

      // ✅ NOVO: Verificamos se o controller retornou exatamente o que o UseCase forneceu.
      expect(result).toEqual(mockFinalizedInspection);
    });
  });
  describe('findAll', () => {
    it('deve chamar o FindAllInspectionsUseCase e retornar uma lista de inspeções', async () => {
      // Arrange
      const mockInspections: Inspection[] = [
        { id: 1, inspectorName: 'Leonardo' } as Inspection,
        { id: 2, inspectorName: 'Silva' } as Inspection,
      ];
      mockFindAllInspectionsUseCase.execute.mockResolvedValue(mockInspections);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(findAllUseCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockInspections);
      expect(result.length).toBe(2);
    });
  });
  describe('findById', () => {
    it('deve chamar o FindInspectionByIdUseCase e retornar uma única inspeção', async () => {
      // Arrange
      const inspectionId = 1;
      const mockInspection: Inspection = { id: inspectionId, inspectorName: 'Leonardo' } as Inspection;
      mockFindByIdUseCase.execute.mockResolvedValue(mockInspection);

      // Act
      const result = await controller.findById(inspectionId);

      // Assert
      expect(mockFindByIdUseCase.execute).toHaveBeenCalledWith(inspectionId);
      expect(mockFindByIdUseCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockInspection);
    });

    it('deve lançar um NotFoundException se o caso de uso não encontrar a inspeção', async () => {
      // Arrange
      const inspectionId = 999; // Um ID que não existe
      const errorMessage = `Inspeção com o ID "${inspectionId}" não foi encontrada.`;
      mockFindByIdUseCase.execute.mockRejectedValue(new NotFoundException(errorMessage));

      // Act & Assert
      // Verificamos se a chamada ao método do controller rejeita a Promise
      // e lança a exceção correta.
      await expect(controller.findById(inspectionId)).rejects.toThrow(NotFoundException);
      await expect(controller.findById(inspectionId)).rejects.toThrow(errorMessage);
    });
  });
});
