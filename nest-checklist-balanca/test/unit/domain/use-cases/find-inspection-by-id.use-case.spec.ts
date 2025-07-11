import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindInspectionByIdUseCase } from '@domain/use-cases/find-inspection-by-id.use-case';
import { InspectionRepositoryPort } from '@domain/repositories/inspection.repository.port';
import { Inspection } from '@domain/models/inspection.model';

// Mock do repositório. Só precisamos simular o método 'findById'.
const mockInspectionRepository = {
  findById: jest.fn(),
};

describe('FindInspectionByIdUseCase', () => {
  let useCase: FindInspectionByIdUseCase;
  let repository: InspectionRepositoryPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindInspectionByIdUseCase,
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
    jest.clearAllMocks(); // Limpa os mocks após cada teste
  });

  // --- Caso de Teste 1: Caminho Feliz (inspeção encontrada) ---
  it('deve retornar uma inspeção quando ela é encontrada pelo repositório', async () => {
    // Arrange: Preparamos o cenário
    const inspectionId = 1;
    const mockInspection: Inspection = {
      id: inspectionId,
      inspectorName: 'Leonardo Testador',
      statusId: 1,
    } as Inspection;
    
    // Simulamos que o repositório retornará nossa inspeção mockada
    mockInspectionRepository.findById.mockResolvedValue(mockInspection);

    // Act: Executamos o caso de uso com um ID
    const result = await useCase.execute(inspectionId);

    // Assert: Verificamos o resultado
    expect(result).toEqual(mockInspection);
    expect(repository.findById).toHaveBeenCalledWith(inspectionId);
    expect(repository.findById).toHaveBeenCalledTimes(1);
  });

  // --- Caso de Teste 2: Caminho de Exceção (inspeção NÃO encontrada) ---
  it('deve lançar um NotFoundException se o repositório retornar nulo', async () => {
    // Arrange
    const inspectionId = 999; // Um ID que sabemos que não existe
    
    // Simulamos que o repositório não encontrou nada (retornou null)
    mockInspectionRepository.findById.mockResolvedValue(null);

    // Act & Assert
    // Verificamos se a execução do caso de uso é REJEITADA com a exceção correta.
    // Isso confirma que nossa lógica de 'if (!inspection) { throw ... }' está funcionando.
    await expect(useCase.execute(inspectionId)).rejects.toThrow(NotFoundException);
    await expect(useCase.execute(inspectionId)).rejects.toThrow(
        `Inspeção com o ID "${inspectionId}" não foi encontrada.`,
    );
    expect(repository.findById).toHaveBeenCalledWith(inspectionId);
  });
  
  // --- Caso de Teste 3: Lidando com erros inesperados do banco de dados ---
  it('deve repassar um erro inesperado vindo do repositório', async () => {
    // Arrange
    const inspectionId = 500;
    const dbError = new Error('Erro de conexão com o banco de dados');
    
    // Simulamos que o repositório vai lançar uma exceção genérica
    mockInspectionRepository.findById.mockRejectedValue(dbError);

    // Act & Assert
    // Verificamos se a execução do caso de uso rejeita a promise com o mesmo erro
    await expect(useCase.execute(inspectionId)).rejects.toThrow(dbError);
  });
});