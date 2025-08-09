import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateInspectionChecklistItemUseCase } from '../../../../src/domain/use-cases/update-inspection-checklist-item.use-case';
import { UpdateInspectionChecklistItemUseCaseImpl } from '../../../../src/domain/use-cases/impl/update-inspection-checklist-item.use-case.impl';
import { InspectionRepositoryPort } from '../../../../src/domain/repositories/inspection.repository.port';
import { UpdateInspectionChecklistItemDto } from '../../../../src/api/dtos/update-inspection-checklist-item.dto';
import { InspectionChecklistItem } from '../../../../src/domain/models/inspection-checklist-item.model';

const STATUS_EM_INSPECAO = 1;
const STATUS_N_A = 4;

const mockInspectionRepository = {
  updateItemByPoint: jest.fn(),
  findByIdWithItems: jest.fn(),
  update: jest.fn(),
};

describe('UpdateInspectionChecklistItemUseCase', () => {
  let useCase: UpdateInspectionChecklistItemUseCase;
  let repository: InspectionRepositoryPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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
    jest.resetAllMocks();
  });

  it('deve chamar updateItemByPoint com os dados corretos', async () => {
    const inspectionId = 1;
    const pointNumber = 5;
    const updateDto: UpdateInspectionChecklistItemDto = {
      statusId: 2,
      observations: 'Item verificado e aprovado.',
    };
    const updatedItemMock = { id: 1, ...updateDto } as InspectionChecklistItem;

    mockInspectionRepository.updateItemByPoint.mockResolvedValue(updatedItemMock);
    mockInspectionRepository.findByIdWithItems.mockResolvedValue({
      id: inspectionId,
      statusId: STATUS_EM_INSPECAO,
      items: [],
    });

    await useCase.execute(inspectionId, pointNumber, updateDto);

    expect(repository.updateItemByPoint).toHaveBeenCalledTimes(1);
    expect(repository.updateItemByPoint).toHaveBeenCalledWith(inspectionId, pointNumber, updateDto);
  });

  it('deve lançar NotFoundException se o item não for encontrado', async () => {
    const inspectionId = 1;
    const pointNumber = 99;
    const updateDto: UpdateInspectionChecklistItemDto = { statusId: 2 };

    mockInspectionRepository.updateItemByPoint.mockResolvedValue(null);

    await expect(useCase.execute(inspectionId, pointNumber, updateDto)).rejects.toThrow(NotFoundException);
  });

  it('deve atualizar status da inspeção para EM_INSPEÇÃO quando existir item com status N/A', async () => {
    const inspectionId = 1;
    const pointNumber = 3;
    const updateDto: UpdateInspectionChecklistItemDto = { statusId: STATUS_N_A };
    const updatedItemMock = { id: 10, statusId: STATUS_N_A } as InspectionChecklistItem;

    mockInspectionRepository.updateItemByPoint.mockResolvedValue(updatedItemMock);
    mockInspectionRepository.findByIdWithItems.mockResolvedValue({
      id: inspectionId,
      statusId: 2, // Não está EM_INSPEÇÃO
      items: [{ statusId: STATUS_N_A }],
    });

    await useCase.execute(inspectionId, pointNumber, updateDto);

    expect(repository.update).toHaveBeenCalledTimes(1);
    expect(repository.update).toHaveBeenCalledWith(inspectionId, { statusId: STATUS_EM_INSPECAO });
  });

  it('não deve atualizar status da inspeção quando não existir item com status N/A', async () => {
    const inspectionId = 1;
    const pointNumber = 3;
    const updateDto: UpdateInspectionChecklistItemDto = { statusId: 2 };
    const updatedItemMock = { id: 10, statusId: 2 } as InspectionChecklistItem;

    mockInspectionRepository.updateItemByPoint.mockResolvedValue(updatedItemMock);
    mockInspectionRepository.findByIdWithItems.mockResolvedValue({
      id: inspectionId,
      statusId: STATUS_EM_INSPECAO,
      items: [{ statusId: 2 }],
    });

    await useCase.execute(inspectionId, pointNumber, updateDto);

    expect(repository.update).not.toHaveBeenCalled();
  });
});
