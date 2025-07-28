import { Inject, Injectable, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { UpdateInspectionUseCase } from '../update-inspection.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { UpdateInspectionDto } from 'src/api/dtos/update-inspection.dto';
import { Inspection } from '@domain/models/inspection.model';

@Injectable()
export class UpdateInspectionUseCaseImpl implements UpdateInspectionUseCase {
  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
  ) {}

  async execute(id: number, dto: UpdateInspectionDto): Promise<Inspection> {
    // 1. Busca e valida a inspeção inicial.
    const initialInspection = await this.inspectionRepository.findById(id);
    if (!initialInspection) {
      throw new NotFoundException(`Inspeção com o ID "${id}" não foi encontrada.`);
    }
    if (initialInspection.statusId !== 1) { // 1 = EM_INSPECAO
      throw new ForbiddenException(
        'Apenas inspeções com o status "EM INSPEÇÃO" podem ser editadas.',
      );
    }

    // 2. Executa a atualização se o DTO não estiver vazio.
    if (Object.keys(dto).length > 0) {
      await this.inspectionRepository.update(id, dto);
    }
    
    // 3. Busca o estado final e atualizado da inspeção.
    const updatedInspection = await this.inspectionRepository.findById(id);

    // 4. A sua verificação crucial, garantindo que o tipo de retorno seja seguro.
    if (!updatedInspection) {
      // Este é um caso de borda muito raro (a inspeção foi apagada por outro processo
      // entre o update e esta busca), mas esta verificação torna o código à prova de falhas.
      throw new InternalServerErrorException(`A inspeção com ID "${id}" foi removida durante a atualização.`);
    }

    return updatedInspection;
  }
}