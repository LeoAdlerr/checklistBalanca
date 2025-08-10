import { Inject, Injectable } from '@nestjs/common';
import { FindAllInspectionsUseCase } from '../find-all-inspections.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { Inspection } from '../../models/inspection.model';

@Injectable()
export class FindAllInspectionsUseCaseImpl implements FindAllInspectionsUseCase {
  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
  ) {}

  async execute(): Promise<Inspection[]> {
    return this.inspectionRepository.findAll();
  }
}
