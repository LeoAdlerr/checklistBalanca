import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { FileSystemPort } from 'src/domain/ports/file-system.port';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';

@Injectable()
export class FileSystemService implements FileSystemPort {
  private readonly logger = new Logger(FileSystemService.name);

  async createDirectoryIfNotExists(dirPath: string): Promise<void> {
    try {
      const resolvedPath = path.resolve(dirPath);
      this.logger.log(`Garantindo que o diretório exista: ${resolvedPath}`);
      await fs.mkdir(resolvedPath, { recursive: true });
    } catch (error) {
      if ((error as any).code !== 'EEXIST') {
        this.logger.error(`Falha ao criar diretório ${dirPath}`, error.stack);
        throw new InternalServerErrorException(`Falha ao criar diretório: ${error.message}`);
      }
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async moveFile(oldPath: string, newPath: string): Promise<void> {
    this.logger.log(`Tentando mover de '${oldPath}' para '${newPath}'`);

    if (!oldPath || !newPath) {
      throw new InternalServerErrorException('Caminho de origem ou destino inválido para moveFile.');
    }

    try {
      const destinationDir = path.dirname(newPath);
      await this.createDirectoryIfNotExists(destinationDir);
      await fs.rename(oldPath, newPath);

      const newFileExists = await this.fileExists(newPath);
      const oldFileExists = await this.fileExists(oldPath);

      if (newFileExists && !oldFileExists) {
        this.logger.log(`SUCESSO: Arquivo movido e verificado em '${newPath}'`);
      } else {
        this.logger.error(`FALHA PÓS-MOVIMENTAÇÃO: Status -> Novo arquivo existe: ${newFileExists}, Arquivo antigo existe: ${oldFileExists}`);
        throw new InternalServerErrorException('Ocorreu uma falha inesperada ao mover o ficheiro.');
      }
    } catch (error) {
      this.logger.error(`Erro ao mover ficheiro de ${oldPath} para ${newPath}`, error.stack);
      throw new InternalServerErrorException(`Erro no sistema de ficheiros: ${error.message}`);
    }
  }

  async ensureTempUploadDir(): Promise<void> {
    const tempDir = path.join(process.cwd(), 'uploads', 'tmp');
    await this.createDirectoryIfNotExists(tempDir);
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const resolvedPath = path.resolve(filePath);
      if (await this.fileExists(resolvedPath)) {
        this.logger.log(`Apagando ficheiro: ${resolvedPath}`);
        await fs.unlink(resolvedPath);
      } else {
        this.logger.warn(`Tentativa de apagar ficheiro inexistente: ${resolvedPath}`);
      }
    } catch (error) {
      this.logger.error(`Falha ao apagar ficheiro ${filePath}`, error.stack);
      throw new InternalServerErrorException(`Falha ao apagar ficheiro: ${error.message}`);
    }
  }

  async deleteDirectory(dirPath: string): Promise<void> {
    try {
      const resolvedPath = path.resolve(dirPath);
      // Usa o 'fsSync' importado para a chamada síncrona
      if (fsSync.existsSync(resolvedPath)) {
        this.logger.log(`Apagando diretório e todo o seu conteúdo: ${resolvedPath}`);
        await fs.rm(resolvedPath, { recursive: true, force: true });
      } else {
        this.logger.warn(`Tentativa de apagar diretório inexistente: ${resolvedPath}`);
      }
    } catch (error) {
      this.logger.error(`Falha ao apagar diretório ${dirPath}`, error.stack);
      throw new InternalServerErrorException(`Falha ao apagar diretório: ${error.message}`);
    }
  }

  async readFile(filePath: string): Promise<Buffer> {
    try {
      const resolvedPath = path.resolve(filePath);
      this.logger.log(`Lendo arquivo de: ${resolvedPath}`);
      return await fs.readFile(resolvedPath);
    } catch (error) {
      this.logger.error(`Falha ao ler o arquivo ${filePath}`, error.stack);
      // Lançamos um erro específico que o UseCase poderá tratar
      throw new InternalServerErrorException(`Falha ao ler o arquivo: ${error.message}`);
    }
  }
}