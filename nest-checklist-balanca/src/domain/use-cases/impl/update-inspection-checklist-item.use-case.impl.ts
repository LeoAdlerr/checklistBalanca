import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { UpdateInspectionChecklistItemDto } from '../../../api/dtos/update-inspection-checklist-item.dto';
import { InspectionChecklistItem } from '../../models/inspection-checklist-item.model';
import { UpdateInspectionChecklistItemUseCase } from '../update-inspection-checklist-item.use-case';

const STATUS_EM_INSPECAO = 1;
const STATUS_N_A = 4;

@Injectable()
export class UpdateInspectionChecklistItemUseCaseImpl extends UpdateInspectionChecklistItemUseCase {
  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
  ) {
    super();
  }

  async execute(
    inspectionId: number,
    pointNumber: number,
    dto: UpdateInspectionChecklistItemDto,
  ): Promise<InspectionChecklistItem> {
    const updatedItem = await this.inspectionRepository.updateItemByPoint(
      inspectionId,
      pointNumber,
      dto,
    );

    if (!updatedItem) {
      throw new NotFoundException(
        `Item do ponto ${pointNumber} para a inspeção ${inspectionId} não encontrado.`,
      );
    }

    // Busca inspeção com todos os itens
    const inspection = await this.inspectionRepository.findByIdWithItems(inspectionId);

    if (!inspection) {
      throw new NotFoundException(`Inspeção ${inspectionId} não encontrada.`);
    }

    // Se existir pelo menos 1 item com status N/A, volta para "EM_INSPEÇÃO"
    const hasNaItem = inspection.items.some(item => item.statusId === STATUS_N_A);
    if (hasNaItem && inspection.statusId !== STATUS_EM_INSPECAO) {
      await this.inspectionRepository.update(inspectionId, {
        statusId: STATUS_EM_INSPECAO
      });
    }

    return updatedItem;
  }
}
