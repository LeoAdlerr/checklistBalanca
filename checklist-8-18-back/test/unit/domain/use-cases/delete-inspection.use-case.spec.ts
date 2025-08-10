import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeleteInspectionUseCase } from '@domain/use-cases/delete-inspection.use-case';
import { DeleteInspectionUseCaseImpl } from '@domain/use-cases/impl/delete-inspection.use-case.impl';
import { InspectionRepositoryPort } from '@domain/repositories/inspection.repository.port';
import { FileSystemPort } from '@domain/ports/file-system.port';
import * as path from 'path';

describe('DeleteInspectionUseCaseImpl', () => {
  let useCase: DeleteInspectionUseCase;
  let mockInspectionRepository: jest.Mocked<InspectionRepositoryPort>;
  let mockFileSystem: jest.Mocked<FileSystemPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { 
          provide: DeleteInspectionUseCase, 
          useClass: DeleteInspectionUseCaseImpl 
        },
        {
          provide: InspectionRepositoryPort,
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: FileSystemPort,
          useValue: {
            deleteDirectory: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<DeleteInspectionUseCase>(DeleteInspectionUseCase);
    mockInspectionRepository = module.get(InspectionRepositoryPort);
    mockFileSystem = module.get(FileSystemPort);
  });

  const inspectionId = 1;

  it('deve apagar a inspeção e o seu diretório se ela estiver "EM INSPEÇÃO"', async () => {
    // Arrange
    const mockInspection = { id: inspectionId, statusId: 1 }; // statusId: 1 = EM_INSPECAO
    mockInspectionRepository.findById.mockResolvedValue(mockInspection as any);

    // Act
    await useCase.execute(inspectionId);

    // Assert
    expect(mockInspectionRepository.findById).toHaveBeenCalledWith(inspectionId);
    expect(mockInspectionRepository.delete).toHaveBeenCalledWith(inspectionId);
    
    const expectedDirPath = path.join(process.cwd(), 'uploads', String(inspectionId));
    expect(mockFileSystem.deleteDirectory).toHaveBeenCalledWith(expectedDirPath);
  });

  it('deve lançar ForbiddenException se a inspeção não estiver "EM INSPEÇÃO"', async () => {
    // Arrange
    const mockInspection = { id: inspectionId, statusId: 3 }; // statusId: 3 = REPROVADO
    mockInspectionRepository.findById.mockResolvedValue(mockInspection as any);
    
    // Act & Assert
    await expect(useCase.execute(inspectionId)).rejects.toThrow(ForbiddenException);
    
    expect(mockInspectionRepository.delete).not.toHaveBeenCalled();
    expect(mockFileSystem.deleteDirectory).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException se a inspeção não for encontrada', async () => {
    // Arrange
    mockInspectionRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(inspectionId)).rejects.toThrow(NotFoundException);
  });
});