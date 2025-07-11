import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InspectionRepositoryPort } from '../repositories/inspection.repository.port';
import { Inspection } from '../models/inspection.model';

// Constantes para os IDs de status
const STATUS_EM_INSPECAO = 1;
const STATUS_APROVADO = 2;
const STATUS_REPROVADO = 3;
const STATUS_NAO_CONFORME = 3;

@Injectable()
export class FinalizeInspectionUseCase {
  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
  ) {}

  async execute(inspectionId: number): Promise<Inspection> {
    const inspection = await this.inspectionRepository.findByIdWithItems(
      inspectionId,
    );

    if (!inspection) {
      throw new NotFoundException(
        `Inspeção com ID ${inspectionId} não encontrada.`,
      );
    }

    const hasPendingItems = inspection.items.some(
      (item) => item.statusId === STATUS_EM_INSPECAO,
    );
    if (hasPendingItems) {
      throw new BadRequestException(
        'Não é possível finalizar a inspeção pois existem itens pendentes.',
      );
    }

    const hasNonConformantItems = inspection.items.some(
      (item) => item.statusId === STATUS_NAO_CONFORME,
    );

    const finalStatusId = hasNonConformantItems
      ? STATUS_REPROVADO
      : STATUS_APROVADO;

    await this.inspectionRepository.update(inspectionId, {
      statusId: finalStatusId,
      endDatetime: new Date(),
    });

    const updatedInspection = await this.inspectionRepository.findByIdWithDetails(
      inspectionId,
    );
    if (!updatedInspection) {
      // Este erro não deve acontecer em um fluxo normal
      throw new NotFoundException(
        `Falha ao buscar a inspeção com ID ${inspectionId} após a finalização.`,
      );
    }

    return updatedInspection;
  }
}