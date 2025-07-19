import { Inject, Injectable } from '@nestjs/common';
import { CheckForExistingInspectionUseCase } from '../check-for-existing-inspection.use-case';
import { Inspection } from '../../models/inspection.model';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { CreateInspectionDto } from '../../../api/dtos/create-inspection.dto';

@Injectable()
export class CheckForExistingInspectionUseCaseImpl implements CheckForExistingInspectionUseCase {
  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
  ) {}

  async execute(dto: CreateInspectionDto): Promise<Inspection | null> {
    // A lógica é simplesmente chamar o método que já criamos no repositório.
    return this.inspectionRepository.findExistingInspection(dto);
  }
}