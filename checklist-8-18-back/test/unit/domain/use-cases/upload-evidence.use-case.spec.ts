import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { UploadEvidenceUseCase } from '@domain/use-cases/upload-evidence.use-case';
import { UploadEvidenceUseCaseImpl } from '@domain/use-cases/impl/upload-evidence.use-case.impl';
import { InspectionRepositoryPort } from '@domain/repositories/inspection.repository.port';
import { FileSystemPort } from '@domain/ports/file-system.port';
import { NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { ItemEvidenceEntity } from '@infra/typeorm/entities/item-evidence.entity';

jest.mock('fs/promises', () => ({
  unlink: jest.fn(),
}));

describe('UploadEvidenceUseCaseImpl', () => {
  let useCase: UploadEvidenceUseCase;
  let mockInspectionRepository: jest.Mocked<InspectionRepositoryPort>;
  let mockFileSystem: jest.Mocked<FileSystemPort>;
  let mockQueryRunner: any;

  beforeEach(async () => {
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        getRepository: jest.fn().mockReturnValue({
          save: jest.fn(),
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadEvidenceUseCaseImpl,
        {
          provide: InspectionRepositoryPort,
          useValue: { findItemByInspectionAndPoint: jest.fn() },
        },
        {
          provide: FileSystemPort,
          useValue: {
            createDirectoryIfNotExists: jest.fn(),
            fileExists: jest.fn(),
            moveFile: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: { createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner) },
        },
      ],
    }).compile();

    useCase = module.get<UploadEvidenceUseCaseImpl>(UploadEvidenceUseCaseImpl);
    mockInspectionRepository = module.get(InspectionRepositoryPort);
    mockFileSystem = module.get(FileSystemPort);
    jest.clearAllMocks();
  });

  const mockFile: Express.Multer.File = { originalname: 'test.png', path: '/tmp/test.png' } as any;
  const mockItem = { id: 10, masterPoint: { name: 'PONTO_TESTE' } };

  it('deve commitar a transação em caso de sucesso', async () => {
    mockInspectionRepository.findItemByInspectionAndPoint.mockResolvedValue(mockItem as any);
    mockFileSystem.fileExists.mockResolvedValue(false);
    (mockFileSystem.moveFile as jest.Mock).mockImplementation(() => {
      // Simula que após o 'move', o ficheiro existe no novo local
      mockFileSystem.fileExists.mockResolvedValue(true);
    });
    mockQueryRunner.manager.getRepository().save.mockResolvedValue({ id: 1 });

    await useCase.execute(1, 1, mockFile);

    expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
    expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
  });

  it('deve fazer rollback se a movimentação do ficheiro falhar', async () => {
    const moveError = new Error('Disk full');
    mockInspectionRepository.findItemByInspectionAndPoint.mockResolvedValue(mockItem as any);
    mockFileSystem.moveFile.mockRejectedValue(moveError);
      
    await expect(useCase.execute(1, 1, mockFile)).rejects.toThrow(moveError);

    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
  });
});