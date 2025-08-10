import { CreateInspectionDto } from '../../api/dtos/create-inspection.dto';
import { Inspection } from '../models/inspection.model';

export abstract class CheckForExistingInspectionUseCase {
  /**
   * Procura por uma inspeção em andamento que corresponda aos dados fornecidos.
   * @param dto Os dados da nova inspeção a ser verificada.
   * @returns A inspeção existente se encontrada, caso contrário, nulo.
   */
  abstract execute(dto: CreateInspectionDto): Promise<Inspection | null>;
}