import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DeleteEvidenceUseCase } from '@domain/use-cases/delete-evidence.use-case';
import { DeleteEvidenceUseCaseImpl } from '@domain/use-cases/impl/delete-evidence.use-case.impl';
import { InspectionRepositoryPort } from '@domain/repositories/inspection.repository.port';
import { FileSystemPort } from '@domain/ports/file-system.port';
import * as path from 'path';

describe('DeleteEvidenceUseCaseImpl (Refatorado)', () => {
  let useCase: DeleteEvidenceUseCase;
  let mockInspectionRepository: jest.Mocked<InspectionRepositoryPort>;
  let mockFileSystem: jest.Mocked<FileSystemPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: DeleteEvidenceUseCase, useClass: DeleteEvidenceUseCaseImpl },
        {
          provide: InspectionRepositoryPort,
          useValue: {
            findEvidenceByFileName: jest.fn(),
            deleteEvidence: jest.fn(),
          },
        },
        {
          provide: FileSystemPort,
          useValue: {
            deleteFile: jest.fn(),
            fileExists: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<DeleteEvidenceUseCase>(DeleteEvidenceUseCase);
    mockInspectionRepository = module.get(InspectionRepositoryPort);
    mockFileSystem = module.get(FileSystemPort);
  });
  
  const inspectionId = 1, pointNumber = 1, fileName = 'evidence.png';
  const mockEvidence = {
      id: 101,
      filePath: `uploads/${inspectionId}/${pointNumber}-PONTO/${fileName}`,
    };

  it('deve apagar o ficheiro físico PRIMEIRO e depois o registo do banco', async () => {
    // Arrange
    mockInspectionRepository.findEvidenceByFileName.mockResolvedValue(mockEvidence as any);
    (mockFileSystem.deleteFile as jest.Mock).mockResolvedValue(undefined);

    // Act
    await useCase.execute(inspectionId, pointNumber, fileName);

    // Assert
    const expectedAbsolutePath = path.join(process.cwd(), mockEvidence.filePath);
    expect(mockFileSystem.deleteFile).toHaveBeenCalledWith(expectedAbsolutePath);
    expect(mockInspectionRepository.deleteEvidence).toHaveBeenCalledWith(mockEvidence.id);
  });

  it('NÃO deve apagar o registo do banco se a remoção do ficheiro falhar', async () => {
    // Arrange
    const fileError = new Error('Permission denied');
    mockInspectionRepository.findEvidenceByFileName.mockResolvedValue(mockEvidence as any);
    mockFileSystem.deleteFile.mockRejectedValue(fileError);

    // Act & Assert
    // esperamos a exceção que o nosso UseCase realmente lança.
    await expect(useCase.execute(inspectionId, pointNumber, fileName))
      .rejects.toThrow(InternalServerErrorException);
      
    await expect(useCase.execute(inspectionId, pointNumber, fileName))
      .rejects.toThrow('Falha ao apagar o ficheiro físico: Permission denied');
    
    // A asserção principal continua a mesma e é crucial
    expect(mockInspectionRepository.deleteEvidence).not.toHaveBeenCalled();
  });
  
  it('deve lançar NotFoundException se a evidência não for encontrada no banco', async () => {
    // Arrange
    mockInspectionRepository.findEvidenceByFileName.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(inspectionId, pointNumber, fileName)).rejects.toThrow(NotFoundException);
  });
});