import { Inspection } from '../models/inspection.model';
import { CreateInspectionDto } from '../../api/dtos/create-inspection.dto';

export abstract class CreateInspectionUseCase {
  abstract execute(dto: CreateInspectionDto): Promise<Inspection>;
}
