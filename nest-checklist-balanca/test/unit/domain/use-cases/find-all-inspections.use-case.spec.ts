import { Test, TestingModule } from '@nestjs/testing';
import { FindAllInspectionsUseCase } from '@domain/use-cases/find-all-inspections.use-case';
import { FindAllInspectionsUseCaseImpl } from '@domain/use-cases/impl/find-all-inspections.use-case.impl';
import { InspectionRepositoryPort } from '@domain/repositories/inspection.repository.port';
import { Inspection } from '@domain/models/inspection.model';

const mockInspectionRepository = {
  findAll: jest.fn(),
};

describe('FindAllInspectionsUseCase', () => {
  let useCase: FindAllInspectionsUseCase;
  let repository: InspectionRepositoryPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Mapeia a interface (provide) para a implementação (useClass)
        {
          provide: FindAllInspectionsUseCase,
          useClass: FindAllInspectionsUseCaseImpl,
        },
        {
          provide: InspectionRepositoryPort,
          useValue: mockInspectionRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindAllInspectionsUseCase>(FindAllInspectionsUseCase);
    repository = module.get<InspectionRepositoryPort>(InspectionRepositoryPort);
  });

  afterEach(() => {
    jest.resetAllMocks(); // Usar reset para garantir isolamento
  });

  it('deve retornar uma lista de inspeções quando o repositório as encontra', async () => {
    // Arrange
    const mockInspections: Inspection[] = [
      { id: 1 } as Inspection,
      { id: 2 } as Inspection,
    ];
    mockInspectionRepository.findAll.mockResolvedValue(mockInspections);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toEqual(mockInspections);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });

  it('deve retornar uma lista vazia se o repositório não encontrar nenhuma inspeção', async () => {
    // Arrange
    mockInspectionRepository.findAll.mockResolvedValue([]);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toEqual([]);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });
  
  it('deve repassar um erro inesperado vindo do repositório', async () => {
    // Arrange
    const dbError = new Error('Erro de conexão com o banco de dados');
    mockInspectionRepository.findAll.mockRejectedValue(dbError);

    // Act & Assert
    await expect(useCase.execute()).rejects.toThrow(dbError);
  });
});