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
    // 1. Sua validação robusta (permanece intacta)
    const initialInspection = await this.inspectionRepository.findById(id);
    if (!initialInspection) {
      throw new NotFoundException(`Inspeção com o ID "${id}" não foi encontrada.`);
    }
    if (initialInspection.statusId !== 1) { // 1 = EM_INSPECAO
      throw new ForbiddenException(
        'Apenas inspeções com o status "EM INSPEÇÃO" podem ser editadas.',
      );
    }

    // 2. Desestruturamos o DTO: separamos a data (string) do resto.
    const { sealVerificationDate, ...restOfDto } = dto;

    // 3. O 'restOfDto' agora é seguro para ser atribuído a Partial<Inspection>.
    const updatePayload: Partial<Inspection> = { ...restOfDto };
    
    // 4. Se a data string existir, nós a convertemos e adicionamos ao payload.
    if (sealVerificationDate) {
      updatePayload.sealVerificationDate = new Date(sealVerificationDate);
    }

    // 5. Executa a atualização usando o payload corrigido
    if (Object.keys(dto).length > 0) {
      await this.inspectionRepository.update(id, updatePayload);
    }
    
    // 6. lógica final de retorno
    const updatedInspection = await this.inspectionRepository.findById(id);
    if (!updatedInspection) {
      throw new InternalServerErrorException(`A inspeção com ID "${id}" foi removida durante a atualização.`);
    }

    return updatedInspection;
  }
}