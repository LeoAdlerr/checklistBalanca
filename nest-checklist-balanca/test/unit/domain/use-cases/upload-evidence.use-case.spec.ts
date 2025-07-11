import { Test, TestingModule } from '@nestjs/testing';
import { UploadEvidenceUseCase } from '../../../../src/domain/use-cases/upload-evidence.use-case';
import { InspectionRepositoryPort } from '../../../../src/domain/repositories/inspection.repository.port';
import { FileSystemPort } from '../../../../src/domain/ports/file-system.port';
import { NotFoundException } from '@nestjs/common';
import { InspectionChecklistItem } from '../../../../src/domain/models/inspection-checklist-item.model';
import { ItemEvidence } from '../../../../src/domain/models/item-evidence.model';
import { Readable } from 'stream';
import * as path from 'path';

// Mocks para as dependências
const mockInspectionRepository = {
  findItemByInspectionAndPoint: jest.fn(),
  addEvidenceToItem: jest.fn(),
  create: jest.fn(),
  updateItemByPoint: jest.fn(),
};

const mockFileSystemService = {
  createDirectoryIfNotExists: jest.fn(),
  fileExists: jest.fn(),
  moveFile: jest.fn(),
};

const mockFile: Express.Multer.File = {
  fieldname: 'file',
  originalname: 'test-image.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: './uploads',
  filename: 'unique-random-name.jpg', // Nome temporário dado pelo Multer
  path: path.join('uploads', 'unique-random-name.jpg'),
  size: 12345,
  stream: new Readable(),
  buffer: Buffer.from(''),
};

describe('UploadEvidenceUseCase', () => {
  let useCase: UploadEvidenceUseCase;
  let repository: InspectionRepositoryPort;
  let fileSystem: FileSystemPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadEvidenceUseCase,
        { provide: InspectionRepositoryPort, useValue: mockInspectionRepository },
        { provide: FileSystemPort, useValue: mockFileSystemService },
      ],
    }).compile();

    useCase = module.get<UploadEvidenceUseCase>(UploadEvidenceUseCase);
    repository = module.get<InspectionRepositoryPort>(InspectionRepositoryPort);
    fileSystem = module.get<FileSystemPort>(FileSystemPort);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const inspectionId = 1;
    const pointNumber = 5;
    const foundItemMock = {
      id: 10,
      masterPoint: { name: 'PAREDE_FRONTAL' },
    } as unknown as InspectionChecklistItem;

    it('deve criar a estrutura de pastas, mover o arquivo e salvar a evidência', async () => {
      // Arrange
      mockInspectionRepository.findItemByInspectionAndPoint.mockResolvedValue(foundItemMock);
      mockFileSystemService.fileExists.mockResolvedValue(false);
      mockInspectionRepository.addEvidenceToItem.mockResolvedValue({} as ItemEvidence);

      // Act
      await useCase.execute(inspectionId, pointNumber, mockFile);

      // Assert
      const expectedDirPath = path.join('uploads', `${inspectionId}`, `${pointNumber}-PAREDE_FRONTAL`);
      const expectedFinalPath = path.join(expectedDirPath, 'test-image.jpg');

      expect(fileSystem.createDirectoryIfNotExists).toHaveBeenCalledWith(expectedDirPath);
      expect(fileSystem.moveFile).toHaveBeenCalledWith(mockFile.path, expectedFinalPath);
      expect(repository.addEvidenceToItem).toHaveBeenCalledWith(expect.objectContaining({
        filePath: expectedFinalPath,
        fileName: mockFile.originalname,
      }));
    });

    it('deve renomear o arquivo se um com o mesmo nome já existir no destino', async () => {
      // Arrange
      mockInspectionRepository.findItemByInspectionAndPoint.mockResolvedValue(foundItemMock);
      mockFileSystemService.fileExists
        .mockResolvedValueOnce(true)  // test-image.jpg existe
        .mockResolvedValueOnce(true)  // test-image(1).jpg existe
        .mockResolvedValueOnce(false); // test-image(2).jpg NÃO existe

      mockInspectionRepository.addEvidenceToItem.mockResolvedValue({} as ItemEvidence);

      // Act
      await useCase.execute(inspectionId, pointNumber, mockFile);

      // Assert
      const expectedDirPath = path.join('uploads', `${inspectionId}`, `${pointNumber}-PAREDE_FRONTAL`);
      const expectedRenamedPath = path.join(expectedDirPath, 'test-image(2).jpg');

      expect(fileSystem.moveFile).toHaveBeenCalledWith(mockFile.path, expectedRenamedPath);
      expect(repository.addEvidenceToItem).toHaveBeenCalledWith(expect.objectContaining({
        filePath: expectedRenamedPath,
        fileName: 'test-image(2).jpg',
      }));
    });

    it('deve lançar NotFoundException se o item de checklist não for encontrado', async () => {
      // Arrange
      mockInspectionRepository.findItemByInspectionAndPoint.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(inspectionId, 99, mockFile)).rejects.toThrow(NotFoundException);
      expect(fileSystem.createDirectoryIfNotExists).not.toHaveBeenCalled();
      expect(repository.addEvidenceToItem).not.toHaveBeenCalled();
    });
  });
});
