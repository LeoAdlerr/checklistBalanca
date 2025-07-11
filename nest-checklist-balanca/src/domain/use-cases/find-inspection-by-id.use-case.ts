import { Injectable, NotFoundException } from '@nestjs/common';
import { Inspection } from '../models/inspection.model';
import { InspectionRepositoryPort } from '../repositories/inspection.repository.port';

@Injectable()
export class FindInspectionByIdUseCase {
  constructor(
    // A injeção de dependência do repositório é fundamental
    private readonly inspectionRepository: InspectionRepositoryPort,
  ) {}

  async execute(id: number): Promise<Inspection> {
    const inspection = await this.inspectionRepository.findById(id);

    if (!inspection) {
      // Lançar uma exceção clara se a inspeção não for encontrada
      throw new NotFoundException(`Inspeção com o ID "${id}" não foi encontrada.`);
    }

    return inspection;
  }
}