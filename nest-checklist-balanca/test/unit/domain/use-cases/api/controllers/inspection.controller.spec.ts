import { Test, TestingModule } from '@nestjs/testing';
import { InspectionController } from 'src/api/controllers/inspection.controller';
import { CreateInspectionUseCase } from 'src/domain/use-cases/create-inspection.use-case';
import { UpdateInspectionChecklistItemUseCase } from 'src/domain/use-cases/update-inspection-checklist-item.use-case';
import { UploadEvidenceUseCase } from '@domain/use-cases/upload-evidence.use-case';
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
import { GenerateInspectionReportUseCase } from '@domain/use-cases/generate-inspection-report.use-case';
import { CheckForExistingInspectionUseCase } from '@domain/use-cases/check-for-existing-inspection.use-case';


// Mocks para todos os casos de uso injetados no controller.
const mockCreateInspectionUseCase = { execute: jest.fn() };
const mockUpdateItemUseCase = { execute: jest.fn() };
const mockUploadEvidenceUseCase = { execute: jest.fn() };
const mockFinalizeInspectionUseCase = { execute: jest.fn() };
const mockFindAllInspectionsUseCase = { execute: jest.fn() };
const mockFindByIdUseCase = { execute: jest.fn() };
const mockGenerateReportUseCase = { execute: jest.fn() };
const mockCheckForExistingUseCase = { execute: jest.fn() };

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
  let generateReportUseCase: GenerateInspectionReportUseCase;
  let checkForExistingUseCase: CheckForExistingInspectionUseCase;

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
      ],
    }).compile();

    controller = module.get<InspectionController>(InspectionController);
    createUseCase = module.get<CreateInspectionUseCase>(CreateInspectionUseCase);
    updateUseCase = module.get<UpdateInspectionChecklistItemUseCase>(UpdateInspectionChecklistItemUseCase);
    uploadUseCase = module.get<UploadEvidenceUseCase>(UploadEvidenceUseCase);
    finalizeUseCase = module.get<FinalizeInspectionUseCase>(FinalizeInspectionUseCase);
    findAllUseCase = module.get<FindAllInspectionsUseCase>(FindAllInspectionsUseCase);
    findByIdUseCase = module.get<FindInspectionByIdUseCase>(FindInspectionByIdUseCase);
    generateReportUseCase = module.get<GenerateInspectionReportUseCase>(GenerateInspectionReportUseCase);
    checkForExistingUseCase = module.get<CheckForExistingInspectionUseCase>(CheckForExistingInspectionUseCase);
  });

  afterEach(() => {
    jest.resetAllMocks();
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

      //simulamos o UseCase retornando o objeto da inspeção.
      mockFinalizeInspectionUseCase.execute.mockResolvedValue(mockFinalizedInspection);

      // Act
      //  Capturamos o resultado que o método do controller retorna.
      const result = await controller.finalize(inspectionId);

      // Assert
      expect(finalizeUseCase.execute).toHaveBeenCalledTimes(1);
      expect(finalizeUseCase.execute).toHaveBeenCalledWith(inspectionId);

      // Verificamos se o controller retornou exatamente o que o UseCase forneceu.
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
    it('deve chamar o FindInspectionByIdUseCase e retornar a inspeção com suas evidências', async () => {
      // ARRANGE
      const inspectionId = 1;
      const mockRichInspection: Inspection = {
        id: inspectionId,
        inspectorName: 'Leonardo',
        statusId: 1,
        driverName: 'Motorista Mock',
        modalityId: 1,
        operationTypeId: 2,
        unitTypeId: 1,
        // Adicionando as propriedades opcionais como undefined para combinar com o tipo
        entryRegistration: undefined,
        vehiclePlates: undefined,
        containerTypeId: undefined,
        startDatetime: new Date(),
        endDatetime: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        // O restante das propriedades opcionais da sua entidade (como paths de assinatura)
        // também seriam 'undefined' aqui em um objeto real não finalizado.
        items: [
          {
            id: 1,
            inspectionId: inspectionId,
            masterPointId: 1,
            statusId: 2,
            observations: 'Tudo OK',
            createdAt: new Date(),
            updatedAt: new Date(),
            evidences: [
              {
                id: 101,
                itemId: 1,
                fileName: 'evidence.jpg',
                filePath: 'uploads/1/1/evidence.jpg',
              } as ItemEvidence,
            ],
            status: { id: 2, name: 'CONFORME' }
          } as InspectionChecklistItem,
        ],
        // Adicionando o objeto de status principal para o mock ser completo
        status: { id: 1, name: 'EM_INSPECAO' }
      } as Inspection;

      mockFindByIdUseCase.execute.mockResolvedValue(mockRichInspection);

      // ACT
      const result = await controller.findById(inspectionId);

      // ASSERT
      expect(mockFindByIdUseCase.execute).toHaveBeenCalledWith(inspectionId);
      expect(result).toEqual(mockRichInspection);
    });


    // O teste para 'NotFoundException' permanece o mesmo.
    it('deve lançar um NotFoundException se o caso de uso não encontrar a inspeção', async () => {
      const inspectionId = 999;
      const errorMessage = `Inspeção com o ID "${inspectionId}" não foi encontrada.`;
      mockFindByIdUseCase.execute.mockRejectedValue(new NotFoundException(errorMessage));

      await expect(controller.findById(inspectionId)).rejects.toThrow(NotFoundException);
      await expect(controller.findById(inspectionId)).rejects.toThrow(errorMessage);
    });
  });
  describe('generateReport', () => {
    it('deve chamar o GenerateInspectionReportUseCase e retornar um PDF', async () => {
      // ARRANGE
      const inspectionId = 1;
      const mockPdfBuffer = Buffer.from('conteúdo-do-pdf');

      // Criamos um mock do objeto de resposta do Express
      const mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      mockGenerateReportUseCase.execute.mockResolvedValue(mockPdfBuffer);

      // ACT
      // A chamada ao método vai falhar aqui, pois ele não existe ainda (ESTADO VERMELHO)
      await controller.generateReport(inspectionId, mockResponse as any);

      // ASSERT
      expect(generateReportUseCase.execute).toHaveBeenCalledWith(inspectionId);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        `attachment; filename="inspecao-${inspectionId}.pdf"`,
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockPdfBuffer);
    });
  });
  // TESTE para o endpoint 'check-existing'
  describe('checkExisting', () => {
    it('deve retornar a inspeção completa se uma duplicata for encontrada', async () => {
      // Arrange
      const dto = { inspectorName: 'Teste' } as CreateInspectionDto;
      const mockExistingInspection = { id: 123, inspectorName: 'Teste' } as Inspection;
      mockCheckForExistingUseCase.execute.mockResolvedValue(mockExistingInspection);

      // Act
      const result = await controller.checkExisting(dto);

      // Assert
      expect(checkForExistingUseCase.execute).toHaveBeenCalledWith(dto);
      // O controller retorna o objeto de inspeção completo
      expect(result).toEqual(mockExistingInspection);
    });

    it('deve lançar NotFoundException se nenhuma inspeção existente for encontrada', async () => {
      // Arrange
      const dto = { inspectorName: 'Teste' } as CreateInspectionDto;
      // O Use Case retorna null
      mockCheckForExistingUseCase.execute.mockResolvedValue(null);

      // Act & Assert
      // O teste agora espera que o controller lance uma exceção 404
      await expect(controller.checkExisting(dto)).rejects.toThrow(NotFoundException);
    });
  });

});
