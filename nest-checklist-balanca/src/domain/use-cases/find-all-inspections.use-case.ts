import { Inject, Injectable } from '@nestjs/common';
import { InspectionRepositoryPort } from '../repositories/inspection.repository.port';
import { Inspection } from '../models/inspection.model';

@Injectable()
export class FindAllInspectionsUseCase {
  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
  ) {}

  async execute(): Promise<Inspection[]> {
    // Esta implementação simples já faz todos os nossos testes passarem.
    return this.inspectionRepository.findAll();
  }
}