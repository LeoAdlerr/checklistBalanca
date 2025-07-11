import { Test, TestingModule } from '@nestjs/testing';
import { FindAllInspectionsUseCase } from '@domain/use-cases/find-all-inspections.use-case';
import { InspectionRepositoryPort } from '@domain/repositories/inspection.repository.port';
import { Inspection } from '@domain/models/inspection.model';

// Mock do repositório que será usado nos testes
const mockInspectionRepository = {
  findAll: jest.fn(), // A única função que este use case vai chamar
};

describe('FindAllInspectionsUseCase', () => {
  let useCase: FindAllInspectionsUseCase;
  let repository: InspectionRepositoryPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllInspectionsUseCase,
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
    jest.clearAllMocks(); // Limpa os mocks após cada teste
  });

  // --- Caso de Teste 1: Caminho Feliz (com dados) ---
  it('deve retornar uma lista de inspeções quando o repositório as encontra', async () => {
    // Arrange: Preparamos o cenário
    const mockInspections: Inspection[] = [
      { id: 1, inspectorName: 'Leonardo' } as Inspection,
      { id: 2, inspectorName: 'Silva' } as Inspection,
    ];
    // Simulamos que o repositório retornará nossa lista mock
    mockInspectionRepository.findAll.mockResolvedValue(mockInspections);

    // Act: Executamos o caso de uso
    const result = await useCase.execute();

    // Assert: Verificamos o resultado
    expect(result).toEqual(mockInspections);
    expect(result.length).toBe(2);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });

  // --- Caso de Teste 2: Caminho Feliz (sem dados) ---
  it('deve retornar uma lista vazia se o repositório não encontrar nenhuma inspeção', async () => {
    // Arrange
    // Aqui está a correção de conceito: para uma lista, o correto não é um erro 404,
    // mas sim um status 200 OK com um array vazio [].
    mockInspectionRepository.findAll.mockResolvedValue([]);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toEqual([]);
    expect(result.length).toBe(0);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });
  
  // --- Caso de Teste 3 (Opcional, mas recomendado): Lidando com erros ---
  it('deve repassar um erro inesperado vindo do repositório', async () => {
    // Arrange
    const dbError = new Error('Erro de conexão com o banco de dados');
    // Simulamos que o repositório vai lançar uma exceção
    mockInspectionRepository.findAll.mockRejectedValue(dbError);

    // Act & Assert
    // Verificamos se a execução do caso de uso rejeita a promise com o mesmo erro
    await expect(useCase.execute()).rejects.toThrow(dbError);
  });
});