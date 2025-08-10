import { Test, TestingModule } from '@nestjs/testing';
import { CheckForExistingInspectionUseCase } from '@domain/use-cases/check-for-existing-inspection.use-case';
import { CheckForExistingInspectionUseCaseImpl } from '@domain/use-cases/impl/check-for-existing-inspection.use-case.impl';
import { InspectionRepositoryPort } from '@domain/repositories/inspection.repository.port';
import { Inspection } from '@domain/models/inspection.model';
import { CreateInspectionDto } from 'src/api/dtos/create-inspection.dto';

// Mock do repositório
const mockInspectionRepository = {
  findExistingInspection: jest.fn(),
};

describe('CheckForExistingInspectionUseCase', () => {
  let useCase: CheckForExistingInspectionUseCase;
  let repository: InspectionRepositoryPort;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CheckForExistingInspectionUseCase,
          useClass: CheckForExistingInspectionUseCaseImpl,
        },
        {
          provide: InspectionRepositoryPort,
          useValue: mockInspectionRepository,
        },
      ],
    }).compile();

    useCase = module.get<CheckForExistingInspectionUseCase>(CheckForExistingInspectionUseCase);
    repository = module.get<InspectionRepositoryPort>(InspectionRepositoryPort);
  });

  it('deve retornar uma inspeção se uma duplicata for encontrada', async () => {
    // Arrange
    const dto = { inspectorName: 'Teste' } as CreateInspectionDto;
    const mockExistingInspection = { id: 1, inspectorName: 'Teste' } as Inspection;
    
    mockInspectionRepository.findExistingInspection.mockResolvedValue(mockExistingInspection);

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(repository.findExistingInspection).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockExistingInspection);
  });

  it('deve retornar nulo se nenhuma duplicata for encontrada', async () => {
    // Arrange
    const dto = { inspectorName: 'Teste' } as CreateInspectionDto;
    mockInspectionRepository.findExistingInspection.mockResolvedValue(null);

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(repository.findExistingInspection).toHaveBeenCalledWith(dto);
    // O Use Case deve simplesmente repassar o 'null' do repositório
    expect(result).toBeNull();
  });

  it('deve repassar um erro se o repositório falhar', async () => {
    // Arrange
    const dto = { inspectorName: 'Teste' } as CreateInspectionDto;
    const mockError = new Error('Erro de banco de dados');
    mockInspectionRepository.findExistingInspection.mockRejectedValue(mockError);

    // Act & Assert
    await expect(useCase.execute(dto)).rejects.toThrow(mockError);
  });
});