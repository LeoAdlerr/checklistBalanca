import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { UpdateInspectionChecklistItemDto } from '../../../api/dtos/update-inspection-checklist-item.dto';
import { InspectionChecklistItem } from '../../models/inspection-checklist-item.model';
import { UpdateInspectionChecklistItemUseCase } from '../update-inspection-checklist-item.use-case';

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

    return updatedItem;
  }
}