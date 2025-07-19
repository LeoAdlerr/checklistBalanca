import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { LookupController } from 'src/api/controllers/lookup.controller';
import { FindLookupsByTypeUseCase } from 'src/domain/use-cases/find-lookups-by-type.use-case';
import { Lookup } from 'src/domain/models/lookup.model';

// Mock do Use Case que será injetado no Controller.
const mockFindLookupsUseCase = {
  execute: jest.fn(),
};

describe('LookupController', () => {
  let controller: LookupController;
  let useCase: FindLookupsByTypeUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LookupController],
      providers: [
        // Injetamos nosso mock no lugar do Use Case real.
        {
          provide: FindLookupsByTypeUseCase,
          useValue: mockFindLookupsUseCase,
        },
      ],
    }).compile();

    controller = module.get<LookupController>(LookupController);
    useCase = module.get<FindLookupsByTypeUseCase>(FindLookupsByTypeUseCase);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllByType', () => {
    it('deve chamar o use case com o tipo correto e retornar os dados', async () => {
      // Arrange
      const mockLookups: Lookup[] = [{ id: 1, name: 'RODOVIARIO' }];
      mockFindLookupsUseCase.execute.mockResolvedValue(mockLookups);

      // Act
      const result = await controller.findAllByType('modalities');

      // Assert
      expect(useCase.execute).toHaveBeenCalledWith('modalities');
      expect(useCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockLookups);
    });

    it('deve repassar a exceção se o use case lançar um erro', async () => {
      // Arrange
      const mockError = new BadRequestException('Tipo de lookup inválido');
      mockFindLookupsUseCase.execute.mockRejectedValue(mockError);

      // Act & Assert
      // O 'as any' é usado para passar um valor inválido no teste de propósito
      await expect(controller.findAllByType('tipo_invalido' as any)).rejects.toThrow(BadRequestException);
    });
  });
});