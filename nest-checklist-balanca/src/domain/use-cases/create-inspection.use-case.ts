import { Inject, Injectable } from '@nestjs/common';
import { Inspection } from '../models/inspection.model';
import { InspectionRepositoryPort } from '../repositories/inspection.repository.port';
import { CreateInspectionDto } from '../../api/dtos/create-inspection.dto';
import { MasterInspectionPointRepositoryPort } from '../repositories/master-inspection-point.repository.port';
import { InspectionChecklistItem } from '../models/inspection-checklist-item.model';

@Injectable()
export class CreateInspectionUseCase {
  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(MasterInspectionPointRepositoryPort)
    private readonly masterPointRepository: MasterInspectionPointRepositoryPort,
  ) {}

  async execute(dto: CreateInspectionDto): Promise<Inspection> {
    // 1. Busca todos os 18 pontos de inspeção mestre.
    const masterPoints = await this.masterPointRepository.findAll();

    // 2. Cria a lista de 18 itens de checklist.
    const checklistItems: Partial<InspectionChecklistItem>[] = masterPoints.map(point => {
      return {
        masterPointId: point.id,
        statusId: 1, // Status: EM_INSPECAO
        observations: undefined,
      };
    });

    // 3. Monta o objeto da nova inspeção.
    const newInspectionData: Partial<Inspection> = {
      ...dto,
      statusId: 1, // Status: EM_INSPECAO
      startDatetime: new Date(),
      items: checklistItems as InspectionChecklistItem[],
    };

    // 4. Chama o repositório para persistir a nova inspeção e retorna o resultado.
    return this.inspectionRepository.create(newInspectionData);
  }
}