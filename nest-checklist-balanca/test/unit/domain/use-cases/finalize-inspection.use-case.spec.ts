import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FinalizeInspectionUseCase } from 'src/domain/use-cases/finalize-inspection.use-case';
import { FinalizeInspectionUseCaseImpl } from 'src/domain/use-cases/impl/finalize-inspection.use-case.impl';
import { InspectionRepositoryPort } from 'src/domain/repositories/inspection.repository.port';
import { Inspection } from 'src/domain/models/inspection.model';

const mockInspectionRepository = {
  findByIdWithItems: jest.fn(),
  findByIdWithDetails: jest.fn(),
  update: jest.fn(),
};

describe('FinalizeInspectionUseCase', () => {
  let useCase: FinalizeInspectionUseCase;
  let repository: InspectionRepositoryPort;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: FinalizeInspectionUseCase,
          useClass: FinalizeInspectionUseCaseImpl,
        },
        {
          provide: InspectionRepositoryPort,
          useValue: mockInspectionRepository,
        },
      ],
    }).compile();

    useCase = module.get<FinalizeInspectionUseCase>(FinalizeInspectionUseCase);
    repository = module.get<InspectionRepositoryPort>(InspectionRepositoryPort);
  });

  it('deve definir o status como APROVADO se todos os itens estiverem conformes', async () => {
    // Arrange
    const inspectionId = 1;
    const mockInspection = {
      id: inspectionId,
      items: [{ statusId: 2 }, { statusId: 4 }], // CONFORME e N/A
    } as Inspection;

    const mockFinalInspection = { ...mockInspection, statusId: 2 };

    mockInspectionRepository.findByIdWithItems.mockResolvedValue(mockInspection);
    mockInspectionRepository.findByIdWithDetails.mockResolvedValue(mockFinalInspection);

    // Act
    const result = await useCase.execute(inspectionId);

    // Assert
    expect(repository.update).toHaveBeenCalledWith(inspectionId, expect.objectContaining({ statusId: 2, endDatetime: expect.any(Date) }));
    expect(result).toEqual(mockFinalInspection);
  });

  it('deve definir o status como REPROVADO se algum item estiver não conforme', async () => {
    // Arrange
    const inspectionId = 1;
    const mockInspection = {
      id: inspectionId,
      items: [{ statusId: 2 }, { statusId: 3 }], // NAO_CONFORME
    } as Inspection;
    
    const mockFinalInspection = { ...mockInspection, statusId: 3 };
    mockInspectionRepository.findByIdWithItems.mockResolvedValue(mockInspection);
    mockInspectionRepository.findByIdWithDetails.mockResolvedValue(mockFinalInspection);

    // Act
    const result = await useCase.execute(inspectionId);

    // Assert
    expect(repository.update).toHaveBeenCalledWith(inspectionId, expect.objectContaining({ statusId: 3, endDatetime: expect.any(Date) }));
    expect(result).toEqual(mockFinalInspection);
  });

  it('deve lançar BadRequestException se houver itens pendentes', async () => {
    // Arrange
    const inspectionId = 1;
    const mockInspection = {
      id: inspectionId,
      items: [{ statusId: 1 }], // EM_INSPECAO
    } as Inspection;
    mockInspectionRepository.findByIdWithItems.mockResolvedValue(mockInspection);

    // Act & Assert
    await expect(useCase.execute(inspectionId)).rejects.toThrow(BadRequestException);
  });
  
  it('deve lançar NotFoundException se a inspeção não for encontrada', async () => {
    // Arrange
    mockInspectionRepository.findByIdWithItems.mockResolvedValue(null);
    
    // Act & Assert
    await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
  });
});