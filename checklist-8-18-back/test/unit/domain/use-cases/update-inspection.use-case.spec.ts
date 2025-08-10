import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateInspectionUseCase } from '@domain/use-cases/update-inspection.use-case';
import { UpdateInspectionUseCaseImpl } from '@domain/use-cases/impl/update-inspection.use-case.impl';
import { InspectionRepositoryPort } from '@domain/repositories/inspection.repository.port';
import { UpdateInspectionDto } from 'src/api/dtos/update-inspection.dto';

describe('UpdateInspectionUseCaseImpl', () => {
  let useCase: UpdateInspectionUseCase;
  let mockInspectionRepository: jest.Mocked<InspectionRepositoryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { 
          provide: UpdateInspectionUseCase, 
          useClass: UpdateInspectionUseCaseImpl 
        },
        {
          provide: InspectionRepositoryPort,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateInspectionUseCase>(UpdateInspectionUseCase);
    mockInspectionRepository = module.get(InspectionRepositoryPort);
  });

  const inspectionId = 1;
  const updateDto: UpdateInspectionDto = { driverName: 'Novo Nome' };

  it('deve atualizar a inspeção se ela existir e estiver com o status "EM INSPEÇÃO"', async () => {
    // Arrange
    const mockInspection = { id: inspectionId, statusId: 1 }; // statusId: 1 = EM_INSPECAO
    mockInspectionRepository.findById.mockResolvedValue(mockInspection as any);

    // Act
    await useCase.execute(inspectionId, updateDto);

    // Assert
    expect(mockInspectionRepository.findById).toHaveBeenCalledWith(inspectionId);
    expect(mockInspectionRepository.update).toHaveBeenCalledWith(inspectionId, updateDto);
  });

  it('deve lançar ForbiddenException se a inspeção não estiver "EM INSPEÇÃO"', async () => {
    // Arrange
    const mockInspection = { id: inspectionId, statusId: 2 }; // statusId: 2 = APROVADO
    mockInspectionRepository.findById.mockResolvedValue(mockInspection as any);
    
    // Act & Assert
    await expect(useCase.execute(inspectionId, updateDto)).rejects.toThrow(ForbiddenException);
    
    // Garante que o método de update nunca foi chamado
    expect(mockInspectionRepository.update).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException se a inspeção não for encontrada', async () => {
    // Arrange
    mockInspectionRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(inspectionId, updateDto)).rejects.toThrow(NotFoundException);
    expect(mockInspectionRepository.update).not.toHaveBeenCalled();
  });
});