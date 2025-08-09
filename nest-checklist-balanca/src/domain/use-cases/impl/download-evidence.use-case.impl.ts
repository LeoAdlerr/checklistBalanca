import { Inject, Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { DownloadEvidenceUseCase, DownloadedEvidence } from '@domain/use-cases/download-evidence.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { FileSystemPort } from '../../ports/file-system.port';
import * as path from 'path';

@Injectable()
export class DownloadEvidenceUseCaseImpl implements DownloadEvidenceUseCase {
  private readonly logger = new Logger(DownloadEvidenceUseCaseImpl.name);

  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(FileSystemPort)
    private readonly fileSystem: FileSystemPort,
  ) {}

  async execute(
    inspectionId: number,
    pointNumber: number,
    fileName: string,
  ): Promise<DownloadedEvidence> {
    this.logger.log(`Iniciando busca por evidência: ${fileName} para inspeção ${inspectionId}, ponto ${pointNumber}`);

    // 1. Encontra o registro da evidência no banco de dados
    const evidence = await this.inspectionRepository.findEvidenceByFileName(
      inspectionId,
      pointNumber,
      fileName,
    );

    if (!evidence) {
      throw new NotFoundException(`Evidência com nome "${fileName}" não encontrada para o ponto ${pointNumber} da inspeção ${inspectionId}.`);
    }

    // 2. Constrói o caminho absoluto para o arquivo no servidor
    const absolutePath = path.join(process.cwd(), evidence.filePath);

    // 3. Verifica se o arquivo físico realmente existe
    if (!(await this.fileSystem.fileExists(absolutePath))) {
      this.logger.error(`Arquivo de evidência não encontrado no disco: ${absolutePath}, embora exista no banco de dados.`);
      throw new InternalServerErrorException('Arquivo de evidência corrompido ou ausente.');
    }
    
    // 4. Lê o arquivo do disco
    const buffer = await this.fileSystem.readFile(absolutePath);

    this.logger.log(`Evidência encontrada e lida com sucesso: ${absolutePath}`);
    
    // 5. Retorna os dados necessários para o Controller
    return {
      buffer,
      mimeType: evidence.mimeType,
      fileName: evidence.fileName,
    };
  }
}