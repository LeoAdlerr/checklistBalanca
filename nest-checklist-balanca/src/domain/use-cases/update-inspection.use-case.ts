import { Inspection } from '@domain/models/inspection.model';
import { UpdateInspectionDto } from 'src/api/dtos/update-inspection.dto';

export abstract class UpdateInspectionUseCase {
  /**
   * Atualiza os dados do cabeçalho de uma inspeção.
   * @param id O ID da inspeção a ser atualizada.
   * @param dto O objeto com os dados a serem atualizados.
   */
  abstract execute(id: number, dto: UpdateInspectionDto): Promise<Inspection>;
}