import { Injectable, NotFoundException } from '@nestjs/common';
import { FindInspectionByIdUseCase } from '../find-inspection-by-id.use-case';
import { Inspection } from '../../models/inspection.model';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';

@Injectable()
export class FindInspectionByIdUseCaseImpl implements FindInspectionByIdUseCase {
  constructor(
    private readonly inspectionRepository: InspectionRepositoryPort,
  ) {}

  async execute(id: number): Promise<Inspection> {
    const inspection = await this.inspectionRepository.findById(id);

    if (!inspection) {
      throw new NotFoundException(`Inspeção com o ID "${id}" não foi encontrada.`);
    }

    return inspection;
  }
}