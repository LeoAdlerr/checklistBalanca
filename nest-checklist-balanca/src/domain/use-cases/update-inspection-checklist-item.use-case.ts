import { UpdateInspectionChecklistItemDto } from '../../api/dtos/update-inspection-checklist-item.dto';
import { InspectionChecklistItem } from '../models/inspection-checklist-item.model';

export abstract class UpdateInspectionChecklistItemUseCase {
  abstract execute(
    inspectionId: number,
    pointNumber: number,
    dto: UpdateInspectionChecklistItemDto,
  ): Promise<InspectionChecklistItem>;
}