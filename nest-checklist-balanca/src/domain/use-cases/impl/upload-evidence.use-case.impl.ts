import { Inject, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { UploadEvidenceUseCase } from '@domain/use-cases/upload-evidence.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { FileSystemPort } from '../../ports/file-system.port';
import { ItemEvidence } from '../../models/item-evidence.model';
import { DataSource } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs/promises'; 
import { ItemEvidenceEntity } from '@infra/typeorm/entities/item-evidence.entity';

@Injectable()
export class UploadEvidenceUseCaseImpl implements UploadEvidenceUseCase {
  private readonly logger = new Logger(UploadEvidenceUseCaseImpl.name);

  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(FileSystemPort)
    private readonly fileSystem: FileSystemPort,
    private readonly dataSource: DataSource, 
  ) {}

  async execute(
    inspectionId: number,
    pointNumber: number,
    file: Express.Multer.File,
  ): Promise<ItemEvidence> {
    this.logger.log(`Iniciando transação de upload para inspeção ${inspectionId}, ponto ${pointNumber}`);
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // A variável é declarada aqui, mas só será usada dentro do try/catch/finally
    let absoluteFinalPath: string | undefined;

    try {
      const item = await this.inspectionRepository.findItemByInspectionAndPoint(inspectionId, pointNumber);
      if (!item || !item.masterPoint) {
        throw new NotFoundException(`Ponto de inspeção ${pointNumber} para a inspeção ${inspectionId} não encontrado.`);
      }

      const pointNameSanitized = item.masterPoint.name.replace(/[^a-zA-Z0-9]/g, '_');
      const relativeDirectory = path.join('uploads', String(inspectionId), `${pointNumber}-${pointNameSanitized}`);
      const absoluteTargetDirectory = path.join(process.cwd(), relativeDirectory);
      
      await this.fileSystem.createDirectoryIfNotExists(absoluteTargetDirectory);

      const originalName = path.parse(file.originalname).name;
      const extension = path.parse(file.originalname).ext;
      let finalFileName = file.originalname;
      absoluteFinalPath = path.join(absoluteTargetDirectory, finalFileName); // Atribuição acontece aqui
      let counter = 1;

      while (await this.fileSystem.fileExists(absoluteFinalPath)) {
        finalFileName = `${originalName}(${counter})${extension}`;
        absoluteFinalPath = path.join(absoluteTargetDirectory, finalFileName);
        counter++;
      }
      
      this.logger.log(`Movendo de '${file.path}' para '${absoluteFinalPath}'`);
      await this.fileSystem.moveFile(file.path, absoluteFinalPath);
      
      const fileMovedSuccessfully = await this.fileSystem.fileExists(absoluteFinalPath);
      if (!fileMovedSuccessfully) {
        throw new Error('Falha ao verificar a existência do ficheiro após movê-lo.');
      }
      this.logger.log(`VERIFICADO: Arquivo existe em '${absoluteFinalPath}'`);
      
      const evidenceData: Partial<ItemEvidence> = {
        itemId: item.id,
        filePath: path.join(relativeDirectory, finalFileName).replace(/\\/g, '/'),
        fileName: finalFileName,
        fileSize: file.size,
        mimeType: file.mimetype,
      };
      
      const evidenceRepository = queryRunner.manager.getRepository(ItemEvidenceEntity);
      const result = await evidenceRepository.save(evidenceData);
      
      await queryRunner.commitTransaction();
      this.logger.log(`Transação commitada com sucesso. Upload finalizado.`);
      
      return result;

    } catch (error) {
      this.logger.error(`Erro durante a transação de upload: ${error.message}. Iniciando rollback.`);
      await queryRunner.rollbackTransaction();
      this.logger.warn('Rollback do banco de dados concluído.');

      if (absoluteFinalPath && await this.fileSystem.fileExists(absoluteFinalPath)) {
        this.logger.warn(`Tentando remover ficheiro órfão em ${absoluteFinalPath}`);
        await fs.unlink(absoluteFinalPath).catch(e => this.logger.error(`Falha ao remover ficheiro órfão: ${e.message}`));
      }
      
      throw error;

    } finally {
      await queryRunner.release();
    }
  }
}

