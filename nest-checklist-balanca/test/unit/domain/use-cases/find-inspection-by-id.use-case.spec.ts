import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindInspectionByIdUseCase } from '@domain/use-cases/find-inspection-by-id.use-case';
import { FindInspectionByIdUseCaseImpl } from '@domain/use-cases/impl/find-inspection-by-id.use-case.impl';
import { InspectionRepositoryPort } from '@domain/repositories/inspection.repository.port';
import { Inspection } from '@domain/models/inspection.model';
import { ItemEvidence } from '@domain/models/item-evidence.model';
import { InspectionChecklistItem } from '@domain/models/inspection-checklist-item.model';

const mockInspectionRepository = {
  findById: jest.fn(),
};

describe('FindInspectionByIdUseCase', () => {
  let useCase: FindInspectionByIdUseCase;
  let repository: InspectionRepositoryPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Mapeia a interface (provide) para a implementação (useClass)
        {
          provide: FindInspectionByIdUseCase,
          useClass: FindInspectionByIdUseCaseImpl,
        },
        {
          provide: InspectionRepositoryPort,
          useValue: mockInspectionRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindInspectionByIdUseCase>(FindInspectionByIdUseCase);
    repository = module.get<InspectionRepositoryPort>(InspectionRepositoryPort);
  });

  afterEach(() => {
    jest.resetAllMocks(); // Usar reset para garantir isolamento
  });

  it('deve retornar uma inspeção completa, incluindo itens e evidências', async () => {
    // Arrange
    const inspectionId = 1;
    const mockRichInspection: Inspection = {
      id: inspectionId,
      inspectorName: 'Leonardo Testador',
      statusId: 1,
      driverName: 'Motorista Mock',
      modalityId: 1,
      operationTypeId: 1,
      unitTypeId: 1,
      startDatetime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: 1,
          inspectionId: inspectionId,
          masterPointId: 1,
          statusId: 2,
          evidences: [{ id: 101 } as ItemEvidence],
        } as InspectionChecklistItem,
      ],
    } as Inspection;
    
    mockInspectionRepository.findById.mockResolvedValue(mockRichInspection);

    // Act
    const result = await useCase.execute(inspectionId);

    // Assert
    expect(result).toEqual(mockRichInspection);
    expect(repository.findById).toHaveBeenCalledWith(inspectionId);
  });

  it('deve lançar um NotFoundException se o repositório retornar nulo', async () => {
    // Arrange
    const inspectionId = 999;
    mockInspectionRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(inspectionId)).rejects.toThrow(NotFoundException);
  });
  
  it('deve repassar um erro inesperado vindo do repositório', async () => {
    // Arrange
    const inspectionId = 500;
    const dbError = new Error('Erro de conexão com o banco de dados');
    mockInspectionRepository.findById.mockRejectedValue(dbError);

    // Act & Assert
    await expect(useCase.execute(inspectionId)).rejects.toThrow(dbError);
  });
});