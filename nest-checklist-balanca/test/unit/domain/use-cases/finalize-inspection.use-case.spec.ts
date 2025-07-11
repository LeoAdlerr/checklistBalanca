import { Test, TestingModule } from '@nestjs/testing';
import { FinalizeInspectionUseCase } from 'src/domain/use-cases/finalize-inspection.use-case';
import { InspectionRepositoryPort } from 'src/domain/repositories/inspection.repository.port';
import { Inspection } from 'src/domain/models/inspection.model';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockInspectionRepository = {
  findByIdWithItems: jest.fn(),
  update: jest.fn(),
  findByIdWithDetails: jest.fn(),
};

describe('FinalizeInspectionUseCase', () => {
  let useCase: FinalizeInspectionUseCase;
  let repository: InspectionRepositoryPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinalizeInspectionUseCase,
        {
          provide: InspectionRepositoryPort,
          useValue: mockInspectionRepository,
        },
      ],
    }).compile();

    useCase = module.get<FinalizeInspectionUseCase>(FinalizeInspectionUseCase);
    repository = module.get<InspectionRepositoryPort>(InspectionRepositoryPort);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve definir o status da inspeção como APROVADO se todos os itens estiverem CONFORME', async () => {
    // Arrange
    const inspectionId = 1;
    const mockInspection = {
      id: inspectionId,
      items: [{ statusId: 2 }, { statusId: 2 }], // 2 = CONFORME
    } as Inspection;

    const mockFinalInspection = { ...mockInspection, statusId: 2 } as Inspection;

    mockInspectionRepository.findByIdWithItems.mockResolvedValue(mockInspection);
    mockInspectionRepository.findByIdWithDetails.mockResolvedValue(mockFinalInspection);

    // Act
    const result = await useCase.execute(inspectionId);

    // Assert
    expect(repository.update).toHaveBeenCalledWith(inspectionId, expect.objectContaining({ statusId: 2 }));
    expect(result).toEqual(mockFinalInspection);
  });

  it('deve definir o status da inspeção como REPROVADO se algum item estiver NAO_CONFORME', async () => {
    // Arrange
    const inspectionId = 1;
    const mockInspection = {
      id: inspectionId,
      items: [{ statusId: 2 }, { statusId: 3 }], // 3 = NAO_CONFORME
    } as Inspection;

    const mockFinalInspection = { ...mockInspection, statusId: 3 } as Inspection;

    mockInspectionRepository.findByIdWithItems.mockResolvedValue(mockInspection);
    mockInspectionRepository.findByIdWithDetails.mockResolvedValue(mockFinalInspection);

    // Act
    const result = await useCase.execute(inspectionId);

    // Assert
    expect(repository.update).toHaveBeenCalledWith(inspectionId, expect.objectContaining({ statusId: 3 }));
    expect(result).toEqual(mockFinalInspection);
  });

  it('deve lançar BadRequestException se houver itens pendentes', async () => {
    // Arrange
    const inspectionId = 1;
    const mockInspection = {
      id: inspectionId,
      items: [{ statusId: 1 }], // 1 = EM_INSPECAO
    } as Inspection;
    mockInspectionRepository.findByIdWithItems.mockResolvedValue(mockInspection);

    // Act & Assert
    await expect(useCase.execute(inspectionId)).rejects.toThrow(BadRequestException);
  });
});