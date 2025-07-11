export abstract class FileSystemPort {
  abstract createDirectoryIfNotExists(path: string): Promise<void>;
  abstract fileExists(path: string): Promise<boolean>;
  abstract moveFile(oldPath: string, newPath: string): Promise<void>;
  abstract ensureTempUploadDir(): Promise<void>; // 👈 adiciona aqui
}
