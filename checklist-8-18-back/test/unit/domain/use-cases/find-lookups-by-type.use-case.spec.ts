import { Test, TestingModule } from '@nestjs/testing';
import { FindLookupsByTypeUseCase } from '@domain/use-cases/find-lookups-by-type.use-case';
import { FindLookupsByTypeUseCaseImpl } from '@domain/use-cases/impl/find-lookups-by-type.use-case.impl';
import { LookupRepositoryPort } from '@domain/repositories/lookup.repository.port';
import { Lookup } from '@domain/models/lookup.model';

//  Mock do repositório que será injetado no Use Case.
const mockLookupRepository = {
  findByType: jest.fn(),
};

describe('FindLookupsByTypeUseCase', () => {
  let useCase: FindLookupsByTypeUseCase;
  let repository: LookupRepositoryPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Conectamos a interface à sua implementação.
        {
          provide: FindLookupsByTypeUseCase,
          useClass: FindLookupsByTypeUseCaseImpl,
        },
        // Injetamos nosso mock no lugar do repositório real.
        {
          provide: LookupRepositoryPort,
          useValue: mockLookupRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindLookupsByTypeUseCase>(FindLookupsByTypeUseCase);
    repository = module.get<LookupRepositoryPort>(LookupRepositoryPort);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('deve chamar o repositório com o tipo correto e retornar os dados', async () => {
    // Arrange
    const mockLookups: Lookup[] = [
      { id: 1, name: 'RODOVIARIO' },
      { id: 2, name: 'MARITIMO' },
    ];
    // Configuramos o mock para retornar nossa lista quando chamado com 'modalities'
    mockLookupRepository.findByType.mockResolvedValue(mockLookups);

    // Act
    const result = await useCase.execute('modalities');

    // Assert
    expect(repository.findByType).toHaveBeenCalledWith('modalities');
    expect(repository.findByType).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockLookups);
  });

  it('deve retornar um array vazio se o repositório retornar um array vazio', async () => {
    // Arrange
    mockLookupRepository.findByType.mockResolvedValue([]);

    // Act
    const result = await useCase.execute('statuses');

    // Assert
    expect(result).toEqual([]);
    expect(repository.findByType).toHaveBeenCalledWith('statuses');
  });

  it('deve repassar um erro se o repositório lançar uma exceção', async () => {
    // Arrange
    const mockError = new Error('Falha no banco de dados');
    mockLookupRepository.findByType.mockRejectedValue(mockError);

    // Act & Assert
    await expect(useCase.execute('unit-types')).rejects.toThrow(mockError);
  });
});