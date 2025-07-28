import { Test, TestingModule } from '@nestjs/testing';
import { FileSystemService } from '@infra/file-system/file-system.service';
import { FileSystemPort } from '@domain/ports/file-system.port';
import * as fs from 'fs/promises';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fsSync from 'fs';

// Mock completo do módulo 'fs/promises' com os novos métodos
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  access: jest.fn(),
  rename: jest.fn(),
  unlink: jest.fn(), // Mock para apagar ficheiros
  rm: jest.fn(),     // Mock para apagar diretórios
}));

// Mock síncrono para a verificação de existência no deleteDirectory
jest.mock('fs', () => ({
  ...jest.requireActual('fs'), // Mantém os outros métodos reais se necessário
  existsSync: jest.fn(),
}));

describe('FileSystemService', () => {
  let service: FileSystemPort;
  const mockedFs = fs as jest.Mocked<typeof fs>;
  const mockedFsSync = fsSync as jest.Mocked<typeof fsSync>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: FileSystemPort, useClass: FileSystemService },
        Logger,
      ],
    }).compile();

    service = module.get<FileSystemPort>(FileSystemPort);
    jest.clearAllMocks();
  });

  describe('createDirectoryIfNotExists', () => {
    it('deve chamar fs.mkdir com o caminho resolvido para absoluto', async () => {
      const dirPath = 'some/relative/path';
      await service.createDirectoryIfNotExists(dirPath);

      // A asserção usa path.resolve para ser compatível com Windows e Linux
      expect(mockedFs.mkdir).toHaveBeenCalledWith(path.resolve(dirPath), { recursive: true });
    });
  });

  describe('moveFile', () => {
    const oldPath = '/tmp/old.txt';
    const newPath = '/tmp/new/new.txt';

    it('deve chamar createDirectory e rename com sucesso', async () => {
      // Arrange
      // Simula que a criação do diretório e a renomeação funcionam
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.rename.mockResolvedValue(undefined);

      // Simula o resultado da verificação interna: o novo ficheiro existe, o antigo não.
      mockedFs.access.mockImplementation(async (p) => {
        if (p === newPath) return; // Sucesso para o novo caminho
        throw new Error('File not found'); // Erro para o caminho antigo
      });

      // Act
      await service.moveFile(oldPath, newPath);

      // Assert
      const expectedDir = path.dirname(newPath);
      // A asserção usa path.resolve, assim como a implementação
      expect(mockedFs.mkdir).toHaveBeenCalledWith(path.resolve(expectedDir), { recursive: true });
      expect(mockedFs.rename).toHaveBeenCalledWith(oldPath, newPath);
    });

    it('deve lançar um erro se a verificação pós-movimentação falhar', async () => {
      // Arrange
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.rename.mockResolvedValue(undefined);

      // Simula o cenário de falha: mesmo após o rename, o ficheiro não é encontrado no novo local
      mockedFs.access.mockImplementation(async () => {
        throw new Error('File not found');
      });

      // Act & Assert
      await expect(service.moveFile(oldPath, newPath)).rejects.toThrow('Ocorreu uma falha inesperada ao mover o ficheiro.');
    });
  });

  describe('deleteFile', () => {
    it('deve chamar fs.unlink se o ficheiro existir', async () => {
      const filePath = '/path/to/file.txt';
      // Simula que o ficheiro existe
      jest.spyOn(service, 'fileExists').mockResolvedValueOnce(true);
      mockedFs.unlink.mockResolvedValueOnce(undefined);

      await service.deleteFile(filePath);

      expect(mockedFs.unlink).toHaveBeenCalledWith(path.resolve(filePath));
    });

    it('NÃO deve chamar fs.unlink se o ficheiro não existir', async () => {
      const filePath = '/path/to/nonexistent-file.txt';
      // Simula que o ficheiro não existe
      jest.spyOn(service, 'fileExists').mockResolvedValueOnce(false);

      // A execução deve completar sem erros
      await expect(service.deleteFile(filePath)).resolves.toBeUndefined();

      expect(mockedFs.unlink).not.toHaveBeenCalled();
    });

    it('deve lançar InternalServerErrorException se fs.unlink falhar', async () => {
      const filePath = '/path/to/protected-file.txt';
      const fileError = new Error('Permission denied');
      jest.spyOn(service, 'fileExists').mockResolvedValueOnce(true);
      mockedFs.unlink.mockRejectedValueOnce(fileError);

      await expect(service.deleteFile(filePath)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deleteDirectory', () => {
    it('deve chamar fs.rm com as opções corretas se o diretório existir', async () => {
      const dirPath = '/path/to/directory';
      mockedFsSync.existsSync.mockReturnValueOnce(true);
      mockedFs.rm.mockResolvedValueOnce(undefined);

      await service.deleteDirectory(dirPath);

      expect(mockedFs.rm).toHaveBeenCalledWith(path.resolve(dirPath), { recursive: true, force: true });
    });

    it('NÃO deve chamar fs.rm se o diretório não existir', async () => {
      const dirPath = '/path/to/nonexistent-directory';
      mockedFsSync.existsSync.mockReturnValueOnce(false);

      await expect(service.deleteDirectory(dirPath)).resolves.toBeUndefined();

      expect(mockedFs.rm).not.toHaveBeenCalled();
    });

    it('deve lançar InternalServerErrorException se fs.rm falhar', async () => {
      const dirPath = '/path/to/protected-directory';
      const dirError = new Error('Operation not permitted');
      mockedFsSync.existsSync.mockReturnValueOnce(true);
      mockedFs.rm.mockRejectedValueOnce(dirError);

      await expect(service.deleteDirectory(dirPath)).rejects.toThrow(InternalServerErrorException);
    });
  });
});