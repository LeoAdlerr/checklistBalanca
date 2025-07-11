import { FileSystemService } from '@infra/file-system/file-system.service';
import { FileSystemPort } from '@domain/ports/file-system.port';


import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('FileSystemService', () => {
  let service: FileSystemPort; // Interface de porta
  let tmpDir: string;

  beforeEach(async () => {
    service = new FileSystemService();
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fs-test-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('deve criar um diretório se ele não existir', async () => {
    const newDir = path.join(tmpDir, 'new-folder');

    await service.createDirectoryIfNotExists(newDir);

    const stat = await fs.stat(newDir);
    expect(stat.isDirectory()).toBe(true);
  });

  it('não deve lançar erro se o diretório já existir', async () => {
    const existingDir = path.join(tmpDir, 'existing-folder');
    await fs.mkdir(existingDir);

    await expect(service.createDirectoryIfNotExists(existingDir)).resolves.not.toThrow();
  });

  it('deve verificar se um arquivo existe', async () => {
    const file = path.join(tmpDir, 'file.txt');
    await fs.writeFile(file, 'conteúdo');

    const exists = await service.fileExists(file);
    expect(exists).toBe(true);

    const notExists = await service.fileExists(path.join(tmpDir, 'missing.txt'));
    expect(notExists).toBe(false);
  });

  it('deve mover um arquivo de um caminho para outro', async () => {
    const oldPath = path.join(tmpDir, 'old.txt');
    const newPath = path.join(tmpDir, 'new.txt');

    await fs.writeFile(oldPath, 'hello');

    await service.moveFile(oldPath, newPath);

    const oldExists = await service.fileExists(oldPath);
    const newExists = await service.fileExists(newPath);

    expect(oldExists).toBe(false);
    expect(newExists).toBe(true);

    const content = await fs.readFile(newPath, 'utf-8');
    expect(content).toBe('hello');
  });

  it('deve garantir o diretório uploads/tmp', async () => {
    const uploadsTmp = path.join(tmpDir, 'uploads/tmp');

    // Sobrescreve o método createDirectoryIfNotExists para usar o tmpDir isolado
    const spy = jest.spyOn(service, 'createDirectoryIfNotExists').mockImplementation(async (_dirPath: string) => {
      await fs.mkdir(uploadsTmp, { recursive: true });
    });

    await expect(service.ensureTempUploadDir()).resolves.not.toThrow();

    const stat = await fs.stat(uploadsTmp);
    expect(stat.isDirectory()).toBe(true);

    spy.mockRestore();
  });
});
