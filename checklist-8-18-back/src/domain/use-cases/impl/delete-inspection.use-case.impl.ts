import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeleteInspectionUseCase } from '../delete-inspection.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { FileSystemPort } from '../../ports/file-system.port';
import * as path from 'path';

@Injectable()
export class DeleteInspectionUseCaseImpl implements DeleteInspectionUseCase {
  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(FileSystemPort)
    private readonly fileSystem: FileSystemPort,
  ) {}

  async execute(id: number): Promise<void> {
    // 1. Busca a inspeção para validar as regras de negócio.
    const inspection = await this.inspectionRepository.findById(id);

    // 2. Regra 1: A inspeção deve existir (satisfaz o teste de NotFound).
    if (!inspection) {
      throw new NotFoundException(`Inspeção com o ID "${id}" não foi encontrada.`);
    }

    // 3. Regra 2: A inspeção deve estar "EM INSPEÇÃO" (satisfaz o teste de Forbidden).
    // Assumindo que o status 1 é "EM_INSPECAO".
    if (inspection.statusId !== 1) {
      throw new ForbiddenException(
        'Apenas inspeções com o status "EM INSPEÇÃO" podem ser apagadas.',
      );
    }

    // 4. Se as regras passarem, orquestra a exclusão (satisfaz o teste de sucesso).
    // Primeiro, apaga o registro do banco de dados.
    await this.inspectionRepository.delete(id);

    // Depois, apaga o diretório de uploads correspondente.
    const dirToDelete = path.join(process.cwd(), 'uploads', String(id));
    await this.fileSystem.deleteDirectory(dirToDelete);
  }
}