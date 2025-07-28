import { Inject, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DeleteEvidenceUseCase } from '../delete-evidence.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { FileSystemPort } from '../../ports/file-system.port';
import * as path from 'path';

@Injectable()
export class DeleteEvidenceUseCaseImpl implements DeleteEvidenceUseCase {
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
  ): Promise<void> {
    // 1. Encontra a evidência pelo seu contexto e nome
    const evidence = await this.inspectionRepository.findEvidenceByFileName(
      inspectionId,
      pointNumber,
      fileName,
    );
    if (!evidence) {
      throw new NotFoundException(`Evidência com nome "${fileName}" não encontrada para este ponto.`);
    }
    
    // 2. Constrói o caminho absoluto e apaga o ficheiro FÍSICO primeiro.
    const absolutePath = path.join(process.cwd(), evidence.filePath);

    try {
      await this.fileSystem.deleteFile(absolutePath);
    } catch (error) {
        // Se a remoção do ficheiro falhar, lançamos o erro e a operação para.
        // O registo no banco de dados permanece intacto.
        throw new InternalServerErrorException(`Falha ao apagar o ficheiro físico: ${error.message}`);
    }

    // 3. Somente se a remoção do ficheiro foi bem-sucedida, apaga o registo do banco.
    await this.inspectionRepository.deleteEvidence(evidence.id);
  }
}