import { Injectable } from '@nestjs/common';
import { FileSystemPort } from 'src/domain/ports/file-system.port';
import * as fs from 'fs/promises';

@Injectable()
export class FileSystemService implements FileSystemPort {
  async createDirectoryIfNotExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if ((error as any).code !== 'EEXIST') {
        throw error;
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

  async moveFile(
    oldPath: string,
    newPath: string,
  ): Promise<void> {
    await fs.rename(oldPath, newPath);
  }

  async ensureTempUploadDir(): Promise<void> {
    await this.createDirectoryIfNotExists('uploads/tmp');
  }
}
