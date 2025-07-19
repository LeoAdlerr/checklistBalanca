import { Inject, Injectable } from '@nestjs/common';
import { CreateInspectionUseCase } from '../create-inspection.use-case';
import { Inspection } from '../../models/inspection.model';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { CreateInspectionDto } from '../../../api/dtos/create-inspection.dto';
import { MasterInspectionPointRepositoryPort } from '../../repositories/master-inspection-point.repository.port';
import { InspectionChecklistItem } from '../../models/inspection-checklist-item.model';

@Injectable()
export class CreateInspectionUseCaseImpl implements CreateInspectionUseCase {
  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(MasterInspectionPointRepositoryPort)
    private readonly masterPointRepository: MasterInspectionPointRepositoryPort,
  ) {}

  async execute(dto: CreateInspectionDto): Promise<Inspection> {
    const masterPoints = await this.masterPointRepository.findAll();

    const checklistItems: Partial<InspectionChecklistItem>[] = masterPoints.map(point => ({
      masterPointId: point.id,
      statusId: 1,
      observations: undefined,
    }));

    const newInspectionData: Partial<Inspection> = {
      ...dto,
      statusId: 1,
      startDatetime: new Date(),
      items: checklistItems as InspectionChecklistItem[],
    };

    return this.inspectionRepository.create(newInspectionData);
  }
}
