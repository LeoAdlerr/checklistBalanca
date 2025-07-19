import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateInspectionChecklistItemUseCase } from '../../../../src/domain/use-cases/update-inspection-checklist-item.use-case';
import { UpdateInspectionChecklistItemUseCaseImpl } from '../../../../src/domain/use-cases/impl/update-inspection-checklist-item.use-case.impl';
import { InspectionRepositoryPort } from '../../../../src/domain/repositories/inspection.repository.port';
import { UpdateInspectionChecklistItemDto } from '../../../../src/api/dtos/update-inspection-checklist-item.dto';
import { InspectionChecklistItem } from '../../../../src/domain/models/inspection-checklist-item.model';

const mockInspectionRepository = {
  updateItemByPoint: jest.fn(),
};

describe('UpdateInspectionChecklistItemUseCase', () => {
  let useCase: UpdateInspectionChecklistItemUseCase;
  let repository: InspectionRepositoryPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Mapeia a interface (provide) para a implementação (useClass)
        {
          provide: UpdateInspectionChecklistItemUseCase,
          useClass: UpdateInspectionChecklistItemUseCaseImpl,
        },
        {
          provide: InspectionRepositoryPort,
          useValue: mockInspectionRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateInspectionChecklistItemUseCase>(UpdateInspectionChecklistItemUseCase);
    repository = module.get<InspectionRepositoryPort>(InspectionRepositoryPort);
  });

  afterEach(() => {
    jest.resetAllMocks(); // Usar reset para garantir isolamento
  });

  it('deve chamar o método updateItemByPoint do repositório com os dados corretos', async () => {
    // Arrange
    const inspectionId = 1;
    const pointNumber = 5;
    const updateDto: UpdateInspectionChecklistItemDto = {
      statusId: 2,
      observations: 'Item verificado e aprovado.',
    };
    const updatedItemMock = { id: 1, ...updateDto } as InspectionChecklistItem;
    mockInspectionRepository.updateItemByPoint.mockResolvedValue(updatedItemMock);

    // Act
    await useCase.execute(inspectionId, pointNumber, updateDto);

    // Assert
    expect(repository.updateItemByPoint).toHaveBeenCalledTimes(1);
    expect(repository.updateItemByPoint).toHaveBeenCalledWith(inspectionId, pointNumber, updateDto);
  });

  it('deve lançar NotFoundException se o item não for encontrado', async () => {
    // Arrange
    const inspectionId = 1;
    const pointNumber = 99; // Ponto inexistente
    const updateDto: UpdateInspectionChecklistItemDto = { statusId: 2 };
    mockInspectionRepository.updateItemByPoint.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(inspectionId, pointNumber, updateDto)).rejects.toThrow(NotFoundException);
  });
});