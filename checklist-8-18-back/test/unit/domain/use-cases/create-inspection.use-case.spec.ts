import { Test, TestingModule } from '@nestjs/testing';
import { CreateInspectionUseCase } from '../../../../src/domain/use-cases/create-inspection.use-case';
import { CreateInspectionUseCaseImpl } from '../../../../src/domain/use-cases/impl/create-inspection.use-case.impl';
import { InspectionRepositoryPort } from '../../../../src/domain/repositories/inspection.repository.port';
import { MasterInspectionPointRepositoryPort } from '../../../../src/domain/repositories/master-inspection-point.repository.port';
import { CreateInspectionDto } from '../../../../src/api/dtos/create-inspection.dto';
import { Inspection } from '../../../../src/domain/models/inspection.model';
import { MasterInspectionPoint } from '../../../../src/domain/models/master-inspection-point.model';

// Os mocks para os repositórios continuam os mesmos
const mockInspectionRepository = {
  create: jest.fn(),
};
const mockMasterPointRepository = {
  findAll: jest.fn().mockResolvedValue(
    Array.from({ length: 18 }, (_, i) => ({ id: i + 1 } as MasterInspectionPoint)),
  ),
};

describe('CreateInspectionUseCase', () => {
  let useCase: CreateInspectionUseCase;
  let inspectionRepo: InspectionRepositoryPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Dizemos ao NestJS para usar a classe de implementação
        // sempre que a interface for injetada.
        {
          provide: CreateInspectionUseCase,
          useClass: CreateInspectionUseCaseImpl,
        },
        // Os mocks das dependências continuam sendo providos da mesma forma
        { provide: InspectionRepositoryPort, useValue: mockInspectionRepository },
        { provide: MasterInspectionPointRepositoryPort, useValue: mockMasterPointRepository },
      ],
    }).compile();

    useCase = module.get<CreateInspectionUseCase>(CreateInspectionUseCase);
    inspectionRepo = module.get<InspectionRepositoryPort>(InspectionRepositoryPort);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ A lógica do seu teste não muda em nada!
  it('deve chamar o repositório e retornar a inspeção criada', async () => {
    // Arrange
    const createDto: CreateInspectionDto = {
      inspectorName: 'Leonardo Adler',
      driverName: 'João Motorista',
      modalityId: 1,
      operationTypeId: 1,
      unitTypeId: 1,
    };
    const expectedInspection = { id: 1, ...createDto } as Inspection;
    mockInspectionRepository.create.mockResolvedValue(expectedInspection);

    // Act
    const result = await useCase.execute(createDto);

    // Assert
    expect(inspectionRepo.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedInspection);
  });
});