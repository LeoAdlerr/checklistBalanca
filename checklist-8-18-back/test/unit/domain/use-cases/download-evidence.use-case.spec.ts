import { Test, TestingModule } from '@nestjs/testing';
import { DownloadEvidenceUseCase } from '@domain/use-cases/download-evidence.use-case';
import { DownloadEvidenceUseCaseImpl } from '@domain/use-cases/impl/download-evidence.use-case.impl';
import { InspectionRepositoryPort } from '@domain/repositories/inspection.repository.port';
import { FileSystemPort } from '@domain/ports/file-system.port';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ItemEvidence } from '@domain/models/item-evidence.model';
import * as path from 'path';

// Mocks para as dependências do UseCase
const mockInspectionRepository = {
  findEvidenceByFileName: jest.fn(),
};

const mockFileSystem = {
  fileExists: jest.fn(),
  readFile: jest.fn(),
};

describe('DownloadEvidenceUseCase', () => {
  let useCase: DownloadEvidenceUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DownloadEvidenceUseCase,
          useClass: DownloadEvidenceUseCaseImpl,
        },
        { provide: InspectionRepositoryPort, useValue: mockInspectionRepository },
        { provide: FileSystemPort, useValue: mockFileSystem },
      ],
    }).compile();

    useCase = module.get<DownloadEvidenceUseCase>(DownloadEvidenceUseCase);
    jest.clearAllMocks();
  });

  const inspectionId = 1;
  const pointNumber = 1;
  const fileName = 'test-evidence.png';
  
  const mockEvidence: ItemEvidence = {
    id: 101,
    fileName: fileName,
    filePath: `uploads/${inspectionId}/${pointNumber}-ITEM_TESTE/${fileName}`,
    mimeType: 'image/png',
    fileSize: 12345,
    itemId: 1,
  };

  it('deve encontrar a evidência, ler o arquivo e retornar os dados completos para download', async () => {
    // Arrange
    const mockBuffer = Buffer.from('fake-image-content');
    mockInspectionRepository.findEvidenceByFileName.mockResolvedValue(mockEvidence);
    mockFileSystem.fileExists.mockResolvedValue(true);
    mockFileSystem.readFile.mockResolvedValue(mockBuffer);

    // Act
    const result = await useCase.execute(inspectionId, pointNumber, fileName);

    // Assert
    expect(mockInspectionRepository.findEvidenceByFileName).toHaveBeenCalledWith(inspectionId, pointNumber, fileName);
    
    const expectedAbsolutePath = path.join(process.cwd(), mockEvidence.filePath);
    expect(mockFileSystem.fileExists).toHaveBeenCalledWith(expectedAbsolutePath);
    expect(mockFileSystem.readFile).toHaveBeenCalledWith(expectedAbsolutePath);

    expect(result).toEqual({
      buffer: mockBuffer,
      mimeType: mockEvidence.mimeType,
      fileName: mockEvidence.fileName,
    });
  });

  it('deve lançar NotFoundException se a evidência não for encontrada no banco de dados', async () => {
    // Arrange
    mockInspectionRepository.findEvidenceByFileName.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(inspectionId, pointNumber, fileName)).rejects.toThrow(NotFoundException);
  });

  it('deve lançar InternalServerErrorException se o arquivo existir no banco de dados mas não no disco', async () => {
    // Arrange
    mockInspectionRepository.findEvidenceByFileName.mockResolvedValue(mockEvidence);
    // Simula que o arquivo não foi encontrado no disco
    mockFileSystem.fileExists.mockResolvedValue(false);

    // Act & Assert
    await expect(useCase.execute(inspectionId, pointNumber, fileName)).rejects.toThrow(InternalServerErrorException);
    // Garante que a leitura do arquivo nem foi tentada
    expect(mockFileSystem.readFile).not.toHaveBeenCalled();
  });
});