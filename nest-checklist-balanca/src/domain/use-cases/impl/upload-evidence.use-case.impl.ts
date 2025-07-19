import { Inject, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { UploadEvidenceUseCase } from '@domain/use-cases/upload-evidence.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { FileSystemPort } from '../../ports/file-system.port';
import { ItemEvidence } from '../../models/item-evidence.model';
import * as path from 'path';

@Injectable()
export class UploadEvidenceUseCaseImpl implements UploadEvidenceUseCase {
  private readonly logger = new Logger(UploadEvidenceUseCase.name);

  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(FileSystemPort)
    private readonly fileSystem: FileSystemPort,
  ) {}

  async execute(
    inspectionId: number,
    pointNumber: number,
    file: Express.Multer.File,
  ): Promise<ItemEvidence> {
    this.logger.log(`Iniciando upload da evidência para inspeçãoId=${inspectionId}, ponto=${pointNumber}`);
    this.logger.log(`Arquivo recebido: originalname=${file.originalname}, path temporário=${file.path}`);

    const item = await this.inspectionRepository.findItemByInspectionAndPoint(
      inspectionId,
      pointNumber,
    );

    if (!item) {
      const msg = `Item do ponto ${pointNumber} para a inspeção ${inspectionId} não encontrado.`;
      this.logger.error(msg);
      throw new NotFoundException(msg);
    }

    if (!item.masterPoint) {
      const msg = `Nome do Ponto de inspeção ${pointNumber} não encontrado.`;
      this.logger.error(msg);
      throw new NotFoundException(msg);
    }

    const pointNameSanitized = item.masterPoint.name.replace(/[^a-zA-Z0-9]/g, '_');
    const targetDirectory = path.join(
      'uploads',
      String(inspectionId),
      `${pointNumber}-${pointNameSanitized}`,
    );
    this.logger.log(`Diretório alvo para salvar evidência: ${targetDirectory}`);

    await this.fileSystem.createDirectoryIfNotExists(targetDirectory);
    this.logger.log(`Diretório garantido: ${targetDirectory}`);

    const originalName = path.parse(file.originalname).name;
    const extension = path.parse(file.originalname).ext;

    let finalFileName = file.originalname;
    let finalPath = path.join(targetDirectory, finalFileName);
    let counter = 1;

    while (await this.fileSystem.fileExists(finalPath)) {
      finalFileName = `${originalName}(${counter})${extension}`;
      finalPath = path.join(targetDirectory, finalFileName);
      this.logger.log(`Arquivo já existe. Tentando novo nome: ${finalFileName}`);
      counter++;
    }

    this.logger.log(`Movendo arquivo do path temporário '${file.path}' para '${finalPath}'`);
    await this.fileSystem.moveFile(file.path, finalPath);
    this.logger.log(`Arquivo movido com sucesso.`);

    const evidenceData: Partial<ItemEvidence> = {
      itemId: item.id,
      filePath: finalPath,
      fileName: finalFileName,
      fileSize: file.size,
      mimeType: file.mimetype,
    };

    this.logger.log(`Adicionando evidência no repositório: ${JSON.stringify(evidenceData)}`);
    const result = await this.inspectionRepository.addEvidenceToItem(evidenceData);
    this.logger.log(`Evidência adicionada com sucesso com id: ${result.id}`);

    return result;
  }
}